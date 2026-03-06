import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import donQuijoteBg from '../assets/don-quijote-bg.png'
import '../styles/hero.css'

function Hero({ onOpenLogin, addToast }) {
    const { user, addToLibrary, isInLibrary } = useAuth()
    const navigate = useNavigate()

    const featuredBook = {
        id: 'hero-quijote',
        type: 'libro',
        title: 'Don Quijote de la Mancha',
        autor: 'Miguel de Cervantes',
    }

    const handleReadNow = () => {
        if (user) {
            navigate('/biblioteca')
        } else {
            onOpenLogin()
        }
    }

    const handleAddToList = () => {
        if (!user) {
            onOpenLogin()
            return
        }
        addToLibrary(featuredBook)
        if (addToast) addToast('Añadido a tu lista', 'success')
    }

    const inList = isInLibrary(featuredBook.id, featuredBook.type)

    return (
        <section className="hero" style={{ backgroundImage: `url(${donQuijoteBg})` }}>
            <div className="hero__background">
                <div className="hero__gradient"></div>
            </div>

            <div className="hero__content">
                <div className="hero__info">
                    <h1 className="hero__title">{featuredBook.title}</h1>
                    <div className="hero__meta">
                        <span className="hero__match">98% Coincidencia</span>
                        <span className="hero__year">1605</span>
                        <span className="hero__age">16+</span>
                        <span className="hero__seasons">800 - 1500 paginas</span>
                        <span className="hero__quality">HD</span>
                    </div>
                    <p className="hero__description">
                        Alonso Quijano es un hombre tranquilo que busca en los libros de caballerías un mundo que admira. Pero de tanto leer historias de guerreros, batallas, princesas, gigantes, dragones y encantadores, cae en la locura de creer que son ciertas.
                    </p>
                    <div className="hero__buttons">
                        <button className="hero__button hero__button--play" onClick={handleReadNow}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M19 1H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 16H5V3h14v14zm-7-2h6v-2h-6v2zm0-4h6V9h-6v2zm0-4h6V5h-6v2z" fill="black" />
                            </svg>
                            {user ? 'Leer ahora' : 'Empezar a leer'}
                        </button>
                        <button
                            className={`hero__button hero__button--info ${inList ? 'active' : ''}`}
                            onClick={handleAddToList}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                {inList ? (
                                    <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                ) : (
                                    <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                )}
                            </svg>
                            {inList ? 'En tu lista' : 'Mi lista'}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Hero