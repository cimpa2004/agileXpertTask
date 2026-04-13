package com.agilexperttask.controller;

import com.agilexperttask.dto.IconRequest;
import com.agilexperttask.model.Icon;
import com.agilexperttask.repository.IconRepository;
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
@RequestMapping("/api/icons")
public class IconController {

    private final IconRepository iconRepository;

    public IconController(IconRepository iconRepository) {
        this.iconRepository = iconRepository;
    }

    @GetMapping
    public List<Icon> list() {
        return iconRepository.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Icon create(@RequestBody IconRequest request) {
        return save(new Icon(), request);
    }

    @PutMapping("/{id}")
    public Icon update(@PathVariable String id, @RequestBody IconRequest request) {
        return save(iconRepository.findById(id).orElseThrow(), request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        iconRepository.deleteById(id);
    }

    private Icon save(Icon icon, IconRequest request) {
        icon.setName(request.name());
        icon.setGlyph(request.glyph());
        icon.setColor(request.color());
        return iconRepository.save(icon);
    }
}
