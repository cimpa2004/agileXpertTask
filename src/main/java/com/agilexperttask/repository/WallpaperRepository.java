package com.agilexperttask.repository;

import com.agilexperttask.model.Wallpaper;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WallpaperRepository extends JpaRepository<Wallpaper, String> {

    Optional<Wallpaper> findByName(String name);
}
