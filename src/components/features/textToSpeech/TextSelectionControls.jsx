import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, X } from 'lucide-react';
import { useTextToSpeech } from '../../../hooks/useTextToSpeech';

/**
 * Componente que aparece quando o usuário seleciona um trecho de texto
 * Permite ouvir apenas o trecho selecionado com controles de play/pause/stop
 */
const TextSelectionControls = ({ onClose }) => {
    const [selectedText, setSelectedText] = useState('');
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const { isSupported, speak, pause, resume, stop, isPlaying, isPaused } = useTextToSpeech();
    const containerRef = useRef(null);

    useEffect(() => {
        const handleSelection = () => {
            const selection = window.getSelection();
            const text = selection.toString().trim();

            if (text.length > 0) {
                // Obter posição da seleção
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();

                setSelectedText(text);
                setPosition({
                    x: rect.left + rect.width / 2,
                    y: rect.top - 10,
                });
            } else {
                setSelectedText('');
            }
        };

        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                const selection = window.getSelection();
                if (selection.toString().trim().length === 0) {
                    setSelectedText('');
                    if (onClose) onClose();
                }
            }
        };

        document.addEventListener('mouseup', handleSelection);
        document.addEventListener('keyup', handleSelection);
        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('mouseup', handleSelection);
            document.removeEventListener('keyup', handleSelection);
            document.removeEventListener('click', handleClickOutside);
        };
    }, [onClose]);

    const handlePlayPause = () => {
        if (selectedText && isSupported) {
            if (isPaused) {
                resume();
            } else if (isPlaying) {
                pause();
            } else {
                stop(); // Para qualquer reprodução em andamento
                speak(selectedText);
            }
        }
    };

    const handleStop = () => {
        stop();
    };

    const handleClose = () => {
        window.getSelection().removeAllRanges();
        setSelectedText('');
        if (onClose) onClose();
    };

    if (!isSupported || !selectedText || selectedText.length < 3) {
        return null;
    }

    // Calcular posição do tooltip (centrado acima da seleção)
    const tooltipStyle = {
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%)',
    };

    return (
        <AnimatePresence>
            {selectedText && (
                <motion.div
                    ref={containerRef}
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="fixed z-50 pointer-events-none"
                    style={tooltipStyle}
                >
                    <div className="bg-primary text-white rounded-lg shadow-xl px-2 py-1.5 flex items-center gap-1.5 pointer-events-auto">
                        {/* Botão Play/Pause */}
                        <button
                            onClick={handlePlayPause}
                            className="p-1.5 rounded-md bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
                            title={isPaused ? 'Continuar' : isPlaying ? 'Pausar' : 'Ouvir trecho'}
                            aria-label={isPaused ? 'Continuar' : isPlaying ? 'Pausar' : 'Ouvir trecho'}
                        >
                            {isPaused || !isPlaying ? (
                                <Play size={14} fill="currentColor" />
                            ) : (
                                <Pause size={14} fill="currentColor" />
                            )}
                        </button>

                        {/* Botão Stop - aparece quando está reproduzindo */}
                        {(isPlaying || isPaused) && (
                            <button
                                onClick={handleStop}
                                className="p-1.5 rounded-md bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
                                title="Parar"
                                aria-label="Parar reprodução"
                            >
                                <Square size={12} fill="currentColor" />
                            </button>
                        )}

                        {/* Separador visual quando há controles */}
                        {(isPlaying || isPaused) && (
                            <div className="w-px h-4 bg-white/30 mx-0.5"></div>
                        )}

                        {/* Botão Fechar */}
                        <button
                            onClick={handleClose}
                            className="p-1.5 rounded-md hover:bg-white/20 transition-colors flex items-center justify-center"
                            title="Fechar"
                            aria-label="Fechar controles de seleção"
                        >
                            <X size={14} />
                        </button>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary"></div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TextSelectionControls;
