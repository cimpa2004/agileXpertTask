package com.agilexperttask.controller;

import com.agilexperttask.dto.ThemeRequest;
import com.agilexperttask.model.Theme;
import com.agilexperttask.repository.ThemeRepository;
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
@RequestMapping("/api/themes")
public class ThemeController {

    private final ThemeRepository themeRepository;

    public ThemeController(ThemeRepository themeRepository) {
        this.themeRepository = themeRepository;
    }

    @GetMapping
    public List<Theme> list() {
        return themeRepository.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Theme create(@RequestBody ThemeRequest request) {
        return save(new Theme(), request);
    }

    @PutMapping("/{id}")
    public Theme update(@PathVariable String id, @RequestBody ThemeRequest request) {
        return save(themeRepository.findById(id).orElseThrow(), request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        themeRepository.deleteById(id);
    }

    private Theme save(Theme theme, ThemeRequest request) {
        theme.setName(request.name());
        theme.setPrimaryColor(request.primaryColor());
        theme.setSecondaryColor(request.secondaryColor());
        theme.setAccentColor(request.accentColor());
        return themeRepository.save(theme);
    }
}
