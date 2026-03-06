import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/footer.css'

function Footer() {
    return (
        <footer className="footer">
            <div className="footer__content">
                <div className="footer__column">
                    <h4>Sobre BookHeaven</h4>
                    <Link to="/nuestra-historia" target="_blank" rel="noopener noreferrer">Nuestra historia</Link>
                    <a href="#">Prensa</a>
                    <a href="#">Contacto</a>
                    <a href="#">Empleo</a>
                </div>

                <div className="footer__column">
                    <h4>Leer en BookHeaven</h4>
                    <a href="#">Leer en móvil</a>
                    <a href="#">Leer en tablet</a>
                    <a href="#">Leer en PC</a>
                </div>

                <div className="footer__column">
                    <h4>Ayuda</h4>
                    <a href="#">Centro de ayuda</a>
                    <a href="#">Cuenta</a>
                    <a href="#">Soporte</a>
                    <a href="#">Preguntas frecuentes</a>
                </div>

                <div className="footer__column">
                    <h4>Términos de uso</h4>
                    <a href="#">Privacidad</a>
                    <a href="#">Preferencias de cookies</a>
                    <a href="#">Información corporativa</a>
                    <a href="#">Contacto legal</a>
                </div>
            </div>

            <div className="footer__social">
                <button className="footer__social-button">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M22 12C22 6.477 17.523 2 12 2C6.477 2 2 6.477 2 12C2 16.991 5.657 21.128 10.438 21.879V14.89H7.898V12H10.438V9.797C10.438 7.291 11.93 5.907 14.215 5.907C15.309 5.907 16.453 6.102 16.453 6.102V8.562H15.193C13.95 8.562 13.563 9.333 13.563 10.124V12H16.336L15.893 14.89H13.563V21.879C18.343 21.128 22 16.991 22 12Z" fill="white" />
                    </svg>
                </button>
                <button className="footer__social-button">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </button>
                <button className="footer__social-button">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        <rect x="2" y="9" width="4" height="12" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="4" cy="4" r="2" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </button>
            </div>

            <div className="footer__bottom">
                <p>&copy; 2026 BookHeaven. Todos los derechos reservados.</p>
            </div>
        </footer>
    )
}

export default Footer