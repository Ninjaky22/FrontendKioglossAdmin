import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import Stack from '@mui/material/Stack';
import { Link, useNavigate } from 'react-router';
import ThemeSwitcher from './ThemeSwitcher';
import Button from '@mui/material/Button';
import { getToken } from '../utils/tokenManagement';
import { CerrarSesion } from '../store/actions/session';
import { useDispatch } from 'react-redux';
import { HEADER_HEIGHT } from '../constants';

const AppBar = styled(MuiAppBar)(({ theme }) => ({
  borderWidth: 0,
  borderBottomWidth: 1,
  borderStyle: 'solid',
  borderColor: (theme.vars ?? theme).palette.divider,
  boxShadow: 'none',
  zIndex: theme.zIndex.drawer + 1,
}));

const LogoContainer = styled('div')({
  position: 'relative',
  height: HEADER_HEIGHT,
  display: 'flex',
  alignItems: 'center',
  '& img': {
    maxHeight: HEADER_HEIGHT,
  },
});

export interface DashboardHeaderProps {
  logo?: React.ReactNode;
  title?: string;
  menuOpen: boolean;
  onToggleMenu: (open: boolean) => void;
}

export default function DashboardHeader({
  logo,
  title,
  menuOpen,
  onToggleMenu,
}: DashboardHeaderProps) {
  const theme = useTheme();
  const dispatch = useDispatch<any>()
  const navegate = useNavigate();

  const handleMenuOpen = React.useCallback(() => {
    onToggleMenu(!menuOpen);
  }, [menuOpen, onToggleMenu]);

  const getMenuIcon = React.useCallback(
    (isExpanded: boolean) => {
      const expandMenuActionText = 'Expand';
      const collapseMenuActionText = 'Collapse';

      return (
        <Tooltip
          title={`${isExpanded ? collapseMenuActionText : expandMenuActionText} menu`}
          enterDelay={1000}
        >
          <div>
            <IconButton
              size="small"
              aria-label={`${isExpanded ? collapseMenuActionText : expandMenuActionText} navigation menu`}
              onClick={handleMenuOpen}
            >
              {isExpanded ? <MenuOpenIcon /> : <MenuIcon />}
            </IconButton>
          </div>
        </Tooltip>
      );
    },
    [handleMenuOpen],
  );

  return (
    <AppBar
      color="inherit"
      position="absolute"
      sx={{
        displayPrint: 'none',
        left: 0,
        right: 0,
        width: '100%',
        background: 'linear-gradient(135deg, #4a024a 0%, #610361 45%, #8b0d6f 100%)',
        color: '#ffffff',
        borderBottomColor: 'rgba(255, 255, 255, 0.18)',
        boxShadow: '0 6px 18px rgba(35, 0, 42, 0.35)',
        '& .MuiIconButton-root': {
          color: '#ffffff',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
          },
        },
      }}
    >
      <Toolbar
        sx={{
          backgroundColor: 'transparent',
          mx: { xs: -0.75, sm: -1 },
          minHeight: HEADER_HEIGHT,
          height: HEADER_HEIGHT,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            flexWrap: 'wrap',
            width: '100%',
          }}
        >
          <Stack direction="row" alignItems="center">
            <Box sx={{ mr: 5 }}>{getMenuIcon(menuOpen)}</Box>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <Stack direction="row" alignItems="center">
                {logo ? <LogoContainer>{logo}</LogoContainer> : null}
                {title ? (
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#ffffff',
                      fontWeight: '700',
                      ml: 1,
                      whiteSpace: 'nowrap',
                      lineHeight: 1,
                    }}
                  >
                    {title}
                  </Typography>
                ) : null}
              </Stack>
            </Link>
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ marginLeft: 'auto' }}
          >
            <Stack
              direction="row"
              alignItems="center"
              sx={{ color: '#ffffff' }}
            >
              <ThemeSwitcher />
            </Stack>
            {getToken() && (
              <Button
                onClick={() => {
                  dispatch(CerrarSesion());
                  navegate('/log-in');
                }}
                variant="contained"
                sx={{
                  my: 1,
                  mx: 1.5,
                  backgroundColor: '#ffffff',
                  color: '#4a024a',
                  fontWeight: 700,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#f6e9f6',
                  },
                }}
              >
                Cerrar Sesion
              </Button>
            )}
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
