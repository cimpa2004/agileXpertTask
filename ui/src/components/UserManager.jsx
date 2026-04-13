import CrudPanel from './CrudPanel';

export default function UserManager({ menus, wallpapers, themes, applications }) {
  return (
    <CrudPanel
      title="Felhasználók"
      subtitle="Név, főmenü, háttérkép, arculat és telepített alkalmazások kezelése."
      queryKey={['users']}
      endpoint="/users"
      fields={[
        { name: 'name', label: 'Név' },
        { name: 'mainMenuId', label: 'Főmenü ID', helperText: menus.length ? `Elérhető menük: ${menus.map((menu) => menu.name).join(', ')}` : 'Nincs még menü.' },
        { name: 'activeWallpaperId', label: 'Aktív háttérkép ID', helperText: wallpapers.length ? `Elérhető háttérképek: ${wallpapers.map((wallpaper) => wallpaper.name).join(', ')}` : 'Nincs még háttérkép.' },
        { name: 'activeThemeId', label: 'Aktív arculat ID', helperText: themes.length ? `Elérhető arculatok: ${themes.map((theme) => theme.name).join(', ')}` : 'Nincs még arculat.' },
        { name: 'installedApplicationIds', label: 'Telepített alkalmazások ID-i', multiline: true, helperText: applications.length ? `Vesszővel elválasztva: ${applications.map((application) => application.name).join(', ')}` : 'Nincs még alkalmazás.' }
      ]}
      rowLabel={(item) => item.name}
      transformCreatePayload={(state) => ({
        ...state,
        installedApplicationIds: state.installedApplicationIds
          ? state.installedApplicationIds.split(',').map((entry) => entry.trim()).filter(Boolean)
          : []
      })}
    />
  );
}
