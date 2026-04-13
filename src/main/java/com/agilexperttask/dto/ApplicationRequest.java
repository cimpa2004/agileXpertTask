package com.agilexperttask.dto;

public record ApplicationRequest(
        String name,
        String description,
        String category,
        String iconId,
        String launchTarget
) {
}
