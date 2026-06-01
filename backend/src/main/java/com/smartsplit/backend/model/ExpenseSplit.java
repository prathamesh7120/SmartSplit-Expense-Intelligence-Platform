package com.smartsplit.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "expense_splits")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ExpenseSplit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Which expense this split belongs to
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expense_id", nullable = false)
    private Expense expense;

    // Which user owes this amount
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Exact amount this person owes for this expense
    @Column(name = "amount_owed",
            nullable = false,
            precision = 10,
            scale = 2)
    private BigDecimal amountOwed;

    // Has this person paid their share?
    // The person who paid the bill (paidBy) gets this set to true immediately.
    // Others start as false — they still owe money.
    @Column(name = "is_settled", nullable = false)
    @Builder.Default
    private Boolean isSettled = false;
}