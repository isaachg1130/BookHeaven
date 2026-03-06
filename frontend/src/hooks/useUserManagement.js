import { useState, useCallback, useEffect } from 'react'

/**
 * useUserManagement - Hook para gestionar CRUD de usuarios
 * 
 * Proporciona funciones para:
 * - Listar usuarios con paginación y búsqueda
 * - Crear usuario
 * - Actualizar usuario
 * - Eliminar usuario
 * - Obtener lista de roles disponibles
 */
const useUserManagement = () => {
    const [users, setUsers] = useState([])
    const [roles, setRoles] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [pagination, setPagination] = useState({
        current_page: 1,
        per_page: 15,
        total: 0,
        last_page: 1,
    })

    const token = localStorage.getItem('auth_token')

    /**
     * Obtener lista de usuarios
     */
    const fetchUsers = useCallback(async (page = 1, search = '', role = '') => {
        try {
            setLoading(true)
            setError(null)

            const params = new URLSearchParams({
                page,
                per_page: pagination.per_page,
                ...(search && { search }),
                ...(role && { role }),
            })

            const response = await fetch(`/api/admin/users?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            })

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`)
            }

            const data = await response.json()

            if (data.success) {
                setUsers(data.data.data || [])
                setPagination({
                    current_page: data.data.current_page,
                    per_page: data.data.per_page,
                    total: data.data.total,
                    last_page: data.data.last_page,
                })
            } else {
                throw new Error(data.message || 'Error al obtener usuarios')
            }
        } catch (err) {
            setError(err.message)
            console.error('Error fetching users:', err)
        } finally {
            setLoading(false)
        }
    }, [token, pagination.per_page])

    /**
     * Obtener lista de roles disponibles
     */
    const fetchRoles = useCallback(async () => {
        try {
            const response = await fetch('/api/admin/roles', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            })

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`)
            }

            const data = await response.json()

            if (data.success) {
                setRoles(data.data || [])
            } else {
                throw new Error(data.message || 'Error al obtener roles')
            }
        } catch (err) {
            console.error('Error fetching roles:', err)
        }
    }, [token])

    /**
     * Crear nuevo usuario
     */
    const createUser = useCallback(async (userData) => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(userData),
            })

            const data = await response.json()

            if (!response.ok) {
                const errorMsg = data.message || `Error ${response.status}`
                throw new Error(errorMsg)
            }

            if (data.success) {
                // Recargar usuarios
                await fetchUsers()
                return data.data
            } else {
                throw new Error(data.message || 'Error al crear usuario')
            }
        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            setLoading(false)
        }
    }, [token, fetchUsers])

    /**
     * Actualizar usuario
     */
    const updateUser = useCallback(async (userId, userData) => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(userData),
            })

            const data = await response.json()

            if (!response.ok) {
                const errorMsg = data.message || `Error ${response.status}`
                throw new Error(errorMsg)
            }

            if (data.success) {
                // Recargar usuarios
                await fetchUsers()
                return data.data
            } else {
                throw new Error(data.message || 'Error al actualizar usuario')
            }
        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            setLoading(false)
        }
    }, [token, fetchUsers])

    /**
     * Eliminar usuario
     */
    const deleteUser = useCallback(async (userId) => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            })

            const data = await response.json()

            if (!response.ok) {
                const errorMsg = data.message || `Error ${response.status}`
                throw new Error(errorMsg)
            }

            if (data.success) {
                // Recargar usuarios
                await fetchUsers()
                return data
            } else {
                throw new Error(data.message || 'Error al eliminar usuario')
            }
        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            setLoading(false)
        }
    }, [token, fetchUsers])

    // Cargar roles al montar el componente
    useEffect(() => {
        const loadInitialData = async () => {
            await fetchRoles()
            await fetchUsers()
        }
        loadInitialData()
    }, [fetchRoles, fetchUsers])

    return {
        users,
        roles,
        loading,
        error,
        pagination,
        fetchUsers,
        fetchRoles,
        createUser,
        updateUser,
        deleteUser,
    }
}

export default useUserManagement
