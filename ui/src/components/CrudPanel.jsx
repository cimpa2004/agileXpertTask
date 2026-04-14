import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
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
  const items = useMemo(() => normalizeQueryItems(query.data), [query.data]);

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
            {items.map((item, index) => (
              <TableRow key={getItemId(item, index)} hover>
                <TableCell>
                  <Typography fontWeight={600}>{item.name ?? rowLabel(item) ?? '-'}</Typography>
                  <Typography variant="caption" color="text.secondary">{getItemDisplayId(item, index)}</Typography>
                </TableCell>
                {columns.slice(1).map((field) => <TableCell key={field.name}>{renderValue(resolveFieldValue(item, field), field)}</TableCell>)}
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button size="small" onClick={() => handleOpenEdit(item)}>Szerkesztés</Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => deleteMutation.mutate(item.id)}
                      disabled={!item.id}
                    >
                      Törlés
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{editingItem ? 'Szerkesztés' : 'Új elem'}</DialogTitle>
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
          {fields.map((field) => {
            if (isColorField(field)) {
              const colorValue = isValidHexColor(formState[field.name]) ? formState[field.name] : '#000000';

              return (
                <TextField
                  key={field.name}
                  type="color"
                  label={field.label}
                  value={colorValue}
                  onChange={(event) => setFormState((current) => ({ ...current, [field.name]: event.target.value }))}
                  fullWidth
                  helperText={field.helperText}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& input': {
                      height: 44,
                      padding: 0,
                      cursor: 'pointer'
                    },
                    '& input[type="color"]': {
                      borderRadius: '12px',
                      overflow: 'hidden'
                    },
                    '& input[type="color"]::-webkit-color-swatch-wrapper': {
                      padding: 2,
                      borderRadius: '12px'
                    },
                    '& input[type="color"]::-webkit-color-swatch': {
                      border: 'none',
                      borderRadius: '10px'
                    },
                    '& input[type="color"]::-moz-color-swatch': {
                      border: 'none',
                      borderRadius: '10px'
                    }
                  }}
                />
              );
            }

            if (field.multiple && field.options?.length > 0) {
              const selectedValues = Array.isArray(formState[field.name]) ? formState[field.name] : [];
              const selectedOptions = field.options.filter((option) => selectedValues.includes(option.value));

              return (
                <Autocomplete
                  key={field.name}
                  multiple
                  options={field.options}
                  value={selectedOptions}
                  onChange={(_, nextOptions) => {
                    setFormState((current) => ({
                      ...current,
                      [field.name]: nextOptions.map((option) => option.value)
                    }));
                  }}
                  getOptionLabel={(option) => option.label}
                  isOptionEqualToValue={(option, value) => option.value === value.value}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={field.label}
                      helperText={field.helperText}
                    />
                  )}
                />
              );
            }

            return (
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
            );
          })}
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
    if (field.multiple) {
      accumulator[field.name] = [];
      return accumulator;
    }
    if (isColorField(field)) {
      accumulator[field.name] = '#000000';
      return accumulator;
    }
    accumulator[field.name] = field.multiline ? '' : emptyValue(field.type);
    return accumulator;
  }, {});
}

function buildStateFromItem(fields, item) {
  return fields.reduce((accumulator, field) => {
    const value = resolveFieldValue(item, field);
    if (field.multiple) {
      accumulator[field.name] = Array.isArray(value)
        ? value.map((entry) => (entry && typeof entry === 'object' ? (entry.id ?? entry.value ?? '') : entry)).filter(Boolean)
        : [];
      return accumulator;
    }

    if (field.options?.length && value && typeof value === 'object') {
      accumulator[field.name] = value.id ?? value.value ?? '';
      return accumulator;
    }

    if (isColorField(field)) {
      accumulator[field.name] = isValidHexColor(value) ? value : '#000000';
      return accumulator;
    }

    accumulator[field.name] = Array.isArray(value) ? value.join(', ') : (value ?? '');
    return accumulator;
  }, {});
}

function renderValue(value, field) {
  if (isColorField(field)) {
    const colorValue = isValidHexColor(value) ? value : null;
    return colorValue ? (
      <Stack direction="row" spacing={1} alignItems="center">
        <Box sx={{ width: 16, height: 16, borderRadius: '4px', border: '1px solid rgba(148, 163, 184, 0.35)', backgroundColor: colorValue }} />
        <Typography variant="body2">{colorValue}</Typography>
      </Stack>
    ) : '-';
  }

  if (field.options?.length > 0 && !Array.isArray(value) && value && typeof value !== 'object') {
    const selectedOption = field.options.find((option) => option.value === value);
    if (selectedOption) {
      return selectedOption.label;
    }
  }

  if (Array.isArray(value)) {
    if (field.options?.length > 0) {
      const labelsByValue = new Map(field.options.map((option) => [option.value, option.label]));
      return value.map((entry) => {
        const entryValue = entry && typeof entry === 'object' ? (entry.id ?? entry.value ?? String(entry)) : String(entry);
        return labelsByValue.get(entryValue) ?? (entry?.name ?? entryValue);
      }).join(', ');
    }
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

function isColorField(field) {
  return field.type === 'color' || /color/i.test(field.name ?? '');
}

function isValidHexColor(value) {
  return typeof value === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim());
}

function normalizeQueryItems(data) {
  const source = Array.isArray(data)
    ? data
    : (Array.isArray(data?.content) ? data.content : []);

  return source
    .map((entry) => {
      if (entry == null) {
        return null;
      }
      if (typeof entry === 'string' || typeof entry === 'number') {
        const asText = String(entry);
        return { id: asText, name: asText };
      }
      if (typeof entry === 'object') {
        return entry;
      }
      return null;
    })
    .filter(Boolean);
}

function resolveFieldValue(item, field) {
  const direct = item?.[field.name];
  if (direct !== undefined) {
    return direct;
  }

  if (field.name.endsWith('Id')) {
    const relatedName = field.name.slice(0, -2);
    return item?.[relatedName];
  }

  if (field.name.endsWith('Ids')) {
    const base = field.name.slice(0, -3);
    const singular = base.endsWith('s') ? base.slice(0, -1) : base;
    return item?.[base] ?? item?.[`${singular}s`];
  }

  return undefined;
}

function getItemId(item, index) {
  return item?.id ?? item?.name ?? `row-${index}`;
}

function getItemDisplayId(item, index) {
  return item?.id ?? `row-${index}`;
}
