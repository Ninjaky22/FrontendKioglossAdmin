import { type Theme, alpha, type Components } from '@mui/material/styles';
import { gray, orange } from '../themePrimitives';

/* eslint-disable import/prefer-default-export */
export const feedbackCustomizations: Components<Theme> = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        minHeight: '100vh',
        background:
          'radial-gradient(1200px circle at 8% -10%, #ffffff 0%, #f6e8ff 42%, #fce7f3 100%)',
        backgroundAttachment: 'fixed',
      },
      '#root': {
        minHeight: '100vh',
      },
      '[data-mui-color-scheme="dark"] body': {
        background:
          'radial-gradient(1200px circle at 10% -10%, #2b0a2b 0%, #1f0d2e 40%, #120817 100%)',
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 10,
        backgroundColor: orange[100],
        color: (theme.vars || theme).palette.text.primary,
        border: `1px solid ${alpha(orange[300], 0.5)}`,
        '& .MuiAlert-icon': {
          color: orange[500],
        },
        ...theme.applyStyles('dark', {
          backgroundColor: `${alpha(orange[900], 0.5)}`,
          border: `1px solid ${alpha(orange[800], 0.5)}`,
        }),
      }),
    },
  },
  MuiDialog: {
    styleOverrides: {
      root: ({ theme }) => ({
        '& .MuiDialog-paper': {
          borderRadius: 24,
          border: '1px solid',
          borderColor: (theme.vars || theme).palette.divider,
        },
      }),
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: ({ theme }) => ({
        height: 8,
        borderRadius: 8,
        backgroundColor: gray[200],
        ...theme.applyStyles('dark', {
          backgroundColor: gray[800],
        }),
      }),
    },
  },
};
