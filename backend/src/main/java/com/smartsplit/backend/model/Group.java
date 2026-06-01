package com.smartsplit.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "groups")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Group name: "Goa Trip", "Flat 3B", "Office Lunch"
    @Column(nullable = false)
    private String name;

    // Optional description for context
    private String description;

    // Who created this group — stored as user's ID (FK to users table)
    // @Column stores just the ID number, not the full User object.
    // We keep it simple here — no @ManyToOne join for now.
    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // One Group has many GroupMembers.
    // mappedBy = "group" means the GroupMember entity owns
    // this relationship (has the foreign key column).
    // CascadeType.ALL = if group is deleted, all its members are deleted too.
    // FetchType.LAZY = do NOT load members from DB until we actually need them.
    // LAZY is critical for performance — without it, every group fetch
    // also queries the members table unnecessarily.
    @OneToMany(mappedBy = "group",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY)
    @Builder.Default
    private List<GroupMember> members = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
