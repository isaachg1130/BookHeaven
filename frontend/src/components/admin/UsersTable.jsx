import React from 'react'

const UsersTable = ({ users, roles, onEdit, onDelete, loading }) => {
    const getRoleName = (roleId) => {
        const role = roles.find(r => r.id === roleId)
        return role ? role.display_name : 'Sin rol'
    }

    const getRoleColor = (roleName) => {
        const lowerName = roleName.toLowerCase()
        if (lowerName.includes('admin')) return '#D4A76A'
        if (lowerName.includes('premium')) return '#7C8FD4'
        return '#A67C52'
    }

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '40px',
                color: '#D4A76A'
            }}>
                <div style={{
                    fontSize: '1.2rem'
                }}>⏳ Cargando usuarios...</div>
            </div>
        )
    }

    if (!users.length) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '40px',
                color: '#888'
            }}>
                <div style={{ fontSize: '1.1rem' }}>No hay usuarios registrados</div>
            </div>
        )
    }

    return (
        <div style={{
            overflowX: 'auto',
            borderRadius: '8px',
            border: '1px solid #3a3530'
        }}>
            <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                backgroundColor: '#1a1a1a',
                color: '#FFFBF5'
            }}>
                <thead>
                    <tr style={{
                        backgroundColor: '#2a2824',
                        borderBottom: '2px solid #3a3530'
                    }}>
                        <th style={{
                            padding: '15px',
                            textAlign: 'left',
                            fontWeight: '600',
                            color: '#D4A76A'
                        }}>Nombre</th>
                        <th style={{
                            padding: '15px',
                            textAlign: 'left',
                            fontWeight: '600',
                            color: '#D4A76A'
                        }}>Email</th>
                        <th style={{
                            padding: '15px',
                            textAlign: 'left',
                            fontWeight: '600',
                            color: '#D4A76A'
                        }}>Rol</th>
                        <th style={{
                            padding: '15px',
                            textAlign: 'center',
                            fontWeight: '600',
                            color: '#D4A76A'
                        }}>Estado</th>
                        <th style={{
                            padding: '15px',
                            textAlign: 'center',
                            fontWeight: '600',
                            color: '#D4A76A'
                        }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id} style={{
                            borderBottom: '1px solid #3a3530',
                            '&:hover': {
                                backgroundColor: '#2a2824'
                            }
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#252019'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <td style={{
                                padding: '15px',
                                color: '#FFFBF5'
                            }}>
                                {user.name}
                            </td>
                            <td style={{
                                padding: '15px',
                                color: '#A67C52',
                                fontSize: '0.9rem'
                            }}>
                                {user.email}
                            </td>
                            <td style={{
                                padding: '15px'
                            }}>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '6px 12px',
                                    backgroundColor: getRoleColor(user.role?.display_name),
                                    color: '#1a1a1a',
                                    borderRadius: '4px',
                                    fontSize: '0.85rem',
                                    fontWeight: '600'
                                }}>
                                    {getRoleName(user.role_id)}
                                </span>
                            </td>
                            <td style={{
                                padding: '15px',
                                textAlign: 'center'
                            }}>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '6px 12px',
                                    backgroundColor: user.is_active ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                                    color: user.is_active ? '#4CAF50' : '#F44336',
                                    borderRadius: '4px',
                                    fontSize: '0.85rem',
                                    fontWeight: '600'
                                }}>
                                    {user.is_active ? '✓ Activo' : '✗ Inactivo'}
                                </span>
                            </td>
                            <td style={{
                                padding: '15px',
                                textAlign: 'center',
                                display: 'flex',
                                gap: '8px',
                                justifyContent: 'center'
                            }}>
                                <button
                                    onClick={() => onEdit(user)}
                                    style={{
                                        padding: '8px 12px',
                                        backgroundColor: '#D4A76A',
                                        border: 'none',
                                        borderRadius: '4px',
                                        color: '#1a1a1a',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '0.85rem',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#E8DCC8'
                                        e.currentTarget.style.transform = 'scale(1.05)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#D4A76A'
                                        e.currentTarget.style.transform = 'scale(1)'
                                    }}
                                >
                                    ✏️ Editar
                                </button>
                                <button
                                    onClick={() => onDelete(user)}
                                    style={{
                                        padding: '8px 12px',
                                        backgroundColor: '#F44336',
                                        border: 'none',
                                        borderRadius: '4px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '0.85rem',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#E53935'
                                        e.currentTarget.style.transform = 'scale(1.05)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#F44336'
                                        e.currentTarget.style.transform = 'scale(1)'
                                    }}
                                >
                                    🗑️ Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default UsersTable
