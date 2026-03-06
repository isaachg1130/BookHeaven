import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { contentAPI } from '../api/content'
import '../styles/CreateContentModal.css'

/**
 * CreateContentModal - Modal para crear libros, mangas o cómics
 * 
 * Props:
 * - isOpen: boolean - si está abierto
 * - contentType: 'libro' | 'manga' | 'comic'
 * - onClose: function - callback para cerrar
 * - onSuccess: function - callback cuando se crea exitosamente
 * - addToast: function - para mostrar notificaciones
 */
const CreateContentModal = ({ isOpen, contentType = 'libro', onClose, onSuccess, addToast }) => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        autor: '',
        genero: '',
        imagen: null,
        pdf: null,
        is_premium: false,
        tiene_derechos_autor: false,
    })
    const [fileNames, setFileNames] = useState({
        imagen: '',
        pdf: ''
    })

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target
        
        if (type === 'file') {
            const file = files?.[0]
            setFormData(prev => ({
                ...prev,
                [name]: file || null
            }))
            setFileNames(prev => ({
                ...prev,
                [name]: file?.name || ''
            }))
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // Validaciones básicas
            if (!formData.titulo.trim()) {
                throw new Error('El título es requerido')
            }
            if (!formData.autor.trim()) {
                throw new Error('El autor es requerido')
            }
            if (!formData.genero.trim()) {
                throw new Error('El género es requerido')
            }
            if (contentType === 'libro' && !formData.pdf) {
                throw new Error('El archivo PDF es requerido para libros')
            }
            if (contentType === 'manga' && !formData.pdf) {
                throw new Error('El archivo PDF es requerido para mangas')
            }
            if (contentType === 'comic' && !formData.pdf) {
                throw new Error('El archivo PDF es requerido para cómics')
            }
            if (!formData.imagen) {
                throw new Error('La imagen de portada es requerida')
            }

            // Crear FormData para multipart/form-data
            const payload = new FormData()
            payload.append('titulo', formData.titulo)
            payload.append('descripcion', formData.descripcion)
            payload.append('autor', formData.autor)
            payload.append('genero', formData.genero)
            payload.append('imagen', formData.imagen)
            payload.append('is_premium', formData.is_premium ? 1 : 0)

            // Agregar PDF solo si es libro
            if (contentType === 'libro' && formData.pdf) {
                payload.append('pdf', formData.pdf)
                payload.append('tiene_derechos_autor', formData.tiene_derechos_autor ? 1 : 0)
            }

            // Agregar PDF para mangas y cómics
            if ((contentType === 'manga' || contentType === 'comic') && formData.pdf) {
                payload.append('pdf', formData.pdf)
            }

            let response
            if (contentType === 'libro') {
                response = await contentAPI.createLibro(payload)
            } else if (contentType === 'manga') {
                response = await contentAPI.createManga(payload)
            } else if (contentType === 'comic') {
                response = await contentAPI.createComic(payload)
            }

            if (addToast) {
                addToast(`${contentType.charAt(0).toUpperCase() + contentType.slice(1)} creado exitosamente`, 'success')
            }

            onSuccess && onSuccess(response.data)
            handleClose()
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Error al crear el contenido'
            setError(errorMsg)
            if (addToast) {
                addToast(errorMsg, 'error')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setFormData({
            titulo: '',
            descripcion: '',
            autor: '',
            genero: '',
            imagen: null,
            pdf: null,
            is_premium: false,
            tiene_derechos_autor: false,
        })
        setFileNames({
            imagen: '',
            pdf: ''
        })
        setError(null)
        onClose()
    }

    if (!isOpen) return null

    const getTitle = () => {
        switch (contentType) {
            case 'libro':
                return '📚 Crear Nuevo Libro'
            case 'manga':
                return '🗯️ Crear Nuevo Manga'
            case 'comic':
                return '🦸 Crear Nuevo Cómic'
            default:
                return 'Crear Contenido'
        }
    }

    return isOpen ? ReactDOM.createPortal(
        <div className="create-modal-overlay" onClick={handleClose}>
            <div className="create-modal" onClick={e => e.stopPropagation()}>
                <div className="create-modal__header">
                    <h2>{getTitle()}</h2>
                    <button
                        className="create-modal__close"
                        onClick={handleClose}
                        title="Cerrar"
                    >
                        ✕
                    </button>
                </div>

                {error && (
                    <div className="create-modal__error">
                        ⚠️ {error}
                    </div>
                )}

                <form className="create-modal__form" onSubmit={handleSubmit}>
                    {/* Título */}
                    <div className="form-group">
                        <label htmlFor="titulo">Título *</label>
                        <input
                            type="text"
                            id="titulo"
                            name="titulo"
                            value={formData.titulo}
                            onChange={handleChange}
                            placeholder={`Ej: El Quijote`}
                            required
                        />
                    </div>

                    {/* Autor */}
                    <div className="form-group">
                        <label htmlFor="autor">Autor *</label>
                        <input
                            type="text"
                            id="autor"
                            name="autor"
                            value={formData.autor}
                            onChange={handleChange}
                            placeholder="Ej: Miguel de Cervantes"
                            required
                        />
                    </div>

                    {/* Género */}
                    <div className="form-group">
                        <label htmlFor="genero">Género *</label>
                        <input
                            type="text"
                            id="genero"
                            name="genero"
                            value={formData.genero}
                            onChange={handleChange}
                            placeholder="Ej: Aventura, Ciencia Ficción, Romance"
                            required
                        />
                    </div>

                    {/* Descripción */}
                    <div className="form-group">
                        <label htmlFor="descripcion">Descripción</label>
                        <textarea
                            id="descripcion"
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            placeholder="Describe el contenido..."
                            rows="4"
                        />
                    </div>

                    {/* Imagen */}
                    <div className="form-group">
                        <label htmlFor="imagen">Imagen de Portada 📸</label>
                        <div className="file-input-wrapper">
                            <input
                                type="file"
                                id="imagen"
                                name="imagen"
                                onChange={handleChange}
                                accept="image/*"
                            />
                            <label htmlFor="imagen" className="file-input-label">
                                {fileNames.imagen ? `✓ ${fileNames.imagen}` : 'Click para seleccionar imagen'}
                            </label>
                        </div>
                    </div>

                    {/* PDF (solo para libros) */}
                    {contentType === 'libro' && (
                        <div className="form-group">
                            <label htmlFor="pdf">Archivo PDF 📄 *</label>
                            <div className="file-input-wrapper">
                                <input
                                    type="file"
                                    id="pdf"
                                    name="pdf"
                                    onChange={handleChange}
                                    accept=".pdf"
                                />
                                <label htmlFor="pdf" className="file-input-label">
                                    {fileNames.pdf ? `✓ ${fileNames.pdf}` : 'Click para seleccionar PDF'}
                                </label>
                            </div>
                        </div>
                    )}

                    {/* PDF (para mangas y cómics) */}
                    {(contentType === 'manga' || contentType === 'comic') && (
                        <div className="form-group">
                            <label htmlFor="pdf">
                                {contentType === 'manga' ? 'Archivo PDF del Manga' : 'Archivo PDF del Cómic'} 📄 *
                            </label>
                            <div className="file-input-wrapper">
                                <input
                                    type="file"
                                    id="pdf"
                                    name="pdf"
                                    onChange={handleChange}
                                    accept=".pdf"
                                />
                                <label htmlFor="pdf" className="file-input-label">
                                    {fileNames.pdf ? `✓ ${fileNames.pdf}` : 'Click para seleccionar PDF'}
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Premium */}
                    <div className="form-group form-group--checkbox">
                        <label htmlFor="is_premium" className="checkbox-label">
                            <input
                                type="checkbox"
                                id="is_premium"
                                name="is_premium"
                                checked={formData.is_premium}
                                onChange={handleChange}
                            />
                            <span>💎 Contenido Premium</span>
                        </label>
                    </div>

                    {/* Derechos de Autor (solo para libros) */}
                    {contentType === 'libro' && (
                        <div className="form-group form-group--checkbox">
                            <label htmlFor="tiene_derechos_autor" className="checkbox-label">
                                <input
                                    type="checkbox"
                                    id="tiene_derechos_autor"
                                    name="tiene_derechos_autor"
                                    checked={formData.tiene_derechos_autor}
                                    onChange={handleChange}
                                />
                                <span>✓ Tengo derechos de autor</span>
                            </label>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="create-modal__actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Creando...' : 'Crear'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    ) : null
}

export default CreateContentModal
