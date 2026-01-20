import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook personalizado para gerenciar síntese de voz (Text-to-Speech)
 * Utiliza a Web Speech API nativa do navegador
 */
export function useTextToSpeech() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [availableVoices, setAvailableVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [rate, setRate] = useState(1.0);
    const utteranceRef = useRef(null);
    const [currentWordIndex, setCurrentWordIndex] = useState(-1);

    useEffect(() => {
        const checkSupport = () => {
            const supported = 'speechSynthesis' in window;
            setIsSupported(supported);

            if (supported) {
                loadVoices();

                speechSynthesis.onvoiceschanged = loadVoices;
            }
        };

        checkSupport();
    }, []);

    const loadVoices = useCallback(() => {
        if ('speechSynthesis' in window) {
            const voices = speechSynthesis.getVoices();
            const portugueseVoices = voices.filter(voice => 
                voice.lang.includes('pt') || voice.lang.includes('PT')
            );

            const voicesToShow = portugueseVoices.length > 0 ? portugueseVoices : voices;
            setAvailableVoices(voicesToShow);

            // Define voz padrão apenas se ainda não houver uma selecionada
            setSelectedVoice(prevVoice => {
                if (!prevVoice && voicesToShow.length > 0) {
                    return voicesToShow[0];
                }
                return prevVoice;
            });
        }
    }, []);

    const speak = useCallback((text) => {
        if (!isSupported || !text) return;

        // Cancela qualquer síntese em andamento
        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        utterance.rate = rate;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        utterance.onstart = () => {
            setIsPlaying(true);
            setIsPaused(false);
        };

        utterance.onend = () => {
            setIsPlaying(false);
            setIsPaused(false);
            utteranceRef.current = null;
        };

        utterance.onerror = (event) => {
            console.error('Erro na síntese de voz:', event);
            setIsPlaying(false);
            setIsPaused(false);
            utteranceRef.current = null;
        };

        utteranceRef.current = utterance;
        speechSynthesis.speak(utterance);
    }, [isSupported, rate, selectedVoice]);

    const pause = useCallback(() => {
        if (speechSynthesis.speaking && !speechSynthesis.paused) {
            speechSynthesis.pause();
            setIsPaused(true);
        }
    }, []);

    const resume = useCallback(() => {
        if (speechSynthesis.paused) {
            speechSynthesis.resume();
            setIsPaused(false);
        }
    }, []);

    const stop = useCallback(() => {
        speechSynthesis.cancel();
        setIsPlaying(false);
        setIsPaused(false);
        utteranceRef.current = null;
    }, []);

    const updateRate = useCallback((newRate) => {
        setRate(newRate);
        
        if (isPlaying && utteranceRef.current) {
            utteranceRef.current.rate = newRate;
        }
    }, [isPlaying]);

    const updateVoice = useCallback((voice) => {
        setSelectedVoice(voice);
        
        if (isPlaying && utteranceRef.current) {
            utteranceRef.current.voice = voice;
        }
    }, [isPlaying]);

    useEffect(() => {
        return () => {
            // Limpa síntese ao desmontar componente
            if ('speechSynthesis' in window) {
                speechSynthesis.cancel();
            }
        };
    }, []);

    return {
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
        setRate: updateRate,
        setVoice: updateVoice,
    };
}
