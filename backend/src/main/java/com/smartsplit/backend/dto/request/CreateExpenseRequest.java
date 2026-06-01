package com.smartsplit.backend.dto.request;

import com.smartsplit.backend.model.Expense.ExpenseCategory;
import com.smartsplit.backend.model.Expense.SplitType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.util.Map;

@Data
public class CreateExpenseRequest {

    @NotBlank(message = "Title is required")
    private String title;

    // Amount must be greater than 0
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    @NotNull(message = "Category is required")
    private ExpenseCategory category;

    @NotNull(message = "Split type is required")
    private SplitType splitType;

    private String description;

    // Used only when splitType = CUSTOM.
    // Key = userId, Value = amount they owe.
    // Example: { "1": 500.00, "2": 700.00 }
    // If splitType = EQUAL, this field is ignored.
    private Map<Long, BigDecimal> customSplits;
}
