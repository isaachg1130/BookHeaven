import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../styles/nuestraHistoria.css'

function NuestraHistoria() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="nh-wrapper">
            {/* Header */}
            <header className="nh-header">
                <div className="nh-header__container">
                    <Link to="/" className="nh-logo">BookHeaven</Link>
                    <nav className="nh-nav">
                        <Link to="/">← Volver a Inicio</Link>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="nh-hero">
                <div className="nh-hero__content">
                    <h1>Nuestra Historia</h1>
                    <p>Donde cada página cuenta el inicio de un gran refugio literario.</p>
                </div>
            </section>

            {/* Main Content */}
            <main className="nh-main">

                {/* Intro Section */}
                <section className="nh-section">
                    <h2>El Origen</h2>
                    <p style={{ fontSize: '1.2rem', lineHeight: '2' }}>
                        BookHeaven no nació en una oficina, sino en el rincón de una pequeña cafetería.
                        Tres amigos, rodeados de libros usados y tazas de café vacías, compartían un sueño:
                        crear un espacio digital que no solo vendiera libros, sino que
                        <strong> protegiera la magia de leer</strong>.
                    </p>
                </section>

                {/* Timeline Section */}
                <section className="nh-section">
                    <h2>Nuestra Evolución</h2>
                    <div className="nh-timeline">
                        <div className="nh-timeline__item">
                            <div className="nh-timeline__dot"></div>
                            <div className="nh-timeline__content">
                                <h3>2024: La Primera chispa</h3>
                                <p>Comenzamos como una simple lista de recomendaciones enviada por correo. La respuesta fue abrumadora; los lectores buscaban algo más personal que un algoritmo.</p>
                            </div>
                        </div>
                        <div className="nh-timeline__item">
                            <div className="nh-timeline__dot"></div>
                            <div className="nh-timeline__content">
                                <h3>2025: Construyendo el Refugio</h3>
                                <p>Lanzamos nuestra primera plataforma beta. Integramos herramientas para autores independientes, dándoles un escenario donde sus voces finalmente fueran escuchadas.</p>
                            </div>
                        </div>
                        <div className="nh-timeline__item">
                            <div className="nh-timeline__dot"></div>
                            <div className="nh-timeline__content">
                                <h3>2026: Una Comunidad Global</h3>
                                <p>Hoy, BookHeaven es el hogar de miles de soñadores. Hemos evolucionado hacia un ecosistema completo que incluye audiolibros, eventos virtuales y una biblioteca sin fin.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Vision Section */}
                <section className="nh-section">
                    <div className="nh-vision-container">
                        <div className="nh-vision__text">
                            <h2>Nuestra Visión</h2>
                            <p style={{ fontSize: '1.2rem', textAlign: 'center' }}>
                                Creemos en un futuro donde el conocimiento y la imaginación no tengan barreras.
                                Nuestra misión es seguir conectando historias con corazones, fomentando la
                                diversidad literaria y apoyando a la próxima generación de escritores.
                            </p>
                        </div>
                    </div>
                </section>

            </main>

            {/* Footer */}
            <footer className="nh-footer">
                <div className="nh-footer__content">
                    <div className="nh-footer__info">
                        <Link to="/" className="nh-logo" style={{ fontSize: '1.5rem' }}>BookHeaven</Link>
                        <p style={{ marginTop: '1rem', color: 'rgba(232, 220, 200, 0.5)' }}>&copy; 2026. Todos los derechos reservados.</p>
                    </div>
                    <div className="nh-footer__links">
                        <Link to="/">Inicio</Link>
                        <a href="#">Contacto</a>
                        <a href="#">Privacidad</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default NuestraHistoria

