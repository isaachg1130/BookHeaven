import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/nuestraHistoria.css'

function NuestraHistoria() {
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

            {/* Main Content */}
            <main className="nh-container">
                <article className="nh-article">
                    <h1>Nuestra Historia</h1>
                    <p className="nh-intro">Conoce cómo BookHeaven se convirtió en el refugio para lectores apasionados</p>

                    <section>
                        <h2>Cómo nació la idea de BookHeaven</h2>
                        <p>
                            BookHeaven nació de una pequeña conversación entre tres amigos que recordaban con nostalgia la experiencia de descubrir libros en librerías locales: recomendaciones cálidas, portadas que llamaban desde los estantes y conversaciones con lectores apasionados.
                            Queríamos recrear ese refugio en línea, un lugar donde cada visita invitara al descubrimiento y donde las historias encontrarán a quienes más las necesitan.
                        </p>
                    </section>

                    <section>
                        <h2>El problema que buscaba resolver</h2>
                        <p>
                            En el océano de contenidos digitales muchas voces quedan silenciadas: obras independientes pasan desapercibidas y las recomendaciones automatizadas resultan frías y repetitivas. BookHeaven nació para cerrar esa brecha, poniendo en el centro la experiencia humana de la lectura y creando un espacio que destaque diversidad, calidad y corazón.
                        </p>
                    </section>

                    <section>
                        <h2>La evolución del proyecto</h2>
                        <p>
                            Lo que comenzó como una lista curada por entusiastas, creció paso a paso gracias a la comunidad: reseñas sinceras, herramientas para autores, secciones de descubrimiento y eventos colaborativos. Cada decisión fue guiada por el feedback de lectores y autores, transformando BookHeaven en una plataforma viva y en constante mejora.
                        </p>
                    </section>

                    <section>
                        <h2>La visión a futuro</h2>
                        <p>
                            Soñamos con un ecosistema donde leer y crear se encuentren sin barreras: recomendaciones más humanas, apoyo real a autores emergentes, programas de mentoring y experiencias que conecten historias con la vida de las personas. Nuestro objetivo es abrir puertas para que cada lector encuentre su próxima lectura transformadora.
                        </p>
                    </section>

                </article>
            </main>

            {/* Footer */}
            <footer className="nh-footer">
                <div className="nh-footer__content">
                    <p>&copy; 2026 BookHeaven. Todos los derechos reservados.</p>
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
