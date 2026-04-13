package com.agilexperttask.repository;

import com.agilexperttask.model.Icon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IconRepository extends JpaRepository<Icon, String> {

    Optional<Icon> findByName(String name);
}
