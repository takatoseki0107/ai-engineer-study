package com.example.taskmanagement.dto;

import jakarta.validation.constraints.Min;

public record TaskPositionUpdateRequest(
    @Min(value = 1, message = "ポジションは1以上である必要があります")
    int position
) {}
