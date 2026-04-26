package com.example.taskmanagement.dto;

import jakarta.validation.constraints.NotBlank;

public record TaskStatusUpdateRequest(
    @NotBlank(message = "ステータスは必須です")
    String status
) {}
