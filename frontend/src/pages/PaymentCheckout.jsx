// src/pages/PaymentCheckout.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { paymentAPI } from '../api/payment';
import { useAuth } from '../context/AuthContext';
import Heaven from '../assets/logo.png';

// Icono de marca de tarjeta - fuera del componente para evitar re-creacion en render
function getCardBrandIcon(cardType) {
    if (cardType === 'visa') {
        return (
            <svg viewBox="0 0 48 16" style={{ width: 38, height: 13 }}>
                <text x="0" y="13" fontFamily="Arial Black, Arial" fontWeight="900" fontSize="13" fill="#1A1F71" letterSpacing="-0.5">VISA</text>
            </svg>
        );
    }
    if (cardType === 'mastercard') {
        return (
            <svg viewBox="0 0 32 20" style={{ width: 32, height: 20 }}>
                <circle cx="12" cy="10" r="10" fill="#EB001B" />
                <circle cx="20" cy="10" r="10" fill="#F79E1B" />
                <path d="M16 4.8a10 10 0 0 1 0 10.4A10 10 0 0 1 16 4.8z" fill="#FF5F00" />
            </svg>
        );
    }
    if (cardType === 'amex') {
        return (
            <svg viewBox="0 0 44 14" style={{ width: 36, height: 13 }}>
                <text x="0" y="12" fontFamily="Arial Black, Arial" fontWeight="900" fontSize="11" fill="#007BC1" letterSpacing="1">AMEX</text>
            </svg>
        );
    }
    return (
        <svg viewBox="0 0 24 24" style={{ width: 22, height: 22, opacity: 0.25 }} fill="none" stroke="#D4A76A" strokeWidth="1.5">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <path d="M2 10h20" />
        </svg>
    );
}

// Mapa de planes disponibles
const PLANS_INFO = {
    premium_1month: {
        id: 'premium_1month',
        name: 'Premium 1 Mes',
        price: 9.99,
        duration_months: 1,
        description: 'Acceso total por 1 mes',
        badge: null,
        features: [
            'Acceso a TODO el contenido premium',
            'Audiolibros premium sin límites',
            'Descargas offline',
            'Sincronización de progreso',
            'Sin anuncios',
        ],
    },
    premium_3months: {
        id: 'premium_3months',
        name: 'Premium 3 Meses',
        price: 24.99,
        duration_months: 3,
        description: 'Mejor valor — Ahorra 10%',
        badge: 'Popular',
        features: [
            'Acceso a TODO el contenido premium',
            'Audiolibros premium sin límites',
            'Descargas offline',
            'Sincronización de progreso',
            'Sin anuncios',
        ],
    },
    premium_6months: {
        id: 'premium_6months',
        name: 'Premium 6 Meses',
        price: 44.99,
        duration_months: 6,
        description: 'Mejor valor — Ahorra 25%',
        badge: 'Recomendado',
        features: [
            'Acceso a TODO el contenido premium',
            'Audiolibros premium sin límites',
            'Descargas offline',
            'Sincronización de progreso',
            'Sin anuncios',
            'Acceso prioritario a nuevo contenido',
        ],
    },
    premium_1year: {
        id: 'premium_1year',
        name: 'Premium 1 Año',
        price: 79.99,
        duration_months: 12,
        description: 'Mejor valor — Ahorra 33%',
        badge: 'Mejor precio',
        features: [
            'Acceso a TODO el contenido premium',
            'Audiolibros premium sin límites',
            'Descargas offline',
            'Sincronización de progreso',
            'Sin anuncios',
            'Acceso prioritario a nuevo contenido',
            'Soporte por email prioritario',
        ],
    },
};

const formatCardNumber = (value) =>
    value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
};

