import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, Volume2, ChevronDown, ChevronUp } from 'lucide-react';
import { useTextToSpeech } from '../../../hooks/useTextToSpeech';
import { stripHtml } from '../../../lib/sanitize';

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
        const completeText = title ? `${title}. ${text}` : text;
        setFullText(stripHtml(completeText));
    }, [text, title]);

    const handlePlay = () => {
        if (isPaused) {
            resume();
        } else {
            speak(fullText);
            setIsExpanded(true);
        }
    };

    const handlePause = () => pause();

    const handleStop = () => stop();

    if (!isSupported) {
        return (
            <div className={`bg-[#F1E7D6] border border-[#E7D9C0] text-text-secondary px-4 py-3 rounded-xl text-sm ${className}`}>
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
            className={`bg-[#F1E7D6] border border-[#E7D9C0] rounded-xl ${className}`}
        >
            <div className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        onClick={isPlaying || isPaused ? (isPaused ? handlePlay : handlePause) : handlePlay}
                        className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-background flex items-center justify-center hover:bg-primary-dark transition-colors shadow-md"
                        aria-label={isPlaying ? 'Pausar' : isPaused ? 'Continuar' : 'Reproduzir'}
                    >
                        {isPlaying ? (
                            <Pause size={20} fill="currentColor" />
                        ) : (
                            <Play size={20} fill="currentColor" className="ml-0.5" />
                        )}
                    </button>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-secondary truncate">
                            {isPlaying ? 'Reproduzindo...' : isPaused ? 'Pausado' : 'Ouvir artigo'}
                        </p>
                        <p className="text-xs text-text-secondary">
                            {isPlaying || isPaused ? `${rate.toFixed(1)}x` : 'Leitura em áudio'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {(isPlaying || isPaused) && (
                        <button
                            onClick={handleStop}
                            className="p-2 text-text-secondary hover:text-primary transition-colors"
                            aria-label="Parar"
                        >
                            <Square size={18} />
                        </button>
                    )}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-2 text-text-secondary hover:text-primary transition-colors rounded-lg hover:bg-[#E7D9C0]"
                        aria-label={isExpanded ? 'Recolher controles' : 'Expandir controles'}
                    >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-[#E7D9C0]"
                    >
                        <div className="p-4 space-y-4">
                            <div>
                                <label htmlFor="tts-rate" className="block text-sm font-semibold text-secondary mb-2">
                                    Velocidade: {rate.toFixed(1)}x
                                </label>
                                <div className="relative">
                                    <input
                                        id="tts-rate"
                                        type="range"
                                        min="0.5"
                                        max="2.0"
                                        step="0.1"
                                        value={rate}
                                        onChange={(e) => setRate(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-[#E1D2B8] rounded-full appearance-none cursor-pointer accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow"
                                    />
                                    <div className="flex justify-between text-xs text-text-secondary mt-1">
                                        <span>0.5x</span>
                                        <span>1.0x</span>
                                        <span>2.0x</span>
                                    </div>
                                </div>
                            </div>

                            {availableVoices.length > 0 && (
                                <div>
                                    <label htmlFor="tts-voice" className="block text-sm font-semibold text-secondary mb-2">
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
                                        className="w-full px-3 py-2 bg-white border border-[#E7D9C0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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

                            {(isPlaying || isPaused) && (
                                <div className="pt-2 border-t border-[#E7D9C0]">
                                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                                        <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-primary animate-pulse' : 'bg-[#C79A3E]'}`} />
                                        <span>{isPlaying ? 'Reproduzindo...' : 'Pausado'}</span>
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
