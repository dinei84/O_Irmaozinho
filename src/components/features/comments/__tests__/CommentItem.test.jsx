import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CommentItem from '../CommentItem';

describe('CommentItem', () => {
    const mockComment = {
        id: 'comment123',
        articleId: 'article123',
        userId: 'user123',
        userName: 'Test User',
        userAvatar: 'https://example.com/avatar.jpg',
        content: 'Este é um comentário de teste',
        createdAt: {
            toMillis: () => Date.now() - 30 * 60 * 1000, // 30 minutos atrás
            toDate: () => new Date(Date.now() - 30 * 60 * 1000),
            seconds: Math.floor((Date.now() - 30 * 60 * 1000) / 1000)
        },
        updatedAt: {
            toMillis: () => Date.now() - 30 * 60 * 1000,
            toDate: () => new Date(Date.now() - 30 * 60 * 1000),
            seconds: Math.floor((Date.now() - 30 * 60 * 1000) / 1000)
        },
        isDeleted: false,
        parentId: null
    };

    const mockOnEdit = vi.fn();
    const mockOnDelete = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        window.confirm = vi.fn(() => true);
    });

    it('deve renderizar o comentário corretamente', () => {
        render(
            <CommentItem
                comment={mockComment}
                currentUserId="user123"
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
            />
        );

        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('Este é um comentário de teste')).toBeInTheDocument();
    });

    it('deve mostrar botões de editar/excluir para o dono', () => {
        render(
            <CommentItem
                comment={mockComment}
                currentUserId="user123"
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
            />
        );

        expect(screen.getByText(/editar/i)).toBeInTheDocument();
        expect(screen.getByText(/excluir/i)).toBeInTheDocument();
    });

    it('não deve mostrar botões de editar/excluir para outros usuários', () => {
        render(
            <CommentItem
                comment={mockComment}
                currentUserId="different-user"
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
            />
        );

        expect(screen.queryByText(/editar/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/excluir/i)).not.toBeInTheDocument();
    });

    it('não deve mostrar botões se usuário não estiver logado', () => {
        render(
            <CommentItem
                comment={mockComment}
                currentUserId={null}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
            />
        );

        expect(screen.queryByText(/editar/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/excluir/i)).not.toBeInTheDocument();
    });

    it('deve mostrar selo "editado" quando comentário foi editado', () => {
        const editedComment = {
            ...mockComment,
            createdAt: {
                toMillis: () => Date.now() - 60 * 60 * 1000,
                seconds: Math.floor((Date.now() - 60 * 60 * 1000) / 1000)
            },
            updatedAt: {
                toMillis: () => Date.now() - 30 * 60 * 1000,
                seconds: Math.floor((Date.now() - 30 * 60 * 1000) / 1000)
            }
        };

        render(
            <CommentItem
                comment={editedComment}
                currentUserId="user123"
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
            />
        );

        expect(screen.getByText(/editado/i)).toBeInTheDocument();
    });

    it('deve abrir modo de edição quando botão editar for clicado', async () => {
        const user = userEvent.setup();
        render(
            <CommentItem
                comment={mockComment}
                currentUserId="user123"
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
            />
        );

        const editButton = screen.getByText(/editar/i);
        await user.click(editButton);

        expect(screen.getByDisplayValue('Este é um comentário de teste')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument();
    });

    it('deve chamar onDelete quando botão excluir for clicado', async () => {
        const user = userEvent.setup();
        mockOnDelete.mockResolvedValue();

        render(
            <CommentItem
                comment={mockComment}
                currentUserId="user123"
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
            />
        );

        const deleteButton = screen.getByText(/excluir/i);
        await user.click(deleteButton);

        expect(window.confirm).toHaveBeenCalled();
        expect(mockOnDelete).toHaveBeenCalledWith('comment123');
    });

    it('não deve chamar onDelete se usuário cancelar confirmação', async () => {
        const user = userEvent.setup();
        window.confirm.mockReturnValue(false);

        render(
            <CommentItem
                comment={mockComment}
                currentUserId="user123"
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
            />
        );

        const deleteButton = screen.getByText(/excluir/i);
        await user.click(deleteButton);

        expect(window.confirm).toHaveBeenCalled();
        expect(mockOnDelete).not.toHaveBeenCalled();
    });

    it('deve mostrar avatar do usuário se fornecido', () => {
        render(
            <CommentItem
                comment={mockComment}
                currentUserId="user123"
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
            />
        );

        const avatar = screen.getByAltText('Test User');
        expect(avatar).toBeInTheDocument();
        expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });

    it('deve mostrar ícone padrão se avatar não for fornecido', () => {
        const commentWithoutAvatar = {
            ...mockComment,
            userAvatar: ''
        };

        render(
            <CommentItem
                comment={commentWithoutAvatar}
                currentUserId="user123"
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
            />
        );

        // Verificar se o ícone de usuário padrão está presente
        const iconContainer = screen.getByText('Test User').closest('div').querySelector('svg');
        expect(iconContainer).toBeInTheDocument();
    });

    it('deve fechar modo de edição quando cancelar', async () => {
        const user = userEvent.setup();
        render(
            <CommentItem
                comment={mockComment}
                currentUserId="user123"
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
            />
        );

        const editButton = screen.getByText(/editar/i);
        await user.click(editButton);

        const cancelButton = screen.getByText(/cancelar/i);
        await user.click(cancelButton);

        expect(screen.queryByDisplayValue('Este é um comentário de teste')).not.toBeInTheDocument();
    });

    it('deve chamar onEdit quando salvar edição', async () => {
        const user = userEvent.setup();
        mockOnEdit.mockResolvedValue();

        render(
            <CommentItem
                comment={mockComment}
                currentUserId="user123"
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
            />
        );

        const editButton = screen.getByText(/editar/i);
        await user.click(editButton);

        const textarea = screen.getByDisplayValue('Este é um comentário de teste');
        await user.clear(textarea);
        await user.type(textarea, 'Conteúdo editado');

        const saveButton = screen.getByRole('button', { name: /salvar/i });
        await user.click(saveButton);

        await waitFor(() => {
            expect(mockOnEdit).toHaveBeenCalledWith('comment123', 'Conteúdo editado');
        });
    });
});
