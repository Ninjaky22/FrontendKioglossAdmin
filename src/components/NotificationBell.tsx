import * as React from 'react';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Popover from '@mui/material/Popover';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CloseIcon from '@mui/icons-material/Close';
import notificationService, { type NotificationDTO } from '../services/notificationService';
import { getToken } from '../utils/tokenManagement';

// ──────────────────────────────────────────────
// Config por tipo
// ──────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { Icon: React.ElementType; color: string; bg: string }> = {
    ORDER_CREATED:        { Icon: ShoppingCartIcon,  color: '#610361', bg: '#f3e6f3' },
    ORDER_STATUS_CHANGED: { Icon: SwapHorizIcon,     color: '#1565c0', bg: '#e3f2fd' },
    LOW_STOCK:            { Icon: WarningAmberIcon,  color: '#e65100', bg: '#fff3e0' },
    OUT_OF_STOCK:         { Icon: ErrorOutlineIcon,  color: '#c62828', bg: '#ffebee' },
};

function relativeTime(isoDate: string): string {
    const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
    if (diff < 60)    return 'hace un momento';
    if (diff < 3600)  return `hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
    return `hace ${Math.floor(diff / 86400)} días`;
}

// ──────────────────────────────────────────────
// Item individual
// ──────────────────────────────────────────────
interface ItemProps {
    notif: NotificationDTO;
    onRead: (id: number) => void;
    onDelete: (id: number) => void;
}

function NotifItem({ notif, onRead, onDelete }: ItemProps) {
    const cfg = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.ORDER_STATUS_CHANGED;
    const { Icon } = cfg;
    const [hovered, setHovered] = React.useState(false);

    return (
        <ListItemButton
            onClick={() => !notif.read && onRead(notif.id)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            sx={{
                gap: 1.5,
                px: 2,
                py: 1.5,
                alignItems: 'flex-start',
                bgcolor: notif.read ? 'transparent' : 'rgba(97, 3, 97, 0.04)',
                '&:hover': { bgcolor: 'rgba(97, 3, 97, 0.08)' },
                position: 'relative',
            }}
        >
            {/* Dot no leído */}
            {!notif.read && (
                <Box sx={{
                    position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)',
                    width: 6, height: 6, borderRadius: '50%', bgcolor: '#9b30a0',
                }} />
            )}

            {/* Icono */}
            <Box sx={{
                width: 34, height: 34, borderRadius: 1.5,
                bgcolor: cfg.bg, display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0,
            }}>
                <Icon sx={{ fontSize: 18, color: cfg.color }} />
            </Box>

            {/* Texto */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                    variant="body2"
                    fontWeight={notif.read ? 400 : 600}
                    sx={{ color: notif.read ? 'text.secondary' : 'text.primary', lineHeight: 1.3 }}
                    noWrap
                >
                    {notif.title}
                </Typography>
                <Typography
                    variant="caption"
                    sx={{
                        color: notif.read ? 'text.disabled' : 'text.secondary',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.4,
                        mt: 0.25,
                    }}
                >
                    {notif.message}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled', mt: 0.5, display: 'block' }}>
                    {relativeTime(notif.createdAt)}
                </Typography>
            </Box>

            {/* Botón eliminar — visible solo en hover */}
            <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); onDelete(notif.id); }}
                sx={{
                    opacity: hovered ? 1 : 0,
                    transition: 'opacity 0.15s',
                    p: 0.25,
                    flexShrink: 0,
                }}
            >
                <CloseIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
            </IconButton>
        </ListItemButton>
    );
}

// ──────────────────────────────────────────────
// Componente principal
// ──────────────────────────────────────────────
export default function NotificationBell() {
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
    const [notifications, setNotifications] = React.useState<NotificationDTO[]>([]);
    const [unreadCount, setUnreadCount] = React.useState(0);
    const [loading, setLoading] = React.useState(false);
    const [hasMore, setHasMore] = React.useState(true);
    // Ref para la página — evita bug de closure obsoleto
    const pageRef = React.useRef(0);
    const esRef = React.useRef<EventSource | null>(null);
    const open = Boolean(anchorEl);

    const fetchNotifications = React.useCallback(async (reset = false) => {
        setLoading(true);
        try {
            const currentPage = reset ? 0 : pageRef.current;
            const data = await notificationService.getNotifications(currentPage, 20);
            setNotifications(prev => reset ? data.content : [...prev, ...data.content]);
            setHasMore(!data.last);
            pageRef.current = reset ? 1 : currentPage + 1;
        } catch { /* silent */ } finally {
            setLoading(false);
        }
    }, []); // Sin dependencias — usa ref para la página

    const fetchUnreadCount = React.useCallback(async () => {
        try {
            const count = await notificationService.getUnreadCount();
            setUnreadCount(count);
        } catch { /* silent */ }
    }, []);

    // Carga inicial y SSE
    React.useEffect(() => {
        fetchNotifications(true);
        fetchUnreadCount();

        // Verificar token real antes de abrir SSE
        const token = getToken();
        if (!token) return;

        const url = notificationService.getStreamUrl();
        const es = new EventSource(url);
        esRef.current = es;

        es.addEventListener('notification', (e: MessageEvent) => {
            try {
                const notif: NotificationDTO = JSON.parse(e.data);
                setNotifications(prev => [notif, ...prev]);
                setUnreadCount(prev => prev + 1);
            } catch { /* malformed */ }
        });

        return () => {
            es.close();
            esRef.current = null;
        };
    }, [fetchNotifications, fetchUnreadCount]);

    const markRead = React.useCallback((id: number) => {
        setNotifications(prev => {
            const target = prev.find(n => n.id === id);
            if (target && !target.read) {
                setUnreadCount(c => Math.max(0, c - 1));
            }
            return prev.map(n => n.id === id ? { ...n, read: true } : n);
        });
        notificationService.markRead(id).catch(() => {});
    }, []);

    const markAllRead = React.useCallback(async () => {
        await notificationService.markAllRead();
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    }, []);

    const removeNotification = React.useCallback((id: number) => {
        setNotifications(prev => {
            const target = prev.find(n => n.id === id);
            if (target && !target.read) {
                setUnreadCount(c => Math.max(0, c - 1));
            }
            return prev.filter(n => n.id !== id);
        });
        notificationService.deleteNotification(id).catch(() => {});
    }, []);

    return (
        <>
            <Tooltip title="Notificaciones" enterDelay={800}>
                <IconButton
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    size="small"
                    aria-label={`Notificaciones${unreadCount > 0 ? `, ${unreadCount} sin leer` : ''}`}
                >
                    <Badge
                        badgeContent={unreadCount > 9 ? '9+' : unreadCount || undefined}
                        color="error"
                        max={9}
                    >
                        {unreadCount > 0
                            ? <NotificationsIcon sx={{ color: '#ffffff', fontSize: 22 }} />
                            : <NotificationsNoneIcon sx={{ color: '#ffffff', fontSize: 22 }} />
                        }
                    </Badge>
                </IconButton>
            </Tooltip>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                    sx: {
                        width: 360,
                        maxHeight: 520,
                        borderRadius: 2,
                        boxShadow: '0 8px 32px rgba(74, 2, 74, 0.18)',
                        border: '1px solid rgba(97, 3, 97, 0.12)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                    }
                }}
            >
                {/* Header */}
                <Box sx={{
                    px: 2,
                    py: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    flexShrink: 0,
                }}>
                    <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                        Notificaciones
                    </Typography>
                    {unreadCount > 0 && (
                        <Button
                            size="small"
                            onClick={markAllRead}
                            sx={{
                                fontSize: 11,
                                textTransform: 'none',
                                color: '#610361',
                                fontWeight: 600,
                                p: 0,
                                minWidth: 'auto',
                                '&:hover': { bgcolor: 'transparent', color: '#9b30a0' },
                            }}
                        >
                            Marcar todas leídas
                        </Button>
                    )}
                </Box>

                {/* Lista con scroll */}
                <Box sx={{ overflowY: 'auto', flex: 1 }}>
                    {loading && notifications.length === 0 ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <Box key={i} sx={{ display: 'flex', gap: 1.5, px: 2, py: 1.5 }}>
                                <Skeleton variant="rounded" width={34} height={34} />
                                <Box sx={{ flex: 1 }}>
                                    <Skeleton variant="text" width="70%" height={16} />
                                    <Skeleton variant="text" width="100%" height={14} />
                                    <Skeleton variant="text" width="35%" height={12} />
                                </Box>
                            </Box>
                        ))
                    ) : notifications.length === 0 ? (
                        <Box sx={{
                            py: 5,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            color: 'text.disabled',
                        }}>
                            <NotificationsNoneIcon sx={{ fontSize: 36, mb: 1 }} />
                            <Typography variant="body2">Sin notificaciones</Typography>
                        </Box>
                    ) : (
                        <List disablePadding>
                            {notifications.map((n, idx) => (
                                <React.Fragment key={n.id}>
                                    <NotifItem
                                        notif={n}
                                        onRead={markRead}
                                        onDelete={removeNotification}
                                    />
                                    {idx < notifications.length - 1 && <Divider component="li" />}
                                </React.Fragment>
                            ))}
                            {hasMore && (
                                <Box sx={{ py: 1, textAlign: 'center' }}>
                                    <Button
                                        size="small"
                                        disabled={loading}
                                        onClick={() => fetchNotifications(false)}
                                        sx={{ fontSize: 12, textTransform: 'none', color: '#610361' }}
                                    >
                                        {loading ? 'Cargando...' : 'Ver más'}
                                    </Button>
                                </Box>
                            )}
                        </List>
                    )}
                </Box>
            </Popover>
        </>
    );
}
