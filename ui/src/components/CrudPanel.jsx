import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { api } from '../api';
import SectionCard from './SectionCard';

const emptyValue = (type) => (type === 'multiline' ? '' : '');

export default function CrudPanel({ title, subtitle, queryKey, endpoint, fields, rowLabel, transformCreatePayload }) {
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formState, setFormState] = useState(() => buildInitialState(fields));

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await api.get(endpoint);
      return response.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await api.post(endpoint, payload);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
      setDialogOpen(false);
      setEditingItem(null);
      setFormState(buildInitialState(fields));
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const response = await api.put(`${endpoint}/${id}`, payload);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
      setDialogOpen(false);
      setEditingItem(null);
      setFormState(buildInitialState(fields));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`${endpoint}/${id}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
    }
  });

  const columns = useMemo(() => fields.filter((field) => field.listable !== false), [fields]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormState(buildInitialState(fields));
    setDialogOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormState(buildStateFromItem(fields, item));
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const payload = transformCreatePayload ? transformCreatePayload(formState) : formState;
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, payload });
      return;
    }
    createMutation.mutate(payload);
  };

  return (
    <SectionCard
      title={title}
      subtitle={subtitle}
      action={<Button variant="contained" onClick={handleOpenCreate}>Új létrehozása</Button>}
    >
      {query.isError ? <Alert severity="error">Nem sikerült betölteni az adatokat.</Alert> : null}
      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Név</TableCell>
              {columns.slice(1).map((field) => <TableCell key={field.name}>{field.label}</TableCell>)}
              <TableCell align="right">Művelet</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(query.data ?? []).map((item) => (
              <TableRow key={item.id} hover>
                <TableCell>
                  <Typography fontWeight={600}>{item.name ?? rowLabel(item)}</Typography>
                  <Typography variant="caption" color="text.secondary">{item.id}</Typography>
                </TableCell>
                {columns.slice(1).map((field) => <TableCell key={field.name}>{renderValue(item[field.name], field)}</TableCell>)}
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button size="small" onClick={() => handleOpenEdit(item)}>Szerkesztés</Button>
                    <Button size="small" color="error" onClick={() => deleteMutation.mutate(item.id)}>Törlés</Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingItem ? 'Szerkesztés' : 'Új elem'}</DialogTitle>
        <DialogContent sx={{ pt: 1, display: 'grid', gap: 2 }}>
          {fields.map((field) => (
            <TextField
              key={field.name}
              label={field.label}
              value={formState[field.name] ?? ''}
              onChange={(event) => setFormState((current) => ({ ...current, [field.name]: event.target.value }))}
              fullWidth
              multiline={field.multiline}
              minRows={field.multiline ? 3 : undefined}
              select={field.options?.length > 0}
              helperText={field.helperText}
            >
              {field.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </TextField>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Mégse</Button>
          <Button variant="contained" onClick={handleSubmit}>Mentés</Button>
        </DialogActions>
      </Dialog>
    </SectionCard>
  );
}

function buildInitialState(fields) {
  return fields.reduce((accumulator, field) => {
    accumulator[field.name] = field.multiline ? '' : emptyValue(field.type);
    return accumulator;
  }, {});
}

function buildStateFromItem(fields, item) {
  return fields.reduce((accumulator, field) => {
    const value = item[field.name];
    accumulator[field.name] = Array.isArray(value) ? value.join(', ') : (value ?? '');
    return accumulator;
  }, {});
}

function renderValue(value, field) {
  if (Array.isArray(value)) {
    return value.map((entry) => (entry?.name ?? entry?.id ?? String(entry))).join(', ');
  }
  if (value && typeof value === 'object') {
    return value.name ?? value.id ?? JSON.stringify(value);
  }
  if (field.type === 'image') {
    return value ? <img src={value} alt="wallpaper" style={{ width: 96, height: 54, objectFit: 'cover', borderRadius: 12 }} /> : '-';
  }
  return value || '-';
}
