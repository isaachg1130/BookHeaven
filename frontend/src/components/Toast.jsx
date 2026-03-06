import React, { useEffect } from 'react'
import '../styles/toast.css'

function Toast({ message, type = 'success', duration = 4000, onClose }) {
    useEffect(() => {
        const timer = setTimeout(onClose, duration)
        return () => clearTimeout(timer)
    }, [duration, onClose])

    return (
        <div className={`toast toast--${type}`}>
            <div className="toast__content">
                {type === 'success' && (
                    <svg className="toast__icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                )}
                {type === 'error' && (
                    <svg className="toast__icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        <path d="M12 7V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                )}
                {type === 'info' && (
                    <svg className="toast__icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                )}
                <p className="toast__message">{message}</p>
            </div>
            <div className="toast__progress"></div>
        </div>
    )
}

export default Toast
