import React, { useState, useEffect, useRef } from 'react';
import { Send, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { validateComment } from '../../../lib/validators';

const CommentForm = ({ onSubmit, onCancel, initialText = '', submitLabel = 'Comentar' }) => {
    const [content, setContent] = useState(initialText);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const textareaRef = useRef(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [content]);

    useEffect(() => {
        if (initialText) {
            setContent(initialText);
        }
    }, [initialText]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validation = validateComment(content);
        if (!validation.valid) {
            setError(validation.errors[0]);
            return;
        }

        setLoading(true);
        setError('');

        try {
            await onSubmit(content);
            setContent('');
            setError('');
        } catch (err) {
            setError(err.message || 'Erro ao enviar comentário. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const remainingChars = 500 - content.length;
    const isNearLimit = remainingChars < 50;

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => {
                        setContent(e.target.value);
                        setError('');
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Deixe um comentário gentil… (Ctrl+Enter para enviar)"
                    className={`
                        w-full px-4 py-3 pr-20 rounded-lg border
                        focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                        resize-none min-h-[100px] max-h-[200px]
                        ${error ? 'border-primary' : 'border-borda'}
                        ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    disabled={loading}
                    maxLength={500}
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <span className={`text-xs ${isNearLimit ? 'text-primary' : 'text-text-secondary'}`}>
                        {remainingChars}
                    </span>
                </div>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-primary bg-pessego/30 border border-primary/30 rounded-lg px-3 py-2"
                >
                    {error}
                </motion.div>
            )}

            <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-text-secondary">
                    {content.length < 3 && (
                        <span>Mínimo de 3 caracteres</span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
                        >
                            <X size={16} className="inline mr-1" />
                            Cancelar
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={loading || content.trim().length < 3}
                        className={`
                            px-6 py-2 rounded-lg text-sm font-medium
                            flex items-center gap-2
                            transition-all duration-200
                            ${loading || content.trim().length < 3
                                ? 'bg-areia text-text-secondary cursor-not-allowed'
                                : 'bg-primary text-background hover:bg-primary-dark'
                            }
                        `}
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background"></div>
                                Enviando...
                            </>
                        ) : (
                            <>
                                <Send size={16} />
                                {submitLabel}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default CommentForm;
