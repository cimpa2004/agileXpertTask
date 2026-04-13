package com.agilexperttask.controller;

import com.agilexperttask.dto.DashboardResponse;
import com.agilexperttask.service.DemoDataService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DemoDataService demoDataService;

    public DashboardController(DemoDataService demoDataService) {
        this.demoDataService = demoDataService;
    }

    @GetMapping
    public DashboardResponse dashboard() {
        return demoDataService.buildDashboard();
    }

    @PostMapping("/simulate")
    public DashboardResponse simulate() {
        return demoDataService.seedDemoData();
    }
}
