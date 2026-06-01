package com.smartsplit.backend.repository;

import com.smartsplit.backend.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    // All expenses in a group, newest first
    List<Expense> findByGroupIdOrderByCreatedAtDesc(Long groupId);

    // All expenses paid by a specific user in a group
    List<Expense> findByGroupIdAndPaidById(Long groupId, Long userId);
}
