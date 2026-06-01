package com.smartsplit.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "group_members",
        // Composite unique constraint — one user cannot be
        // in the same group twice. Database enforces this.
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"group_id", "user_id"}
        )
)
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GroupMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // @ManyToOne = many GroupMember rows belong to one Group.
    // @JoinColumn = creates group_id foreign key column in group_members table.
    // This is what links the member record to its group.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    // Which user is this member record for
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // ADMIN can add/remove members and delete group.
    // MEMBER can add expenses and view group.
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GroupRole role;

    @Column(name = "joined_at")
    private LocalDateTime joinedAt;

    @PrePersist
    protected void onJoin() {
        joinedAt = LocalDateTime.now();
    }

    // Enum defined inside — it belongs to GroupMember, nowhere else.
    public enum GroupRole {
        ADMIN, MEMBER
    }
}
