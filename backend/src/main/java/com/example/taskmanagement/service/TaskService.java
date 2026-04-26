package com.example.taskmanagement.service;

import com.example.taskmanagement.domain.Priority;
import com.example.taskmanagement.domain.Status;
import com.example.taskmanagement.domain.Task;
import com.example.taskmanagement.dto.TaskCreateRequest;
import com.example.taskmanagement.dto.TaskPositionUpdateRequest;
import com.example.taskmanagement.dto.TaskStatusUpdateRequest;
import com.example.taskmanagement.dto.TaskUpdateRequest;
import com.example.taskmanagement.exception.TaskNotFoundException;
import com.example.taskmanagement.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<Task> findAll() {
        return taskRepository.findAllByOrderByPositionAsc();
    }

    public Task findById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));
    }

    public List<Task> findByStatus(String status) {
        Status s = Status.valueOf(status);
        return taskRepository.findByStatusOrderByPositionAsc(s);
    }

    @Transactional
    public Task create(TaskCreateRequest req) {
        int nextPosition = taskRepository.findTopByOrderByPositionDesc()
            .map(t -> t.getPosition() + 1)
            .orElse(1);

        Priority priority = null;
        if (req.priority() != null && !req.priority().isBlank()) {
            try {
                priority = Priority.valueOf(req.priority());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("無効な優先度です: " + req.priority());
            }
        }

        return taskRepository.save(Task.create(req.title(), req.description(), priority, req.dueDate(), nextPosition));
    }

    @Transactional
    public Task update(Long id, TaskUpdateRequest req) {
        Task task = findById(id);
        Priority priority = null;
        if (req.priority() != null && !req.priority().isBlank()) {
            try {
                priority = Priority.valueOf(req.priority());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("無効な優先度です: " + req.priority());
            }
        }
        task.update(req.title(), req.description(), priority, req.dueDate());
        return taskRepository.save(task);
    }

    @Transactional
    public Task updateStatus(Long id, String statusStr) {
        Task task = findById(id);
        Status status;
        try {
            status = Status.valueOf(statusStr);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("無効なステータスです: " + statusStr);
        }
        task.updateStatus(status);
        return taskRepository.save(task);
    }

    @Transactional
    public Task updatePosition(Long id, int position) {
        Task task = findById(id);
        task.updatePosition(position);
        return taskRepository.save(task);
    }
}
