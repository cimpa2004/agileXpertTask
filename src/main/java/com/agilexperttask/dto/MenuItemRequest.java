package com.agilexperttask.dto;

public record MenuItemRequest(
        String name,
        String type,
        String iconId,
        String applicationId
) {
}
