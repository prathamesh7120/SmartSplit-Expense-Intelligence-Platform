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
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;

    @Transactional
    public GroupResponse createGroup(CreateGroupRequest request,
                                     User currentUser) {
        Group group = Group.builder()
                .name(request.getName())
                .description(request.getDescription())
                .createdBy(currentUser.getId())
                .build();

        Group savedGroup = groupRepository.save(group);

        GroupMember adminMember = GroupMember.builder()
                .group(savedGroup)
                .user(currentUser)
                .role(GroupMember.GroupRole.ADMIN)
                .build();

        groupMemberRepository.save(adminMember);

        return buildGroupResponse(savedGroup, List.of(adminMember));
    }

    @Transactional(readOnly = true)
    public List<GroupResponse> getMyGroups(User currentUser) {
        List<Group> groups = groupRepository
                .findGroupsByUserId(currentUser.getId());

        return groups.stream()
                .map(g -> buildGroupResponse(g, g.getMembers()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GroupResponse getGroupById(Long groupId, User currentUser) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() ->
                        new RuntimeException("Group not found"));

        boolean isMember = groupMemberRepository
                .existsByGroupIdAndUserId(groupId, currentUser.getId());

        if (!isMember) {
            throw new RuntimeException(
                    "You are not a member of this group");
        }

        return buildGroupResponse(group, group.getMembers());
    }

    @Transactional
    public GroupResponse addMember(Long groupId,
                                   String memberEmail,
                                   User currentUser) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() ->
                        new RuntimeException("Group not found"));

        GroupMember currentMembership = groupMemberRepository
                .findByGroupIdAndUserId(groupId, currentUser.getId())
                .orElseThrow(() ->
                        new RuntimeException("You are not in this group"));

        if (currentMembership.getRole() != GroupMember.GroupRole.ADMIN) {
            throw new RuntimeException("Only group admin can add members");
        }

        User newMember = userRepository.findByEmail(memberEmail)
                .orElseThrow(() ->
                        new RuntimeException(
                                "No user found with email: " + memberEmail));

        if (groupMemberRepository.existsByGroupIdAndUserId(
                groupId, newMember.getId())) {
            throw new RuntimeException("User is already in this group");
        }

        GroupMember member = GroupMember.builder()
                .group(group)
                .user(newMember)
                .role(GroupMember.GroupRole.MEMBER)
                .build();

        groupMemberRepository.save(member);

        Group updatedGroup = groupRepository.findById(groupId).get();
        return buildGroupResponse(updatedGroup, updatedGroup.getMembers());
    }

    private GroupResponse buildGroupResponse(Group group,
                                             List<GroupMember> members) {
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