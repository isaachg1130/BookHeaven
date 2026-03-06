
import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
        <div style={{
            background: 'rgba(18,18,18,0.95)',
            border: '1px solid #3a3530',
            borderRadius: '8px',
            padding: '10px 14px',
        }}>
            <p style={{ color: '#D4A76A', margin: 0, fontWeight: 'bold', fontSize: '0.85rem' }}>{label}</p>
            <p style={{ color: '#fff', margin: '4px 0 0', fontSize: '1rem', fontWeight: 'bold' }}>
                {payload[0].value} <span style={{ color: '#aaa', fontSize: '0.75rem', fontWeight: 'normal' }}>usuarios</span>
            </p>
        </div>
    );
};

const AdminChart = ({ title, data = [], color = '#D4A76A' }) => {
    const hasData = data.length > 0 && data.some(d => d.count > 0);

    return (
        <div style={{
            background: '#1f1f1f',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            height: '300px',
            display: 'flex',
            flexDirection: 'column',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#eee', fontSize: '1.05rem', fontWeight: 'bold' }}>{title}</h3>
                {hasData && (
                    <span style={{ fontSize: '0.75rem', color: '#666', background: '#2a2a2a', padding: '3px 8px', borderRadius: '20px' }}>
                        🔄 En tiempo real
                    </span>
                )}
            </div>

            {!hasData ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '2rem' }}>📈</span>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Sin registros de nuevos usuarios</p>
                </div>
            ) : (
                <div style={{ flex: 1 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                            <XAxis
                                dataKey="month_es"
                                tick={{ fill: '#666', fontSize: 12 }}
                                axisLine={{ stroke: '#333' }}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fill: '#666', fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '4 4' }} />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke={color}
                                strokeWidth={2.5}
                                fill="url(#colorUsers)"
                                dot={{ fill: color, r: 3, strokeWidth: 0 }}
                                activeDot={{ fill: color, r: 5, strokeWidth: 2, stroke: '#1f1f1f' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

export default AdminChart;
