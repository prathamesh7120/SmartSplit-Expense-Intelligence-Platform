package com.smartsplit.backend.service;

import com.smartsplit.backend.dto.request.CreateExpenseRequest;
import com.smartsplit.backend.dto.response.ExpenseResponse;
import com.smartsplit.backend.dto.response.GroupBalanceResponse;
import com.smartsplit.backend.model.*;
import com.smartsplit.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseSplitRepository expenseSplitRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;

    @Transactional
    public ExpenseResponse createExpense(Long groupId,
                                         CreateExpenseRequest request,
                                         User currentUser) {

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        boolean isMember = groupMemberRepository
                .existsByGroupIdAndUserId(groupId, currentUser.getId());
        if (!isMember) {
            throw new RuntimeException(
                    "You must be a group member to add expenses");
        }

        Expense expense = Expense.builder()
                .group(group)
                .paidBy(currentUser)
                .title(request.getTitle())
                .amount(request.getAmount())
                .category(request.getCategory())
                .splitType(request.getSplitType())
                .description(request.getDescription() != null
                        ? request.getDescription() : "")
                .build();

        Expense savedExpense = expenseRepository.save(expense);

        List<ExpenseSplit> splits;

        if (request.getSplitType() == Expense.SplitType.EQUAL) {
            splits = createEqualSplits(savedExpense, group, currentUser);
        } else {
            splits = createCustomSplits(
                    savedExpense, request.getCustomSplits(), currentUser);
        }

        expenseSplitRepository.saveAll(splits);

        return buildExpenseResponse(savedExpense, splits);
    }

    private List<ExpenseSplit> createEqualSplits(Expense expense,
                                                 Group group,
                                                 User paidBy) {

        List<GroupMember> members = groupMemberRepository
                .findAll()
                .stream()
                .filter(m -> m.getGroup().getId().equals(group.getId()))
                .collect(Collectors.toList());

        int memberCount = members.size();

        if (memberCount == 0) {
            throw new RuntimeException("Group has no members");
        }

        BigDecimal equalShare = expense.getAmount()
                .divide(BigDecimal.valueOf(memberCount), 2,
                        RoundingMode.HALF_UP);

        List<ExpenseSplit> splits = new ArrayList<>();

        for (GroupMember member : members) {
            ExpenseSplit split = ExpenseSplit.builder()
                    .expense(expense)
                    .user(member.getUser())
                    .amountOwed(equalShare)
                    .isSettled(member.getUser().getId()
                            .equals(paidBy.getId()))
                    .build();
            splits.add(split);
        }

        return splits;
    }

    private List<ExpenseSplit> createCustomSplits(
            Expense expense,
            Map<Long, BigDecimal> customSplits,
            User paidBy) {

        if (customSplits == null || customSplits.isEmpty()) {
            throw new RuntimeException(
                    "Custom split amounts are required for CUSTOM split type");
        }

        BigDecimal totalCustom = customSplits.values()
                .stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalCustom.compareTo(expense.getAmount()) != 0) {
            throw new RuntimeException(
                    "Sum of custom splits (" + totalCustom +
                            ") must equal expense amount (" +
                            expense.getAmount() + ")");
        }

        List<ExpenseSplit> splits = new ArrayList<>();

        for (Map.Entry<Long, BigDecimal> entry : customSplits.entrySet()) {
            Long userId = entry.getKey();
            BigDecimal amountOwed = entry.getValue();

            User user = userRepository.findById(userId)
                    .orElseThrow(() ->
                            new RuntimeException("User not found: " + userId));

            ExpenseSplit split = ExpenseSplit.builder()
                    .expense(expense)
                    .user(user)
                    .amountOwed(amountOwed)
                    .isSettled(userId.equals(paidBy.getId()))
                    .build();

            splits.add(split);
        }

        return splits;
    }

    // ✅ FIXED — added @Transactional(readOnly = true)
    @Transactional(readOnly = true)
    public List<ExpenseResponse> getGroupExpenses(Long groupId,
                                                  User currentUser) {

        boolean isMember = groupMemberRepository
                .existsByGroupIdAndUserId(groupId, currentUser.getId());
        if (!isMember) {
            throw new RuntimeException("Access denied");
        }

        List<Expense> expenses = expenseRepository
                .findByGroupIdOrderByCreatedAtDesc(groupId);

        return expenses.stream()
                .map(e -> buildExpenseResponse(
                        e,
                        expenseSplitRepository.findByExpenseId(e.getId())))
                .collect(Collectors.toList());
    }

    // ✅ FIXED — added @Transactional(readOnly = true)
    @Transactional(readOnly = true)
    public GroupBalanceResponse getGroupBalance(Long groupId,
                                                User currentUser) {

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        boolean isMember = groupMemberRepository
                .existsByGroupIdAndUserId(groupId, currentUser.getId());
        if (!isMember) {
            throw new RuntimeException("Access denied");
        }

        List<Expense> expenses = expenseRepository
                .findByGroupIdOrderByCreatedAtDesc(groupId);

        BigDecimal totalSpend = expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<GroupMember> members = groupMemberRepository
                .findAll()
                .stream()
                .filter(m -> m.getGroup().getId().equals(groupId))
                .collect(Collectors.toList());

        List<GroupBalanceResponse.MemberBalance> balances =
                members.stream().map(member -> {

                    User user = member.getUser();

                    BigDecimal totalPaid = expenses.stream()
                            .filter(e -> e.getPaidBy().getId()
                                    .equals(user.getId()))
                            .map(Expense::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    BigDecimal totalOwed = expenseSplitRepository
                            .getTotalOwedByUserInGroup(
                                    user.getId(), groupId);

                    BigDecimal netBalance = totalPaid.subtract(totalOwed);

                    return GroupBalanceResponse.MemberBalance.builder()
                            .userId(user.getId())
                            .userName(user.getName())
                            .totalPaid(totalPaid)
                            .totalOwed(totalOwed)
                            .netBalance(netBalance)
                            .build();

                }).collect(Collectors.toList());

        return GroupBalanceResponse.builder()
                .groupId(groupId)
                .groupName(group.getName())
                .totalGroupSpend(totalSpend)
                .memberBalances(balances)
                .build();
    }

    private ExpenseResponse buildExpenseResponse(Expense expense,
                                                 List<ExpenseSplit> splits) {

        List<ExpenseResponse.SplitDetail> splitDetails = splits.stream()
                .map(s -> ExpenseResponse.SplitDetail.builder()
                        .userId(s.getUser().getId())
                        .userName(s.getUser().getName())
                        .amountOwed(s.getAmountOwed())
                        .isSettled(s.getIsSettled())
                        .build())
                .collect(Collectors.toList());

        return ExpenseResponse.builder()
                .id(expense.getId())
                .title(expense.getTitle())
                .amount(expense.getAmount())
                .category(expense.getCategory().name())
                .splitType(expense.getSplitType().name())
                .description(expense.getDescription())
                .createdAt(expense.getCreatedAt())
                .paidById(expense.getPaidBy().getId())
                .paidByName(expense.getPaidBy().getName())
                .splits(splitDetails)
                .build();
    }



}