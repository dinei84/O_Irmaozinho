import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Loader2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { getComments, getCommentsCount, createComment, updateComment, deleteComment } from '../../../services/commentService';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import { motion, AnimatePresence } from 'framer-motion';

const CommentsSection = ({ articleId, className = '' }) => {
    const { currentUser } = useAuth();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [lastComment, setLastComment] = useState(null);
    const [error, setError] = useState('');
    const commentsEndRef = useRef(null);
    const PAGE_SIZE = 10;

    useEffect(() => {
        if (articleId) {
            loadComments();
            loadCommentsCount();
        }
    }, [articleId]);

    async function loadComments() {
        if (!articleId) return;

        try {
            setLoading(true);
            setError('');
            const result = await getComments(articleId, PAGE_SIZE);
            setComments(result.comments);
            setHasMore(result.hasMore);
            setLastComment(result.lastComment);
        } catch (err) {
            console.error('Erro ao carregar comentários:', err);
            setError('Erro ao carregar comentários. Tente recarregar a página.');
        } finally {
            setLoading(false);
        }
    }

    async function loadCommentsCount() {
        if (!articleId) return;

        try {
            const count = await getCommentsCount(articleId);
            setTotalCount(count);
        } catch (err) {
            console.error('Erro ao carregar contagem:', err);
        }
    }

    async function loadMoreComments() {
        if (!hasMore || loadingMore || !lastComment) return;

        try {
            setLoadingMore(true);
            const result = await getComments(articleId, PAGE_SIZE, lastComment);
            setComments(prev => [...prev, ...result.comments]);
            setHasMore(result.hasMore);
            setLastComment(result.lastComment);
        } catch (err) {
            console.error('Erro ao carregar mais comentários:', err);
            setError('Erro ao carregar mais comentários.');
        } finally {
            setLoadingMore(false);
        }
    }

    async function handleSubmitComment(content) {
        if (!currentUser) {
            throw new Error('Você precisa estar logado para comentar');
        }

        setSubmitting(true);
        setError('');

        try {
            const userData = {
                displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Usuário',
                photoURL: currentUser.photoURL || '',
                name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Usuário',
                avatar: currentUser.photoURL || ''
            };

            const newComment = await createComment(articleId, currentUser.uid, userData, content);

            const optimisticComment = {
                ...newComment,
                createdAt: { toMillis: () => Date.now(), toDate: () => new Date() },
                updatedAt: { toMillis: () => Date.now(), toDate: () => new Date() },
                isOptimistic: true
            };

            setComments(prev => [optimisticComment, ...prev]);
            setTotalCount(prev => prev + 1);

            setTimeout(() => {
                loadComments();
                loadCommentsCount();
            }, 500);
        } catch (err) {
            console.error('Erro ao criar comentário:', err);
            throw err;
        } finally {
            setSubmitting(false);
        }
    }

    async function handleEditComment(commentId, newContent) {
        if (!currentUser) {
            throw new Error('Você precisa estar logado para editar comentários');
        }

        try {
            await updateComment(commentId, newContent, currentUser.uid);
            const now = new Date();
            setComments(prev =>
                prev.map(comment =>
                    comment.id === commentId
                        ? { 
                            ...comment, 
                            content: newContent.trim(), 
                            updatedAt: { 
                                toMillis: () => now.getTime(),
                                toDate: () => now,
                                seconds: Math.floor(now.getTime() / 1000)
                            } 
                        }
                        : comment
                )
            );
        } catch (err) {
            // O erro já foi traduzido no serviço, apenas relançar
            if (process.env.NODE_ENV !== 'test') {
                console.error('Erro ao editar comentário:', err);
            }
            throw err;
        }
    }

    async function handleDeleteComment(commentId) {
        if (!currentUser) {
            throw new Error('Você precisa estar logado');
        }

        try {
            await deleteComment(commentId, currentUser.uid);
            setComments(prev =>
                prev.map(comment =>
                    comment.id === commentId
                        ? { ...comment, content: '[Comentário removido]', isDeleted: true }
                        : comment
                )
            );
        } catch (err) {
            console.error('Erro ao deletar comentário:', err);
            throw err;
        }
    }

    const scrollToBottom = () => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className={className}>
            <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="text-primary" size={24} />
                <h2 className="text-2xl font-heading font-bold text-secondary">
                    Comentários
                    {totalCount > 0 && (
                        <span className="text-lg font-normal text-text-secondary ml-2">
                            ({totalCount})
                        </span>
                    )}
                </h2>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-pessego/30 border border-primary/30 text-secondary text-sm px-4 py-3 rounded-lg mb-6"
                >
                    {error}
                </motion.div>
            )}

            {currentUser ? (
                <div className="mb-8">
                    <CommentForm
                        onSubmit={handleSubmitComment}
                        submitLabel={submitting ? 'Enviando...' : 'Comentar'}
                    />
                </div>
            ) : (
                <div className="mb-8 p-6 bg-areia rounded-xl text-center">
                    <p className="text-sm text-text-secondary">
                        <Link to="/login" className="text-primary hover:underline font-semibold">
                            Faça login
                        </Link>
                        {' '}para deixar um comentário gentil
                    </p>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="animate-spin text-primary" size={32} />
                </div>
            ) : comments.length === 0 ? (
                <div className="text-center py-12 bg-areia rounded-xl">
                    <MessageSquare className="mx-auto text-text-secondary/30 mb-4" size={48} />
                    <p className="text-text-secondary">
                        Seja o primeiro a deixar um comentário gentil
                    </p>
                </div>
            ) : (
                <>
                    <div className="space-y-0">
                        <AnimatePresence>
                            {comments.map((comment) => (
                                <CommentItem
                                    key={comment.id}
                                    comment={comment}
                                    currentUserId={currentUser?.uid}
                                    onEdit={handleEditComment}
                                    onDelete={handleDeleteComment}
                                />
                            ))}
                        </AnimatePresence>
                        <div ref={commentsEndRef} />
                    </div>

                    {hasMore && (
                        <div className="mt-6 text-center">
                            <button
                                onClick={loadMoreComments}
                                disabled={loadingMore}
                                className={`
                                    px-6 py-2 rounded-lg text-sm font-medium
                                    transition-all duration-200
                                    ${loadingMore
                                        ? 'bg-areia text-text-secondary cursor-not-allowed'
                                        : 'bg-primary text-background hover:bg-primary-dark'
                                    }
                                `}
                            >
                                {loadingMore ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="animate-spin" size={16} />
                                        Carregando...
                                    </span>
                                ) : (
                                    'Carregar mais comentários'
                                )}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CommentsSection;
