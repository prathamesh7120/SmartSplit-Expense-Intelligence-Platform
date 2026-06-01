package com.smartsplit.backend.controller;

import com.smartsplit.backend.dto.request.CreateGroupRequest;
import com.smartsplit.backend.dto.response.GroupResponse;
import com.smartsplit.backend.model.User;
import com.smartsplit.backend.service.GroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class GroupController {

    private final GroupService groupService;

    // @AuthenticationPrincipal is the most important annotation here.
    // Remember in JwtAuthenticationFilter Step 8, we stored
    // the UserDetails object in SecurityContextHolder?
    // @AuthenticationPrincipal retrieves that stored User object.
    // No need to parse the token again. No need to query the database again.
    // Spring Security already did it — just receive it here.

    @PostMapping
    public ResponseEntity<GroupResponse> createGroup(
            @Valid @RequestBody CreateGroupRequest request,
            @AuthenticationPrincipal User currentUser) {

        GroupResponse response = groupService.createGroup(
                request, currentUser);

        // 201 Created is the correct HTTP status for resource creation.
        // Not 200 OK — that means "request processed."
        // 201 means "new resource was created."
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<GroupResponse>> getMyGroups(
            @AuthenticationPrincipal User currentUser) {

        return ResponseEntity.ok(groupService.getMyGroups(currentUser));
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<GroupResponse> getGroupById(
            @PathVariable Long groupId,
            @AuthenticationPrincipal User currentUser) {

        // @PathVariable extracts {groupId} from the URL.
        // GET /api/groups/5 → groupId = 5
        return ResponseEntity.ok(
                groupService.getGroupById(groupId, currentUser));
    }

    @PostMapping("/{groupId}/members")
    public ResponseEntity<GroupResponse> addMember(
            @PathVariable Long groupId,
            @RequestParam String email,
            @AuthenticationPrincipal User currentUser) {

        // @RequestParam reads from query string:
        // POST /api/groups/5/members?email=friend@gmail.com
        return ResponseEntity.ok(
                groupService.addMember(groupId, email, currentUser));
    }
}
