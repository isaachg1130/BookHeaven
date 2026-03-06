import React, { useState, useEffect } from 'react'
import { contentAPI } from '../api/content'
import '../styles/CreateContentModal.css'

function CreateAudiobookModal({ isOpen, onClose, onSuccess, addToast, editingAudiobook = null }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        autor: '',
        narrador: '',
        duracion: '',
        genero: '',
        poster: null,
        archivo_audio: null,
        is_premium: false,
    })
    const [fileNames, setFileNames] = useState({
        poster: '',
        archivo_audio: ''
    })

    useEffect(() => {
        if (isOpen) {
            if (editingAudiobook) {
                // Guardar duración en segundos (del backend viene en duracion_segundos o duration)
                let durationInSeconds = editingAudiobook.duracion_segundos || editingAudiobook.duration || 0
                
                setFormData({
                    titulo: editingAudiobook.title || editingAudiobook.titulo || '',
                    descripcion: editingAudiobook.description || editingAudiobook.descripcion || '',
                    autor: editingAudiobook.author || editingAudiobook.autor || '',
                    narrador: editingAudiobook.narrator || editingAudiobook.narrador || '',
                    duracion: durationInSeconds || '',
                    genero: editingAudiobook.genre || editingAudiobook.genero || '',
                    poster: null,
                    archivo_audio: null,
                    is_premium: editingAudiobook.is_premium || editingAudiobook.isPremium || false,
                })
                setFileNames({ poster: '', archivo_audio: '' })
            } else {
                setFormData({
                    titulo: '',
                    descripcion: '',
                    autor: '',
                    narrador: '',
                    duracion: '',
                    genero: '',
                    poster: null,
                    archivo_audio: null,
                    is_premium: false,
                })
                setFileNames({ poster: '', archivo_audio: '' })
            }
            setError(null)
        }
    }, [isOpen, editingAudiobook])

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target

        if (type === 'file') {
            const file = files?.[0]
            
            // Validar tipo de archivo
            if (name === 'archivo_audio' && file) {
                const validAudioTypes = ['audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/wav', 'audio/flac']
                const validExtensions = ['.mp3', '.mp4', '.m4a', '.wav', '.flac']
                const fileName = file.name.toLowerCase()
                const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext))
                
                if (!validAudioTypes.includes(file.type) && !hasValidExtension) {
                    setError('Por favor, selecciona un archivo de audio válido (MP3, MP4, M4A, WAV o FLAC)')
                    return
                }

                // Detectar duración automáticamente (en segundos)
                const audioUrl = URL.createObjectURL(file)
                const audio = new Audio()
                audio.src = audioUrl
                audio.onloadedmetadata = () => {
                    const durationInSeconds = Math.round(audio.duration)
                    setFormData(prev => ({
                        ...prev,
                        duracion: durationInSeconds || ''
                    }))
                    URL.revokeObjectURL(audioUrl)
                }
            }
            
            // Validar imagen
            if (name === 'poster' && file) {
                const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg']
                const validExtensions = ['.jpg', '.jpeg', '.png']
                const fileName = file.name.toLowerCase()
                const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext))
                
                if (!validImageTypes.includes(file.type) && !hasValidExtension) {
                    setError('Por favor, selecciona una imagen válida (JPG o PNG)')
                    return
                }
            }
            
            setFormData(prev => ({
                ...prev,
                [name]: file || null
            }))
            setFileNames(prev => ({
                ...prev,
                [name]: file?.name || ''
            }))
            setError(null)
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
            // Validaciones
            if (!formData.titulo.trim()) {
                throw new Error('El título es requerido')
            }
            if (!formData.autor.trim()) {
                throw new Error('El autor es requerido')
            }
            if (!formData.narrador.trim()) {
                throw new Error('El narrador es requerido')
            }
            if (!formData.genero.trim()) {
                throw new Error('El género es requerido')
            }

            // Para crear: requiere archivo de audio y poster
            if (!editingAudiobook) {
                if (!formData.archivo_audio) {
                    throw new Error('El archivo de audio es requerido')
                }
                if (!formData.poster) {
                    throw new Error('La imagen de portada es requerida')
                }
            }

            // Datos a enviar
            const data = {
                titulo: formData.titulo,
                descripcion: formData.descripcion,
                autor: formData.autor,
                narrador: formData.narrador,
                duracion_segundos: formData.duracion ? parseInt(formData.duracion) : 0,
                genero: formData.genero,
                is_premium: formData.is_premium ? 1 : 0,
            }

            // Detectar si hay archivos para subir
            const hasFiles = formData.poster || formData.archivo_audio
            
            let payload
            if (hasFiles) {
                // Usar FormData para multipart/form-data (con archivos)
                payload = new FormData()
                payload.append('titulo', data.titulo)
                payload.append('descripcion', data.descripcion)
                payload.append('autor', data.autor)
                payload.append('narrador', data.narrador)
                payload.append('duracion_segundos', data.duracion_segundos)
                payload.append('genero', data.genero)
                payload.append('is_premium', data.is_premium)

                if (formData.poster) {
                    payload.append('imagen', formData.poster)
                }
                if (formData.archivo_audio) {
                    payload.append('audio', formData.archivo_audio)
                }
                
                // Log FormData contents
                console.log('📦 FormData contents:')
                for (let [key, value] of payload.entries()) {
                    if (value instanceof File) {
                        console.log(`   ${key}: File(${value.name}, ${value.size} bytes)`)
                    } else {
                        console.log(`   ${key}: ${value}`)
                    }
                }
            } else {
                // Usar JSON para data-only (sin archivos) - mejor para ediciones simples
                payload = data
                console.log('📦 JSON payload:', payload)
            }

            console.log('🚀 Preparando envío de audiobook:')
            console.log('   Editando:', editingAudiobook ? editingAudiobook.id : 'NUEVO')
            console.log('   Título:', data.titulo)
            console.log('   Tiene imagen:', !!formData.poster)
            console.log('   Tiene audio:', !!formData.archivo_audio)
            console.log('   Tipo payload:', hasFiles ? 'FormData' : 'JSON')

            let response
            if (editingAudiobook) {
                console.log(`📤 PUT /content/audiolibros/${editingAudiobook.id}`)
                response = await contentAPI.updateAudiobook(editingAudiobook.id, payload)
                console.log('✅ Respuesta PUT completa:', response)
                console.log('✅ Respuesta.data:', response.data)
                console.log('✅ Respuesta.data.audiobook:', response.data.audiobook)
                if (addToast) addToast('Audiolibro actualizado exitosamente', 'success')
            } else {
                console.log('📤 POST /content/audiolibros')
                response = await contentAPI.createAudiobook(payload)
                console.log('✅ Respuesta POST:', response.data)
                if (addToast) addToast('Audiolibro creado exitosamente', 'success')
            }

            onSuccess && onSuccess(response.data)
            handleClose()
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Error al guardar el audiolibro'
            setError(errorMsg)
            if (addToast) addToast(errorMsg, 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setFormData({
            titulo: '',
            descripcion: '',
            autor: '',
            narrador: '',
            duracion: '',
            genero: '',
            poster: null,
            archivo_audio: null,
            is_premium: false,
        })
        setFileNames({ poster: '', archivo_audio: '' })
        setError(null)
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="create-modal-overlay" onClick={handleClose}>
            <div className="create-modal" onClick={e => e.stopPropagation()}>
                <div className="create-modal__header">
                    <h2>{editingAudiobook ? '🎧 Editar Audiolibro' : '🎧 Crear Nuevo Audiolibro'}</h2>
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
                            placeholder="Ej: Harry Potter y la Piedra Filosofal"
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
                            placeholder="Ej: J.K. Rowling"
                        />
                    </div>

                    {/* Narrador */}
                    <div className="form-group">
                        <label htmlFor="narrador">Narrador *</label>
                        <input
                            type="text"
                            id="narrador"
                            name="narrador"
                            value={formData.narrador}
                            onChange={handleChange}
                            placeholder="Ej: Antonio Casamitjana"
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
                            placeholder="Ej: Fantasía, Ciencia Ficción"
                        />
                    </div>

                    {/* Duración - Solo lectura, se detecta automáticamente */}
                    {formData.duracion && (
                        <div className="form-group">
                            <label>Duración detectada</label>
                            <div className="duration-display">
                                ⏱️ {Math.floor(formData.duracion / 60)}h {Math.round(formData.duracion % 60)}m ({Math.round(formData.duracion)} segundos)
                            </div>
                        </div>
                    )}

                    {/* Descripción */}
                    <div className="form-group">
                        <label htmlFor="descripcion">Descripción</label>
                        <textarea
                            id="descripcion"
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            placeholder="Descripción del audiolibro..."
                            rows="4"
                        />
                    </div>

                    {/* Poster/Imagen */}
                    <div className="form-group">
                        <label htmlFor="poster">
                            Imagen de Portada {!editingAudiobook && '*'}
                        </label>
                        <div style={{ fontSize: '0.85rem', color: '#D4A76A', marginBottom: '8px' }}>
                            JPG, PNG, WebP (Mínimo 500x750px)
                        </div>
                        <div className="file-input-wrapper">
                            <input
                                type="file"
                                id="poster"
                                name="poster"
                                onChange={handleChange}
                                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                            />
                            <label htmlFor="poster" className="file-input-label">
                                {fileNames.poster ? `✓ ${fileNames.poster}` : (editingAudiobook ? 'Cambiar imagen (opcional)' : 'Seleccionar imagen de portada')}
                            </label>
                        </div>
                    </div>

                    {/* Archivo de Audio */}
                    <div className="form-group">
                        <label htmlFor="archivo_audio">
                            Archivo de Audio {!editingAudiobook && '*'} 
                        </label>
                        <div style={{ fontSize: '0.85rem', color: '#D4A76A', marginBottom: '8px' }}>
                            MP3, MP4, M4A, WAV, FLAC
                        </div>
                        <div className="file-input-wrapper">
                            <input
                                type="file"
                                id="archivo_audio"
                                name="archivo_audio"
                                onChange={handleChange}
                                accept=".mp3,.mp4,.m4a,.wav,.flac,audio/mpeg,audio/mp4,audio/x-m4a,audio/wav,audio/flac"
                            />
                            <label htmlFor="archivo_audio" className="file-input-label">
                                {fileNames.archivo_audio ? `✓ ${fileNames.archivo_audio}` : (editingAudiobook ? 'Cambiar audio (opcional)' : 'Seleccionar archivo de audio')}
                            </label>
                        </div>
                    </div>

                    {/* Premium */}
                    <div className="form-group checkbox">
                        <input
                            type="checkbox"
                            id="is_premium"
                            name="is_premium"
                            checked={formData.is_premium}
                            onChange={handleChange}
                        />
                        <label htmlFor="is_premium">⭐ Contenido Premium</label>
                    </div>

                    {/* Submit Button */}
                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={loading}
                        >
                            {loading ? '⏳ Guardando...' : (editingAudiobook ? '💾 Actualizar' : '✨ Crear')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateAudiobookModal
