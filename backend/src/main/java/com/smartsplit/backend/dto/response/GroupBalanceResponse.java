package com.smartsplit.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

// This is what the "who owes whom" summary looks like.
// Every expense app's most important screen.
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GroupBalanceResponse {

    private Long groupId;
    private String groupName;

    // Total spent in this group across all expenses
    private BigDecimal totalGroupSpend;

    // Each member's balance summary
    private List<MemberBalance> memberBalances;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MemberBalance {
        private Long userId;
        private String userName;

        // Positive = this person is owed money (they paid more than their share)
        // Negative = this person owes money (they paid less than their share)
        // Zero = settled up
        private BigDecimal netBalance;
        private BigDecimal totalPaid;
        private BigDecimal totalOwed;
    }
}
