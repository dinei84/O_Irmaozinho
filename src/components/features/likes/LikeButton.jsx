import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { toggleLike, hasUserLiked, getLikesCount } from '../../../services/likeService';
import { motion } from 'framer-motion';

const LikeButton = ({ contentId, initialLikesCount = 0, onLikeChange, className = '' }) => {
    const { currentUser } = useAuth();
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(initialLikesCount);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        checkInitialState();
    }, [contentId, currentUser]);

    async function checkInitialState() {
        if (!currentUser || !contentId) {
            setIsChecking(false);
            return;
        }

        try {
            setIsChecking(true);
            const [liked, count] = await Promise.all([
                hasUserLiked(contentId, currentUser.uid),
                getLikesCount(contentId)
            ]);
            
            setIsLiked(liked);
            setLikesCount(count || 0);
        } catch (err) {
            console.error('Erro ao verificar estado inicial:', err);
        } finally {
            setIsChecking(false);
        }
    }

    async function handleToggleLike() {
        if (!currentUser) {
            setError('Você precisa estar logado para curtir');
            setTimeout(() => setError(null), 3000);
            return;
        }

        if (!contentId || loading) {
            return;
        }

        const previousLiked = isLiked;
        const previousCount = likesCount;

        setLoading(true);
        setError(null);

        setIsLiked(!previousLiked);
        setLikesCount(previousCount + (previousLiked ? -1 : 1));

        try {
            const result = await toggleLike(contentId, currentUser.uid);
            
            if (onLikeChange) {
                onLikeChange(result.action === 'liked', likesCount + (previousLiked ? -1 : 1));
            }
        } catch (err) {
            setIsLiked(previousLiked);
            setLikesCount(previousCount);

            let errorMessage = 'Erro ao curtir. Tente novamente.';
            
            if (err.code === 'permission-denied') {
                errorMessage = 'Você não tem permissão para realizar esta ação.';
            } else if (err.code === 'unauthenticated') {
                errorMessage = 'Você precisa estar autenticado.';
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
            setTimeout(() => setError(null), 3000);

            console.error('Erro ao alternar curtida:', err);
        } finally {
            setLoading(false);
        }
    }

    if (isChecking) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <div className="animate-pulse">
                    <Heart size={20} className="text-areia" />
                </div>
                <span className="text-areia text-sm">{likesCount}</span>
            </div>
        );
    }

    return (
        <div className={`flex flex-col items-start gap-1 ${className}`}>
            <button
                onClick={handleToggleLike}
                disabled={loading || !currentUser}
                className={`
                    flex items-center gap-2 px-3 py-3 rounded-lg
                    transition-all duration-200
                    ${isLiked 
                        ? 'text-red-500 hover:text-red-600 bg-red-50' 
                        : 'text-text-secondary hover:text-text-primary hover:bg-areia'
                    }
                    ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    ${!currentUser ? 'opacity-50 cursor-not-allowed' : ''}
                    focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                `}
                aria-label={isLiked ? 'Descurtir' : 'Curtir'}
                aria-pressed={isLiked}
            >
                <motion.div
                    animate={{
                        scale: isLiked ? [1, 1.2, 1] : 1
                    }}
                    transition={{ duration: 0.3 }}
                >
                    <Heart 
                        size={20} 
                        className={isLiked ? 'fill-current' : ''}
                    />
                </motion.div>
                <span className="text-sm font-medium">
                    {likesCount}
                </span>
            </button>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-pessego/30 border border-primary/30 text-primary text-xs px-3 py-2 rounded-md"
                >
                    {error}
                </motion.div>
            )}

            {!currentUser && (
                <p className="text-xs text-text-secondary">
                    Faça login para curtir
                </p>
            )}
        </div>
    );
};

export default LikeButton;
