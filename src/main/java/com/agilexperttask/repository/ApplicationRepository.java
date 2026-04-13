package com.agilexperttask.repository;

import com.agilexperttask.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, String> {

    Optional<Application> findByName(String name);
}
