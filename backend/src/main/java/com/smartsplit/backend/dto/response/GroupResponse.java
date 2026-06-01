package com.smartsplit.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GroupResponse {

    private Long id;
    private String name;
    private String description;
    private Long createdBy;
    private LocalDateTime createdAt;

    // List of members in this group
    private List<MemberInfo> members;

    // Nested class — represents one member's info in the response.
    // We use a nested class because MemberInfo only makes sense
    // in the context of a GroupResponse. It has no life outside.
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MemberInfo {
        private Long userId;
        private String name;
        private String email;
        private String role;
    }
}
