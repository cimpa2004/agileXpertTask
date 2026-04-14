import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { api } from '../api';

export default function MenuManager() {
  const queryClient = useQueryClient();
  const [selectedMenuId, setSelectedMenuId] = useState('');
  const [menuName, setMenuName] = useState('');
  const [menuDialogOpen, setMenuDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [itemForm, setItemForm] = useState({ name: '', type: 'app', iconId: '', applicationId: '' });

  const menusQuery = useQuery({
    queryKey: ['menus'],
    queryFn: async () => (await api.get('/menus')).data
  });

  const iconsQuery = useQuery({
    queryKey: ['icons'],
    queryFn: async () => (await api.get('/icons')).data
  });

  const applicationsQuery = useQuery({
    queryKey: ['applications'],
    queryFn: async () => (await api.get('/applications')).data
  });

  const createMenuMutation = useMutation({
    mutationFn: async (payload) => (await api.post('/menus', payload)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['menus'] });
      setMenuName('');
    }
  });

  const updateMenuMutation = useMutation({
    mutationFn: async ({ id, payload }) => (await api.put(`/menus/${id}`, payload)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['menus'] });
      setMenuDialogOpen(false);
      setEditingMenu(null);
      setMenuName('');
    }
  });

  const deleteMenuMutation = useMutation({
    mutationFn: async (id) => api.delete(`/menus/${id}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['menus'] });
    }
  });

  const addItemMutation = useMutation({
    mutationFn: async ({ menuId, payload }) => (await api.post(`/menus/${menuId}/items`, payload)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['menus'] });
      setItemDialogOpen(false);
      setItemForm({ name: '', type: 'app', iconId: '', applicationId: '' });
    }
  });

  const createSubmenuMutation = useMutation({
    mutationFn: async ({ parentMenuId, name }) => (await api.post('/menus', { name, isSubmenu: true, parentMenuId })).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['menus'] });
    }
  });

  const menus = (menusQuery.data ?? []).filter((entry) => entry && typeof entry === 'object' && entry.id);
  const applications = applicationsQuery.data ?? [];
  const applicationsById = new Map(applications.map((application) => [application.id, application]));

  const resolveLabel = (value, byIdMap) => {
    if (!value) {
      return '-';
    }
    if (typeof value === 'string') {
      return byIdMap.get(value)?.name ?? value;
    }
    return value.name ?? value.id ?? '-';
  };

  const resolveId = (value) => {
    if (!value) {
      return null;
    }
    if (typeof value === 'string') {
      return value;
    }
    return value.id ?? null;
  };

  const rootMenus = menus.filter((menu) => !menu.isSubmenu && !resolveId(menu.parentMenu));
  const selectedMenu = menus.find((menu) => menu.id === selectedMenuId) ?? rootMenus[0] ?? menus[0];
  const directSubmenus = menus.filter((menu) => resolveId(menu.parentMenu) === selectedMenu?.id);
  const directContentItems = (selectedMenu?.items ?? []).filter((item) => item.type !== 'submenu');

  const openSubmenu = (submenu) => {
    if (submenu) {
      setSelectedMenuId(submenu.id);
    }
  };

  const openCreateMenuDialog = () => {
    setEditingMenu(null);
    setMenuName('');
    setMenuDialogOpen(true);
  };

  const openEditMenuDialog = (menu) => {
    setEditingMenu(menu);
    setMenuName(menu.name);
    setMenuDialogOpen(true);
  };

  return (
    <Card sx={{ border: '1px solid rgba(148, 163, 184, 0.18)', backdropFilter: 'blur(18px)', backgroundImage: 'linear-gradient(180deg, rgba(15,23,42,0.88), rgba(15,23,42,0.62))' }}>
      <CardContent sx={{ display: 'grid', gap: 2 }}>
        <Typography variant="h5" fontWeight={700}>Főmenü és almenü</Typography>
        <Typography variant="body2" color="text.secondary">Főmenük létrehozása, átnevezése, törlése és menüelemek hozzáadása.</Typography>

        {menusQuery.isError ? <Alert severity="error">Nem sikerült betölteni a menüket.</Alert> : null}

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-start">
          <Button variant="contained" onClick={openCreateMenuDialog}>Menü létrehozása</Button>
        </Stack>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Menü</TableCell>
              <TableCell align="right">Művelet</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rootMenus.map((menu) => (
              <TableRow key={menu.id} hover selected={menu.id === selectedMenuId} onClick={() => setSelectedMenuId(menu.id)} sx={{ cursor: 'pointer' }}>
                <TableCell>
                  <Typography fontWeight={600}>{menu.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{menu.id}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
                    <Button size="small" onClick={(event) => { event.stopPropagation(); setSelectedMenuId(menu.id); setItemDialogOpen(true); }}>Menüelem hozzáadása</Button>
                    <Button size="small" onClick={(event) => { event.stopPropagation(); openEditMenuDialog(menu); }}>Szerkesztés</Button>
                    <Button size="small" color="error" onClick={(event) => { event.stopPropagation(); deleteMenuMutation.mutate(menu.id); }}>Törlés</Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {selectedMenu ? (
          <Card variant="outlined" sx={{ borderColor: 'rgba(148, 163, 184, 0.18)' }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack spacing={1}>
                  <Typography variant="h6" fontWeight={600}>{selectedMenu.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedMenu.id}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Button size="small" variant="outlined" onClick={() => setSelectedMenuId('')} disabled={!selectedMenuId}>
                    Összes menü
                  </Button>
                </Stack>

                <Typography variant="subtitle1" fontWeight={700}>Almenük</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Név</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {directSubmenus.length ? directSubmenus.map((submenu) => {
                      return (
                        <TableRow key={submenu.id} hover sx={{ cursor: 'pointer' }} onClick={() => openSubmenu(submenu)}>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                              <Typography fontWeight={600}>{submenu.name}</Typography>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    }) : (
                      <TableRow>
                        <TableCell colSpan={2}>
                          <Typography variant="body2" color="text.secondary">Ehhez a menühöz még nincs almenü.</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                <Typography variant="subtitle1" fontWeight={700}>Menüelemek</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Név</TableCell>
                      <TableCell>Típus</TableCell>
                      <TableCell>Alkalmazás</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {directContentItems.length ? directContentItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.type}</TableCell>
                        <TableCell>{resolveLabel(item.application, applicationsById)}</TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={3}>
                          <Typography variant="body2" color="text.secondary">Ehhez a menühöz még nincs tartalmi elem.</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Stack>
            </CardContent>
          </Card>
        ) : null}
      </CardContent>

      <Dialog
        open={menuDialogOpen}
        onClose={() => setMenuDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{editingMenu ? 'Menü szerkesztése' : 'Új menü'}</DialogTitle>
        <DialogContent
          sx={{
            pt: '12px !important',
            '& .MuiFormControl-root:first-of-type': {
              mt: 0
            }
          }}
        >
          <TextField label="Név" value={menuName} onChange={(event) => setMenuName(event.target.value)} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMenuDialogOpen(false)}>Mégse</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (editingMenu) {
                updateMenuMutation.mutate({ id: editingMenu.id, payload: { name: menuName } });
                return;
              }
              createMenuMutation.mutate({ name: menuName });
              setMenuDialogOpen(false);
            }}
            disabled={!menuName.trim()}
          >
            Mentés
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={itemDialogOpen}
        onClose={() => setItemDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Menüelem hozzáadása</DialogTitle>
        <DialogContent
          sx={{
            pt: '12px !important',
            display: 'grid',
            gap: 2,
            '& .MuiFormControl-root:first-of-type': {
              mt: 0
            }
          }}
        >
          <TextField label="Név" value={itemForm.name} onChange={(event) => setItemForm((state) => ({ ...state, name: event.target.value }))} fullWidth />
          <TextField select label="Típus" value={itemForm.type} onChange={(event) => setItemForm((state) => ({ ...state, type: event.target.value }))} fullWidth>
            <MenuItem value="app">Alkalmazás</MenuItem>
            <MenuItem value="shortcut">Parancsikon</MenuItem>
          </TextField>
          <TextField
            select
            label="Ikon"
            value={itemForm.iconId}
            onChange={(event) => setItemForm((state) => ({ ...state, iconId: event.target.value }))}
            fullWidth
            helperText={(iconsQuery.data ?? []).length ? 'Válassz ikont.' : 'Nincs elérhető ikon.'}
          >
            {(iconsQuery.data ?? []).map((icon) => (
              <MenuItem key={icon.id} value={icon.id}>{icon.name} ({icon.id})</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Alkalmazás"
            value={itemForm.applicationId}
            onChange={(event) => setItemForm((state) => ({ ...state, applicationId: event.target.value }))}
            fullWidth
            helperText={applications.length ? 'Válassz alkalmazást.' : 'Nincs elérhető alkalmazás.'}
          >
            {applications.map((application) => (
              <MenuItem key={application.id} value={application.id}>{application.name} ({application.id})</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setItemDialogOpen(false)}>Mégse</Button>
          <Button variant="contained" onClick={() => addItemMutation.mutate({ menuId: selectedMenu?.id, payload: itemForm })} disabled={!selectedMenu?.id || !itemForm.name.trim()}>Mentés</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
