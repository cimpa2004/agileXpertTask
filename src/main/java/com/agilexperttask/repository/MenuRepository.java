package com.agilexperttask.repository;

import com.agilexperttask.model.Menu;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface MenuRepository extends JpaRepository<Menu, String> {

    Optional<Menu> findByName(String name);

    @EntityGraph(attributePaths = {"items", "items.icon", "items.application", "parentMenu"})
    List<Menu> findAllByOrderByNameAsc();

    List<Menu> findByParentMenuIdOrderByNameAsc(String parentMenuId);
}
