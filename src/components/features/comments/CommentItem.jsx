import React, { useState } from 'react';
import { Edit2, Trash2, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatRelativeTime } from '../../../lib/dateUtils';
import CommentForm from './CommentForm';

const CommentItem = ({ comment, currentUserId, onEdit, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editError, setEditError] = useState(null);
    const isOwner = currentUserId && comment.userId === currentUserId;
    const isEdited = comment.updatedAt && 
                     comment.createdAt && 
                     (comment.updatedAt.toMillis ? comment.updatedAt.toMillis() : comment.updatedAt.seconds * 1000) > 
                     (comment.createdAt.toMillis ? comment.createdAt.toMillis() : comment.createdAt.seconds * 1000) + 1000;

    const handleEdit = async (newContent) => {
        try {
            setEditError(null);
            await onEdit(comment.id, newContent);
            setIsEditing(false);
        } catch (error) {
            setEditError(error.message || 'Erro ao editar comentário');
            throw error;
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Tem certeza que deseja remover este comentário?')) {
            try {
                await onDelete(comment.id);
            } catch (error) {
                console.error('Erro ao deletar comentário:', error);
            }
        }
    };

    if (isEditing) {
        return (
            <div className="mb-4">
                {editError && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-3 p-4 bg-red-50 border border-red-200 rounded-xl"
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-red-800 text-sm mb-1">
                                    Não foi possível editar o comentário
                                </p>
                                <p className="text-red-700 text-sm">{editError}</p>
                            </div>
                            <button
                                onClick={() => setEditError(null)}
                                className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
                                aria-label="Fechar erro"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </motion.div>
                )}
                <CommentForm
                    initialText={comment.content}
                    onSubmit={handleEdit}
                    onCancel={() => {
                        setIsEditing(false);
                        setEditError(null);
                    }}
                    submitLabel="Salvar"
                />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 pb-6 border-b border-borda last:border-0"
        >
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                    {comment.userAvatar ? (
                        <img
                            src={comment.userAvatar}
                            alt={comment.userName}
                            className="w-10 h-10 rounded-full object-cover"
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <div
                        className={`w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center ${comment.userAvatar ? 'hidden' : ''}`}
                    >
                        <User size={20} className="text-primary" />
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-secondary text-sm">
                            {comment.userName || 'Usuário'}
                        </span>
                        <span className="text-xs text-text-secondary">
                            {formatRelativeTime(comment.createdAt)}
                        </span>
                        {isEdited && (
                            <span className="text-xs text-text-secondary italic">
                                (editado)
                            </span>
                        )}
                    </div>

                    <p className="text-text-primary text-sm leading-relaxed mb-3 whitespace-pre-wrap">
                        {comment.content}
                    </p>

                    {isOwner && !comment.isDeleted && (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-xs text-primary hover:text-primary-dark flex items-center gap-1 transition-colors"
                            >
                                <Edit2 size={14} />
                                Editar
                            </button>
                            <button
                                onClick={handleDelete}
                                className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                            >
                                <Trash2 size={14} />
                                Excluir
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default CommentItem;
