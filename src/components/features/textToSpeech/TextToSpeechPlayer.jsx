import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, Volume2, ChevronDown, ChevronUp } from 'lucide-react';
import { useTextToSpeech } from '../../../hooks/useTextToSpeech';
import Button from '../../ui/Button';

/**
 * Componente player de Text-to-Speech
 * Permite reproduzir texto completo em áudio
 */
const TextToSpeechPlayer = ({ text, title, className = '' }) => {
    const {
        isSupported,
        isPlaying,
        isPaused,
        availableVoices,
        selectedVoice,
        rate,
        speak,
        pause,
        resume,
        stop,
        setRate,
        setVoice,
    } = useTextToSpeech();

    const [isExpanded, setIsExpanded] = useState(false);
    const [fullText, setFullText] = useState('');

    useEffect(() => {
        // Prepara texto completo incluindo título se fornecido
        let completeText = '';
        if (title) {
            completeText = `${title}. ${text}`;
        } else {
            completeText = text;
        }

        // Remove HTML tags for speech
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = completeText;
        setFullText(tempDiv.textContent || tempDiv.innerText || '');
    }, [text, title]);

    const handlePlay = () => {
        if (isPaused) {
            resume();
        } else {
            speak(fullText);
            setIsExpanded(true);
        }
    };

    const handlePause = () => {
        pause();
    };

    const handleStop = () => {
        stop();
    };

    if (!isSupported) {
        return (
            <div className={`bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm ${className}`}>
                Seu navegador não suporta leitura em áudio. Tente usar Chrome, Edge ou Safari.
            </div>
        );
    }

    if (!fullText || fullText.trim().length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-primary/5 border border-primary/20 rounded-lg overflow-hidden ${className}`}
        >
            {/* Header - Modo Compacto */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Volume2 size={20} className="text-primary" />
                    <span className="font-semibold text-secondary">Ouvir Artigo</span>
                </div>

                <div className="flex items-center gap-2">
                    {isPlaying || isPaused ? (
                        <>
                            <Button
                                onClick={isPaused ? handlePlay : handlePause}
                                variant="outline"
                                className="flex items-center gap-2 px-4 py-2 text-sm"
                            >
                                {isPaused ? (
                                    <>
                                        <Play size={16} />
                                        Continuar
                                    </>
                                ) : (
                                    <>
                                        <Pause size={16} />
                                        Pausar
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={handleStop}
                                variant="outline"
                                className="flex items-center gap-2 px-4 py-2 text-sm"
                            >
                                <Square size={16} />
                                Parar
                            </Button>
                        </>
                    ) : (
                        <Button
                            onClick={handlePlay}
                            variant="primary"
                            className="flex items-center gap-2 px-4 py-2 text-sm"
                        >
                            <Play size={16} />
                            Reproduzir
                        </Button>
                    )}

                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-2 hover:bg-primary/10 rounded transition-colors"
                        aria-label={isExpanded ? 'Recolher controles' : 'Expandir controles'}
                    >
                        {isExpanded ? (
                            <ChevronUp size={20} className="text-text-secondary" />
                        ) : (
                            <ChevronDown size={20} className="text-text-secondary" />
                        )}
                    </button>
                </div>
            </div>

            {/* Controles Avançados - Expandidos */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-primary/20 bg-white"
                    >
                        <div className="p-4 space-y-4">
                            {/* Controle de Velocidade */}
                            <div>
                                <label htmlFor="tts-rate" className="block text-sm font-medium text-secondary mb-2">
                                    Velocidade: {rate.toFixed(1)}x
                                </label>
                                <input
                                    id="tts-rate"
                                    type="range"
                                    min="0.5"
                                    max="2.0"
                                    step="0.1"
                                    value={rate}
                                    onChange={(e) => setRate(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <div className="flex justify-between text-xs text-text-secondary mt-1">
                                    <span>0.5x</span>
                                    <span>1.0x</span>
                                    <span>2.0x</span>
                                </div>
                            </div>

                            {/* Seletor de Voz */}
                            {availableVoices.length > 0 && (
                                <div>
                                    <label htmlFor="tts-voice" className="block text-sm font-medium text-secondary mb-2">
                                        Voz
                                    </label>
                                    <select
                                        id="tts-voice"
                                        value={selectedVoice?.name || ''}
                                        onChange={(e) => {
                                            const voice = availableVoices.find(
                                                v => v.name === e.target.value
                                            );
                                            if (voice) setVoice(voice);
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        disabled={isPlaying && !isPaused}
                                    >
                                        {availableVoices.map((voice) => (
                                            <option key={voice.name} value={voice.name}>
                                                {voice.name} ({voice.lang})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Indicador de Estado */}
                            {(isPlaying || isPaused) && (
                                <div className="pt-2 border-t border-gray-200">
                                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                                        <div
                                            className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
                                                }`}
                                        />
                                        <span>
                                            {isPlaying ? 'Reproduzindo...' : 'Pausado'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default TextToSpeechPlayer;
