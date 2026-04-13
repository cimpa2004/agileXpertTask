package com.agilexperttask.repository;

import com.agilexperttask.model.Theme;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ThemeRepository extends JpaRepository<Theme, String> {

    Optional<Theme> findByName(String name);
}
