// src/components/payment/PlanSelectorModal.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PLANS = [
    {
        id: 'premium_1month',
        label: '1 Mes',
        price: 9.99,
        perMonth: 9.99,
        total: '$9.99',
        save: null,
        badge: null,
        color: '#A67C52',
    },
    {
        id: 'premium_3months',
        label: '3 Meses',
        price: 24.99,
        perMonth: 8.33,
        total: '$24.99',
        save: '17%',
        badge: 'Popular',
        color: '#C49050',
    },
    {
        id: 'premium_6months',
        label: '6 Meses',
        price: 44.99,
        perMonth: 7.50,
        total: '$44.99',
        save: '25%',
        badge: 'Recomendado',
        color: '#D4A76A',
    },
    {
        id: 'premium_1year',
        label: '12 Meses',
        price: 79.99,
        perMonth: 6.67,
        total: '$79.99',
        save: '33%',
        badge: 'Mejor precio',
        color: '#E8C88A',
    },
];

function PlanSelectorModal({ isOpen, onClose }) {
    const navigate = useNavigate();
    const [selected, setSelected] = useState('premium_6months');

    if (!isOpen) return null;

    const handleSelect = (planId) => {
        setSelected(planId);
    };

    const handleContinue = () => {
        onClose();
        navigate(`/payment/checkout?plan=${selected}`, { state: { planId: selected } });
    };

    const selectedPlan = PLANS.find((p) => p.id === selected);

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'rgba(0,0,0,0.75)',
                backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '20px',
                animation: 'psmFadeIn 0.2s ease',
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <style>{`
                @keyframes psmFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes psmSlideUp {
                    from { opacity: 0; transform: translateY(24px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .psm-wrap {
                    background: linear-gradient(160deg, #1a1208 0%, #0f0a04 100%);
                    border: 1px solid rgba(212,167,106,0.18);
                    border-radius: 22px;
                    width: 100%;
                    max-width: 520px;
                    overflow: hidden;
                    box-shadow: 0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(212,167,106,0.06) inset;
                    animation: psmSlideUp 0.25s cubic-bezier(0.34,1.56,0.64,1);
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                .psm-header {
                    padding: 28px 28px 20px;
                    position: relative;
                    text-align: center;
                    border-bottom: 1px solid rgba(212,167,106,0.07);
                }
                .psm-close {
                    position: absolute;
                    top: 18px; right: 18px;
                    width: 30px; height: 30px;
                    background: rgba(212,167,106,0.08);
                    border: 1px solid rgba(212,167,106,0.15);
                    border-radius: 8px;
                    color: rgba(232,220,200,0.5);
                    font-size: 15px;
                    cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    transition: all 0.2s;
                    line-height: 1;
                }
                .psm-close:hover { background: rgba(212,167,106,0.15); color: #D4A76A; }
                .psm-icon-row {
                    display: flex; align-items: center; justify-content: center;
                    margin-bottom: 10px;
                }
                .psm-icon {
                    width: 48px; height: 48px;
                    background: linear-gradient(135deg, rgba(212,167,106,0.2), rgba(166,124,82,0.15));
                    border: 1px solid rgba(212,167,106,0.25);
                    border-radius: 14px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 24px;
                }
                .psm-title {
                    font-size: 20px;
                    font-weight: 800;
                    color: #FFFBF5;
                    letter-spacing: -0.4px;
                    margin-bottom: 5px;
                }
                .psm-subtitle {
                    font-size: 13px;
                    color: rgba(232,220,200,0.4);
                    line-height: 1.4;
                }
                .psm-body { padding: 22px 22px 0; }
                .psm-plans { display: flex; flex-direction: column; gap: 10px; }
                .psm-plan {
                    border-radius: 13px;
                    border: 1.5px solid rgba(212,167,106,0.1);
                    background: rgba(255,255,255,0.02);
                    padding: 15px 16px;
                    cursor: pointer;
                    transition: all 0.18s ease;
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    position: relative;
                    overflow: hidden;
                }
                .psm-plan:hover {
                    border-color: rgba(212,167,106,0.35);
                    background: rgba(212,167,106,0.04);
                }
                .psm-plan.active {
                    border-color: #D4A76A;
                    background: rgba(212,167,106,0.08);
                    box-shadow: 0 0 0 3px rgba(212,167,106,0.08), inset 0 1px 0 rgba(212,167,106,0.1);
                }
                .psm-radio {
                    width: 19px; height: 19px; flex-shrink: 0;
                    border-radius: 50%;
                    border: 2px solid rgba(212,167,106,0.25);
                    display: flex; align-items: center; justify-content: center;
                    transition: all 0.18s;
                }
                .psm-plan.active .psm-radio {
                    border-color: #D4A76A;
                    background: #D4A76A;
                }
                .psm-radio-dot {
                    width: 7px; height: 7px;
                    border-radius: 50%;
                    background: #1a1208;
                    opacity: 0;
                    transition: opacity 0.15s;
                }
                .psm-plan.active .psm-radio-dot { opacity: 1; }
                .psm-plan-info { flex: 1; min-width: 0; }
                .psm-plan-name {
                    font-size: 14px;
                    font-weight: 700;
                    color: #FFFBF5;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .psm-plan-badge {
                    font-size: 10px;
                    font-weight: 700;
                    padding: 2px 7px;
                    border-radius: 20px;
                    text-transform: uppercase;
                    letter-spacing: 0.4px;
                }
                .psm-plan-per {
                    font-size: 11.5px;
                    color: rgba(232,220,200,0.4);
                    margin-top: 2px;
                }
                .psm-plan-right { text-align: right; flex-shrink: 0; }
                .psm-plan-price {
                    font-size: 18px;
                    font-weight: 800;
                    color: #D4A76A;
                    letter-spacing: -0.5px;
                    line-height: 1;
                }
                .psm-plan-total {
                    font-size: 10.5px;
                    color: rgba(232,220,200,0.3);
                    margin-top: 2px;
                }
                .psm-save-pill {
                    position: absolute;
                    top: 0; right: 0;
                    background: rgba(76,175,80,0.15);
                    border: 1px solid rgba(76,175,80,0.25);
                    border-top-right-radius: 11px;
                    border-bottom-left-radius: 8px;
                    padding: 3px 9px;
                    font-size: 10px;
                    font-weight: 700;
                    color: rgba(76,175,80,0.9);
                    letter-spacing: 0.3px;
                }
                .psm-footer { padding: 18px 22px 22px; }
                .psm-cta {
                    width: 100%;
                    padding: 17px;
                    background: linear-gradient(135deg, #D4A76A 0%, #C49050 50%, #A67C52 100%);
                    border: none;
                    border-radius: 13px;
                    font-size: 16px;
                    font-weight: 800;
                    font-family: inherit;
                    color: #1a0f04;
                    cursor: pointer;
                    display: flex; align-items: center; justify-content: center; gap: 10px;
                    transition: all 0.25s;
                    box-shadow: 0 6px 22px rgba(212,167,106,0.25), inset 0 1px 0 rgba(255,255,255,0.2);
                    position: relative;
                    overflow: hidden;
                    letter-spacing: 0.1px;
                }
                .psm-cta::before {
                    content: '';
                    position: absolute;
                    top: 0; left: -100%; width: 100%; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
                    transition: left 0.4s ease;
                }
                .psm-cta:hover::before { left: 100%; }
                .psm-cta:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 32px rgba(212,167,106,0.38);
                }
                .psm-cta:active { transform: translateY(0); }
                .psm-note {
                    text-align: center;
                    font-size: 11px;
                    color: rgba(232,220,200,0.25);
                    margin-top: 12px;
                    line-height: 1.5;
                }
            `}</style>

            <div className="psm-wrap">
                <div className="psm-header">
                    <button className="psm-close" onClick={onClose}>&#x2715;</button>
                    <div className="psm-icon-row">
                        <div className="psm-icon">&#11088;</div>
                    </div>
                    <div className="psm-title">Elige tu plan Premium</div>
                    <div className="psm-subtitle">
                        Acceso ilimitado a miles de libros, audiolibros y más
                    </div>
                </div>

                <div className="psm-body">
                    <div className="psm-plans">
                        {PLANS.map((plan) => {
                            const isActive = selected === plan.id;
                            return (
                                <div
                                    key={plan.id}
                                    className={`psm-plan ${isActive ? 'active' : ''}`}
                                    onClick={() => handleSelect(plan.id)}
                                >
                                    {plan.save && (
                                        <div className="psm-save-pill">Ahorra {plan.save}</div>
                                    )}
                                    <div className="psm-radio">
                                        <div className="psm-radio-dot"></div>
                                    </div>
                                    <div className="psm-plan-info">
                                        <div className="psm-plan-name">
                                            {plan.label}
                                            {plan.badge && (
                                                <span
                                                    className="psm-plan-badge"
                                                    style={{
                                                        background: isActive
                                                            ? 'rgba(212,167,106,0.18)'
                                                            : 'rgba(212,167,106,0.08)',
                                                        color: '#D4A76A',
                                                        border: `1px solid rgba(212,167,106,${isActive ? '0.35' : '0.15'})`,
                                                    }}
                                                >
                                                    {plan.badge}
                                                </span>
                                            )}
                                        </div>
                                        <div className="psm-plan-per">
                                            ${plan.perMonth.toFixed(2)} / mes
                                        </div>
                                    </div>
                                    <div className="psm-plan-right">
                                        <div className="psm-plan-price">{plan.total}</div>
                                        <div className="psm-plan-total">total USD</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="psm-footer">
                    <button className="psm-cta" onClick={handleContinue}>
                        <svg width="15" height="17" viewBox="0 0 15 17" fill="none">
                            <rect x="0.5" y="6.5" width="14" height="10" rx="1.5" fill="none" stroke="rgba(26,15,4,0.5)" strokeWidth="1.2"/>
                            <path d="M4 6.5V4.5a3.5 3.5 0 0 1 7 0v2" stroke="rgba(26,15,4,0.5)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                            <circle cx="7.5" cy="12" r="1.5" fill="rgba(26,15,4,0.45)"/>
                        </svg>
                        Continuar con {selectedPlan?.label}
                        &nbsp;&mdash;&nbsp;
                        {selectedPlan?.total} USD
                    </button>
                    <div className="psm-note">
                        Cancela cuando quieras &middot; Sin compromisos &middot; Pago seguro SSL
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PlanSelectorModal;
