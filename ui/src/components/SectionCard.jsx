import { Card, CardContent, Typography } from '@mui/material';

export default function SectionCard({ title, subtitle, children, action }) {
  return (
    <Card
      sx={{
        border: '1px solid rgba(148, 163, 184, 0.18)',
        backdropFilter: 'blur(18px)',
        backgroundImage: 'linear-gradient(180deg, rgba(15,23,42,0.88), rgba(15,23,42,0.62))'
      }}
    >
      <CardContent sx={{ display: 'grid', gap: 2 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }}>
          <div>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{title}</Typography>
            <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
          </div>
          {action}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
