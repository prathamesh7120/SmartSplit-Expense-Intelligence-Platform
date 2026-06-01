package com.smartsplit.backend.repository;

import com.smartsplit.backend.model.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {

    // Custom JPQL query — finds all groups where a specific user is a member.
    // JPQL uses Java class names and field names, NOT SQL table/column names.
    // "g" = Group alias, "m" = GroupMember alias.
    // We join Group → members list → filter where member's user id matches.
    @Query("SELECT g FROM Group g " +
            "JOIN g.members m " +
            "WHERE m.user.id = :userId")
    List<Group> findGroupsByUserId(@Param("userId") Long userId);
}