function PaymentCheckout({ addToast }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const searchParams = new URLSearchParams(location.search);
    const planIdFromQuery = searchParams.get('plan') || 'premium_1month';
    const planIdFromState = location.state?.planId;
    const selectedPlanId = planIdFromState || planIdFromQuery;
    const plan = PLANS_INFO[selectedPlanId] || PLANS_INFO['premium_1month'];

    const [cardNumber, setCardNumber] = useState('');
    const [cardHolder, setCardHolder] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('credit_card');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [step, setStep] = useState(1);

    const getCardType = () => {
        const num = cardNumber.replace(/\s/g, '');
        if (num.startsWith('4')) return 'visa';
        if (num.startsWith('5') || num.startsWith('2')) return 'mastercard';
        if (num.startsWith('3')) return 'amex';
        return 'generic';
    };

    const validate = () => {
        const newErrors = {};
        const rawCard = cardNumber.replace(/\s/g, '');
        if (!cardHolder.trim()) newErrors.cardHolder = 'El nombre del titular es obligatorio';
        if (rawCard.length < 16) newErrors.cardNumber = 'Número de tarjeta inválido (16 dígitos)';
        if (expiry.length < 5) {
            newErrors.expiry = 'Fecha de expiración inválida (MM/AA)';
        } else {
            const [mm, yy] = expiry.split('/');
            const now = new Date();
            const expDate = new Date(2000 + parseInt(yy), parseInt(mm) - 1, 1);
            if (expDate < now) newErrors.expiry = 'La tarjeta ha expirado';
        }
        if (cvv.length < 3) newErrors.cvv = 'CVV inválido (mín. 3 dígitos)';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        if (!user) { navigate('/', { state: { openLogin: true } }); return; }
        setLoading(true);
        setStep(2);
        try {
            const initiateRes = await paymentAPI.initiatePremiumPayment({
                duration_months: plan.duration_months,
                payment_method: paymentMethod,
            });
            const paymentId = initiateRes.data.payment.id;
            await new Promise((resolve) => setTimeout(resolve, 1800));
            const completeRes = await paymentAPI.completePayment(paymentId, {
                token: `SIM-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
            });
            setStep(3);
            navigate('/payment/success', {
                state: { plan, payment: completeRes.data.payment, premiumExpiresAt: completeRes.data.premium_expires_at },
            });
        } catch (error) {
            setLoading(false);
            setStep(1);
            const msg = error?.response?.data?.message || 'Error al procesar el pago. Intenta de nuevo.';
            if (addToast) addToast(msg, 'error');
            setErrors({ general: msg });
        }
    };

    useEffect(() => {
        if (!user) {
            navigate('/', { state: { openLogin: true, redirectAfter: `/payment/checkout?plan=${selectedPlanId}` } });
        }
    }, [user, navigate, selectedPlanId]);

    const cardType = getCardType();
    const cardDigits = cardNumber.replace(/\s/g, '');

    return (
        <div className="mp-page">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

                .mp-page {
                    min-height: 100vh;
                    background: linear-gradient(160deg, #0d0b06 0%, #1a1208 50%, #0d0b06 100%);
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    color: #E8DCC8;
                    position: relative;
                    overflow-x: hidden;
                }
                .mp-page::before {
                    content: '';
                    position: fixed;
                    top: -30%;
                    right: -20%;
                    width: 600px;
                    height: 600px;
                    background: radial-gradient(circle, rgba(212,167,106,0.04) 0%, transparent 70%);
                    pointer-events: none;
                }
                .mp-page::after {
                    content: '';
                    position: fixed;
                    bottom: -20%;
                    left: -10%;
                    width: 500px;
                    height: 500px;
                    background: radial-gradient(circle, rgba(166,124,82,0.03) 0%, transparent 70%);
                    pointer-events: none;
                }

                /* TOP BAR */
                .mp-topbar {
                    height: 64px;
                    background: rgba(10,8,4,0.92);
                    border-bottom: 1px solid rgba(212,167,106,0.1);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 40px;
                    position: sticky;
                    top: 0;
                    z-index: 200;
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                }
                .mp-topbar-left {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }
                .mp-back-btn {
                    background: rgba(212,167,106,0.07);
                    border: 1px solid rgba(212,167,106,0.15);
                    color: rgba(232,220,200,0.6);
                    cursor: pointer;
                    width: 34px;
                    height: 34px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    transition: all 0.2s;
                    line-height: 1;
                }
                .mp-back-btn:hover {
                    background: rgba(212,167,106,0.15);
                    color: #D4A76A;
                    border-color: rgba(212,167,106,0.3);
                }
                .mp-logo {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    text-decoration: none;
                }
                .mp-logo-icon {
                    width: 28px;
                    height: 28px;
                    background: linear-gradient(135deg, #D4A76A, #A67C52);
                    border-radius: 7px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 15px;
                }
                .mp-logo-text {
                    font-size: 15px;
                    font-weight: 700;
                    background: linear-gradient(135deg, #D4A76A, #E8C88A);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    letter-spacing: -0.3px;
                }
                .mp-topbar-right {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    color: rgba(212,167,106,0.45);
                    font-weight: 500;
                }
                .mp-ssl-icon {
                    width: 16px;
                    height: 16px;
                    background: rgba(76,175,80,0.15);
                    border: 1px solid rgba(76,175,80,0.3);
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 9px;
                }

                /* MAIN GRID */
                .mp-main {
                    display: grid;
                    grid-template-columns: 1fr 360px;
                    max-width: 980px;
                    margin: 0 auto;
                    padding: 36px 24px 64px;
                    gap: 28px;
                    align-items: start;
                }
                @media (max-width: 800px) {
                    .mp-main { grid-template-columns: 1fr; padding: 20px 16px 48px; gap: 20px; }
                    .mp-summary { order: -1; }
                    .mp-topbar { padding: 0 20px; }
                }

                /* FORM PANEL */
                .mp-form-panel {
                    background: rgba(28,20,10,0.7);
                    border: 1px solid rgba(212,167,106,0.12);
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 24px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,167,106,0.08);
                }
                .mp-form-header {
                    padding: 28px 32px 0;
                    border-bottom: 1px solid rgba(212,167,106,0.08);
                    padding-bottom: 20px;
                }
                .mp-form-title {
                    font-size: 18px;
                    font-weight: 700;
                    color: #FFFBF5;
                    margin-bottom: 4px;
                    letter-spacing: -0.3px;
                }
                .mp-form-subtitle {
                    font-size: 13px;
                    color: rgba(232,220,200,0.4);
                }
                .mp-form-body {
                    padding: 28px 32px 32px;
                }
                @media (max-width: 480px) {
                    .mp-form-header, .mp-form-body { padding-left: 20px; padding-right: 20px; }
                }

                /* METHOD TABS */
                .mp-method-tabs {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 28px;
                    background: rgba(0,0,0,0.25);
                    border: 1px solid rgba(212,167,106,0.1);
                    border-radius: 12px;
                    padding: 5px;
                }
                .mp-method-tab {
                    flex: 1;
                    padding: 10px 14px;
                    background: transparent;
                    border: none;
                    border-radius: 9px;
                    color: rgba(232,220,200,0.4);
                    font-size: 13px;
                    font-weight: 600;
                    font-family: inherit;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 7px;
                }
                .mp-method-tab:hover { color: rgba(232,220,200,0.75); }
                .mp-method-tab.mp-active {
                    background: rgba(212,167,106,0.12);
                    color: #D4A76A;
                    box-shadow: inset 0 0 0 1px rgba(212,167,106,0.25);
                }
                .mp-tab-icon {
                    width: 18px;
                    height: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0.8;
                }

                /* FIELDS */
                .mp-field {
                    margin-bottom: 18px;
                }
                .mp-label {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-size: 11.5px;
                    font-weight: 600;
                    color: rgba(212,167,106,0.65);
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.6px;
                }
                .mp-input-wrap {
                    position: relative;
                }
                .mp-input {
                    width: 100%;
                    padding: 14px 16px;
                    background: rgba(15,10,4,0.7);
                    border: 1.5px solid rgba(212,167,106,0.14);
                    border-radius: 11px;
                    color: #E8DCC8;
                    font-size: 15px;
                    font-family: inherit;
                    outline: none;
                    transition: all 0.22s;
                }
                .mp-input::placeholder { color: rgba(232,220,200,0.15); }
                .mp-input:focus {
                    border-color: rgba(212,167,106,0.6);
                    background: rgba(20,14,6,0.85);
                    box-shadow: 0 0 0 3px rgba(212,167,106,0.08), 0 4px 20px rgba(0,0,0,0.3);
                }
                .mp-input.err {
                    border-color: rgba(231,76,60,0.6);
                    box-shadow: 0 0 0 3px rgba(231,76,60,0.06);
                }
                .mp-input-hero {
                    font-size: 20px;
                    padding: 17px 58px 17px 18px;
                    letter-spacing: 3px;
                    font-weight: 600;
                    color: #FFFBF5;
                }
                .mp-input-hero::placeholder {
                    letter-spacing: 2px;
                    font-weight: 400;
                    color: rgba(232,220,200,0.12);
                }
                .mp-brand-slot {
                    position: absolute;
                    right: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 42px;
                    height: 28px;
                    background: rgba(255,255,255,0.06);
                    border-radius: 5px;
                    border: 1px solid rgba(255,255,255,0.06);
                    overflow: hidden;
                    transition: all 0.25s;
                }
                .mp-input-sm { font-size: 14px; padding: 13px 16px; }
                .mp-cvv-input-wrap { position: relative; }
                .mp-cvv-hint-icon {
                    position: absolute;
                    right: 13px;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 20px;
                    height: 20px;
                    background: rgba(212,167,106,0.12);
                    border: 1px solid rgba(212,167,106,0.2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 11px;
                    font-weight: 700;
                    color: rgba(212,167,106,0.5);
                    cursor: default;
                    font-family: inherit;
                    pointer-events: none;
                }
                .mp-field-error {
                    color: #e74c3c;
                    font-size: 11px;
                    margin-top: 6px;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    font-weight: 500;
                }
                .mp-row-2 {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 14px;
                }

                /* DIVIDER */
                .mp-divider {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin: 22px 0;
                }
                .mp-divider-line {
                    flex: 1;
                    height: 1px;
                    background: rgba(212,167,106,0.08);
                }
                .mp-divider-text {
                    font-size: 10px;
                    font-weight: 700;
                    color: rgba(212,167,106,0.25);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    white-space: nowrap;
                }

                /* SELECT */
                .mp-select {
                    width: 100%;
                    padding: 13px 40px 13px 16px;
                    background: rgba(15,10,4,0.7);
                    border: 1.5px solid rgba(212,167,106,0.14);
                    border-radius: 11px;
                    color: #E8DCC8;
                    font-size: 14px;
                    font-family: inherit;
                    font-weight: 500;
                    outline: none;
                    cursor: pointer;
                    transition: all 0.22s;
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23D4A76A' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 14px center;
                }
                .mp-select:focus {
                    border-color: rgba(212,167,106,0.6);
                    box-shadow: 0 0 0 3px rgba(212,167,106,0.08);
                }
                .mp-select option { background: #1a1208; color: #E8DCC8; }

                /* GENERAL ERROR */
                .mp-general-error {
                    background: rgba(231,76,60,0.08);
                    border: 1px solid rgba(231,76,60,0.25);
                    border-radius: 10px;
                    padding: 13px 16px;
                    color: #e74c3c;
                    font-size: 13px;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    line-height: 1.4;
                    font-weight: 500;
                }

                /* PAY BUTTON */
                .mp-pay-btn {
                    width: 100%;
                    padding: 18px;
                    position: relative;
                    background: linear-gradient(135deg, #D4A76A 0%, #C49050 50%, #A67C52 100%);
                    border: none;
                    border-radius: 13px;
                    font-size: 16px;
                    font-weight: 800;
                    font-family: inherit;
                    color: #1a0f04;
                    cursor: pointer;
                    transition: all 0.28s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    letter-spacing: 0.2px;
                    overflow: hidden;
                    box-shadow: 0 6px 24px rgba(212,167,106,0.25), inset 0 1px 0 rgba(255,255,255,0.2);
                }
                .mp-pay-btn::before {
                    content: '';
                    position: absolute;
                    top: 0; left: -100%;
                    width: 100%; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
                    transition: left 0.45s ease;
                }
                .mp-pay-btn:hover:not(:disabled)::before { left: 100%; }
                .mp-pay-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 36px rgba(212,167,106,0.4), inset 0 1px 0 rgba(255,255,255,0.2);
                    filter: brightness(1.06);
                }
                .mp-pay-btn:active:not(:disabled) { transform: translateY(0); transition: transform 0.1s; }
                .mp-pay-btn:disabled {
                    opacity: 0.45;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }
                .mp-pay-amount {
                    font-size: 19px;
                    font-weight: 900;
                }

                /* TRUST BADGES */
                .mp-trust {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 20px;
                    margin-top: 16px;
                    flex-wrap: wrap;
                }
                .mp-trust-item {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 11px;
                    color: rgba(212,167,106,0.3);
                    font-weight: 500;
                    letter-spacing: 0.2px;
                }
                .mp-trust-dot {
                    width: 3px;
                    height: 3px;
                    background: rgba(212,167,106,0.2);
                    border-radius: 50%;
                }

                /* SPINNER */
                .mp-spinner {
                    border: 3px solid rgba(212,167,106,0.12);
                    border-top-color: #D4A76A;
                    border-radius: 50%;
                    animation: mpspin 0.7s linear infinite;
                }
                @keyframes mpspin { to { transform: rotate(360deg); } }

                /* PROCESSING OVERLAY */
                .mp-processing {
                    min-height: calc(100vh - 64px);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 20px;
                    padding: 40px;
                }
                .mp-processing-ring {
                    width: 70px;
                    height: 70px;
                    border: 5px solid rgba(212,167,106,0.1);
                    border-top-color: #D4A76A;
                    border-radius: 50%;
                    animation: mpspin 0.8s linear infinite;
                }
                .mp-processing-title {
                    font-size: 20px;
                    font-weight: 700;
                    color: #FFFBF5;
                    letter-spacing: -0.3px;
                }
                .mp-processing-sub {
                    font-size: 13px;
                    color: rgba(232,220,200,0.4);
                    text-align: center;
                    max-width: 260px;
                    line-height: 1.5;
                }
                .mp-processing-steps {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    margin-top: 8px;
                }
                .mp-processing-step {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 13px;
                    color: rgba(232,220,200,0.5);
                }
                .mp-step-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: rgba(212,167,106,0.3);
                    flex-shrink: 0;
                }
                .mp-step-dot.active {
                    background: #D4A76A;
                    box-shadow: 0 0 8px rgba(212,167,106,0.6);
                    animation: mpblink 1s ease-in-out infinite;
                }
                @keyframes mpblink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }

                /* SUMMARY PANEL */
                .mp-summary {
                    background: rgba(24,17,8,0.8);
                    border: 1px solid rgba(212,167,106,0.12);
                    border-radius: 20px;
                    overflow: hidden;
                    position: sticky;
                    top: 84px;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.4);
                }
                .mp-summary-top {
                    padding: 24px 24px 20px;
                    border-bottom: 1px solid rgba(212,167,106,0.08);
                }
                .mp-summary-product-row {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                }
                .mp-summary-icon-box {
                    width: 64px;
                    height: 64px;
                    background: linear-gradient(135deg, rgba(42,31,0,0.8) 0%, rgba(61,45,0,0.9) 100%);
                    border: 2px solid rgba(232,168,75,0.4);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    box-shadow: 
                        0 4px 16px rgba(212,167,106,0.25),
                        inset 0 0 0 1px rgba(232,168,75,0.15),
                        0 0 0 4px rgba(212,167,106,0.08);
                    position: relative;
                    overflow: hidden;
                    animation: logoGlow 3s ease-in-out infinite;
                }
                @keyframes logoGlow {
                    0%, 100% { box-shadow: 0 4px 16px rgba(212,167,106,0.25), inset 0 0 0 1px rgba(232,168,75,0.15), 0 0 0 4px rgba(212,167,106,0.08); }
                    50% { box-shadow: 0 6px 24px rgba(212,167,106,0.4), inset 0 0 0 1px rgba(232,168,75,0.25), 0 0 0 4px rgba(212,167,106,0.15); }
                }
                .mp-summary-icon-box::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, transparent 40%, rgba(255,220,140,0.12) 50%, transparent 60%);
                    background-size: 200% 200%;
                    animation: iconShimmer 3s linear infinite;
                }
                @keyframes iconShimmer {
                    0% { background-position: -200% -200%; }
                    100% { background-position: 200% 200%; }
                }
                .mp-summary-icon-box img {
                    position: relative;
                    z-index: 1;
                }
                .mp-summary-product-info { flex: 1; min-width: 0; }
                .mp-summary-product-name {
                    font-size: 15px;
                    font-weight: 700;
                    color: #FFFBF5;
                    letter-spacing: -0.2px;
                }
                .mp-summary-product-sub {
                    font-size: 12px;
                    color: rgba(232,220,200,0.4);
                    margin-top: 2px;
                }
                .mp-summary-badge {
                    display: inline-block;
                    padding: 2px 8px;
                    background: rgba(212,167,106,0.12);
                    border: 1px solid rgba(212,167,106,0.2);
                    border-radius: 20px;
                    font-size: 10px;
                    font-weight: 700;
                    color: #D4A76A;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-top: 5px;
                    display: none;
                }
                .mp-summary-mid {
                    padding: 20px 24px;
                    border-bottom: 1px solid rgba(212,167,106,0.06);
                }
                .mp-summary-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 13px;
                    color: rgba(232,220,200,0.45);
                    margin-bottom: 8px;
                }
                .mp-summary-row:last-child { margin-bottom: 0; }
                .mp-summary-discount { color: rgba(76,175,80,0.85); }
                .mp-summary-total-section {
                    padding: 18px 24px;
                    border-bottom: 1px solid rgba(212,167,106,0.06);
                }
                .mp-summary-total-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                }
                .mp-total-label {
                    font-size: 13px;
                    font-weight: 600;
                    color: rgba(232,220,200,0.6);
                    letter-spacing: 0.3px;
                }
                .mp-total-amount {
                    display: flex;
                    align-items: flex-start;
                    gap: 3px;
                }
                .mp-total-usd {
                    font-size: 13px;
                    font-weight: 600;
                    color: rgba(212,167,106,0.5);
                    padding-top: 5px;
                }
                .mp-total-price {
                    font-size: 32px;
                    font-weight: 900;
                    color: #D4A76A;
                    letter-spacing: -1px;
                    line-height: 1;
                }
                .mp-summary-per {
                    font-size: 11px;
                    color: rgba(212,167,106,0.3);
                    margin-top: 4px;
                    text-align: right;
                }
                .mp-summary-features-section {
                    padding: 18px 24px;
                }
                .mp-features-label {
                    font-size: 10.5px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                    color: rgba(212,167,106,0.4);
                    margin-bottom: 12px;
                }
                .mp-features-list {
                    list-style: none;
                    padding: 0; margin: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 9px;
                }
                .mp-features-list li {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 12.5px;
                    color: rgba(232,220,200,0.55);
                    font-weight: 400;
                    line-height: 1.3;
                }
                .mp-feature-check {
                    width: 18px;
                    height: 18px;
                    background: rgba(76,175,80,0.1);
                    border: 1px solid rgba(76,175,80,0.2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .mp-summary-footer {
                    padding: 14px 24px;
                    background: rgba(0,0,0,0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 7px;
                    font-size: 11px;
                    color: rgba(212,167,106,0.25);
                    font-weight: 500;
                }

                /* CARD PREVIEW STRIP */
                .mp-card-preview {
                    height: 3px;
                    background: rgba(212,167,106,0.06);
                    border-radius: 0 0 0 0;
                    position: relative;
                    overflow: hidden;
                    margin-bottom: 24px;
                }
                .mp-card-preview-fill {
                    position: absolute;
                    left: 0; top: 0; height: 100%;
                    background: linear-gradient(90deg, #A67C52, #D4A76A, #E8C88A);
                    border-radius: 2px;
                    transition: width 0.4s ease;
                }
            `}</style>

            {/* TOP BAR */}
            <div className="mp-topbar">
                <div className="mp-topbar-left">
                    <button className="mp-back-btn" onClick={() => navigate(-1)}>
                        <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
                            <path d="M8 14L2 8l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <div className="mp-logo">
                        <div className="mp-logo-icon">&#128218;</div>
                        <span className="mp-logo-text">BookHeaven</span>
                    </div>
                </div>
                <div className="mp-topbar-right">
                    <div className="mp-ssl-icon">
                        <svg width="8" height="10" viewBox="0 0 8 10" fill="none">
                            <rect x="1" y="4" width="6" height="6" rx="1" fill="none" stroke="rgba(76,175,80,0.7)" strokeWidth="1"/>
                            <path d="M2.5 4V2.5a1.5 1.5 0 0 1 3 0V4" stroke="rgba(76,175,80,0.7)" strokeWidth="1" fill="none"/>
                        </svg>
                    </div>
                    Pago seguro SSL 256-bit
                </div>
            </div>

            {step === 2 ? (
                <div className="mp-processing">
                    <div className="mp-processing-ring"></div>
                    <div className="mp-processing-title">Procesando tu pago</div>
                    <div className="mp-processing-sub">Estamos verificando tu información de forma segura. No cierres esta ventana.</div>
                    <div className="mp-processing-steps">
                        <div className="mp-processing-step">
                            <div className="mp-step-dot active"></div>
                            Verificando datos de la tarjeta...
                        </div>
                        <div className="mp-processing-step">
                            <div className="mp-step-dot"></div>
                            Procesando pago
                        </div>
                        <div className="mp-processing-step">
                            <div className="mp-step-dot"></div>
                            Activando suscripción Premium
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mp-main">

                    {/* LEFT: FORM */}
                    <div className="mp-form-panel">
                        <div className="mp-form-header">
                            <div className="mp-form-title">Información de pago</div>
                            <div className="mp-form-subtitle">Tus datos están protegidos con cifrado de extremo a extremo</div>
                        </div>

                        {/* Progress bar segun digitos ingresados */}
                        <div className="mp-card-preview">
                            <div className="mp-card-preview-fill" style={{ width: `${Math.min((cardDigits.length / 16) * 100, 100)}%` }}></div>
                        </div>

                        <div className="mp-form-body">
                            {/* Method tabs */}
                            <div className="mp-method-tabs">
                                <button
                                    type="button"
                                    className={`mp-method-tab ${paymentMethod === 'credit_card' ? 'mp-active' : ''}`}
                                    onClick={() => setPaymentMethod('credit_card')}
                                >
                                    <span className="mp-tab-icon">
                                        <svg viewBox="0 0 20 14" fill="none" width="20" height="14">
                                            <rect x="0.5" y="0.5" width="19" height="13" rx="1.5" stroke="currentColor" strokeOpacity="0.6"/>
                                            <path d="M0 4h20" stroke="currentColor" strokeOpacity="0.6"/>
                                            <rect x="2" y="7" width="4" height="2" rx="0.5" fill="currentColor" fillOpacity="0.4"/>
                                        </svg>
                                    </span>
                                    Tarjeta
                                </button>
                                <button
                                    type="button"
                                    className={`mp-method-tab ${paymentMethod === 'paypal' ? 'mp-active' : ''}`}
                                    onClick={() => setPaymentMethod('paypal')}
                                >
                                    <span className="mp-tab-icon">
                                        <svg viewBox="0 0 16 18" fill="none" width="14" height="16">
                                            <path d="M13 4.5C13 7.5 11 9 8 9H6L5 14H2L4.5 2H9C11.5 2 13 3 13 4.5Z" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1.2" fill="none"/>
                                        </svg>
                                    </span>
                                    PayPal
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                {errors.general && (
                                    <div className="mp-general-error">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{flexShrink:0,marginTop:1}}>
                                            <circle cx="8" cy="8" r="7" stroke="#e74c3c" strokeWidth="1.5"/>
                                            <path d="M8 5v4" stroke="#e74c3c" strokeWidth="1.5" strokeLinecap="round"/>
                                            <circle cx="8" cy="11.5" r="0.75" fill="#e74c3c"/>
                                        </svg>
                                        {errors.general}
                                    </div>
                                )}

                                {/* Numero de tarjeta */}
                                <div className="mp-field">
                                    <div className="mp-label">
                                        <span>Número de tarjeta</span>
                                        {cardType !== 'generic' && (
                                            <span style={{fontSize:10,color:'rgba(212,167,106,0.5)',fontWeight:500,textTransform:'none',letterSpacing:0}}>
                                                {cardType === 'visa' ? 'Visa detectada' : cardType === 'mastercard' ? 'Mastercard detectada' : 'Amex detectada'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="mp-input-wrap">
                                        <input
                                            type="text"
                                            className={`mp-input mp-input-hero ${errors.cardNumber ? 'err' : ''}`}
                                            placeholder="0000  0000  0000  0000"
                                            value={cardNumber}
                                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                            autoComplete="cc-number"
                                            inputMode="numeric"
                                            maxLength={19}
                                        />
                                        <div className="mp-brand-slot">
                                            {getCardBrandIcon(cardType)}
                                        </div>
                                    </div>
                                    {errors.cardNumber && (
                                        <div className="mp-field-error">
                                            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="5.5" r="5" stroke="#e74c3c" strokeWidth="1"/><path d="M5.5 3.5v3" stroke="#e74c3c" strokeWidth="1" strokeLinecap="round"/><circle cx="5.5" cy="8" r="0.5" fill="#e74c3c"/></svg>
                                            {errors.cardNumber}
                                        </div>
                                    )}
                                </div>

                                {/* Nombre en tarjeta */}
                                <div className="mp-field">
                                    <label className="mp-label">Nombre del titular</label>
                                    <input
                                        type="text"
                                        className={`mp-input mp-input-sm ${errors.cardHolder ? 'err' : ''}`}
                                        placeholder="Como aparece en la tarjeta"
                                        value={cardHolder}
                                        onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                                        autoComplete="cc-name"
                                    />
                                    {errors.cardHolder && (
                                        <div className="mp-field-error">
                                            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="5.5" r="5" stroke="#e74c3c" strokeWidth="1"/><path d="M5.5 3.5v3" stroke="#e74c3c" strokeWidth="1" strokeLinecap="round"/><circle cx="5.5" cy="8" r="0.5" fill="#e74c3c"/></svg>
                                            {errors.cardHolder}
                                        </div>
                                    )}
                                </div>

                                {/* Vencimiento + CVV */}
                                <div className="mp-row-2">
                                    <div className="mp-field">
                                        <label className="mp-label">Vencimiento</label>
                                        <input
                                            type="text"
                                            className={`mp-input mp-input-sm ${errors.expiry ? 'err' : ''}`}
                                            placeholder="MM / AA"
                                            value={expiry}
                                            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                                            autoComplete="cc-exp"
                                            inputMode="numeric"
                                            maxLength={5}
                                        />
                                        {errors.expiry && <div className="mp-field-error"><svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="5.5" r="5" stroke="#e74c3c" strokeWidth="1"/><path d="M5.5 3.5v3" stroke="#e74c3c" strokeWidth="1" strokeLinecap="round"/><circle cx="5.5" cy="8" r="0.5" fill="#e74c3c"/></svg>{errors.expiry}</div>}
                                    </div>
                                    <div className="mp-field">
                                        <label className="mp-label">CVV</label>
                                        <div className="mp-cvv-input-wrap">
                                            <input
                                                type="password"
                                                className={`mp-input mp-input-sm ${errors.cvv ? 'err' : ''}`}
                                                style={{ paddingRight: 44 }}
                                                placeholder="&#8226;&#8226;&#8226;"
                                                value={cvv}
                                                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                                autoComplete="cc-csc"
                                                inputMode="numeric"
                                                maxLength={4}
                                            />
                                            <div className="mp-cvv-hint-icon">?</div>
                                        </div>
                                        {errors.cvv && <div className="mp-field-error"><svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="5.5" r="5" stroke="#e74c3c" strokeWidth="1"/><path d="M5.5 3.5v3" stroke="#e74c3c" strokeWidth="1" strokeLinecap="round"/><circle cx="5.5" cy="8" r="0.5" fill="#e74c3c"/></svg>{errors.cvv}</div>}
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="mp-divider">
                                    <div className="mp-divider-line"></div>
                                    <span className="mp-divider-text">Cuotas disponibles</span>
                                    <div className="mp-divider-line"></div>
                                </div>

                                {/* Cuotas */}
                                <div className="mp-field">
                                    <label className="mp-label">
                                        <span>Plan de pago</span>
                                        <span style={{color:'rgba(76,175,80,0.6)',fontWeight:600,fontSize:10,textTransform:'none',letterSpacing:0}}>Sin interés</span>
                                    </label>
                                    <select className="mp-select" defaultValue="1" disabled={paymentMethod === 'paypal'}>
                                        <option value="1">1 pago de ${plan.price.toFixed(2)} USD &mdash; sin interés</option>
                                        <option value="3">3 cuotas de ${(plan.price / 3).toFixed(2)} USD &mdash; sin interés</option>
                                        <option value="6">6 cuotas de ${(plan.price / 6).toFixed(2)} USD &mdash; sin interés</option>
                                        <option value="12">12 cuotas de ${(plan.price / 12).toFixed(2)} USD &mdash; sin interés</option>
                                    </select>
                                </div>

                                {/* Pay button */}
                                <button type="submit" className="mp-pay-btn" disabled={loading} style={{ marginTop: 8 }}>
                                    {loading ? (
                                        <>
                                            <div className="mp-spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></div>
                                            Procesando pago...
                                        </>
                                    ) : (
                                        <>
                                            <svg width="17" height="20" viewBox="0 0 17 20" fill="none">
                                                <rect x="1" y="8" width="15" height="11" rx="2" fill="rgba(26,15,4,0.4)" stroke="rgba(26,15,4,0.5)" strokeWidth="1.2"/>
                                                <path d="M5 8V5.5a3.5 3.5 0 0 1 7 0V8" stroke="rgba(26,15,4,0.6)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                                                <circle cx="8.5" cy="13.5" r="1.5" fill="rgba(26,15,4,0.5)"/>
                                            </svg>
                                            Pagar
                                            <span className="mp-pay-amount">${plan.price.toFixed(2)}</span>
                                            USD
                                        </>
                                    )}
                                </button>

                                {/* Trust */}
                                <div className="mp-trust">
                                    <span className="mp-trust-item">
                                        <svg width="11" height="13" viewBox="0 0 11 13" fill="none"><rect x="0.5" y="5" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1"/><path d="M3 5V3a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1" fill="none"/></svg>
                                        SSL Cifrado
                                    </span>
                                    <div className="mp-trust-dot"></div>
                                    <span className="mp-trust-item">
                                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1L8 5h4L9 8l1 4-3.5-2.5L3 12l1-4-3-3h4z" stroke="currentColor" strokeWidth="1" fill="none"/></svg>
                                        PCI DSS
                                    </span>
                                    <div className="mp-trust-dot"></div>
                                    <span className="mp-trust-item">
                                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 7l3 3 6-6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        Cancela cuando quieras
                                    </span>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* RIGHT: SUMMARY */}
                    <div className="mp-summary">
                        <div className="mp-summary-top">
                            <div className="mp-summary-product-row">
                                <div className="mp-summary-icon-box">
                                    <img src={Heaven} alt="BookHeaven" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '12px', borderRadius: '50%' }} />
                                </div>
                                <div className="mp-summary-product-info">
                                    <div className="mp-summary-product-name">{plan.name}</div>
                                    <div className="mp-summary-product-sub">{plan.description}</div>
                                    {plan.badge && (
                                        <span style={{
                                            display: 'inline-block',
                                            marginTop: 5,
                                            padding: '2px 8px',
                                            background: 'rgba(212,167,106,0.12)',
                                            border: '1px solid rgba(212,167,106,0.2)',
                                            borderRadius: 20,
                                            fontSize: 10,
                                            fontWeight: 700,
                                            color: '#D4A76A',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                        }}>{plan.badge}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mp-summary-mid">
                            <div className="mp-summary-row">
                                <span>Precio de lista</span>
                                <span>${plan.price.toFixed(2)}</span>
                            </div>
                            <div className="mp-summary-row">
                                <span>Descuento</span>
                                <span className="mp-summary-discount">-$0.00</span>
                            </div>
                            <div className="mp-summary-row">
                                <span>Impuestos</span>
                                <span>Incluidos</span>
                            </div>
                        </div>

                        <div className="mp-summary-total-section">
                            <div className="mp-summary-total-row">
                                <span className="mp-total-label">Total a pagar</span>
                                <div className="mp-total-amount">
                                    <span className="mp-total-usd">USD</span>
                                    <span className="mp-total-price">${plan.price.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="mp-summary-per">
                                {plan.duration_months === 1 ? 'por mes' : plan.duration_months === 12 ? 'por año' : `por ${plan.duration_months} meses`}
                            </div>
                        </div>

                        <div className="mp-summary-features-section">
                            <div className="mp-features-label">Incluye</div>
                            <ul className="mp-features-list">
                                {plan.features.map((f, i) => (
                                    <li key={i}>
                                        <div className="mp-feature-check">
                                            <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                                                <path d="M1 3.5L3.5 6 8 1" stroke="rgba(76,175,80,0.8)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mp-summary-footer">
                            <svg width="11" height="13" viewBox="0 0 11 13" fill="none">
                                <rect x="0.5" y="5" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
                                <path d="M3 5V3a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5"/>
                            </svg>
                            Transacción 100% segura y cifrada
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}

export default PaymentCheckout;
