
import React from 'react';
import { getImageUrl } from '../../utils/imageUtils';

const AVATAR_COLORS = ['#3a2a1a', '#1a2a3a', '#1a3a2a', '#2a1a3a', '#3a1a2a', '#2a3a1a'];
const AVATAR_TEXT_COLORS = ['#D4A76A', '#6AB4D4', '#6AD4A7', '#A76AD4', '#D46A6A', '#A7D46A'];

const getRoleStyle = (role) => {
    if (role === 'admin') return { bg: 'rgba(212,167,106,0.2)', color: '#D4A76A', border: 'rgba(212,167,106,0.4)' };
    if (role === 'premium') return { bg: 'rgba(255,215,0,0.15)', color: '#FFD700', border: 'rgba(255,215,0,0.35)' };
    return { bg: 'rgba(150,150,150,0.1)', color: '#999', border: 'rgba(150,150,150,0.25)' };
};

const getRoleLabel = (role) => {
    if (role === 'admin') return '⚙️ Admin';
    if (role === 'premium') return '💎 Premium';
    if (role === 'standard') return 'Standard';
    return role || 'User';
};

const getStatusStyle = (status) => {
    switch (status) {
        case 'online':   return { color: '#4ade80', dot: '#4ade80', glow: '#4ade8066', label: 'En línea' };
        case 'recent':   return { color: '#86efac', dot: '#86efac', glow: '#86efac55', label: 'Hoy' };
        case 'away':     return { color: '#facc15', dot: '#facc15', glow: '#facc1555', label: 'Esta semana' };
        case 'offline':  return { color: '#94a3b8', dot: '#94a3b8', glow: '#94a3b844', label: 'Inactivo' };
        case 'inactive': return { color: '#f87171', dot: '#f87171', glow: '#f8717155', label: 'Desactivado' };
        case 'never':    return { color: '#64748b', dot: '#64748b', glow: '#64748b44', label: 'Sin acceso' };
        default:         return { color: '#94a3b8', dot: '#94a3b8', glow: '#94a3b844', label: 'Desconocido' };
    }
};

