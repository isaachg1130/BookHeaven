// src/components/payment/PaymentSuccess.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { generateInvoice, printInvoice } from '../../utils/invoiceGenerator';

function PaymentSuccess() {
    const navigate = useNavigate();
    const location = useLocation();
    const { refreshUser, user } = useAuth();
    const [countdown, setCountdown] = useState(8);
    const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);

    const { plan, payment, premiumExpiresAt } = location.state || {};

    // Refrescar datos del usuario para que isPremium() funcione
    useEffect(() => {
        if (refreshUser) {
            refreshUser();
        }
    }, [refreshUser]);

    // Countdown para redirigir automáticamente
    useEffect(() => {
        if (countdown <= 0) {
            navigate('/biblioteca');
            return;
        }
        const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown, navigate]);

    const expiresDate = premiumExpiresAt
        ? new Date(premiumExpiresAt).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
          })
        : null;

    // Manejar descarga de factura
    const handleDownloadInvoice = async () => {
        if (!plan || !user) return;
        
        setIsGeneratingInvoice(true);
        try {
            await generateInvoice({
                user,
                plan,
                payment,
                premiumExpiresAt,
                transactionDate: new Date(),
            });
        } catch (error) {
            console.error('Error generando factura:', error);
        } finally {
            setIsGeneratingInvoice(false);
        }
    };

    // Manejar impresión de factura
    const handlePrintInvoice = () => {
        if (!plan || !user) return;
        
        printInvoice({
            user,
            plan,
            payment,
            premiumExpiresAt,
            transactionDate: new Date(),
        });
    };

    return (
        <div className="success-page">
            <style>{`
                .success-page {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #141414 0%, #1E1914 60%, #2C2018 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 20px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }
                .success-card {
                    background: rgba(40,30,20,0.7);
                    border: 1px solid rgba(212,167,106,0.25);
                    border-radius: 24px;
                    padding: 48px 40px;
                    max-width: 520px;
                    width: 100%;
                    text-align: center;
                    backdrop-filter: blur(16px);
                    box-shadow: 0 32px 64px rgba(0,0,0,0.5);
                    animation: slideUp 0.5s ease-out;
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .success-icon {
                    width: 96px;
                    height: 96px;
                    background: linear-gradient(135deg, #D4A76A, #A67C52);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 44px;
                    margin: 0 auto 24px;
                    box-shadow: 0 0 40px rgba(212,167,106,0.3);
                    animation: pulse 2.5s infinite;
                }
                @keyframes pulse {
                    0%, 100% { box-shadow: 0 0 40px rgba(212,167,106,0.25); }
                    50% { box-shadow: 0 0 60px rgba(212,167,106,0.5); }
                }
                .success-title {
                    font-size: 26px;
                    font-weight: 800;
                    color: #FFFBF5;
                    margin-bottom: 8px;
                }
                .success-subtitle {
                    color: rgba(232,220,200,0.6);
                    font-size: 14px;
                    margin-bottom: 32px;
                }
                .success-plan-box {
                    background: rgba(212,167,106,0.08);
                    border: 1px solid rgba(212,167,106,0.25);
                    border-radius: 14px;
                    padding: 20px 24px;
                    margin-bottom: 24px;
                }
                .success-plan-name {
                    font-size: 16px;
                    font-weight: 700;
                    color: #D4A76A;
                    margin-bottom: 6px;
                }
                .success-plan-price {
                    font-size: 34px;
                    font-weight: 800;
                    color: #FFFBF5;
                    margin-bottom: 4px;
                }
                .success-plan-expiry {
                    color: rgba(232,220,200,0.5);
                    font-size: 12px;
                }
                .success-divider {
                    height: 1px;
                    background: rgba(212,167,106,0.1);
                    margin: 24px 0;
                }
                .success-features {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    margin-bottom: 32px;
                    text-align: left;
                }
                .success-feature {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 13px;
                    color: #E8DCC8;
                }
                .feature-check {
                    width: 22px;
                    height: 22px;
                    background: linear-gradient(135deg, #D4A76A, #A67C52);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 11px;
                    color: #1E1914;
                    font-weight: 800;
                    flex-shrink: 0;
                }
                .success-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .btn-primary {
                    padding: 14px;
                    background: linear-gradient(135deg, #D4A76A, #A67C52);
                    border: none;
                    border-radius: 12px;
                    font-size: 15px;
                    font-weight: 700;
                    color: #1E1914;
                    cursor: pointer;
                    transition: all 0.25s;
                    width: 100%;
                    letter-spacing: 0.3px;
                }
                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(212,167,106,0.35);
                    filter: brightness(1.08);
                }
                .btn-secondary {
                    padding: 12px;
                    background: rgba(212,167,106,0.07);
                    border: 1px solid rgba(212,167,106,0.2);
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 500;
                    color: rgba(232,220,200,0.55);
                    cursor: pointer;
                    transition: all 0.25s;
                    width: 100%;
                }
                .btn-secondary:hover {
                    border-color: rgba(212,167,106,0.4);
                    color: #E8DCC8;
                }
                .btn-invoice {
                    padding: 14px;
                    background: rgba(212,167,106,0.12);
                    border: 1px solid rgba(212,167,106,0.35);
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 600;
                    color: #D4A76A;
                    cursor: pointer;
                    transition: all 0.25s;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }
                .btn-invoice:hover {
                    background: rgba(212,167,106,0.18);
                    border-color: rgba(212,167,106,0.5);
                    transform: translateY(-1px);
                }
                .btn-invoice:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .invoice-buttons {
                    display: flex;
                    gap: 8px;
                    width: 100%;
                }
                .invoice-buttons button {
                    flex: 1;
                }
                .countdown-bar-container {
                    background: rgba(212,167,106,0.1);
                    border-radius: 4px;
                    height: 4px;
                    overflow: hidden;
                    margin-top: 20px;
                }
                .countdown-bar {
                    height: 4px;
                    background: linear-gradient(90deg, #D4A76A, #A67C52);
                    border-radius: 4px;
                    transition: width 1s linear;
                }
                .countdown-text {
                    color: rgba(212,167,106,0.4);
                    font-size: 11px;
                    margin-top: 8px;
                }
                .transaction-id {
                    color: rgba(212,167,106,0.3);
                    font-size: 10px;
                    font-family: monospace;
                    margin-top: 16px;
                }
            `}</style>

            <div className="success-card">
                <div className="success-icon">✓</div>

                <h1 className="success-title">¡Pago Exitoso!</h1>
                <p className="success-subtitle">
                    ¡Bienvenido al mundo premium de BookHeaven! Tu suscripción está activa.
                </p>

                {plan && (
                    <div className="success-plan-box">
                        <div className="success-plan-name">✦ {plan.name}</div>
                        <div className="success-plan-price">${plan.price?.toFixed(2)} USD</div>
                        {expiresDate && (
                            <div className="success-plan-expiry">
                                Válido hasta: {expiresDate}
                            </div>
                        )}
                    </div>
                )}

                <div className="success-features">
                    <div className="success-feature">
                        <span className="feature-check">✓</span>
                        Acceso ilimitado a todos los libros premium
                    </div>
                    <div className="success-feature">
                        <span className="feature-check">✓</span>
                        Audiolibros y mangas exclusivos
                    </div>
                    <div className="success-feature">
                        <span className="feature-check">✓</span>
                        Sin anuncios en toda la plataforma
                    </div>
                    <div className="success-feature">
                        <span className="feature-check">✓</span>
                        Descargas offline disponibles
                    </div>
                </div>

                <div className="success-divider" />

                <div className="success-actions">
                    <div className="invoice-buttons">
                        <button 
                            className="btn-invoice" 
                            onClick={handleDownloadInvoice}
                            disabled={isGeneratingInvoice}
                        >
                            {isGeneratingInvoice ? '⏳ Generando...' : '📄 Descargar Factura'}
                        </button>
                        <button 
                            className="btn-invoice" 
                            onClick={handlePrintInvoice}
                        >
                            🖨️ Imprimir
                        </button>
                    </div>
                    
                    <button className="btn-primary" onClick={() => navigate('/biblioteca')}>
                        📚 Explorar Biblioteca Premium
                    </button>
                    <button className="btn-secondary" onClick={() => navigate('/')}>
                        🏠 Ir al Inicio
                    </button>
                </div>

                <div className="countdown-bar-container">
                    <div
                        className="countdown-bar"
                        style={{ width: `${(countdown / 8) * 100}%` }}
                    />
                </div>
                <div className="countdown-text">
                    Redirigiendo a la biblioteca en {countdown}s...
                </div>

                {payment?.transaction_id && (
                    <div className="transaction-id">
                        ID de transacción: {payment.transaction_id}
                    </div>
                )}
            </div>
        </div>
    );
}

export default PaymentSuccess;
