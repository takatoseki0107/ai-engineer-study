package com.example.taskmanagement.dto;

import com.example.taskmanagement.domain.Task;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record TaskResponse(
    Long id,
    String title,
    String description,
    String priority,
    String status,
    LocalDate dueDate,
    int position,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static TaskResponse from(Task task) {
        return new TaskResponse(
            task.getId(),
            task.getTitle(),
            task.getDescription(),
            task.getPriority() != null ? task.getPriority().name() : null,
            task.getStatus().name(),
            task.getDueDate(),
            task.getPosition(),
            task.getCreatedAt(),
            task.getUpdatedAt()
        );
    }
}
