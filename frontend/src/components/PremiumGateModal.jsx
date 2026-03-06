import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/auth-modal.css'

const PLANS = [
    { id: 'premium_1month',  label: '1 Mes',    price: 9.99,  perMonth: 9.99, save: null,  badge: null },
    { id: 'premium_3months', label: '3 Meses',  price: 24.99, perMonth: 8.33, save: '17%', badge: 'Popular' },
    { id: 'premium_6months', label: '6 Meses',  price: 44.99, perMonth: 7.50, save: '25%', badge: 'Recomendado' },
    { id: 'premium_1year',   label: '12 Meses', price: 79.99, perMonth: 6.67, save: '33%', badge: 'Mejor precio' },
]

const CheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
        <circle cx="7" cy="7" r="6.5" stroke="rgba(212,167,106,0.35)" />
        <path d="M4 7l2 2 4-4" stroke="#D4A76A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

const StarIcon = () => (
    <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
        <path d="M19 4l4 8.5 9.5 0.9-7 6.2 2.1 9.4-8.6-5-8.6 5 2.1-9.4-7-6.2 9.5-0.9z" fill="rgba(212,167,106,0.18)" stroke="#D4A76A" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
)

function PremiumGateModal({
    isOpen,
    onClose,
    onLoginClick,
    userRole = null,
    isUserAuthenticated = false,
    contentTitle = 'Contenido Premium',
}) {
    const navigate = useNavigate()
    const [selectedPlan, setSelectedPlan] = useState('premium_6months')

    const isAuthenticated = isUserAuthenticated || (userRole !== null && userRole !== undefined)

    useEffect(() => {
        if (isOpen && !isAuthenticated) {
            onClose()
            if (typeof onLoginClick === 'function') onLoginClick()
        }
    }, [isOpen, isAuthenticated, onClose, onLoginClick])

    if (!isOpen) return null
    if (!isAuthenticated) return null

    const handleSubscribe = () => {
        onClose()
        navigate(`/payment/checkout?plan=${selectedPlan}`, { state: { planId: selectedPlan } })
    }

    const currentPlan = PLANS.find((p) => p.id === selectedPlan)

    return (
        <div className="auth-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="auth-modal premium-gate-modal pgm-modal">
                <div className="pgm-accent-line" />
                <button className="auth-modal-close" onClick={onClose}>&#x2715;</button>

                <div className="auth-modal-header pgm-header">
                    <div className="pgm-icon-wrap">
                        <StarIcon />
                    </div>
                    <h2 className="pgm-title">Hazte Premium</h2>
                    <p className="pgm-subtitle">Cancela cuando quieras &middot; Sin compromisos</p>
                    {contentTitle && (
                        <div className="pgm-content-badge">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M2 2h8v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V2z" stroke="#D4A76A" strokeWidth="1.2" fill="none" />
                                <path d="M4 2V1m4 1V1" stroke="#D4A76A" strokeWidth="1.2" strokeLinecap="round" />
                            </svg>
                            <span>{contentTitle}</span>
                        </div>
                    )}
                </div>

                <div className="premium-gate-content">
                    <div className="pgm-benefits">
                        {[
                            'Biblioteca completa sin límites',
                            'Audiolibros y cómics exclusivos',
                            'Descarga offline ilimitada',
                            'Sin publicidades',
                        ].map((b) => (
                            <div key={b} className="pgm-benefit-row">
                                <CheckIcon />
                                <span>{b}</span>
                            </div>
                        ))}
                    </div>

                    <div className="pgm-plan-picker">
                        {PLANS.map((plan) => (
                            <div
                                key={plan.id}
                                className={`pgm-plan-row${selectedPlan === plan.id ? ' pgm-active' : ''}`}
                                onClick={() => setSelectedPlan(plan.id)}
                                role="radio"
                                aria-checked={selectedPlan === plan.id}
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && setSelectedPlan(plan.id)}
                            >
                                {plan.save && <div className="pgm-save-chip">Ahorra {plan.save}</div>}
                                <div className="pgm-radio">
                                    <div className="pgm-radio-dot" />
                                </div>
                                <div className="pgm-plan-info">
                                    <div className="pgm-plan-name">
                                        {plan.label}
                                        {plan.badge && <span className="pgm-badge">{plan.badge}</span>}
                                    </div>
                                    <div className="pgm-plan-per">${plan.perMonth.toFixed(2)} / mes</div>
                                </div>
                                <div className="pgm-plan-price">${plan.price.toFixed(2)}</div>
                            </div>
                        ))}
                    </div>

                    <button className="pgm-cta" onClick={handleSubscribe}>
                        <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
                            <rect x="0.5" y="6" width="13" height="10" rx="1.5" fill="none" stroke="rgba(26,15,4,0.55)" strokeWidth="1.2" />
                            <path d="M3.5 6V4a3.5 3.5 0 0 1 7 0v2" stroke="rgba(26,15,4,0.55)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                        </svg>
                        Suscribirse &middot; {currentPlan?.label} por ${currentPlan?.price.toFixed(2)}
                    </button>

                    <button className="pgm-close-link" onClick={onClose}>
                        No por ahora
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PremiumGateModal