
import React from 'react';

const StatCard = ({ title, value, icon, trend, color = '#D4A76A' }) => {
    return (
        <div style={{
            background: '#1f1f1f',
            borderRadius: '8px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            borderLeft: `4px solid ${color}`
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#aaa', fontSize: '0.9rem' }}>{title}</span>
                <span style={{ fontSize: '1.5rem' }}>{icon}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#fff' }}>{value}</h3>
                {trend && (
                    <span style={{
                        color: trend > 0 ? '#D4A76A' : '#A67C52',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                    }}>
                        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                    </span>
                )}
            </div>
        </div>
    );
};

export default StatCard;
