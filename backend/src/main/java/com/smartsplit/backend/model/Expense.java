package com.smartsplit.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "expenses")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    // Who physically paid the bill
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paid_by", nullable = false)
    private User paidBy;

    @Column(nullable = false)
    private String title;

    // BigDecimal for money — NEVER use double or float for currency.
    // double cannot represent 0.1 exactly in binary.
    // 0.1 + 0.2 in double = 0.30000000000000004
    // BigDecimal is exact. Always use it for financial calculations.
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    // Food, Travel, Accommodation, Entertainment, Utilities, Other
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExpenseCategory category;

    // EQUAL = divide equally among all members
    // CUSTOM = each person owes a specific amount you specify
    @Enumerated(EnumType.STRING)
    @Column(name = "split_type", nullable = false)
    private SplitType splitType;

    @Column(nullable = false)
    private String description;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // One Expense has many ExpenseSplit records
    @OneToMany(mappedBy = "expense",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY)
    @Builder.Default
    private List<ExpenseSplit> splits = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum ExpenseCategory {
        FOOD, TRAVEL, ACCOMMODATION,
        ENTERTAINMENT, UTILITIES, OTHER
    }

    public enum SplitType {
        EQUAL, CUSTOM
    }
}
