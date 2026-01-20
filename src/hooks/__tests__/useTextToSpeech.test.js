import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTextToSpeech } from '../useTextToSpeech';

describe('useTextToSpeech', () => {
    let mockSpeechSynthesis;
    let mockUtterance;
    let mockVoices;

    beforeEach(() => {
        mockVoices = [
            { name: 'Voz PT-BR 1', lang: 'pt-BR', default: true },
            { name: 'Voz PT-BR 2', lang: 'pt-BR', default: false },
            { name: 'Voice EN', lang: 'en-US', default: false },
        ];

        mockUtterance = {
            text: '',
            lang: '',
            rate: 1,
            pitch: 1,
            volume: 1,
            voice: null,
            onstart: null,
            onend: null,
            onerror: null,
        };

        mockSpeechSynthesis = {
            speak: vi.fn(),
            cancel: vi.fn(),
            pause: vi.fn(),
            resume: vi.fn(),
            getVoices: vi.fn(() => mockVoices),
            speaking: false,
            paused: false,
            onvoiceschanged: null,
        };

        global.SpeechSynthesisUtterance = vi.fn((text) => {
            mockUtterance.text = text;
            return mockUtterance;
        });

        Object.defineProperty(window, 'speechSynthesis', {
            writable: true,
            value: mockSpeechSynthesis,
            configurable: true,
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
        mockSpeechSynthesis.cancel();
    });

    it('deve inicializar com valores padrão quando suportado', () => {
        const { result } = renderHook(() => useTextToSpeech());

        expect(result.current.isSupported).toBe(true);
        expect(result.current.isPlaying).toBe(false);
        expect(result.current.isPaused).toBe(false);
        expect(result.current.rate).toBe(1.0);
        expect(result.current.availableVoices.length).toBeGreaterThan(0);
    });

    it('deve detectar quando navegador não suporta', () => {
        delete window.speechSynthesis;

        const { result } = renderHook(() => useTextToSpeech());

        expect(result.current.isSupported).toBe(false);
    });

    it('deve carregar vozes em português preferencialmente', () => {
        const { result } = renderHook(() => useTextToSpeech());

        expect(result.current.availableVoices.length).toBe(2); // Apenas vozes PT-BR
        expect(result.current.availableVoices.every(v => v.lang.includes('pt') || v.lang.includes('PT'))).toBe(true);
    });

    it('deve usar todas as vozes se não houver vozes em português', () => {
        mockSpeechSynthesis.getVoices = vi.fn(() => [
            { name: 'Voice EN', lang: 'en-US', default: false },
            { name: 'Voice FR', lang: 'fr-FR', default: false },
        ]);

        const { result } = renderHook(() => useTextToSpeech());

        expect(result.current.availableVoices.length).toBe(2);
    });

    it('deve selecionar primeira voz em português por padrão', () => {
        const { result } = renderHook(() => useTextToSpeech());

        expect(result.current.selectedVoice).toEqual(mockVoices[0]);
    });

    it('deve iniciar reprodução quando speak é chamado', async () => {
        const { result } = renderHook(() => useTextToSpeech());
        const testText = 'Texto de teste';

        act(() => {
            result.current.speak(testText);
        });

        expect(global.SpeechSynthesisUtterance).toHaveBeenCalledWith(testText);
        expect(mockUtterance.lang).toBe('pt-BR');
        expect(mockUtterance.rate).toBe(1.0);
        expect(mockSpeechSynthesis.speak).toHaveBeenCalledWith(mockUtterance);

        // Simular evento onstart
        act(() => {
            mockUtterance.onstart();
        });

        expect(result.current.isPlaying).toBe(true);
    });

    it('deve pausar reprodução quando pause é chamado', async () => {
        const { result } = renderHook(() => useTextToSpeech());

        mockSpeechSynthesis.speaking = true;
        mockSpeechSynthesis.paused = false;

        act(() => {
            result.current.pause();
        });

        expect(mockSpeechSynthesis.pause).toHaveBeenCalled();

        act(() => {
            result.current.isPaused = true;
        });
    });

    it('deve retomar reprodução quando resume é chamado', () => {
        const { result } = renderHook(() => useTextToSpeech());

        mockSpeechSynthesis.speaking = true;
        mockSpeechSynthesis.paused = true;

        act(() => {
            result.current.resume();
        });

        expect(mockSpeechSynthesis.resume).toHaveBeenCalled();
    });

    it('deve parar reprodução quando stop é chamado', () => {
        const { result } = renderHook(() => useTextToSpeech());

        act(() => {
            result.current.stop();
        });

        expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
        expect(result.current.isPlaying).toBe(false);
        expect(result.current.isPaused).toBe(false);
    });

    it('deve atualizar velocidade de reprodução', () => {
        const { result } = renderHook(() => useTextToSpeech());
        const newRate = 1.5;

        act(() => {
            result.current.setRate(newRate);
        });

        expect(result.current.rate).toBe(newRate);
    });

    it('deve atualizar velocidade em utterance em reprodução', () => {
        const { result } = renderHook(() => useTextToSpeech());

        act(() => {
            result.current.speak('Teste');
        });

        // Simular que está reproduzindo
        act(() => {
            mockUtterance.onstart();
        });

        const newRate = 1.5;

        act(() => {
            result.current.setRate(newRate);
        });

        expect(mockUtterance.rate).toBe(newRate);
    });

    it('deve atualizar voz selecionada', () => {
        const { result } = renderHook(() => useTextToSpeech());
        const newVoice = mockVoices[1];

        act(() => {
            result.current.setVoice(newVoice);
        });

        expect(result.current.selectedVoice).toEqual(newVoice);
    });

    it('deve cancelar reprodução anterior ao iniciar nova', () => {
        const { result } = renderHook(() => useTextToSpeech());

        act(() => {
            result.current.speak('Texto 1');
            result.current.speak('Texto 2');
        });

        expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
    });

    it('deve limpar reprodução ao desmontar componente', () => {
        const { unmount } = renderHook(() => useTextToSpeech());

        unmount();

        expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
    });

    it('deve lidar com erro na síntese de voz', () => {
        const { result } = renderHook(() => useTextToSpeech());
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        act(() => {
            result.current.speak('Teste');
            mockUtterance.onstart();
        });

        expect(result.current.isPlaying).toBe(true);

        act(() => {
            mockUtterance.onerror({ error: 'test-error' });
        });

        expect(result.current.isPlaying).toBe(false);
        consoleErrorSpy.mockRestore();
    });

    it('não deve reproduzir se texto estiver vazio', () => {
        const { result } = renderHook(() => useTextToSpeech());

        act(() => {
            result.current.speak('');
        });

        expect(mockSpeechSynthesis.speak).not.toHaveBeenCalled();
    });

    it('não deve reproduzir se navegador não suportar', () => {
        delete window.speechSynthesis;

        const { result } = renderHook(() => useTextToSpeech());

        act(() => {
            result.current.speak('Teste');
        });

        expect(result.current.isSupported).toBe(false);
    });

    it('deve incluir título no texto quando fornecido', () => {
        const { result } = renderHook(() => useTextToSpeech());
        const title = 'Título do Artigo';
        const body = 'Corpo do artigo';

        act(() => {
            result.current.speak(`${title}. ${body}`);
        });

        expect(global.SpeechSynthesisUtterance).toHaveBeenCalledWith(`${title}. ${body}`);
    });
});
