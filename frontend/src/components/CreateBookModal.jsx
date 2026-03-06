import React, { useState } from 'react'
import '../styles/modal.css'

function CreateBookModal({ isOpen, onClose, onCreate }) {
    const [formData, setFormData] = useState({
        nombre: '',
        autor: '',
        descripcion: '',
        imagen: null,
        pdf: null
    })

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()

        const data = new FormData()
        data.append('nombre', formData.nombre)
        data.append('autor', formData.autor)
        data.append('descripcion', formData.descripcion)
        data.append('imagen', formData.imagen)
        data.append('pdf', formData.pdf)

        try {
            const response = await fetch('http://127.0.0.1:8000/api/libros', {
                method: 'POST',
                body: data // ⚠️ NO headers aquí
            })

            if (!response.ok) {
                throw new Error('Error al crear libro')
            }

            const libro = await response.json()

            onCreate({
                id: libro.id,
                title: libro.nombre,
                poster: libro.imagen,
                backdrop: libro.imagen,
                description: libro.descripcion,
                genres: [libro.autor],
                match: 100,
                age: 'Libro',
                duration: 'PDF',
                pdf: libro.pdf
            })

            // Notificar al dashboard para actualizar inmediatamente
            localStorage.setItem('dashboardUpdate', Date.now().toString())

            onClose()
        } catch (error) {
            console.error(error)
            alert('Error al subir el libro')
        }
    }

    return (
        <div className="modal-overlay">
            <div className="modal modal--create">
                <h2>Crear Libro</h2>

                <form onSubmit={handleSubmit} className="modal__form">
                    <input
                        type="text"
                        placeholder="Nombre del libro"
                        required
                        onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                    />

                    <input
                        type="text"
                        placeholder="Autor"
                        required
                        onChange={e => setFormData({ ...formData, autor: e.target.value })}
                    />

                    <textarea
                        placeholder="Descripción"
                        onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                    />

                    <label>Imagen del libro</label>
                    <input
                        type="file"
                        accept="image/*"
                        required
                        onChange={e => setFormData({ ...formData, imagen: e.target.files[0] })}
                    />

                    <label>Archivo PDF</label>
                    <input
                        type="file"
                        accept="application/pdf"
                        required
                        onChange={e => setFormData({ ...formData, pdf: e.target.files[0] })}
                    />

                    <div className="modal__actions">
                        <button type="button" onClick={onClose}>Cancelar</button>
                        <button type="submit">Crear Libro</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateBookModal
