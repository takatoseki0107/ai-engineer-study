package com.example.taskmanagement.service;

import com.example.taskmanagement.domain.Priority;
import com.example.taskmanagement.domain.Status;
import com.example.taskmanagement.domain.Task;
import com.example.taskmanagement.domain.User;
import com.example.taskmanagement.dto.TaskCreateRequest;
import com.example.taskmanagement.dto.TaskUpdateRequest;
import com.example.taskmanagement.exception.TaskNotFoundException;
import com.example.taskmanagement.repository.TaskRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserService userService;

    public TaskService(TaskRepository taskRepository, UserService userService) {
        this.taskRepository = taskRepository;
        this.userService = userService;
    }

    public List<Task> findAll(String username) {
        User user = userService.findByUsername(username);
        return taskRepository.findByUserIdOrderByPositionAsc(user.getId());
    }

    public Task findById(Long id, String username) {
        User user = userService.findByUsername(username);
        return taskRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new TaskNotFoundException(id));
    }

    public List<Task> findByStatus(String status, String username) {
        Status s;
        try {
            s = Status.valueOf(status);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("無効なステータスです: " + status);
        }
        User user = userService.findByUsername(username);
        return taskRepository.findByUserIdAndStatusOrderByPositionAsc(user.getId(), s);
    }

    @Transactional
    public Task create(TaskCreateRequest req, String username) {
        User user = userService.findByUsername(username);
        int nextPosition = taskRepository.findTopByUserIdOrderByPositionDesc(user.getId())
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

        return taskRepository.save(
                Task.create(user, req.title(), req.description(), priority, req.dueDate(), nextPosition)
        );
    }

    @Transactional
    public Task update(Long id, TaskUpdateRequest req, String username) {
        Task task = findById(id, username);
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
    public Task updateStatus(Long id, String statusStr, String username) {
        Task task = findById(id, username);
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
    public Task updatePosition(Long id, int position, String username) {
        Task task = findById(id, username);
        task.updatePosition(position);
        return taskRepository.save(task);
    }

    @Transactional
    public void delete(Long id, String username) {
        findById(id, username);
        taskRepository.deleteById(id);
    }
}
