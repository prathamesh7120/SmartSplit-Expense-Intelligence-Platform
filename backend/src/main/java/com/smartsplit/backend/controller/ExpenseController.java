package com.smartsplit.backend.controller;

import com.smartsplit.backend.dto.request.CreateExpenseRequest;
import com.smartsplit.backend.dto.response.ExpenseResponse;
import com.smartsplit.backend.dto.response.GroupBalanceResponse;
import com.smartsplit.backend.model.User;
import com.smartsplit.backend.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/groups/{groupId}/expenses")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ExpenseController {

    private final ExpenseService expenseService;

    // Notice the URL pattern: /api/groups/{groupId}/expenses
    // This is called a nested resource URL.
    // It expresses: "expenses BELONG TO a group."
    // Clean REST design — groupId is always in the path,
    // so you always know which group's expenses you are working with.

    @PostMapping
    public ResponseEntity<ExpenseResponse> createExpense(
            @PathVariable Long groupId,
            @Valid @RequestBody CreateExpenseRequest request,
            @AuthenticationPrincipal User currentUser) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(expenseService.createExpense(
                        groupId, request, currentUser));
    }

    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> getGroupExpenses(
            @PathVariable Long groupId,
            @AuthenticationPrincipal User currentUser) {

        return ResponseEntity.ok(
                expenseService.getGroupExpenses(groupId, currentUser));
    }

    @GetMapping("/balance")
    public ResponseEntity<GroupBalanceResponse> getGroupBalance(
            @PathVariable Long groupId,
            @AuthenticationPrincipal User currentUser) {

        return ResponseEntity.ok(
                expenseService.getGroupBalance(groupId, currentUser));
    }
}
