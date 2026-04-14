package com.agilexperttask.dto;

import java.util.List;

public record UserResponse(
        String id,
        String name,
        String mainMenuId,
        String activeWallpaperId,
        String activeThemeId,
        List<String> installedApplicationIds
) {
}