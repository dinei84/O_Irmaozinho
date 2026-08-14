import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../../../contexts/AuthContext';
import CommentsSection from '../CommentsSection';
import {
    getComments,
    getCommentsCount,
    createComment,
    updateComment,
    deleteComment
} from '../../../../services/commentService';
import { useAuth } from '../../../../contexts/AuthContext';

vi.mock('../../../../services/commentService', () => ({
    getComments: vi.fn(),
    getCommentsCount: vi.fn(),
    createComment: vi.fn(),
    updateComment: vi.fn(),
    deleteComment: vi.fn()
}));

vi.mock('../../../../contexts/AuthContext', () => ({
    AuthProvider: ({ children }) => children,
    useAuth: vi.fn()
}));

const mockComments = [
    {
        id: 'comment1',
        articleId: 'article123',
        userId: 'user1',
        userName: 'User One',
        userAvatar: '',
        content: 'Primeiro comentário',
        createdAt: { toMillis: () => Date.now() - 1000, toDate: () => new Date(Date.now() - 1000) },
        updatedAt: { toMillis: () => Date.now() - 1000, toDate: () => new Date(Date.now() - 1000) },
        isDeleted: false,
        parentId: null
    },
    {
        id: 'comment2',
        articleId: 'article123',
        userId: 'user2',
        userName: 'User Two',
        userAvatar: '',
        content: 'Segundo comentário',
        createdAt: { toMillis: () => Date.now() - 2000, toDate: () => new Date(Date.now() - 2000) },
        updatedAt: { toMillis: () => Date.now() - 2000, toDate: () => new Date(Date.now() - 2000) },
        isDeleted: false,
        parentId: null
    }
];

const MockAuthProvider = ({ children, currentUser = null }) => {
    useAuth.mockReturnValue({
        currentUser,
        userRole: currentUser ? 'user' : null,
        isAdmin: false,
        loading: false,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
        refreshToken: vi.fn()
    });

    return (
        <MemoryRouter>
            <AuthProvider>{children}</AuthProvider>
        </MemoryRouter>
    );
};

