package com.smartsplit.backend.service;

import com.smartsplit.backend.dto.request.CreateGroupRequest;
import com.smartsplit.backend.dto.response.GroupResponse;
import com.smartsplit.backend.model.Group;
import com.smartsplit.backend.model.GroupMember;
import com.smartsplit.backend.model.User;
import com.smartsplit.backend.repository.GroupMemberRepository;
import com.smartsplit.backend.repository.GroupRepository;
import com.smartsplit.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;

    // CREATE GROUP
    // currentUser = the logged-in user extracted from JWT (passed from controller)
    public GroupResponse createGroup(CreateGroupRequest request,
                                     User currentUser) {

        // Step 1: Build and save the Group entity
        Group group = Group.builder()
                .name(request.getName())
                .description(request.getDescription())
                .createdBy(currentUser.getId())
                .build();

        // save() returns the saved entity WITH the generated id.
        // We must use this returned object — not the original "group" variable
        // — because the id is only populated after save.
        Group savedGroup = groupRepository.save(group);

        // Step 2: Creator automatically becomes ADMIN member.
        // A group with no members is useless.
        GroupMember adminMember = GroupMember.builder()
                .group(savedGroup)
                .user(currentUser)
                .role(GroupMember.GroupRole.ADMIN)
                .build();

        groupMemberRepository.save(adminMember);

        // Step 3: Build and return the response DTO
        return buildGroupResponse(savedGroup, List.of(adminMember));
    }

    // GET ALL GROUPS FOR CURRENT USER
    public List<GroupResponse> getMyGroups(User currentUser) {

        // Fetch all groups where this user is a member
        List<Group> groups = groupRepository
                .findGroupsByUserId(currentUser.getId());

        // Convert each Group entity to GroupResponse DTO.
        // .stream() = process list as a pipeline.
        // .map() = transform each Group → GroupResponse.
        // .collect() = gather results back into a List.
        return groups.stream()
                .map(g -> buildGroupResponse(g, g.getMembers()))
                .collect(Collectors.toList());
    }

    // GET SINGLE GROUP BY ID
    public GroupResponse getGroupById(Long groupId, User currentUser) {

        // Find the group or throw exception if not found
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() ->
                        new RuntimeException("Group not found"));

        // Security check: is this user actually a member?
        // You must not return group data to someone who is not in the group.
        boolean isMember = groupMemberRepository
                .existsByGroupIdAndUserId(groupId, currentUser.getId());

        if (!isMember) {
            throw new RuntimeException(
                    "You are not a member of this group");
        }

        return buildGroupResponse(group, group.getMembers());
    }

    // ADD MEMBER TO GROUP
    public GroupResponse addMember(Long groupId,
                                   String memberEmail,
                                   User currentUser) {

        // Step 1: Load group
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        // Step 2: Only ADMIN can add members — check role
        GroupMember currentMembership = groupMemberRepository
                .findByGroupIdAndUserId(groupId, currentUser.getId())
                .orElseThrow(() ->
                        new RuntimeException("You are not in this group"));

        if (currentMembership.getRole() != GroupMember.GroupRole.ADMIN) {
            throw new RuntimeException(
                    "Only group admin can add members");
        }

        // Step 3: Find the user to add by their email
        User newMember = userRepository.findByEmail(memberEmail)
                .orElseThrow(() ->
                        new RuntimeException(
                                "No user found with email: " + memberEmail));

        // Step 4: Check they are not already in the group
        if (groupMemberRepository.existsByGroupIdAndUserId(
                groupId, newMember.getId())) {
            throw new RuntimeException("User is already in this group");
        }

        // Step 5: Add them as MEMBER (not ADMIN)
        GroupMember member = GroupMember.builder()
                .group(group)
                .user(newMember)
                .role(GroupMember.GroupRole.MEMBER)
                .build();

        groupMemberRepository.save(member);

        // Reload group to get updated members list
        Group updatedGroup = groupRepository.findById(groupId).get();
        return buildGroupResponse(updatedGroup, updatedGroup.getMembers());
    }

    // PRIVATE HELPER — converts Group entity to GroupResponse DTO
    // Private because it is only used internally in this service.
    // DRY principle — Don't Repeat Yourself. Used in all 3 methods above.
    private GroupResponse buildGroupResponse(Group group,
                                             List<GroupMember> members) {

        // Convert each GroupMember to MemberInfo DTO
        List<GroupResponse.MemberInfo> memberInfos = members.stream()
                .map(m -> GroupResponse.MemberInfo.builder()
                        .userId(m.getUser().getId())
                        .name(m.getUser().getName())
                        .email(m.getUser().getEmail())
                        .role(m.getRole().name())
                        .build())
                .collect(Collectors.toList());

        return GroupResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .createdBy(group.getCreatedBy())
                .createdAt(group.getCreatedAt())
                .members(memberInfos)
                .build();
    }
}
