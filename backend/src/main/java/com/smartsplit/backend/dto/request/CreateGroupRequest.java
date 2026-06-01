package com.smartsplit.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateGroupRequest {

    @NotBlank(message = "Group name is required")
    private String name;

    // Description is optional — no @NotBlank
    private String description;
}
