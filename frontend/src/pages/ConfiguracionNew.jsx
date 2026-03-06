import React, { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import '../styles/configuracion-new.css'

function Configuracion({ addToast }) {
    const { theme, setTheme } = useTheme()

    // Load settings from localStorage or defaults
    const [settings, setSettings] = useState(() => {
        const savedSettings = localStorage.getItem('userSettings')
        return savedSettings ? JSON.parse(savedSettings) : {
            shareActivity: true,
            emailNotifications: true,
            pushNotifications: false,
            recommendations: true,
            newsletter: true,
            theme: 'dark',
            language: 'es',
            fontSize: 'medium'
        }
    })

    // Sincronizar el estado local con el tema global si cambia por fuera
    useEffect(() => {
        if (settings.theme !== theme) {
            setTheme(settings.theme)
        }
    }, [settings.theme, theme, setTheme])

    // Save to localStorage whenever settings change
    useEffect(() => {
        localStorage.setItem('userSettings', JSON.stringify(settings))
    }, [settings])

    const handleToggle = (key) => {
        setSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }))
        if (addToast) addToast('Configuración actualizada', 'info')
    }

    const handleSelectChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }))

        // Si el cambio es el tema, actualizar el contexto inmediatamente
        if (key === 'theme') {
            setTheme(value)
        }

        if (addToast) addToast('Configuración actualizada', 'info')
    }

    return (
        <div className="configuracion-container">
            <div className="configuracion-wrapper">
                <div className="configuracion-header">
                    <h1>⚙️ Configuración</h1>
                    <p>Personaliza tu experiencia en BookHeaven</p>
                </div>

                <div className="config-single-column">
                    {/* Apariencia Section */}
                    <div className="config-section">
                        <h2>🎨 Apariencia</h2>
                        <div className="config-option">
                            <div className="config-option-label">
                                <div className="config-option-title">Tema</div>
                                <div className="config-option-description">Elige tu modo visual preferido</div>
                            </div>
                            <select
                                className="select-input"
                                value={settings.theme}
                                onChange={(e) => handleSelectChange('theme', e.target.value)}
                            >
                                <option value="dark">🌙 Modo Oscuro</option>
                                <option value="light">☀️ Modo Claro</option>
                                <option value="auto">🤖 Automático</option>
                            </select>
                        </div>
                    </div>

                    {/* Notificaciones Section */}
                    <div className="config-section">
                        <h2>🔔 Notificaciones</h2>
                        <div className="config-option">
                            <div className="config-option-label">
                                <div className="config-option-title">Notificaciones por Email</div>
                                <div className="config-option-description">Recibe actualizaciones por correo</div>
                            </div>
                            <div className="toggle-switch">
                                <input
                                    type="checkbox"
                                    className="checkbox-input"
                                    checked={settings.emailNotifications}
                                    onChange={() => handleToggle('emailNotifications')}
                                />
                            </div>
                        </div>
                        <div className="config-option">
                            <div className="config-option-label">
                                <div className="config-option-title">Notificaciones Push</div>
                                <div className="config-option-description">Avisos en tu navegador</div>
                            </div>
                            <div className="toggle-switch">
                                <input
                                    type="checkbox"
                                    className="checkbox-input"
                                    checked={settings.pushNotifications}
                                    onChange={() => handleToggle('pushNotifications')}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Privacidad Section */}
                    <div className="config-section">
                        <h2>🔒 Privacidad</h2>
                        <div className="config-option">
                            <div className="config-option-label">
                                <div className="config-option-title">Perfil Público</div>
                                <div className="config-option-description">Tu perfil será visible para otros</div>
                            </div>
                            <div className="toggle-switch">
                                <input
                                    type="checkbox"
                                    className="checkbox-input"
                                    checked={settings.shareActivity}
                                    onChange={() => handleToggle('shareActivity')}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Configuracion
