import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatAPI } from '../services/api';

export const AIDoctor = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([
        { role: 'ai', text: `Hello ${user?.name || 'Farmer'}! I am KrishiDrishti AI Crop Doctor. How can I help you today with your farming?` }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            // Create context block with last few messages
            const history = messages.slice(-5).map(m => `${m.role === 'ai' ? 'Crop Doctor' : 'Farmer'}: ${m.text}`).join('\n');
            const questionWithContext = `Previous conversation context:\n${history}\n\nFarmer's current question: ${input}`;

            const res = await chatAPI.ask({
                question: questionWithContext,
                language: 'mr' // Hardcoding Marathi preference for now or from user preferences
            });

            setMessages(prev => [...prev, { role: 'ai', text: res.data.answer }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I am facing some technical issues right now. Please try again later.' }]);
        } finally {
            setLoading(false);
        }
    };

    // Convert rich text from AI with basic markdown support (bolding and line breaks)
    const formatText = (text) => {
        const formatted = text
            .split('\n')
            .map((line, i) => (
                <span key={i}>
                    {line.split('**').map((part, j) => j % 2 === 1 ? <b key={j}>{part}</b> : part)}
                    <br />
                </span>
            ));
        return formatted;
    };

    return (
        <div className="fade-in" id="ai-doctor-page" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
            <div className="km-page-header d-flex justify-content-between align-items-start">
                <div>
                    <div className="km-breadcrumb">🏠 Home <i className="fas fa-chevron-right" style={{ fontSize: 8 }}></i> <span>AI Crop Doctor</span></div>
                    <h1><i className="fas fa-robot me-2 icon-spin-in" style={{ color: 'var(--green-primary)' }}></i>AI Crop Doctor</h1>
                    <p className="marathi">कृषी डॉक्टर — स्मार्ट चॅटबॉट</p>
                </div>
            </div>

            <div className="km-card flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden', padding: 0 }}>
                {/* Chat Messages Area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', background: '#f8faf9' }}>
                    {messages.map((msg, idx) => (
                        <div key={idx} style={{
                            display: 'flex',
                            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            marginBottom: '1rem'
                        }}>
                            <div style={{
                                maxWidth: '75%',
                                padding: '1rem 1.25rem',
                                borderRadius: '1rem',
                                backgroundColor: msg.role === 'user' ? 'var(--green-primary)' : 'var(--white)',
                                color: msg.role === 'user' ? 'white' : 'var(--text-dark)',
                                boxShadow: 'var(--shadow-sm)',
                                border: msg.role === 'ai' ? '1px solid var(--border)' : 'none',
                                borderBottomRightRadius: msg.role === 'user' ? '0.25rem' : '1rem',
                                borderBottomLeftRadius: msg.role === 'ai' ? '0.25rem' : '1rem'
                            }}>
                                {msg.role === 'ai' && (
                                    <div style={{ fontSize: '0.8rem', color: 'var(--green-primary)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                        <i className="fas fa-robot me-1"></i> KrishiDrishti AI
                                    </div>
                                )}
                                <div>{formatText(msg.text)}</div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem' }}>
                            <div style={{
                                padding: '1rem 1.25rem', borderRadius: '1rem', backgroundColor: 'var(--white)',
                                boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', borderBottomLeftRadius: '0.25rem'
                            }}>
                                <div className="km-spinner" style={{ width: '20px', height: '20px', borderWidth: '3px' }}></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Chat Input Area */}
                <div style={{ padding: '1rem 1.5rem', background: 'var(--white)', borderTop: '1px solid var(--border)' }}>
                    <form onSubmit={handleSend} style={{ display: 'flex', gap: '1rem' }}>
                        <input
                            type="text"
                            className="km-input flex-grow-1"
                            style={{ marginBottom: 0, borderRadius: '2rem', padding: '0.75rem 1.5rem' }}
                            placeholder="तुमचा प्रश्न विचारा... (e.g., माझ्या कांद्याला पिवळी पाने आली, काय करू?)"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            className="btn-km-primary"
                            style={{ borderRadius: '2rem', padding: '0 1.5rem', display: 'flex', alignItems: 'center' }}
                            disabled={loading || !input.trim()}
                        >
                            <i className="fas fa-paper-plane"></i>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
