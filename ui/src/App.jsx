import { useMutation, useQuery } from '@tanstack/react-query';
import { Alert, Box, Button, Container, Paper, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useState } from 'react';
import { api } from './api';
import MenuManager from './components/MenuManager';
import SimpleCatalogManager from './components/SimpleCatalogManager';
import UserManager from './components/UserManager';

function StatsCard({ label, value }) {
  return (
    <Paper elevation={0} sx={{ p: 2.5, border: '1px solid rgba(148, 163, 184, 0.16)', backgroundColor: 'rgba(15, 23, 42, 0.68)' }}>
      <Typography variant="overline" color="text.secondary">{label}</Typography>
      <Typography variant="h4" fontWeight={700}>{value}</Typography>
    </Paper>
  );
}

export default function App() {
  const [tab, setTab] = useState(0);

  const dashboardQuery = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get('/dashboard')).data,
    refetchInterval: 15000
  });

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: async () => (await api.get('/users')).data
  });

  const menusQuery = useQuery({
    queryKey: ['menus'],
    queryFn: async () => (await api.get('/menus')).data
  });

  const applicationsQuery = useQuery({
    queryKey: ['applications'],
    queryFn: async () => (await api.get('/applications')).data
  });

  const iconsQuery = useQuery({
    queryKey: ['icons'],
    queryFn: async () => (await api.get('/icons')).data
  });

  const wallpapersQuery = useQuery({
    queryKey: ['wallpapers'],
    queryFn: async () => (await api.get('/wallpapers')).data
  });

  const themesQuery = useQuery({
    queryKey: ['themes'],
    queryFn: async () => (await api.get('/themes')).data
  });

  const simulateMutation = useMutation({
    mutationFn: async () => (await api.post('/dashboard/simulate')).data,
    onSuccess: async () => {
      await Promise.all([
        dashboardQuery.refetch(),
        usersQuery.refetch(),
        menusQuery.refetch(),
        applicationsQuery.refetch(),
        iconsQuery.refetch(),
        wallpapersQuery.refetch(),
        themesQuery.refetch()
      ]);
    }
  });

  const summary = dashboardQuery.data;

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, border: '1px solid rgba(148, 163, 184, 0.18)', background: 'linear-gradient(135deg, rgba(15,23,42,0.92), rgba(8,17,31,0.74))' }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="overline" color="primary.light" sx={{ letterSpacing: 2 }}>agileXpertTask</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, maxWidth: 900 }}>
                  Smart device OS
                </Typography>
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button variant="contained" size="large" onClick={() => simulateMutation.mutate()}>
                  Szimuláció indítása
                </Button>
              </Stack>

              {simulateMutation.isError ? <Alert severity="error">A szimuláció frissítése nem sikerült.</Alert> : null}
            </Stack>
          </Paper>

          <Box
            sx={{
              display: 'grid',
              gap: 2.5,
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(3, minmax(0, 1fr))'
              }
            }}
          >
            <StatsCard label="Felhasználók" value={summary?.userCount ?? usersQuery.data?.length ?? 0} />
            <StatsCard label="Menük" value={summary?.menuCount ?? menusQuery.data?.length ?? 0} />
            <StatsCard label="Alkalmazások" value={summary?.applicationCount ?? applicationsQuery.data?.length ?? 0} />
            <StatsCard label="Ikonok" value={summary?.iconCount ?? iconsQuery.data?.length ?? 0} />
            <StatsCard label="Háttérképek" value={summary?.wallpaperCount ?? wallpapersQuery.data?.length ?? 0} />
            <StatsCard label="Arculatok" value={summary?.themeCount ?? themesQuery.data?.length ?? 0} />
          </Box>

          {summary?.highlights ? (
            <Paper elevation={0} sx={{ p: 2.5, border: '1px solid rgba(148, 163, 184, 0.16)', backgroundColor: 'rgba(15, 23, 42, 0.68)' }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Rövid összegzés</Typography>
              <Stack spacing={1}>
                {summary.highlights.map((highlight) => (
                  <Typography key={highlight} variant="body2" color="text.secondary">{highlight}</Typography>
                ))}
              </Stack>
            </Paper>
          ) : null}

          <Paper elevation={0} sx={{ border: '1px solid rgba(148, 163, 184, 0.16)', backgroundColor: 'rgba(15, 23, 42, 0.55)' }}>
            <Tabs value={tab} onChange={(_, nextTab) => setTab(nextTab)} variant="scrollable" scrollButtons="auto">
              <Tab label="Felhasználók" />
              <Tab label="Menük" />
              <Tab label="Alkalmazások" />
              <Tab label="Ikonok" />
              <Tab label="Háttérképek" />
              <Tab label="Arculatok" />
            </Tabs>
          </Paper>

          {tab === 0 ? <UserManager menus={menusQuery.data ?? []} wallpapers={wallpapersQuery.data ?? []} themes={themesQuery.data ?? []} applications={applicationsQuery.data ?? []} /> : null}
          {tab === 1 ? <MenuManager /> : null}
          {tab === 2 ? <SimpleCatalogManager title="Alkalmazások" subtitle="Aknakereső, openmap, paint és címtár kezelése." queryKey={['applications']} endpoint="/applications" fields={[
            { name: 'name', label: 'Név' },
            { name: 'description', label: 'Leírás', multiline: true },
            { name: 'category', label: 'Kategória' },
            {
              name: 'iconId',
              label: 'Ikon',
              options: (iconsQuery.data ?? []).map((icon) => ({ value: icon.id, label: `${icon.name} (${icon.id})` })),
              helperText: (iconsQuery.data ?? []).length ? 'Válassz ikont.' : 'Nincs elérhető ikon.'
            },
            { name: 'launchTarget', label: 'Indítási cél' }
          ]} /> : null}
          {tab === 3 ? <SimpleCatalogManager title="Ikonok" subtitle="Új ikonok létrehozása és módosítása." queryKey={['icons']} endpoint="/icons" fields={[
            { name: 'name', label: 'Név' },
            { name: 'glyph', label: 'Glyph' },
            { name: 'color', label: 'Szín', type: 'color' }
          ]} /> : null}
          {tab === 4 ? <SimpleCatalogManager title="Háttérképek" subtitle="Háttérképek hozzáadása, kiválasztása és módosítása." queryKey={['wallpapers']} endpoint="/wallpapers" fields={[
            { name: 'name', label: 'Név' },
            { name: 'imageUrl', label: 'Kép URL', helperText: 'Online kép link vagy CDN URL.' }
          ]} /> : null}
          {tab === 5 ? <SimpleCatalogManager title="Arculatok" subtitle="Színpaletták és megjelenési profilok kezelése." queryKey={['themes']} endpoint="/themes" fields={[
            { name: 'name', label: 'Név' },
            { name: 'primaryColor', label: 'Elsődleges szín', type: 'color' },
            { name: 'secondaryColor', label: 'Másodlagos szín', type: 'color' },
            { name: 'accentColor', label: 'Emelés színe', type: 'color' }
          ]} /> : null}
        </Stack>
      </Container>
    </Box>
  );
}
