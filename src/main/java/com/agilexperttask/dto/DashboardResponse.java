package com.agilexperttask.dto;

import java.util.List;

public record DashboardResponse(
        long userCount,
        long menuCount,
        long applicationCount,
        long iconCount,
        long wallpaperCount,
        long themeCount,
        List<String> highlights
) {
}
