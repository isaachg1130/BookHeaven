import React, { useState } from 'react'

const UserFormModal = ({ isOpen, user, roles, onClose, onSubmit, isLoading }) => {
    const [formData, setFormData] = useState(() => {
        return user ? {
            name: user.name || '',
            email: user.email || '',
            password: '',
            role_id: user.role_id || '',
            is_active: user.is_active !== false,
            bio: user.bio || '',
        } : {
            name: '',
            email: '',
            password: '',
            role_id: '',
            is_active: true,
            bio: '',
        }
    })
    const [errors, setErrors] = useState({})

    const handleClose = () => {
        // Resetear formulario y errores al cerrar
        setFormData({
            name: '',
            email: '',
            password: '',
            role_id: '',
            is_active: true,
            bio: '',
        })
        setErrors({})
        onClose()
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
        // Limpiar error del campo cuando el usuario empieza a escribir
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        try {
            // Validación básica frontend
            const newErrors = {}
            
            if (!formData.name.trim()) {
                newErrors.name = 'El nombre es requerido'
            }
            if (!formData.email.trim()) {
                newErrors.email = 'El email es requerido'
            }
            if (!user && !formData.password) { // Solo requerir password en creación
                newErrors.password = 'La contraseña es requerida'
            }
            if (formData.password && formData.password.length < 8) {
                newErrors.password = 'La contraseña debe tener al menos 8 caracteres'
            }
            if (!formData.role_id) {
                newErrors.role_id = 'Debes seleccionar un rol'
            }

            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors)
                return
            }

            // Preparar datos para enviar
            const submitData = { ...formData }
            
            // Si no se cambió la contraseña en edición, no enviarla
            if (user && !submitData.password) {
                delete submitData.password
            }

            await onSubmit(submitData)
        } catch (error) {
            console.error('Error submitting form:', error)
        }
    }

    if (!isOpen) return null

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
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: '#1a1a1a',
                borderRadius: '8px',
                padding: '30px',
                maxWidth: '500px',
                width: '90%',
                maxHeight: '90vh',
                overflowY: 'auto',
                border: '1px solid #3a3530'
            }}>
                <h2 style={{
                    margin: '0 0 24px 0',
                    color: '#FFFBF5',
                    fontSize: '1.5rem'
                }}>
                    {user ? '✏️ Editar Usuario' : '➕ Crear Nuevo Usuario'}
                </h2>

                <form onSubmit={handleSubmit}>
                    {/* Nombre */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            color: '#D4A76A',
                            fontWeight: '600'
                        }}>
                            Nombre Completo
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Ej: Juan Pérez"
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: '#2a2824',
                                border: errors.name ? '2px solid #F44336' : '1px solid #3a3530',
                                borderRadius: '4px',
                                color: '#FFFBF5',
                                fontSize: '1rem',
                                boxSizing: 'border-box',
                                fontFamily: 'inherit'
                            }}
                        />
                        {errors.name && <p style={{ color: '#F44336', fontSize: '0.85rem', margin: '4px 0 0 0' }}>{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            color: '#D4A76A',
                            fontWeight: '600'
                        }}>
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="ej@ejemplo.com"
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: '#2a2824',
                                border: errors.email ? '2px solid #F44336' : '1px solid #3a3530',
                                borderRadius: '4px',
                                color: '#FFFBF5',
                                fontSize: '1rem',
                                boxSizing: 'border-box',
                                fontFamily: 'inherit'
                            }}
                        />
                        {errors.email && <p style={{ color: '#F44336', fontSize: '0.85rem', margin: '4px 0 0 0' }}>{errors.email}</p>}
                    </div>

                    {/* Contraseña */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            color: '#D4A76A',
                            fontWeight: '600'
                        }}>
                            Contraseña {user && <span style={{ color: '#888', fontSize: '0.85rem' }}>(opcional en edición)</span>}
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder={user ? 'Dejar en blanco para no cambiar' : 'Mínimo 8 caracteres'}
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: '#2a2824',
                                border: errors.password ? '2px solid #F44336' : '1px solid #3a3530',
                                borderRadius: '4px',
                                color: '#FFFBF5',
                                fontSize: '1rem',
                                boxSizing: 'border-box',
                                fontFamily: 'inherit'
                            }}
                        />
                        {errors.password && <p style={{ color: '#F44336', fontSize: '0.85rem', margin: '4px 0 0 0' }}>{errors.password}</p>}
                    </div>

                    {/* Rol */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            color: '#D4A76A',
                            fontWeight: '600'
                        }}>
                            Rol
                        </label>
                        <select
                            name="role_id"
                            value={formData.role_id}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: '#2a2824',
                                border: errors.role_id ? '2px solid #F44336' : '1px solid #3a3530',
                                borderRadius: '4px',
                                color: '#FFFBF5',
                                fontSize: '1rem',
                                boxSizing: 'border-box',
                                fontFamily: 'inherit',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="">Selecciona un rol</option>
                            {roles.map(role => (
                                <option key={role.id} value={role.id}>
                                    {role.display_name}
                                </option>
                            ))}
                        </select>
                        {errors.role_id && <p style={{ color: '#F44336', fontSize: '0.85rem', margin: '4px 0 0 0' }}>{errors.role_id}</p>}
                    </div>

                    {/* Bio */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            color: '#D4A76A',
                            fontWeight: '600'
                        }}>
                            Biografía (opcional)
                        </label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            placeholder="Cuéntanos sobre este usuario..."
                            rows="3"
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: '#2a2824',
                                border: '1px solid #3a3530',
                                borderRadius: '4px',
                                color: '#FFFBF5',
                                fontSize: '1rem',
                                boxSizing: 'border-box',
                                fontFamily: 'inherit',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    {/* Estado Activo */}
                    <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="checkbox"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={handleChange}
                            style={{
                                width: '18px',
                                height: '18px',
                                cursor: 'pointer'
                            }}
                        />
                        <label style={{
                            color: '#D4A76A',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}>
                            Usuario Activo
                        </label>
                    </div>

                    {/* Botones */}
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        justifyContent: 'flex-end'
                    }}>
                        <button
                            type="button"
                            onClick={handleClose}
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
                            type="submit"
                            disabled={isLoading}
                            style={{
                                padding: '12px 32px',
                                backgroundColor: '#D4A76A',
                                border: 'none',
                                borderRadius: '4px',
                                color: '#1a1a1a',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                fontWeight: '600',
                                fontSize: '0.95rem',
                                opacity: isLoading ? 0.6 : 1,
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                if (!isLoading) {
                                    e.currentTarget.style.backgroundColor = '#E8DCC8'
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#D4A76A'
                            }}
                        >
                            {isLoading ? 'Procesando...' : (user ? 'Actualizar' : 'Crear')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default UserFormModal
