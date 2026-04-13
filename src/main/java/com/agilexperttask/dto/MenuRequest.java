package com.agilexperttask.dto;

public record MenuRequest(
	String name,
	Boolean isSubmenu,
	String parentMenuId
) {
}
