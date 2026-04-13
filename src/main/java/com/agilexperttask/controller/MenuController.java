package com.agilexperttask.controller;

import com.agilexperttask.dto.MenuItemRequest;
import com.agilexperttask.dto.MenuRequest;
import com.agilexperttask.model.Menu;
import com.agilexperttask.model.MenuItem;
import com.agilexperttask.repository.ApplicationRepository;
import com.agilexperttask.repository.IconRepository;
import com.agilexperttask.repository.MenuItemRepository;
import com.agilexperttask.repository.MenuRepository;
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

@RestController
@RequestMapping("/api/menus")
public class MenuController {

    private final MenuRepository menuRepository;
    private final MenuItemRepository menuItemRepository;
    private final IconRepository iconRepository;
    private final ApplicationRepository applicationRepository;

    public MenuController(MenuRepository menuRepository,
                          MenuItemRepository menuItemRepository,
                          IconRepository iconRepository,
                          ApplicationRepository applicationRepository) {
        this.menuRepository = menuRepository;
        this.menuItemRepository = menuItemRepository;
        this.iconRepository = iconRepository;
        this.applicationRepository = applicationRepository;
    }

    @GetMapping
    public List<Menu> list() {
        return menuRepository.findAllByOrderByNameAsc();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Menu create(@RequestBody MenuRequest request) {
        Menu menu = new Menu();
        return save(menu, request);
    }

    @PutMapping("/{id}")
    public Menu update(@PathVariable String id, @RequestBody MenuRequest request) {
        Menu menu = menuRepository.findById(id).orElseThrow();
        return save(menu, request);
    }

    private Menu save(Menu menu, MenuRequest request) {
        boolean isNew = menu.getId() == null || menu.getId().isBlank();
        menu.setName(request.name());
        if (request.isSubmenu() != null) {
            menu.setSubmenu(Boolean.TRUE.equals(request.isSubmenu()));
        } else if (isNew) {
            menu.setSubmenu(false);
        }

        if (request.parentMenuId() != null) {
            if (request.parentMenuId().isBlank()) {
                menu.setParentMenu(null);
            } else {
                menu.setParentMenu(menuRepository.findById(request.parentMenuId()).orElseThrow());
            }
        } else if (isNew) {
            menu.setParentMenu(null);
        }
        return menuRepository.save(menu);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        menuRepository.deleteById(id);
    }

    @PostMapping("/{menuId}/items")
    @ResponseStatus(HttpStatus.CREATED)
    public MenuItem addItem(@PathVariable String menuId, @RequestBody MenuItemRequest request) {
        Menu menu = menuRepository.findById(menuId).orElseThrow();
        MenuItem item = new MenuItem();
        item.setName(request.name());
        item.setType(request.type());
        item.setMenu(menu);
        item.setIcon(request.iconId() == null || request.iconId().isBlank() ? null : iconRepository.findById(request.iconId()).orElseThrow());
        item.setApplication(request.applicationId() == null || request.applicationId().isBlank() ? null : applicationRepository.findById(request.applicationId()).orElseThrow());
        return menuItemRepository.save(item);
    }
}
