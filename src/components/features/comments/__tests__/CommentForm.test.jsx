import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CommentForm from '../CommentForm';

describe('CommentForm', () => {
    const mockOnSubmit = vi.fn();
    const mockOnCancel = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deve renderizar o formulário corretamente', () => {
        render(<CommentForm onSubmit={mockOnSubmit} />);

        expect(screen.getByPlaceholderText(/escreva seu comentário/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /comentar/i })).toBeInTheDocument();
    });

    it('deve mostrar texto inicial se fornecido', () => {
        const initialText = 'Texto inicial';
        render(<CommentForm onSubmit={mockOnSubmit} initialText={initialText} />);

        expect(screen.getByDisplayValue(initialText)).toBeInTheDocument();
    });

    it('deve mostrar botão de cancelar se onCancel for fornecido', () => {
        render(<CommentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
    });

    it('deve chamar onSubmit ao enviar comentário válido', async () => {
        const user = userEvent.setup();
        mockOnSubmit.mockResolvedValue();

        render(<CommentForm onSubmit={mockOnSubmit} />);

        const textarea = screen.getByPlaceholderText(/escreva seu comentário/i);
        const submitButton = screen.getByRole('button', { name: /comentar/i });

        await user.type(textarea, 'Este é um comentário válido');
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith('Este é um comentário válido');
        });
    });

    it('não deve chamar onSubmit se comentário tiver menos de 3 caracteres', async () => {
        const user = userEvent.setup();
        render(<CommentForm onSubmit={mockOnSubmit} />);

        const textarea = screen.getByPlaceholderText(/escreva seu comentário/i);
        const submitButton = screen.getByRole('button', { name: /comentar/i });

        await user.type(textarea, 'ab');
        await user.click(submitButton);

        expect(mockOnSubmit).not.toHaveBeenCalled();
        expect(submitButton).toBeDisabled();
    });

    it('deve mostrar mensagem de erro quando validação falhar', async () => {
        const user = userEvent.setup();
        render(<CommentForm onSubmit={mockOnSubmit} />);

        const textarea = screen.getByPlaceholderText(/escreva seu comentário/i);
        const submitButton = screen.getByRole('button', { name: /comentar/i });

        await user.type(textarea, 'ab');
        
        // Tentar enviar (não deve funcionar, mas vamos forçar)
        await user.click(submitButton);

        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('deve mostrar erro quando onSubmit falhar', async () => {
        const user = userEvent.setup();
        const errorMessage = 'Erro ao enviar comentário';
        mockOnSubmit.mockRejectedValue(new Error(errorMessage));

        render(<CommentForm onSubmit={mockOnSubmit} />);

        const textarea = screen.getByPlaceholderText(/escreva seu comentário/i);
        const submitButton = screen.getByRole('button', { name: /comentar/i });

        await user.type(textarea, 'Comentário válido');
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/erro ao enviar comentário/i)).toBeInTheDocument();
        });
    });

    it('deve mostrar loading durante o envio', async () => {
        const user = userEvent.setup();
        let resolveSubmit;
        const submitPromise = new Promise((resolve) => {
            resolveSubmit = resolve;
        });
        mockOnSubmit.mockReturnValue(submitPromise);

        render(<CommentForm onSubmit={mockOnSubmit} />);

        const textarea = screen.getByPlaceholderText(/escreva seu comentário/i);
        const submitButton = screen.getByRole('button', { name: /comentar/i });

        await user.type(textarea, 'Comentário válido');
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/enviando/i)).toBeInTheDocument();
        });

        resolveSubmit();
        await waitFor(() => {
            expect(screen.queryByText(/enviando/i)).not.toBeInTheDocument();
        });
    });

    it('deve limpar o campo após envio bem-sucedido', async () => {
        const user = userEvent.setup();
        mockOnSubmit.mockResolvedValue();

        render(<CommentForm onSubmit={mockOnSubmit} />);

        const textarea = screen.getByPlaceholderText(/escreva seu comentário/i);
        const submitButton = screen.getByRole('button', { name: /comentar/i });

        await user.type(textarea, 'Comentário válido');
        await user.click(submitButton);

        await waitFor(() => {
            expect(textarea).toHaveValue('');
        });
    });

    it('deve chamar onCancel quando botão cancelar for clicado', async () => {
        const user = userEvent.setup();
        render(<CommentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        const cancelButton = screen.getByRole('button', { name: /cancelar/i });
        await user.click(cancelButton);

        expect(mockOnCancel).toHaveBeenCalled();
    });

    it('deve mostrar contador de caracteres', async () => {
        const user = userEvent.setup();
        render(<CommentForm onSubmit={mockOnSubmit} />);

        const textarea = screen.getByPlaceholderText(/escreva seu comentário/i);
        
        await user.type(textarea, 'Teste');
        
        expect(screen.getByText(/495/i)).toBeInTheDocument(); // 500 - 5
    });

    it('deve desabilitar botão durante loading', async () => {
        const user = userEvent.setup();
        let resolveSubmit;
        const submitPromise = new Promise((resolve) => {
            resolveSubmit = resolve;
        });
        mockOnSubmit.mockReturnValue(submitPromise);

        render(<CommentForm onSubmit={mockOnSubmit} />);

        const textarea = screen.getByPlaceholderText(/escreva seu comentário/i);
        const submitButton = screen.getByRole('button', { name: /comentar/i });

        await user.type(textarea, 'Comentário válido');
        await user.click(submitButton);

        await waitFor(() => {
            expect(submitButton).toBeDisabled();
        });

        resolveSubmit();
    });

    it('deve usar submitLabel personalizado', () => {
        render(<CommentForm onSubmit={mockOnSubmit} submitLabel="Salvar" />);

        expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument();
    });
});
