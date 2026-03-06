// src/components/payment/PricingPlans.jsx
import React, { useState, useEffect } from 'react';
import { paymentAPI } from '../../api/payment';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const PricingPlans = ({ onOpenLogin }) => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [_selectedPlan, _setSelectedPlan] = useState(null);
    const { user, isPremium } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const response = await paymentAPI.getPricingPlans();
            setPlans(response.data.plans);
        } catch (error) {
            console.error('Error fetching plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPlan = (plan) => {
        if (!user) {
            if (onOpenLogin) {
                onOpenLogin();
            } else {
                navigate('/', { state: { openLogin: true } });
            }
            return;
        }

        if (plan.id === 'standard') {
            alert('Ya tienes el plan estándar');
            return;
        }

        if (isPremium()) {
            alert('Ya eres miembro Premium. Para renovar, espera a que expire tu suscripción.');
            return;
        }

        _setSelectedPlan(plan);
        // Navegar al checkout con el plan seleccionado
        navigate(`/payment/checkout?plan=${plan.id}`, {
            state: { planId: plan.id },
        });
    };

    if (loading) {
        return <div className="text-center py-12">Cargando planes...</div>;
    }

    return (
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6 py-12">
            {plans.map((plan) => (
                <div
                    key={plan.id}
                    className={`rounded-lg p-6 ${
                        plan.id === 'premium_1year'
                            ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 ring-2 ring-yellow-300'
                            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                    }`}
                >
                    {plan.id === 'premium_1year' && (
                        <div className="text-center mb-4">
                            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                MEJOR VALOR
                            </span>
                        </div>
                    )}

                    <h3 className={`text-xl font-bold mb-2 ${plan.id === 'premium_1year' ? 'text-white' : ''}`}>
                        {plan.name}
                    </h3>

                    <div className={`text-3xl font-bold mb-4 ${plan.id === 'premium_1year' ? 'text-white' : ''}`}>
                        ${plan.price}
                        {plan.duration_months && <span className="text-sm">/mes</span>}
                    </div>

                    <p className={`text-sm mb-4 ${plan.id === 'premium_1year' ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                        {plan.description}
                    </p>

                    <ul className={`space-y-2 mb-6 text-sm ${plan.id === 'premium_1year' ? 'text-white' : ''}`}>
                        {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                                <span className="text-green-500">✓</span>
                                {feature}
                            </li>
                        ))}
                    </ul>

                    <button
                        onClick={() => handleSelectPlan(plan)}
                        disabled={plan.id === 'standard' || (isPremium() && plan.id !== 'standard')}
                        className={`w-full py-2 rounded font-bold transition-colors ${
                            plan.id === 'standard'
                                ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
                                : plan.id === 'premium_1year'
                                ? 'bg-white text-yellow-600 hover:bg-gray-100'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                        {plan.id === 'standard'
                            ? 'Plan actual'
                            : isPremium()
                            ? 'Ya eres Premium ✓'
                            : '⭐ Suscribirse'}
                    </button>
                </div>
            ))}
        </div>
    );
};