describe('CommentsSection', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        getComments.mockResolvedValue({
            comments: mockComments,
            hasMore: false,
            lastComment: mockComments[mockComments.length - 1]
        });
        getCommentsCount.mockResolvedValue(2);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('deve renderizar seção de comentários', async () => {
        render(
            <MockAuthProvider>
                <CommentsSection articleId="article123" />
            </MockAuthProvider>
        );

        expect(screen.getByText(/comentários/i)).toBeInTheDocument();
        expect(getComments).toHaveBeenCalledWith('article123', 10);
        expect(getCommentsCount).toHaveBeenCalledWith('article123');
    });

    it('deve mostrar loading inicial', async () => {
        getComments.mockImplementation(() => new Promise(() => {})); // Nunca resolve

        const { container } = render(
            <MockAuthProvider>
                <CommentsSection articleId="article123" />
            </MockAuthProvider>
        );

        // Verificar se há um spinner ou elemento de loading
        const loader = container.querySelector('.animate-spin');
        expect(loader).toBeTruthy();
    });

    it('deve exibir comentários após carregar', async () => {
        render(
            <MockAuthProvider>
                <CommentsSection articleId="article123" />
            </MockAuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('Primeiro comentário')).toBeInTheDocument();
            expect(screen.getByText('Segundo comentário')).toBeInTheDocument();
        });
    });

    it('deve exibir contador de comentários', async () => {
        render(
            <MockAuthProvider>
                <CommentsSection articleId="article123" />
            </MockAuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByText(/\(2\)/i)).toBeInTheDocument();
        });
    });

    it('deve mostrar mensagem quando não houver comentários', async () => {
        getComments.mockResolvedValue({
            comments: [],
            hasMore: false,
            lastComment: null
        });
        getCommentsCount.mockResolvedValue(0);

        render(
            <MockAuthProvider>
                <CommentsSection articleId="article123" />
            </MockAuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByText(/Seja o primeiro/i)).toBeInTheDocument();
        });
    });

    it('deve mostrar formulário para usuários logados', async () => {
        const mockUser = {
            uid: 'user123',
            email: 'test@example.com',
            displayName: 'Test User'
        };

        render(
            <MockAuthProvider currentUser={mockUser}>
                <CommentsSection articleId="article123" />
            </MockAuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByPlaceholderText(/Deixe um comentário gentil/i)).toBeInTheDocument();
        });
    });

    it('deve mostrar mensagem de login para usuários não autenticados', async () => {
        render(
            <MockAuthProvider currentUser={null}>
                <CommentsSection articleId="article123" />
            </MockAuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByText(/faça login/i)).toBeInTheDocument();
        });
    });

    it('deve criar comentário quando formulário for enviado', async () => {
        const user = userEvent.setup();
        const mockUser = {
            uid: 'user123',
            email: 'test@example.com',
            displayName: 'Test User',
            photoURL: ''
        };

        createComment.mockResolvedValue({
            id: 'new-comment',
            articleId: 'article123',
            userId: 'user123',
            userName: 'Test User',
            content: 'Novo comentário',
            createdAt: { toMillis: () => Date.now(), toDate: () => new Date() },
            updatedAt: { toMillis: () => Date.now(), toDate: () => new Date() },
            isDeleted: false
        });

        render(
            <MockAuthProvider currentUser={mockUser}>
                <CommentsSection articleId="article123" />
            </MockAuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByPlaceholderText(/Deixe um comentário gentil/i)).toBeInTheDocument();
        });

        const textarea = screen.getByPlaceholderText(/Deixe um comentário gentil/i);
        const submitButton = screen.getByRole('button', { name: /comentar/i });

        await user.type(textarea, 'Novo comentário');
        await user.click(submitButton);

        await waitFor(() => {
            expect(createComment).toHaveBeenCalledWith(
                'article123',
                'user123',
                expect.objectContaining({
                    displayName: 'Test User'
                }),
                'Novo comentário'
            );
        });
    });

    it('deve exibir erro quando criar comentário falhar', async () => {
        const user = userEvent.setup();
        const mockUser = {
            uid: 'user123',
            email: 'test@example.com'
        };

        createComment.mockRejectedValue(new Error('Erro ao criar comentário'));

        render(
            <MockAuthProvider currentUser={mockUser}>
                <CommentsSection articleId="article123" />
            </MockAuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByPlaceholderText(/Deixe um comentário gentil/i)).toBeInTheDocument();
        });

        const textarea = screen.getByPlaceholderText(/Deixe um comentário gentil/i);
        const submitButton = screen.getByRole('button', { name: /comentar/i });

        await user.type(textarea, 'Comentário com erro');
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/erro ao criar comentário/i)).toBeInTheDocument();
        });
    });

    it('deve carregar mais comentários quando botão for clicado', async () => {
        const user = userEvent.setup();

        // Mock determinístico por argumento (não por ordem de chamada): a 1ª página
        // (sem cursor) devolve hasMore=true; o "carregar mais" (com cursor = lastComment)
        // devolve a 2ª página. Isso evita a fragilidade da fila mockResolvedValueOnce, que
        // pode ser corrompida por atualizações de estado assíncronas vazando entre testes
        // sob paralelismo (era a causa raiz da instabilidade deste teste).
        const terceiroComentario = {
            id: 'comment3',
            content: 'Terceiro comentário',
            createdAt: { toMillis: () => Date.now() - 3000, toDate: () => new Date(Date.now() - 3000) },
            updatedAt: { toMillis: () => Date.now() - 3000, toDate: () => new Date(Date.now() - 3000) },
            isDeleted: false
        };
        getComments.mockImplementation((_articleId, _pageSize, cursor) =>
            Promise.resolve(cursor
                ? { comments: [terceiroComentario], hasMore: false, lastComment: null }
                : { comments: mockComments, hasMore: true, lastComment: mockComments[mockComments.length - 1] }
            )
        );

        render(
            <MockAuthProvider>
                <CommentsSection articleId="article123" />
            </MockAuthProvider>
        );

        // Espera o botão "carregar mais" aparecer (hasMore=true após o 1º load)
        const loadMoreButton = await screen.findByRole('button', { name: /carregar mais/i });
        await user.click(loadMoreButton);

        // Asserção robusta a timing: espera o comentário da 2ª página aparecer no DOM
        // (findBy* faz retry até o timeout — não corre com a contagem de chamadas do mock).
        expect(await screen.findByText('Terceiro comentário')).toBeInTheDocument();
    });

    it('deve exibir erro quando carregar comentários falhar', async () => {
        getComments.mockRejectedValue(new Error('Erro na rede'));

        render(
            <MockAuthProvider>
                <CommentsSection articleId="article123" />
            </MockAuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByText(/erro ao carregar comentários/i)).toBeInTheDocument();
        });
    });

    it('não deve carregar se articleId não for fornecido', () => {
        render(
            <MockAuthProvider>
                <CommentsSection articleId={null} />
            </MockAuthProvider>
        );

        expect(getComments).not.toHaveBeenCalled();
        expect(getCommentsCount).not.toHaveBeenCalled();
    });
});
