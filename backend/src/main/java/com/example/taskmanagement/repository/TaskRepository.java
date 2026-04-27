package com.example.taskmanagement.repository;

import com.example.taskmanagement.domain.Status;
import com.example.taskmanagement.domain.Task;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByUserIdOrderByPositionAsc(Long userId);

    List<Task> findByUserIdAndStatusOrderByPositionAsc(Long userId, Status status);

    Optional<Task> findTopByUserIdOrderByPositionDesc(Long userId);

    Optional<Task> findByIdAndUserId(Long id, Long userId);
}
