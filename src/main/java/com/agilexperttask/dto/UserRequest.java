package com.agilexperttask.dto;

import java.util.List;

public record UserRequest(
        String name,
        String mainMenuId,
        String activeWallpaperId,
        String activeThemeId,
        List<String> installedApplicationIds
) {
}
