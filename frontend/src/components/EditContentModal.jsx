import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { contentAPI } from '../api/content'
import '../styles/EditContentModal.css'

function EditContentModal({ isOpen, onClose, onUpdate, content, contentType, addToast }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [formData, setFormData] = useState({
        titulo: '',
        autor: '',
        descripcion: '',
        genero: '',
        popularidad: 50,
        is_premium: false,
        tiene_derechos_autor: false,
    })
    const [fileNames, setFileNames] = useState({
        imagen: '',
        pdf: ''
    })
    const [imagenPreview, setImagenPreview] = useState(null)
    const [pdfName, setPdfName] = useState(null)
    const [deletePdf, setDeletePdf] = useState(false)

    useEffect(() => {
        if (isOpen && content) {
            setFormData({
                titulo: content.titulo || content.title || '',
                autor: content.autor || content.author || '',
                descripcion: content.descripcion || content.description || '',
                genero: content.genero || content.genre || '',
                popularidad: content.popularidad || 50,
                is_premium: content.is_premium || content.isPremium || false,
                tiene_derechos_autor: content.tiene_derechos_autor || false,
            })
            setImagenPreview(content.imagen || content.poster || null)
            setPdfName(content.pdf || null)
            setFileNames({ imagen: '', pdf: '' })
            setDeletePdf(false)
            setError(null)
        }
    }, [isOpen, content])

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
            if (name === 'imagen' && file) {
                const reader = new FileReader()
                reader.onloadend = () => setImagenPreview(reader.result)
                reader.readAsDataURL(file)
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }))
        }
    }

    const handleDeletePdf = () => {
        setDeletePdf(!deletePdf)
        if (!deletePdf) {
            setFileNames(prev => ({ ...prev, pdf: '' }))
            setFormData(prev => ({ ...prev, pdf: null }))
        }
    }

    const handleOpenPdf = () => {
        if (pdfName) {
            const url = pdfName.startsWith('http')
                ? pdfName
                : `${window.location.origin}/storage/${pdfName}`
            window.open(url, '_blank')
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // Validaciones
            if (!formData.titulo.trim()) {
                throw new Error('El título es requerido')
            }
            if (!formData.autor.trim()) {
                throw new Error('El autor es requerido')
            }
            if (!formData.genero.trim()) {
                throw new Error('El género es requerido')
            }

            // Verificar si hay archivos para enviar
            const hasImage = formData.imagen && typeof formData.imagen === 'object'
            const hasPdf = formData.pdf && typeof formData.pdf === 'object'
            const hasFileChanges = hasImage || hasPdf || deletePdf
            
            console.log('=== PREPARANDO PAYLOAD ===')
            console.log('¿Hay imagen nueva?', hasImage, formData.imagen?.name || 'none')
            console.log('¿Hay PDF nuevo?', hasPdf, formData.pdf?.name || 'none')
            console.log('¿Eliminar PDF?', deletePdf)
            console.log('¿Hay cambios en archivos?', hasFileChanges)

            let payload

            if (hasFileChanges) {
                // Si hay cambios en archivos, usar FormData
                payload = new FormData()
                payload.append('titulo', formData.titulo.trim())
                payload.append('descripcion', formData.descripcion.trim())
                payload.append('autor', formData.autor.trim())
                payload.append('genero', formData.genero.trim())
                payload.append('popularidad', formData.popularidad)
                payload.append('is_premium', formData.is_premium ? 1 : 0)
                
                // Solo enviar tiene_derechos_autor para libros
                if (contentType === 'libro') {
                    payload.append('tiene_derechos_autor', formData.tiene_derechos_autor ? 1 : 0)
                }

                // Agregar archivos si existen
                if (hasImage) {
                    console.log('✓ Enviando imagen:', formData.imagen.name)
                    payload.append('imagen', formData.imagen)
                }
                if (deletePdf) {
                    payload.append('delete_pdf', 1)
                } else if (hasPdf) {
                    console.log('✓ Enviando PDF:', formData.pdf.name)
                    payload.append('pdf', formData.pdf)
                }
                
                // Debug: mostrar contenido de FormData
                console.log('FormData entries:')
                for (let [key, value] of payload.entries()) {
                    if (value instanceof File) {
                        console.log(`  ${key}: ${value.name} (${value.size} bytes)`)
                    } else {
                        console.log(`  ${key}: ${value}`)
                    }
                }
            } else {
                // Si no hay cambios en archivos, usar JSON puro
                payload = {
                    titulo: formData.titulo.trim(),
                    descripcion: formData.descripcion.trim(),
                    autor: formData.autor.trim(),
                    genero: formData.genero.trim(),
                    popularidad: parseInt(formData.popularidad, 10),
                    is_premium: Boolean(formData.is_premium),
                }
                
                // Solo enviar tiene_derechos_autor para libros
                if (contentType === 'libro') {
                    payload.tiene_derechos_autor = Boolean(formData.tiene_derechos_autor)
                }
                
                console.log('Enviando JSON:', payload)
            }

            // Enviar según tipo de contenido
            let response
            console.log(`=== ENVIANDO ${contentType.toUpperCase()} ===`)
            console.log('Tipo de payload:', hasFileChanges ? 'FormData' : 'JSON')
            
            if (contentType === 'libro') {
                console.log('URL: /api/libros/' + content.id)
                response = await contentAPI.updateLibro(content.id, payload)
            } else if (contentType === 'manga') {
                console.log('URL: /api/mangas/' + content.id)
                response = await contentAPI.updateManga(content.id, payload)
            } else if (contentType === 'comic') {
                console.log('URL: /api/comics/' + content.id)
                response = await contentAPI.updateComic(content.id, payload)
            }
            
            console.log('✓ Respuesta del servidor:', response.status, response.data)
            console.log('✓ Imagen nuevo valor en BD:', response.data.data?.imagen || 'undefined')

            if (addToast) {
                addToast(`${contentType.charAt(0).toUpperCase() + contentType.slice(1)} actualizado exitosamente`, 'success')
            }

            // Usar response.data.data (la estructura correcta del backend)
            onUpdate && onUpdate(response.data.data || response.data)
            
            // Recargar la página después de que se cierre el modal
            setTimeout(() => {
                handleClose()
                window.location.reload()
            }, 500)
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Error al actualizar el contenido'
            setError(errorMsg)
            if (addToast) {
                addToast(errorMsg, 'error')
            }
            console.error('Error en handleSubmit:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setFormData({
            titulo: '',
            autor: '',
            descripcion: '',
            genero: '',
            popularidad: 50,
            is_premium: false,
            tiene_derechos_autor: false,
        })
        setFileNames({ imagen: '', pdf: '' })
        setImagenPreview(null)
        setPdfName(null)
        setDeletePdf(false)
        setError(null)
        onClose()
    }

    if (!isOpen || !content) return null

    const getTitle = () => {
        switch (contentType) {
            case 'libro':
                return '📚 Editar Libro'
            case 'manga':
                return '🗯️ Editar Manga'
            case 'comic':
                return '🦸 Editar Cómic'
            default:
                return 'Editar Contenido'
        }
    }

    return isOpen ? ReactDOM.createPortal(
        <div className="edit-modal-overlay" onClick={handleClose}>
            <div className="edit-modal" onClick={e => e.stopPropagation()}>
                <div className="edit-modal__header">
                    <h2>{getTitle()}</h2>
                    <button
                        className="edit-modal__close"
                        onClick={handleClose}
                        title="Cerrar"
                    >
                        ✕
                    </button>
                </div>

                {error && (
                    <div className="edit-modal__error">
                        ⚠️ {error}
                    </div>
                )}

                <form className="edit-modal__form" onSubmit={handleSubmit}>
                    {/* Título */}
                    <div className="form-group">
                        <label htmlFor="titulo">Título *</label>
                        <input
                            type="text"
                            id="titulo"
                            name="titulo"
                            value={formData.titulo}
                            onChange={handleChange}
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
                                {fileNames.imagen ? `✓ ${fileNames.imagen}` : 'Click para cambiar imagen'}
                            </label>
                        </div>
                        {imagenPreview && (
                            <div className="edit-modal__preview">
                                <img src={imagenPreview} alt="Vista previa" />
                            </div>
                        )}
                    </div>

                    {/* PDF */}
                    <div className="form-group">
                        <label>Archivo PDF 📄</label>
                        
                        {/* PDF Actual */}
                        {pdfName && !deletePdf && (
                            <div className="edit-modal__pdf-current">
                                <div className="edit-modal__pdf-info">
                                    <span>📄 PDF actual guardado</span>
                                </div>
                                <div className="edit-modal__pdf-actions">
                                    <button
                                        type="button"
                                        className="edit-modal__pdf-btn edit-modal__pdf-btn--view"
                                        onClick={handleOpenPdf}
                                    >
                                        👁️ Ver
                                    </button>
                                    <button
                                        type="button"
                                        className="edit-modal__pdf-btn edit-modal__pdf-btn--delete"
                                        onClick={handleDeletePdf}
                                    >
                                        🗑️ Eliminar
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Indicador de eliminación */}
                        {deletePdf && (
                            <div className="edit-modal__pdf-deleted">
                                <span>⚠️ El PDF será eliminado</span>
                                <button
                                    type="button"
                                    className="edit-modal__pdf-btn edit-modal__pdf-btn--cancel"
                                    onClick={handleDeletePdf}
                                >
                                    Deshacer
                                </button>
                            </div>
                        )}

                        {/* Input para nuevo PDF */}
                        {!deletePdf && (
                            <div className="file-input-wrapper">
                                <input
                                    type="file"
                                    id="pdf"
                                    name="pdf"
                                    onChange={handleChange}
                                    accept=".pdf"
                                />
                                <label htmlFor="pdf" className="file-input-label">
                                    {fileNames.pdf ? `✓ ${fileNames.pdf}` : 'Click para cambiar PDF'}
                                </label>
                            </div>
                        )}

                        {fileNames.pdf && (
                            <p className="edit-modal__file-info">✓ Nuevo PDF: {fileNames.pdf}</p>
                        )}
                    </div>

                    {/* Popularidad */}
                    <div className="form-group">
                        <label htmlFor="popularidad">Popularidad (0-100)</label>
                        <input
                            type="range"
                            id="popularidad"
                            name="popularidad"
                            min="0"
                            max="100"
                            value={formData.popularidad}
                            onChange={handleChange}
                        />
                        <span className="edit-modal__range-value">{formData.popularidad}</span>
                    </div>

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

                    {/* Botones */}
                    <div className="edit-modal__actions">
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
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    ) : null
}

export default EditContentModal
