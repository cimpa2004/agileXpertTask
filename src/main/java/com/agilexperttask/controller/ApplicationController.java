package com.agilexperttask.controller;

import com.agilexperttask.dto.ApplicationRequest;
import com.agilexperttask.model.Application;
import com.agilexperttask.repository.ApplicationRepository;
import com.agilexperttask.repository.IconRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationRepository applicationRepository;
    private final IconRepository iconRepository;

    public ApplicationController(ApplicationRepository applicationRepository, IconRepository iconRepository) {
        this.applicationRepository = applicationRepository;
        this.iconRepository = iconRepository;
    }

    @GetMapping
    public List<Application> list() {
        return applicationRepository.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Application create(@RequestBody ApplicationRequest request) {
        return save(new Application(), request);
    }

    @PutMapping("/{id}")
    public Application update(@PathVariable String id, @RequestBody ApplicationRequest request) {
        Application application = applicationRepository.findById(id).orElseThrow();
        return save(application, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        applicationRepository.deleteById(id);
    }

    private Application save(Application application, ApplicationRequest request) {
        application.setName(request.name());
        application.setDescription(request.description());
        application.setCategory(request.category());
        application.setLaunchTarget(request.launchTarget());
        application.setIcon(request.iconId() == null || request.iconId().isBlank()
                ? null
                : iconRepository.findById(request.iconId()).orElseThrow());
        return applicationRepository.save(application);
    }
}
