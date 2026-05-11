import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

export interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
  trend?: number;
}

export default function KpiCard({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
}: KpiCardProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accentColor = color ?? 'var(--color-primary)';
  const showTrend = typeof trend === 'number' && trend !== 0;
  const trendIsPositive = (trend ?? 0) > 0;
  const formatTrend = (value: number) =>
    Number.isInteger(value) ? Math.abs(value).toString() : Math.abs(value).toFixed(1);

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: 3,
        border: '1px solid',
        borderColor: theme.palette.divider,
        borderLeft: '4px solid',
        borderLeftColor: accentColor,
        boxShadow: isDark
          ? '0 14px 26px rgba(0, 0, 0, 0.35)'
          : '0 8px 18px -12px rgba(97, 3, 97, 0.35)',
        background: isDark
          ? `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.default, 0.95)} 100%)`
          : 'linear-gradient(145deg, #ffffff 0%, #faf5ff 100%)',
        fontFamily: "'Winky Sans', sans-serif",
      }}
    >
      <CardContent
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          p: 2.5,
          '&:last-child': { p: 2.5 },
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="overline"
            sx={{
              color: 'text.secondary',
              letterSpacing: 0.6,
              fontWeight: 600,
              fontFamily: "'Winky Sans', sans-serif",
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: 'var(--color-accent)',
              fontFamily: "'Winky Sans', sans-serif",
            }}
          >
            {value}
          </Typography>
          {showTrend ? (
            <Typography
              variant="caption"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                color: trendIsPositive
                  ? theme.palette.success.main
                  : theme.palette.error.main,
                fontWeight: 600,
                fontFamily: "'Winky Sans', sans-serif",
              }}
            >
              <span>{trendIsPositive ? '↑' : '↓'}</span>
              <span>
                {trendIsPositive ? '+' : ''}
                {formatTrend(trend ?? 0)}%
              </span>
            </Typography>
          ) : null}
          {subtitle ? (
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontFamily: "'Winky Sans', sans-serif",
              }}
            >
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        {icon ? (
          <Box
            sx={{
              height: 44,
              width: 44,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              color: accentColor,
              backgroundColor: alpha(theme.palette.primary.main, isDark ? 0.2 : 0.12),
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        ) : null}
      </CardContent>
    </Card>
  );
}
