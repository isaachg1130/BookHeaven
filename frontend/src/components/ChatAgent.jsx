import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import logo from '../assets/logo.png';
import '../styles/ChatAgent.css';

const WEBHOOK_URL = 'https://kristofergod.app.n8n.cloud/webhook/ecd0a278-63d9-49f7-a01f-e7cb2b191ee2/chat';

const ChatAgent = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [sessionId] = useState(() => {
        try {
            return crypto.randomUUID();
        } catch (e) {
            return Math.random().toString(36).substring(2) + Date.now().toString(36);
        }
    });
    const [messages, setMessages] = useState([
        { role: 'agent', content: '¡Hola! Soy tu asistente de BookHeaven. ¿En qué puedo ayudarte hoy?' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            // n8n Chat Trigger typically expects 'chatInput', 'action' and 'sessionId'
            const response = await axios.post(WEBHOOK_URL, {
                action: 'sendMessage',
                sessionId: sessionId,
                chatInput: userMessage
            });

            // Handle response - n8n usually returns the response in a field or as base object
            let agentResponse = '';
            if (response.data.output) {
                agentResponse = response.data.output;
            } else if (Array.isArray(response.data) && response.data[0]?.output) {
                agentResponse = response.data[0].output;
            } else if (response.data.text) {
                agentResponse = response.data.text;
            } else if (response.data.response) {
                agentResponse = response.data.response;
            } else {
                agentResponse = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
                // If it's empty or [object Object], use a fallback
                if (agentResponse === '[object Object]' || !agentResponse) {
                    agentResponse = 'Recibí tu mensaje, pero no pude procesar la respuesta correctamente.';
                }
            }

            setMessages(prev => [...prev, { role: 'agent', content: agentResponse }]);
        } catch (error) {
            console.error('Error contacting AI agent:', error);
            setMessages(prev => [...prev, { role: 'agent', content: 'Lo siento, hubo un error al conectar con el asistente. Por favor, intenta de nuevo.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chat-agent-container">
            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <div className="header-title">
                            <img src={logo} alt="Logo" className="header-logo" />
                            <h3>Asistente de BookHeaven</h3>
                        </div>
                        <button className="close-chat" onClick={() => setIsOpen(false)}>×</button>
                    </div>

                    <div className="chat-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message-wrapper ${msg.role}`}>
                                {msg.role === 'agent' && (
                                    <div className="agent-avatar">
                                        <img src={logo} alt="Agent" />
                                    </div>
                                )}
                                <div className={`message ${msg.role}`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message-wrapper agent">
                                <div className="agent-avatar">
                                    <img src={logo} alt="Agent" />
                                </div>
                                <div className="typing-indicator">
                                    El asistente está escribiendo...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="message-input-area" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            placeholder="Escribe un mensaje..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                        />
                        <button type="submit" className="send-button" disabled={isLoading || !input.trim()}>
                            Enviar
                        </button>
                    </form>
                </div>
            )}

            <button className="chat-agent-button" onClick={() => setIsOpen(!isOpen)} aria-label="Abrir asistente">
                <img src={logo} alt="Abrir asistente" className="chat-btn-logo" />
            </button>

        </div>
    );
};

export default ChatAgent;
