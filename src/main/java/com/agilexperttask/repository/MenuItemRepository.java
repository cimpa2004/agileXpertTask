package com.agilexperttask.repository;

import com.agilexperttask.model.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuItemRepository extends JpaRepository<MenuItem, String> {
	boolean existsByMenuIdAndName(String menuId, String name);
}
