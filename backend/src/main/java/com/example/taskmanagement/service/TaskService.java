package com.example.taskmanagement.service;

import com.example.taskmanagement.domain.Status;
import com.example.taskmanagement.domain.Task;
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
}
