package com.smartsplit.backend.repository;

import com.smartsplit.backend.model.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface GroupMemberRepository
        extends JpaRepository<GroupMember, Long> {

    // Check if a user is already a member of a group.
    // Prevents adding the same person twice.
    boolean existsByGroupIdAndUserId(Long groupId, Long userId);

    // Find a specific membership record.
    // Used to check someone's role before allowing actions.
    Optional<GroupMember> findByGroupIdAndUserId(
            Long groupId, Long userId);
}
