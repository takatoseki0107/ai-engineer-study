package com.example.taskmanagement.repository;

import com.example.taskmanagement.domain.Status;
import com.example.taskmanagement.domain.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findAllByOrderByPositionAsc();
    List<Task> findByStatusOrderByPositionAsc(Status status);
    Optional<Task> findTopByOrderByPositionDesc();
}
