package com.agilexperttask.service;

import com.agilexperttask.dto.DashboardResponse;
import com.agilexperttask.model.Application;
import com.agilexperttask.model.Icon;
import com.agilexperttask.model.Menu;
import com.agilexperttask.model.MenuItem;
import com.agilexperttask.model.Theme;
import com.agilexperttask.model.UserAccount;
import com.agilexperttask.model.Wallpaper;
import com.agilexperttask.repository.ApplicationRepository;
import com.agilexperttask.repository.IconRepository;
import com.agilexperttask.repository.MenuItemRepository;
import com.agilexperttask.repository.MenuRepository;
import com.agilexperttask.repository.ThemeRepository;
import com.agilexperttask.repository.UserAccountRepository;
import com.agilexperttask.repository.WallpaperRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class DemoDataService {

    private final UserAccountRepository userAccountRepository;
    private final MenuRepository menuRepository;
    private final MenuItemRepository menuItemRepository;
    private final ApplicationRepository applicationRepository;
    private final IconRepository iconRepository;
    private final WallpaperRepository wallpaperRepository;
    private final ThemeRepository themeRepository;

    public DemoDataService(UserAccountRepository userAccountRepository,
                           MenuRepository menuRepository,
                           MenuItemRepository menuItemRepository,
                           ApplicationRepository applicationRepository,
                           IconRepository iconRepository,
                           WallpaperRepository wallpaperRepository,
                           ThemeRepository themeRepository) {
        this.userAccountRepository = userAccountRepository;
        this.menuRepository = menuRepository;
        this.menuItemRepository = menuItemRepository;
        this.applicationRepository = applicationRepository;
        this.iconRepository = iconRepository;
        this.wallpaperRepository = wallpaperRepository;
        this.themeRepository = themeRepository;
    }

    public DashboardResponse seedDemoData() {
        Icon mapsIcon = upsertIcon("openmap-icon", "map", "#2F80ED");
        Icon gamesIcon = upsertIcon("games-icon", "gamepad", "#F2994A");
        Icon paintIcon = upsertIcon("paint-icon", "brush", "#EB5757");
        Icon contactsIcon = upsertIcon("contacts-icon", "contacts", "#27AE60");
        Icon recipesIcon = upsertIcon("recipes-icon", "restaurant", "#BB6BD9");

        Application openMap = upsertApplication("openmap", "GPS, útvonaltervezés és helykeresés.", "navigation", mapsIcon, "Launch openmap");
        Application minesweeper = upsertApplication("aknakereső", "Klasszikus logikai játék.", "game", gamesIcon, "Launch minesweeper");
        Application paint = upsertApplication("paint", "Egyszerű rajz- és szerkesztőalkalmazás.", "creative", paintIcon, "Launch paint");
        Application directory = upsertApplication("címtár", "Családi és céges névjegyek kezelése.", "productivity", contactsIcon, "Launch directory");
        upsertApplication("receptek", "Családi receptek gyűjteménye.", "lifestyle", recipesIcon, "Launch recipes");

        Theme familyTheme = upsertTheme("family-sunrise", "#FDF2E9", "#FCF3CF", "#F5B041");
        Theme darkTheme = upsertTheme("midnight-work", "#111827", "#1F2937", "#60A5FA");

        Wallpaper lakeside = upsertWallpaper("lakeside", "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80");
        Wallpaper geometry = upsertWallpaper("geometry", "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80");

        Menu parentMenu = menuRepository.findByName("Főmenü").orElseGet(Menu::new);
        parentMenu.setName("Főmenü");
        menuRepository.save(parentMenu);

        Menu gamesMenu = ensureSubMenu("Játékok almenü", parentMenu);

        ensureMenuItem(parentMenu, "Térkép", "app", mapsIcon, openMap);
        ensureMenuItem(parentMenu, "Rajzolás", "app", paintIcon, paint);
        ensureMenuItem(parentMenu, "Címtár", "app", contactsIcon, directory);
        ensureMenuItem(gamesMenu, "Aknakereső", "app", gamesIcon, minesweeper);

        UserAccount parent = userAccountRepository.findByName("Szülő").orElseGet(UserAccount::new);
        parent.setName("Szülő");
        parent.setMainMenu(parentMenu);
        parent.setInstalledApplications(new ArrayList<>(List.of(openMap, paint, directory)));
        parent.setActiveTheme(familyTheme);
        parent.setActiveWallpaper(lakeside);
        parent.getWallpapers().clear();
        lakeside.setOwner(parent);
        geometry.setOwner(parent);
        parent.getWallpapers().add(lakeside);
        parent.getWallpapers().add(geometry);
        userAccountRepository.save(parent);

        UserAccount child = userAccountRepository.findByName("Gyerek").orElseGet(UserAccount::new);
        child.setName("Gyerek");
        child.setMainMenu(parentMenu);
        child.setInstalledApplications(new ArrayList<>(List.of(minesweeper, paint)));
        child.setActiveTheme(darkTheme);
        child.setActiveWallpaper(geometry);
        userAccountRepository.save(child);

        return buildDashboard();
    }

    public DashboardResponse buildDashboard() {
        return new DashboardResponse(
                userAccountRepository.count(),
                menuRepository.count(),
                applicationRepository.count(),
                iconRepository.count(),
                wallpaperRepository.count(),
                themeRepository.count(),
                List.of(
                        "A szülői főmenü tartalmaz almenüt és alkalmazás-indító elemeket.",
                        "A demo adatok az aknakereső, openmap, paint és címtár alkalmazásokat tartalmazzák.",
                        "A szimuláció gomb újratölti a felhasználókat, menüket, ikonokat és megjelenési elemeket."
                )
        );
    }

    private Icon upsertIcon(String name, String glyph, String color) {
        Icon icon = iconRepository.findByName(name).orElseGet(Icon::new);
        icon.setName(name);
        icon.setGlyph(glyph);
        icon.setColor(color);
        return iconRepository.save(icon);
    }

    private Application upsertApplication(String name, String description, String category, Icon icon, String launchTarget) {
        Application application = applicationRepository.findByName(name).orElseGet(Application::new);
        application.setName(name);
        application.setDescription(description);
        application.setCategory(category);
        application.setIcon(icon);
        application.setLaunchTarget(launchTarget);
        return applicationRepository.save(application);
    }

    private Theme upsertTheme(String name, String primaryColor, String secondaryColor, String accentColor) {
        Theme theme = themeRepository.findByName(name).orElseGet(Theme::new);
        theme.setName(name);
        theme.setPrimaryColor(primaryColor);
        theme.setSecondaryColor(secondaryColor);
        theme.setAccentColor(accentColor);
        return themeRepository.save(theme);
    }

    private Wallpaper upsertWallpaper(String name, String imageUrl) {
        Wallpaper wallpaper = wallpaperRepository.findByName(name).orElseGet(Wallpaper::new);
        wallpaper.setName(name);
        wallpaper.setImageUrl(imageUrl);
        return wallpaperRepository.save(wallpaper);
    }

    private Menu ensureSubMenu(String name, Menu parentMenu) {
        Menu submenu = menuRepository.findByName(name).orElseGet(Menu::new);
        submenu.setName(name);
        submenu.setSubmenu(true);
        submenu.setParentMenu(parentMenu);
        return menuRepository.save(submenu);
    }

    private void ensureMenuItem(Menu menu, String name, String type, Icon icon, Application application) {
        boolean exists = menuItemRepository.existsByMenuIdAndName(menu.getId(), name);
        if (exists) {
            return;
        }
        MenuItem item = new MenuItem();
        item.setName(name);
        item.setType(type);
        item.setMenu(menu);
        item.setIcon(icon);
        item.setApplication(application);
        menuItemRepository.save(item);
    }
}
