import CrudPanel from './CrudPanel';

export default function UserManager({ menus, wallpapers, themes, applications }) {
  const menuOptions = menus.map((menu) => ({ value: menu.id, label: `${menu.name} (${menu.id})` }));
  const wallpaperOptions = wallpapers.map((wallpaper) => ({ value: wallpaper.id, label: `${wallpaper.name} (${wallpaper.id})` }));
  const themeOptions = themes.map((theme) => ({ value: theme.id, label: `${theme.name} (${theme.id})` }));
  const applicationOptions = applications.map((application) => ({ value: application.id, label: `${application.name} (${application.id})` }));

  return (
    <CrudPanel
      title="Felhasználók"
      subtitle="Név, főmenü, háttérkép, arculat és telepített alkalmazások kezelése."
      queryKey={['users']}
      endpoint="/users"
      fields={[
        { name: 'name', label: 'Név' },
        { name: 'mainMenuId', label: 'Főmenü', options: menuOptions, helperText: menus.length ? 'Válassz egy menüt.' : 'Nincs még menü.' },
        { name: 'activeWallpaperId', label: 'Aktív háttérkép', options: wallpaperOptions, helperText: wallpapers.length ? 'Válassz egy háttérképet.' : 'Nincs még háttérkép.' },
        { name: 'activeThemeId', label: 'Aktív arculat', options: themeOptions, helperText: themes.length ? 'Válassz egy arculatot.' : 'Nincs még arculat.' },
        { name: 'installedApplicationIds', label: 'Telepített alkalmazások', multiple: true, options: applicationOptions, helperText: applications.length ? 'Több alkalmazás is kiválasztható.' : 'Nincs még alkalmazás.' }
      ]}
      rowLabel={(item) => item.name}
      transformCreatePayload={(state) => ({
        ...state,
        installedApplicationIds: Array.isArray(state.installedApplicationIds) ? state.installedApplicationIds : []
      })}
    />
  );
}
