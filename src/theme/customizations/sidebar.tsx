import type { Theme, Components } from '@mui/material/styles';
import { listSubheaderClasses } from '@mui/material/ListSubheader';
import { listItemButtonClasses } from '@mui/material/ListItemButton';
import { listItemIconClasses } from '@mui/material/ListItemIcon';
import { listItemTextClasses } from '@mui/material/ListItemText';
import { typographyClasses } from '@mui/material/Typography';
import { svgIconClasses } from '@mui/material/SvgIcon';

/* eslint-disable import/prefer-default-export */
export const sidebarCustomizations: Components<Theme> = {
  MuiDrawer: {
    styleOverrides: {
      root: () => ({
        // ── Encabezados de sección ("Tienda", "Contenido") ──────────────
        [`& .${listSubheaderClasses.root}`]: {
          lineHeight: 3,
          backgroundColor: 'transparent',   // evita el fondo blanco del tema
          color: 'rgba(255, 255, 255, 0.72)',
        },

        // ── Items de navegación ──────────────────────────────────────────
        [`& .${listItemButtonClasses.root}`]: {
          color: '#ffffff',

          // Iconos
          [`& .${listItemIconClasses.root}`]: {
            color: '#ffffff',
            [`& .${svgIconClasses.root}`]: { color: '#ffffff' },
          },

          // Texto principal
          [`& .${listItemTextClasses.root}`]: {
            color: '#ffffff',
            [`& .${typographyClasses.root}`]: { color: '#ffffff' },
          },

          // Hover
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            color: '#ffffff',
          },

          // Item activo/seleccionado — se sobre-escribe el text.primary del tema
          '&.Mui-selected': {
            backgroundColor: 'rgba(255, 255, 255, 0.18)',
            color: '#ffffff',
            [`& .${listItemIconClasses.root}`]: {
              color: '#ffffff',
              [`& .${svgIconClasses.root}`]: { color: '#ffffff' },
            },
            [`& .${listItemTextClasses.root}`]: {
              color: '#ffffff',
              [`& .${typographyClasses.root}`]: { color: '#ffffff' },
            },
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.22)' },
          },

          // Disabled
          '&.Mui-disabled': {
            color: 'rgba(255, 255, 255, 0.38)',
            [`& .${listItemIconClasses.root}`]: { color: 'rgba(255, 255, 255, 0.38)' },
            [`& .${listItemTextClasses.root}`]: { color: 'rgba(255, 255, 255, 0.38)' },
          },
        },
      }),
    },
  },
};
