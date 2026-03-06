import React from 'react'

const DeleteConfirmModal = ({ isOpen, user, onClose, onConfirm, isLoading }) => {
    if (!isOpen || !user) return null

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001
        }}>
            <div style={{
                backgroundColor: '#1a1a1a',
                borderRadius: '8px',
                padding: '30px',
                maxWidth: '400px',
                width: '90%',
                border: '2px solid #F44336'
            }}>
                <h2 style={{
                    margin: '0 0 16px 0',
                    color: '#F44336',
                    fontSize: '1.3rem'
                }}>
                    ⚠️ Confirmar Eliminación
                </h2>

                <p style={{
                    color: '#A67C52',
                    marginBottom: '16px',
                    fontSize: '0.95rem',
                    lineHeight: '1.5'
                }}>
                    ¿Estás seguro de que deseas eliminar al usuario <strong style={{ color: '#FFFBF5' }}>{user.name}</strong>?{' '}
                    <br /><br />
                    Esta acción no se puede deshacer.
                </p>

                <div style={{
                    backgroundColor: '#2a2824',
                    padding: '12px',
                    borderRadius: '4px',
                    marginBottom: '20px',
                    fontSize: '0.85rem',
                    color: '#888',
                    borderLeft: '3px solid #F44336'
                }}>
                    📧 {user.email}
                </div>

                <div style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#3a3530',
                            border: '1px solid #5a5350',
                            borderRadius: '4px',
                            color: '#FFFBF5',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            fontSize: '0.95rem',
                            opacity: isLoading ? 0.6 : 1,
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            if (!isLoading) {
                                e.currentTarget.style.backgroundColor = '#4a4639'
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#3a3530'
                        }}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onConfirm(user.id)}
                        disabled={isLoading}
                        style={{
                            padding: '12px 32px',
                            backgroundColor: '#F44336',
                            border: 'none',
                            borderRadius: '4px',
                            color: 'white',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            fontSize: '0.95rem',
                            opacity: isLoading ? 0.6 : 1,
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            if (!isLoading) {
                                e.currentTarget.style.backgroundColor = '#E53935'
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#F44336'
                        }}
                    >
                        {isLoading ? 'Eliminando...' : 'Sí, Eliminar'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DeleteConfirmModal
