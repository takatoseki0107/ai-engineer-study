package com.example.taskmanagement.controller;

import com.example.taskmanagement.domain.Task;
import com.example.taskmanagement.dto.TaskCreateRequest;
import com.example.taskmanagement.dto.TaskPositionUpdateRequest;
import com.example.taskmanagement.dto.TaskStatusUpdateRequest;
import com.example.taskmanagement.dto.TaskUpdateRequest;
import com.example.taskmanagement.dto.TaskResponse;
import com.example.taskmanagement.service.TaskService;
import jakarta.validation.Valid;
import java.net.URI;
import java.security.Principal;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getAllTasks(Principal principal) {
        List<TaskResponse> tasks = taskService.findAll(principal.getName())
            .stream()
            .map(TaskResponse::from)
            .toList();
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTaskById(
            @PathVariable Long id,
            Principal principal) {
        return ResponseEntity.ok(TaskResponse.from(taskService.findById(id, principal.getName())));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<TaskResponse>> getTasksByStatus(
            @PathVariable String status,
            Principal principal) {
        List<TaskResponse> tasks = taskService.findByStatus(status, principal.getName())
            .stream()
            .map(TaskResponse::from)
            .toList();
        return ResponseEntity.ok(tasks);
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(
            @RequestBody @Valid TaskCreateRequest req,
            UriComponentsBuilder ucb,
            Principal principal) {
        Task created = taskService.create(req, principal.getName());
        URI location = ucb.path("/api/tasks/{id}").buildAndExpand(created.getId()).toUri();
        return ResponseEntity.created(location).body(TaskResponse.from(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable Long id,
            @RequestBody @Valid TaskUpdateRequest req,
            Principal principal) {
        return ResponseEntity.ok(TaskResponse.from(taskService.update(id, req, principal.getName())));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskResponse> updateTaskStatus(
            @PathVariable Long id,
            @RequestBody @Valid TaskStatusUpdateRequest req,
            Principal principal) {
        return ResponseEntity.ok(
                TaskResponse.from(taskService.updateStatus(id, req.status(), principal.getName()))
        );
    }

    @PatchMapping("/{id}/position")
    public ResponseEntity<TaskResponse> updateTaskPosition(
            @PathVariable Long id,
            @RequestBody @Valid TaskPositionUpdateRequest req,
            Principal principal) {
        return ResponseEntity.ok(
                TaskResponse.from(taskService.updatePosition(id, req.position(), principal.getName()))
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable Long id,
            Principal principal) {
        taskService.delete(id, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