export const UserTable = ({ users }) => {
    return (
        <div style={{ overflowX: 'auto', background: '#1f1f1f', borderRadius: '8px', padding: '20px' }}>
            <h3 style={{ color: '#eee', marginBottom: '15px' }}>Usuarios Recientes</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#ccc' }}>
                <thead>
                    <tr style={{ background: '#2a2a2a', borderBottom: '1px solid #333', textAlign: 'left' }}>
                        <th style={{ padding: '10px', fontWeight: 'bold', color: '#D4A76A' }}>Usuario</th>
                        <th style={{ padding: '10px', fontWeight: 'bold', color: '#D4A76A' }}>Email</th>
                        <th style={{ padding: '10px', fontWeight: 'bold', color: '#D4A76A' }}>Rol</th>
                        <th style={{ padding: '10px', fontWeight: 'bold', color: '#D4A76A' }}>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length === 0 ? (
                        <tr>
                            <td colSpan={4} style={{ padding: '30px', textAlign: 'center', color: '#666' }}>
                                No hay usuarios recientes
                            </td>
                        </tr>
                    ) : users.map((user, idx) => {
                        const roleStyle = getRoleStyle(user.role);
                        const statusStyle = getStatusStyle(user.status);
                        const colorIdx = idx % AVATAR_COLORS.length;
                        return (
                            <tr
                                key={idx}
                                style={{ borderBottom: '1px solid #2a2a2a', transition: 'background 0.2s' }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(212,167,106,0.08)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <td style={{ padding: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '50%',
                                            background: AVATAR_COLORS[colorIdx],
                                            border: `2px solid ${AVATAR_TEXT_COLORS[colorIdx]}40`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.95rem',
                                            fontWeight: 'bold',
                                            color: AVATAR_TEXT_COLORS[colorIdx],
                                            flexShrink: 0,
                                        }}>
                                            {(user.name || '?').charAt(0).toUpperCase()}
                                        </div>
                                        <span style={{ color: '#fff', fontWeight: '500', fontSize: '0.9rem' }}>{user.name}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '12px', fontSize: '0.85rem', color: '#aaa' }}>{user.email}</td>
                                <td style={{ padding: '12px' }}>
                                    <span style={{
                                        padding: '3px 10px',
                                        borderRadius: '12px',
                                        background: roleStyle.bg,
                                        color: roleStyle.color,
                                        border: `1px solid ${roleStyle.border}`,
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {getRoleLabel(user.role)}
                                    </span>
                                </td>
                                <td style={{ padding: '12px' }}>
                                    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '2px' }}>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            fontSize: '0.8rem',
                                            color: statusStyle.color,
                                        }}>
                                            <span style={{
                                                width: '7px', height: '7px',
                                                borderRadius: '50%',
                                                background: statusStyle.dot,
                                                display: 'inline-block',
                                                boxShadow: `0 0 5px ${statusStyle.glow}`,
                                                flexShrink: 0,
                                            }} />
                                            {statusStyle.label}
                                        </span>
                                        {user.last_login_human && user.last_login_human !== 'Nunca' && (
                                            <span style={{ fontSize: '0.7rem', color: '#555', paddingLeft: '12px' }}>
                                                {user.last_login_human}
                                            </span>
                                        )}
                                        {(!user.last_login_human || user.last_login_human === 'Nunca') && (
                                            <span style={{ fontSize: '0.7rem', color: '#555', paddingLeft: '12px' }}>
                                                Sin sesión
                                            </span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

const PLACEHOLDER_COLORS = ['#2a2a2a', '#1f2a1f', '#1f1f2a', '#2a1f1f', '#1f2a2a'];

export const ContentTable = ({ items, onDelete }) => {
    return (
        <div style={{ overflowX: 'auto', background: '#1f1f1f', borderRadius: '8px', padding: '20px' }}>
            <h3 style={{ color: '#eee', marginBottom: '15px' }}>Gestión de Contenido</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#ccc' }}>
                <thead>
                    <tr style={{ background: '#2a2a2a', borderBottom: '1px solid #333', textAlign: 'left' }}>
                        <th style={{ padding: '10px' }}>Título</th>
                        <th style={{ padding: '10px' }}>Tipo</th>
                        <th style={{ padding: '10px' }}>Categoría</th>
                        <th style={{ padding: '10px' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {items.length === 0 ? (
                        <tr>
                            <td colSpan={4} style={{ padding: '30px', textAlign: 'center', color: '#666' }}>
                                No hay contenido reciente
                            </td>
                        </tr>
                    ) : items.map((item, idx) => {
                        const imgUrl = item.imagen ? getImageUrl(item.imagen) : null;
                        return (
                            <tr key={`${item.content_type}-${item.id}-${idx}`}
                                style={{
                                    borderBottom: '1px solid #2a2a2a',
                                    transition: 'background 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(212,167,106,0.08)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <td style={{ padding: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        {imgUrl ? (
                                            <img
                                                src={imgUrl}
                                                alt={item.title}
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.nextSibling.style.display = 'flex';
                                                }}
                                                style={{
                                                    width: '40px',
                                                    height: '58px',
                                                    objectFit: 'cover',
                                                    borderRadius: '4px',
                                                    flexShrink: 0,
                                                    border: '1px solid #3a3530'
                                                }}
                                            />
                                        ) : null}
                                        <div style={{
                                            width: '40px',
                                            height: '58px',
                                            borderRadius: '4px',
                                            background: PLACEHOLDER_COLORS[idx % PLACEHOLDER_COLORS.length],
                                            display: imgUrl ? 'none' : 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.2rem',
                                            flexShrink: 0,
                                            border: '1px solid #3a3530'
                                        }}>
                                            {item.type === 'Manga' ? '🗯️' : item.type === 'Cómic' ? '🦸' : item.type === 'Audiolibro' ? '🎧' : '📖'}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.9rem' }}>{item.title}</div>
                                            {item.autor && (
                                                <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '2px' }}>{item.autor}</div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '12px' }}>
                                    <span style={{
                                        padding: '3px 10px',
                                        borderRadius: '12px',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        background: item.type === 'Libro' ? 'rgba(212,167,106,0.2)'
                                            : item.type === 'Manga' ? 'rgba(166,124,82,0.2)'
                                            : item.type === 'Cómic' ? 'rgba(196,180,159,0.2)'
                                            : 'rgba(100,180,100,0.2)',
                                        color: item.type === 'Libro' ? '#D4A76A'
                                            : item.type === 'Manga' ? '#A67C52'
                                            : item.type === 'Cómic' ? '#C4B49F'
                                            : '#64b464',
                                    }}>
                                        {item.type}
                                    </span>
                                </td>
                                <td style={{ padding: '12px' }}>
                                    {item.is_premium
                                        ? <span style={{ color: '#FFD700', fontSize: '0.85rem' }}>💎 Premium</span>
                                        : <span style={{ color: '#666', fontSize: '0.85rem' }}>Gratis</span>
                                    }
                                </td>
                                <td style={{ padding: '12px' }}>
                                    <button
                                        onClick={() => onDelete(item)}
                                        style={{
                                            padding: '6px 14px',
                                            background: 'rgba(212, 167, 106, 0.15)',
                                            color: '#D4A76A',
                                            border: '1px solid rgba(212,167,106,0.3)',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,82,82,0.15)'; e.currentTarget.style.color = '#ff5252'; e.currentTarget.style.borderColor = 'rgba(255,82,82,0.4)'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(212,167,106,0.15)'; e.currentTarget.style.color = '#D4A76A'; e.currentTarget.style.borderColor = 'rgba(212,167,106,0.3)'; }}
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
