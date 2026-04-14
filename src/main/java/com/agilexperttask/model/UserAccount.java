package com.agilexperttask.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinTable;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;

import java.util.ArrayList;
import java.util.List;

@Entity
public class UserAccount extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name;

    @ManyToOne
    private Menu mainMenu;

    @ManyToMany
    @JoinTable(name = "user_installed_applications",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "application_id"))
    private List<Application> installedApplications = new ArrayList<>();

    @OneToMany(mappedBy = "owner", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"owner"})
    private List<Wallpaper> wallpapers = new ArrayList<>();

    @ManyToOne
    private Wallpaper activeWallpaper;

    @ManyToOne
    private Theme activeTheme;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Menu getMainMenu() {
        return mainMenu;
    }

    public void setMainMenu(Menu mainMenu) {
        this.mainMenu = mainMenu;
    }

    public List<Application> getInstalledApplications() {
        return installedApplications;
    }

    public void setInstalledApplications(List<Application> installedApplications) {
        this.installedApplications = installedApplications;
    }

    public List<Wallpaper> getWallpapers() {
        return wallpapers;
    }

    public void setWallpapers(List<Wallpaper> wallpapers) {
        this.wallpapers = wallpapers;
    }

    public Wallpaper getActiveWallpaper() {
        return activeWallpaper;
    }

    public void setActiveWallpaper(Wallpaper activeWallpaper) {
        this.activeWallpaper = activeWallpaper;
    }

    public Theme getActiveTheme() {
        return activeTheme;
    }

    public void setActiveTheme(Theme activeTheme) {
        this.activeTheme = activeTheme;
    }
}
