package com.smartsplit.backend.repository;

import com.smartsplit.backend.model.ExpenseSplit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ExpenseSplitRepository
        extends JpaRepository<ExpenseSplit, Long> {

    // All unsettled splits for a user in a group
    // = what this user still owes across all expenses in a group
    @Query("SELECT es FROM ExpenseSplit es " +
            "WHERE es.user.id = :userId " +
            "AND es.expense.group.id = :groupId " +
            "AND es.isSettled = false")
    List<ExpenseSplit> findUnsettledByUserAndGroup(
            @Param("userId") Long userId,
            @Param("groupId") Long groupId);

    // Total amount a user owes in a group
    @Query("SELECT COALESCE(SUM(es.amountOwed), 0) " +
            "FROM ExpenseSplit es " +
            "WHERE es.user.id = :userId " +
            "AND es.expense.group.id = :groupId " +
            "AND es.isSettled = false")
    BigDecimal getTotalOwedByUserInGroup(
            @Param("userId") Long userId,
            @Param("groupId") Long groupId);

    // All splits for a specific expense
    List<ExpenseSplit> findByExpenseId(Long expenseId);
}
