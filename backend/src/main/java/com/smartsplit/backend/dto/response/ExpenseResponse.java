package com.smartsplit.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ExpenseResponse {

    private Long id;
    private String title;
    private BigDecimal amount;
    private String category;
    private String splitType;
    private String description;
    private LocalDateTime createdAt;

    // Who paid — show their name and id
    private Long paidById;
    private String paidByName;

    private List<SplitDetail> splits;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SplitDetail {
        private Long userId;
        private String userName;
        private BigDecimal amountOwed;
        private Boolean isSettled;
    }
}
