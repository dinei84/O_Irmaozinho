import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TextToSpeechPlayer from '../TextToSpeechPlayer';
import { useTextToSpeech } from '../../../../hooks/useTextToSpeech';

vi.mock('../../../../hooks/useTextToSpeech');

describe('TextToSpeechPlayer', () => {
    const mockSpeak = vi.fn();
    const mockPause = vi.fn();
    const mockResume = vi.fn();
    const mockStop = vi.fn();
    const mockSetRate = vi.fn();
    const mockSetVoice = vi.fn();

    const defaultMockReturn = {
        isSupported: true,
        isPlaying: false,
        isPaused: false,
        availableVoices: [
            { name: 'Voz PT-BR 1', lang: 'pt-BR' },
            { name: 'Voz PT-BR 2', lang: 'pt-BR' },
        ],
        selectedVoice: { name: 'Voz PT-BR 1', lang: 'pt-BR' },
        rate: 1.0,
        speak: mockSpeak,
        pause: mockPause,
        resume: mockResume,
        stop: mockStop,
        setRate: mockSetRate,
        setVoice: mockSetVoice,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        useTextToSpeech.mockReturnValue(defaultMockReturn);
    });

    it('deve renderizar player quando navegador suporta', () => {
        render(<TextToSpeechPlayer text="Texto do artigo" title="Título" />);

        expect(screen.getByText(/ouvir artigo/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /reproduzir/i })).toBeInTheDocument();
    });

    it('deve mostrar mensagem quando navegador não suporta', () => {
        useTextToSpeech.mockReturnValue({
            ...defaultMockReturn,
            isSupported: false,
        });

        render(<TextToSpeechPlayer text="Texto do artigo" />);

        expect(screen.getByText(/seu navegador não suporta/i)).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /reproduzir/i })).not.toBeInTheDocument();
    });

    it('não deve renderizar se texto estiver vazio', () => {
        const { container } = render(<TextToSpeechPlayer text="" />);

        expect(container.firstChild).toBeNull();
    });

    it('deve iniciar reprodução ao clicar em Reproduzir', async () => {
        const user = userEvent.setup();
        render(<TextToSpeechPlayer text="Texto do artigo" title="Título" />);

        const playButton = screen.getByRole('button', { name: /reproduzir/i });
        await user.click(playButton);

        expect(mockSpeak).toHaveBeenCalledWith('Título. Texto do artigo');
    });

    it('deve mostrar controles de pausar/parar quando reproduzindo', () => {
        useTextToSpeech.mockReturnValue({
            ...defaultMockReturn,
            isPlaying: true,
        });

        render(<TextToSpeechPlayer text="Texto do artigo" />);

        expect(screen.getByRole('button', { name: /pausar/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /parar/i })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /reproduzir/i })).not.toBeInTheDocument();
    });

    it('deve pausar reprodução ao clicar em Pausar', async () => {
        const user = userEvent.setup();
        useTextToSpeech.mockReturnValue({
            ...defaultMockReturn,
            isPlaying: true,
        });

        render(<TextToSpeechPlayer text="Texto do artigo" />);

        const pauseButton = screen.getByRole('button', { name: /pausar/i });
        await user.click(pauseButton);

        expect(mockPause).toHaveBeenCalled();
    });

    it('deve retomar reprodução quando pausado', async () => {
        const user = userEvent.setup();
        useTextToSpeech.mockReturnValue({
            ...defaultMockReturn,
            isPaused: true,
        });

        render(<TextToSpeechPlayer text="Texto do artigo" />);

        const resumeButton = screen.getByRole('button', { name: /continuar/i });
        await user.click(resumeButton);

        expect(mockResume).toHaveBeenCalled();
    });

    it('deve parar reprodução ao clicar em Parar', async () => {
        const user = userEvent.setup();
        useTextToSpeech.mockReturnValue({
            ...defaultMockReturn,
            isPlaying: true,
        });

        render(<TextToSpeechPlayer text="Texto do artigo" />);

        const stopButton = screen.getByRole('button', { name: /parar/i });
        await user.click(stopButton);

        expect(mockStop).toHaveBeenCalled();
    });

    it('deve expandir/recolher controles avançados', async () => {
        const user = userEvent.setup();
        render(<TextToSpeechPlayer text="Texto do artigo" />);

        const expandButton = screen.getByRole('button', { name: /expandir controles/i });
        
        // Inicialmente oculto
        expect(screen.queryByText(/velocidade/i)).not.toBeInTheDocument();

        // Expandir
        await user.click(expandButton);

        await waitFor(() => {
            expect(screen.getByText(/velocidade/i)).toBeInTheDocument();
        });

        // Recolher
        const collapseButton = screen.getByRole('button', { name: /recolher controles/i });
        await user.click(collapseButton);

        await waitFor(() => {
            expect(screen.queryByText(/velocidade/i)).not.toBeInTheDocument();
        });
    });

    it('deve mostrar slider de velocidade quando expandido', async () => {
        const user = userEvent.setup();
        render(<TextToSpeechPlayer text="Texto do artigo" />);

        const expandButton = screen.getByRole('button', { name: /expandir controles/i });
        await user.click(expandButton);

        await waitFor(() => {
            const slider = screen.getByLabelText(/velocidade/i);
            expect(slider).toBeInTheDocument();
            expect(slider).toHaveValue('1');
        });
    });

    it('deve atualizar velocidade ao mover slider', async () => {
        const user = userEvent.setup();
        render(<TextToSpeechPlayer text="Texto do artigo" />);

        const expandButton = screen.getByRole('button', { name: /expandir controles/i });
        await user.click(expandButton);

        await waitFor(() => {
            const slider = screen.getByLabelText(/velocidade/i);
            expect(slider).toBeInTheDocument();
        });

        const slider = screen.getByLabelText(/velocidade/i);
        // Simular mudança de valor no slider
        fireEvent.change(slider, { target: { value: '1.5' } });

        expect(mockSetRate).toHaveBeenCalledWith(1.5);
    });

    it('deve mostrar seletor de voz quando expandido', async () => {
        const user = userEvent.setup();
        render(<TextToSpeechPlayer text="Texto do artigo" />);

        const expandButton = screen.getByRole('button', { name: /expandir controles/i });
        await user.click(expandButton);

        await waitFor(() => {
            expect(screen.getByLabelText(/voz/i)).toBeInTheDocument();
        });

        const voiceSelect = screen.getByLabelText(/voz/i);
        expect(voiceSelect).toBeInTheDocument();
        expect(voiceSelect.children.length).toBe(2); // Duas vozes disponíveis
    });

    it('deve atualizar voz ao selecionar outra', async () => {
        const user = userEvent.setup();
        render(<TextToSpeechPlayer text="Texto do artigo" />);

        const expandButton = screen.getByRole('button', { name: /expandir controles/i });
        await user.click(expandButton);

        await waitFor(() => {
            expect(screen.getByLabelText(/voz/i)).toBeInTheDocument();
        });

        const voiceSelect = screen.getByLabelText(/voz/i);
        await user.selectOptions(voiceSelect, 'Voz PT-BR 2');

        expect(mockSetVoice).toHaveBeenCalled();
    });

    it('deve mostrar indicador de estado quando reproduzindo', () => {
        useTextToSpeech.mockReturnValue({
            ...defaultMockReturn,
            isPlaying: true,
        });

        render(<TextToSpeechPlayer text="Texto do artigo" />);

        expect(screen.getByText(/reproduzindo/i)).toBeInTheDocument();
    });

    it('deve mostrar indicador de pausado', () => {
        useTextToSpeech.mockReturnValue({
            ...defaultMockReturn,
            isPaused: true,
        });

        render(<TextToSpeechPlayer text="Texto do artigo" />);

        expect(screen.getByText(/pausado/i)).toBeInTheDocument();
    });

    it('deve usar apenas texto quando título não for fornecido', async () => {
        const user = userEvent.setup();
        render(<TextToSpeechPlayer text="Texto do artigo" />);

        const playButton = screen.getByRole('button', { name: /reproduzir/i });
        await user.click(playButton);

        expect(mockSpeak).toHaveBeenCalledWith('Texto do artigo');
    });

    it('deve expandir automaticamente ao iniciar reprodução', async () => {
        const user = userEvent.setup();
        render(<TextToSpeechPlayer text="Texto do artigo" />);

        // Expandir não está visível inicialmente
        expect(screen.queryByText(/velocidade/i)).not.toBeInTheDocument();

        // Iniciar reprodução - isso deve expandir automaticamente
        const playButton = screen.getByRole('button', { name: /reproduzir/i });
        await user.click(playButton);

        // Verificar que expandiu automaticamente
        await waitFor(() => {
            expect(screen.getByText(/velocidade/i)).toBeInTheDocument();
        }, { timeout: 3000 });
    });
});
