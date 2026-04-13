package com.agilexperttask.controller;

import com.agilexperttask.dto.WallpaperRequest;
import com.agilexperttask.model.Wallpaper;
import com.agilexperttask.repository.WallpaperRepository;
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
@RequestMapping("/api/wallpapers")
public class WallpaperController {

    private final WallpaperRepository wallpaperRepository;

    public WallpaperController(WallpaperRepository wallpaperRepository) {
        this.wallpaperRepository = wallpaperRepository;
    }

    @GetMapping
    public List<Wallpaper> list() {
        return wallpaperRepository.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Wallpaper create(@RequestBody WallpaperRequest request) {
        return save(new Wallpaper(), request);
    }

    @PutMapping("/{id}")
    public Wallpaper update(@PathVariable String id, @RequestBody WallpaperRequest request) {
        return save(wallpaperRepository.findById(id).orElseThrow(), request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        wallpaperRepository.deleteById(id);
    }

    private Wallpaper save(Wallpaper wallpaper, WallpaperRequest request) {
        wallpaper.setName(request.name());
        wallpaper.setImageUrl(request.imageUrl());
        return wallpaperRepository.save(wallpaper);
    }
}
