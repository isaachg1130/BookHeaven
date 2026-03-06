import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * useUnifiedContent - Hook optimizado para consumo de contenido unificado
 */
export const useUnifiedContent = (initialCategories = ['libro', 'manga', 'comic'], filters = {}) => {
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Estado de paginación
    const [pagination, setPagination] = useState({
        total: 0,
        per_page: 20,
        current_page: 1,
        last_page: 1,
    });

    // Estado de parámetros
    const [params, setParams] = useState({
        categories: initialCategories,
        per_page: filters.per_page || 20,
        page: filters.page || 1,
        sort_by: filters.sort_by || 'created_at',
        sort_order: filters.sort_order || 'desc',
        ...filters,
    });

    // Ref para evitar race conditions (si una petición tarda más que la siguiente)
    const abortControllerRef = useRef(null);

    const fetchContent = useCallback(async (currentParams) => {
        // Cancelar petición anterior si existe
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setLoading(true);
        setError(null);

        try {
            // Limpieza de parámetros: eliminamos nulos y formateamos arrays
            const cleanParams = Object.entries(currentParams).reduce((acc, [k, v]) => {
                if (v === null || v === undefined) return acc;
                acc[k] = Array.isArray(v) ? v.join(',') : v;
                return acc;
            }, {});

            const queryString = new URLSearchParams(cleanParams).toString();
            
            const response = await fetch(`/api/content/unified?${queryString}`, {
                signal: abortControllerRef.current.signal,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Accept': 'application/json'
                },
            });

            if (!response.ok) throw new Error('Error al obtener contenido');

            const data = await response.json();
            
            setContent(data.data || []);
            setPagination(data.pagination || {
                total: data.total || 0,
                per_page: data.per_page || 20,
                current_page: data.current_page || 1,
                last_page: data.last_page || 1,
            });
        } catch (err) {
            if (err.name !== 'AbortError') {
                setError(err.message);
                console.error('Error en useUnifiedContent:', err);
            }
        } finally {
            setLoading(false);
        }
    }, []); // No depende de 'params' para evitar ciclos

    // Efecto principal: Se dispara cuando 'params' cambia
    useEffect(() => {
        fetchContent(params);
        
        return () => {
            if (abortControllerRef.current) abortControllerRef.current.abort();
        };
    }, [params, fetchContent]);

    // Helpers usando el patrón de actualización funcional para evitar dependencias innecesarias
    const nextPage = useCallback(() => {
        setParams(prev => {
            if (pagination.current_page < pagination.last_page) {
                return { ...prev, page: prev.page + 1 };
            }
            return prev;
        });
    }, [pagination.current_page, pagination.last_page]);

    const prevPage = useCallback(() => {
        setParams(prev => {
            if (prev.page > 1) {
                return { ...prev, page: prev.page - 1 };
            }
            return prev;
        });
    }, []);

    const goToPage = useCallback((page) => {
        setParams(prev => ({ ...prev, page }));
    }, []);

    const setFilter = useCallback((key, value) => {
        setParams(prev => ({ ...prev, [key]: value, page: 1 }));
    }, []);

    const updateCategories = useCallback((categories) => {
        setParams(prev => ({ ...prev, categories, page: 1 }));
    }, []);

    return {
        content,
        loading,
        error,
        pagination,
        params,
        refresh: () => fetchContent(params),
        nextPage,
        prevPage,
        goToPage,
        setFilter,
        updateCategories,
    };
};

export default useUnifiedContent;