package com.agilexperttask.controller;

import com.agilexperttask.dto.UserRequest;
import com.agilexperttask.dto.UserResponse;
import com.agilexperttask.model.Application;
import com.agilexperttask.model.Menu;
import com.agilexperttask.model.Theme;
import com.agilexperttask.model.UserAccount;
import com.agilexperttask.model.Wallpaper;
import com.agilexperttask.repository.ApplicationRepository;
import com.agilexperttask.repository.MenuRepository;
import com.agilexperttask.repository.ThemeRepository;
import com.agilexperttask.repository.UserAccountRepository;
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
import java.util.ArrayList;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserAccountRepository userAccountRepository;
    private final MenuRepository menuRepository;
    private final WallpaperRepository wallpaperRepository;
    private final ThemeRepository themeRepository;
    private final ApplicationRepository applicationRepository;

    public UserController(UserAccountRepository userAccountRepository,
                          MenuRepository menuRepository,
                          WallpaperRepository wallpaperRepository,
                          ThemeRepository themeRepository,
                          ApplicationRepository applicationRepository) {
        this.userAccountRepository = userAccountRepository;
        this.menuRepository = menuRepository;
        this.wallpaperRepository = wallpaperRepository;
        this.themeRepository = themeRepository;
        this.applicationRepository = applicationRepository;
    }

    @GetMapping
    public List<UserResponse> list() {
        return userAccountRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse create(@RequestBody UserRequest request) {
        return toResponse(save(new UserAccount(), request));
    }

    @PutMapping("/{id}")
    public UserResponse update(@PathVariable String id, @RequestBody UserRequest request) {
        return toResponse(save(userAccountRepository.findById(id).orElseThrow(), request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        userAccountRepository.deleteById(id);
    }

    private UserAccount save(UserAccount user, UserRequest request) {
        user.setName(request.name());
        user.setMainMenu(resolveMenu(request.mainMenuId()));
        user.setActiveWallpaper(resolveWallpaper(request.activeWallpaperId()));
        user.setActiveTheme(resolveTheme(request.activeThemeId()));
        user.setInstalledApplications(request.installedApplicationIds() == null
            ? new ArrayList<>()
            : request.installedApplicationIds().stream()
                .filter(idOrName -> idOrName != null && !idOrName.isBlank())
                .map(this::resolveApplication)
            .collect(java.util.stream.Collectors.toCollection(ArrayList::new)));
        return userAccountRepository.save(user);
    }

    private Menu resolveMenu(String idOrName) {
        if (idOrName == null || idOrName.isBlank()) {
            return null;
        }
        return menuRepository.findById(idOrName)
                .or(() -> menuRepository.findByName(idOrName))
                .orElseThrow(() -> new IllegalArgumentException("Unknown menu: " + idOrName));
    }

    private Wallpaper resolveWallpaper(String idOrName) {
        if (idOrName == null || idOrName.isBlank()) {
            return null;
        }
        return wallpaperRepository.findById(idOrName)
                .or(() -> wallpaperRepository.findByName(idOrName))
                .orElseThrow(() -> new IllegalArgumentException("Unknown wallpaper: " + idOrName));
    }

    private Theme resolveTheme(String idOrName) {
        if (idOrName == null || idOrName.isBlank()) {
            return null;
        }
        return themeRepository.findById(idOrName)
                .or(() -> themeRepository.findByName(idOrName))
                .orElseThrow(() -> new IllegalArgumentException("Unknown theme: " + idOrName));
    }

    private Application resolveApplication(String idOrName) {
        return applicationRepository.findById(idOrName)
                .or(() -> applicationRepository.findByName(idOrName))
                .orElseThrow(() -> new IllegalArgumentException("Unknown application: " + idOrName));
    }

    private UserResponse toResponse(UserAccount user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getMainMenu() == null ? null : user.getMainMenu().getId(),
                user.getActiveWallpaper() == null ? null : user.getActiveWallpaper().getId(),
                user.getActiveTheme() == null ? null : user.getActiveTheme().getId(),
                user.getInstalledApplications() == null
                        ? List.of()
                        : user.getInstalledApplications().stream()
                            .map(Application::getId)
                            .collect(Collectors.toList())
        );
    }
}
