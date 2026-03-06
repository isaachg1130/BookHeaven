import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import MainLayout from '../components/dashboard/MainLayout'
import useUserManagement from '../hooks/useUserManagement'
import UsersTable from '../components/admin/UsersTable'
import UserFormModal from '../components/admin/UserFormModal'
import DeleteConfirmModal from '../components/admin/DeleteConfirmModal'

/**
 * UsersPage - Gestión completa de usuarios
 * CRUD: Crear, Leer, Actualizar, Eliminar
 * 
 * Features:
 * - Listar usuarios con paginación
 * - Crear nuevo usuario con rol
 * - Editar usuario
 * - Eliminar usuario con confirmación
 * - Búsqueda y filtrado por rol
 */
const UsersPage = () => {
    const { isAdmin } = useAuth()
    const {
        users,
        roles,
        loading,
        error,
        pagination,
        fetchUsers,
        createUser,
        updateUser,
        deleteUser
    } = useUserManagement()

    // UI State
    const [showFormModal, setShowFormModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [editingUser, setEditingUser] = useState(null)
    const [userToDelete, setUserToDelete] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [roleFilter, setRoleFilter] = useState('')

    // Validar acceso de admin
    if (!isAdmin()) {
        return (
            <MainLayout>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    color: '#E8DCC8',
                    fontSize: '1.2rem'
                }}>
                    ❌ Acceso Denegado - Se requieren permisos de administrador
                </div>
            </MainLayout>
        )
    }

    // Handlers
    const handleAddUser = () => {
        setEditingUser(null)
        setShowFormModal(true)
    }

    const handleEditUser = (user) => {
        setEditingUser(user)
        setShowFormModal(true)
    }

    const handleDeleteClick = (user) => {
        setUserToDelete(user)
        setShowDeleteModal(true)
    }

    const handleFormSubmit = async (formData) => {
        setIsSubmitting(true)
        try {
            if (editingUser) {
                // Actualizar usuario
                await updateUser(editingUser.id, formData)
                setSuccessMessage(`✅ Usuario ${formData.name} actualizado correctamente`)
            } else {
                // Crear usuario
                await createUser(formData)
                setSuccessMessage(`✅ Usuario ${formData.name} creado correctamente`)
            }
            setShowFormModal(false)
            setEditingUser(null)

            // Limpiar mensaje de éxito después de 3 segundos
            setTimeout(() => setSuccessMessage(''), 3000)
        } catch (err) {
            console.error('Error en formulario:', err)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleConfirmDelete = async (userId) => {
        setIsSubmitting(true)
        try {
            await deleteUser(userId)
            setSuccessMessage('✅ Usuario eliminado correctamente')
            setShowDeleteModal(false)
            setUserToDelete(null)

            // Limpiar mensaje de éxito después de 3 segundos
            setTimeout(() => setSuccessMessage(''), 3000)
        } catch (err) {
            console.error('Error al eliminar:', err)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSearch = async (e) => {
        setSearchTerm(e.target.value)
        await fetchUsers(1, e.target.value, roleFilter)
    }

    const handleRoleFilter = async (roleId) => {
        setRoleFilter(roleId)
        await fetchUsers(1, searchTerm, roleId)
    }

    return (
        <MainLayout>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginTop: '40px' }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: '20px',
                    borderBottom: '2px solid #3a3530'
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            margin: '0 0 10px 0',
                            color: '#FFFBF5'
                        }}>
                            👥 Gestión de Usuarios
                        </h1>
                        <p style={{ color: '#D4A76A', margin: 0, fontSize: '0.95rem' }}>
                            Total: <strong>{pagination.total}</strong> usuarios
                        </p>
                    </div>
                    <button
                        onClick={handleAddUser}
                        style={{
                            padding: '12px 24px',
                            background: '#D4A76A',
                            border: 'none',
                            borderRadius: '4px',
                            color: '#1a1a1a',
                            fontWeight: 'bold',
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#E8DCC8'
                            e.currentTarget.style.transform = 'scale(1.05)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#D4A76A'
                            e.currentTarget.style.transform = 'scale(1)'
                        }}
                    >
                        ➕ Nuevo Usuario
                    </button>
                </div>

                {/* Mensaje de Éxito */}
                {successMessage && (
                    <div style={{
                        padding: '16px',
                        background: 'rgba(76, 175, 80, 0.1)',
                        border: '1px solid #4CAF50',
                        borderRadius: '8px',
                        color: '#4CAF50',
                        fontWeight: '600'
                    }}>
                        {successMessage}
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div style={{
                        padding: '16px',
                        background: 'rgba(244, 67, 54, 0.1)',
                        border: '1px solid #F44336',
                        borderRadius: '8px',
                        color: '#ff9800',
                        fontWeight: '600'
                    }}>
                        ❌ {error}
                    </div>
                )}

                {/* Búsqueda y Filtros */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: '20px',
                    alignItems: 'start'
                }}>
                    <div>
                        <input
                            type="text"
                            placeholder="🔍 Buscar por nombre o email..."
                            value={searchTerm}
                            onChange={handleSearch}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: '#2a2824',
                                border: '1px solid #3a3530',
                                borderRadius: '4px',
                                color: '#FFFBF5',
                                fontSize: '0.95rem',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => handleRoleFilter(e.target.value)}
                        style={{
                            padding: '12px 16px',
                            background: '#2a2824',
                            border: '1px solid #3a3530',
                            borderRadius: '4px',
                            color: '#FFFBF5',
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            minWidth: '200px',
                            fontFamily: 'inherit'
                        }}
                    >
                        <option value="">Todos los Roles</option>
                        {roles.map(role => (
                            <option key={role.id} value={role.name}>
                                {role.display_name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Tabla de Usuarios */}
                <UsersTable
                    users={users}
                    roles={roles}
                    onEdit={handleEditUser}
                    onDelete={handleDeleteClick}
                    loading={loading}
                />

                {/* Paginación */}
                {pagination.last_page > 1 && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '10px',
                        alignItems: 'center'
                    }}>
                        <button
                            disabled={pagination.current_page === 1}
                            onClick={() => fetchUsers(pagination.current_page - 1, searchTerm, roleFilter)}
                            style={{
                                padding: '8px 12px',
                                background: pagination.current_page === 1 ? '#3a3530' : '#D4A76A',
                                border: 'none',
                                borderRadius: '4px',
                                color: pagination.current_page === 1 ? '#666' : '#1a1a1a',
                                cursor: pagination.current_page === 1 ? 'not-allowed' : 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            ← Anterior
                        </button>

                        <span style={{ color: '#D4A76A', fontWeight: '600', minWidth: '100px', textAlign: 'center' }}>
                            Página {pagination.current_page} de {pagination.last_page}
                        </span>

                        <button
                            disabled={pagination.current_page === pagination.last_page}
                            onClick={() => fetchUsers(pagination.current_page + 1, searchTerm, roleFilter)}
                            style={{
                                padding: '8px 12px',
                                background: pagination.current_page === pagination.last_page ? '#3a3530' : '#D4A76A',
                                border: 'none',
                                borderRadius: '4px',
                                color: pagination.current_page === pagination.last_page ? '#666' : '#1a1a1a',
                                cursor: pagination.current_page === pagination.last_page ? 'not-allowed' : 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            Siguiente →
                        </button>
                    </div>
                )}
            </div>

            {/* Modales */}
            <UserFormModal
                isOpen={showFormModal}
                user={editingUser}
                roles={roles}
                onClose={() => {
                    setShowFormModal(false)
                    setEditingUser(null)
                }}
                onSubmit={handleFormSubmit}
                isLoading={isSubmitting}
            />

            <DeleteConfirmModal
                isOpen={showDeleteModal}
                user={userToDelete}
                onClose={() => {
                    setShowDeleteModal(false)
                    setUserToDelete(null)
                }}
                onConfirm={handleConfirmDelete}
                isLoading={isSubmitting}
            />
        </MainLayout>
    )
}

export default UsersPage
