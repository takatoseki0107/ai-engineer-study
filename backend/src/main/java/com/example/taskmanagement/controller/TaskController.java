package com.example.taskmanagement.controller;

import com.example.taskmanagement.domain.Task;
import com.example.taskmanagement.dto.TaskCreateRequest;
import com.example.taskmanagement.dto.TaskPositionUpdateRequest;
import com.example.taskmanagement.dto.TaskStatusUpdateRequest;
import com.example.taskmanagement.dto.TaskUpdateRequest;
import com.example.taskmanagement.dto.TaskResponse;
import com.example.taskmanagement.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getAllTasks() {
        List<TaskResponse> tasks = taskService.findAll()
            .stream()
            .map(TaskResponse::from)
            .toList();
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(TaskResponse.from(taskService.findById(id)));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<TaskResponse>> getTasksByStatus(@PathVariable String status) {
        List<TaskResponse> tasks = taskService.findByStatus(status)
            .stream()
            .map(TaskResponse::from)
            .toList();
        return ResponseEntity.ok(tasks);
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(
            @RequestBody @Valid TaskCreateRequest req,
            UriComponentsBuilder ucb) {
        Task created = taskService.create(req);
        URI location = ucb.path("/api/tasks/{id}").buildAndExpand(created.getId()).toUri();
        return ResponseEntity.created(location).body(TaskResponse.from(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable Long id,
            @RequestBody @Valid TaskUpdateRequest req) {
        return ResponseEntity.ok(TaskResponse.from(taskService.update(id, req)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskResponse> updateTaskStatus(
            @PathVariable Long id,
            @RequestBody @Valid TaskStatusUpdateRequest req) {
        return ResponseEntity.ok(TaskResponse.from(taskService.updateStatus(id, req.status())));
    }

    @PatchMapping("/{id}/position")
    public ResponseEntity<TaskResponse> updateTaskPosition(
            @PathVariable Long id,
            @RequestBody @Valid TaskPositionUpdateRequest req) {
        return ResponseEntity.ok(TaskResponse.from(taskService.updatePosition(id, req.position())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
