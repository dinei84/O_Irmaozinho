import {
    doc,
    getDoc,
    collection,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    getDocs,
    runTransaction,
    increment,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export async function createComment(articleId, userId, userData, content) {
    if (!articleId || !userId || !content) {
        throw new Error('articleId, userId e content são obrigatórios');
    }

    const contentTrimmed = content.trim();
    if (contentTrimmed.length < 3) {
        throw new Error('Comentário deve ter no mínimo 3 caracteres');
    }
    if (contentTrimmed.length > 500) {
        throw new Error('Comentário deve ter no máximo 500 caracteres');
    }

    const commentRef = collection(db, 'comments');
    const articleRef = doc(db, 'content', articleId);

    try {
        const newCommentRef = doc(commentRef);
        const commentId = newCommentRef.id;

        const result = await runTransaction(db, async (transaction) => {
            const articleDoc = await transaction.get(articleRef);

            if (!articleDoc.exists()) {
                throw new Error('Artigo não encontrado');
            }

            const commentData = {
                articleId,
                userId,
                userName: userData.displayName || userData.name || 'Usuário',
                userAvatar: userData.photoURL || userData.avatar || '',
                content: contentTrimmed,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                isDeleted: false,
                parentId: null
            };

            transaction.set(newCommentRef, commentData);
            transaction.update(articleRef, {
                commentsCount: increment(1),
                updatedAt: serverTimestamp()
            });

            return { id: commentId, ...commentData };
        });

        return result;
    } catch (error) {
        if (process.env.NODE_ENV !== 'test') {
            console.error('Erro ao criar comentário:', error);
        }
        throw error;
    }
}

export async function getComments(articleId, pageSize = 10, lastComment = null) {
    if (!articleId) {
        throw new Error('articleId é obrigatório');
    }

    try {
        let q = query(
            collection(db, 'comments'),
            where('articleId', '==', articleId),
            where('isDeleted', '==', false),
            orderBy('createdAt', 'desc'),
            limit(pageSize)
        );

        if (lastComment) {
            const lastDoc = await getDoc(doc(db, 'comments', lastComment.id));
            if (lastDoc.exists()) {
                q = query(
                    collection(db, 'comments'),
                    where('articleId', '==', articleId),
                    where('isDeleted', '==', false),
                    orderBy('createdAt', 'desc'),
                    startAfter(lastDoc),
                    limit(pageSize)
                );
            }
        }

        const querySnapshot = await getDocs(q);
        const comments = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return {
            comments,
            hasMore: querySnapshot.docs.length === pageSize,
            lastComment: comments.length > 0 ? comments[comments.length - 1] : null
        };
    } catch (error) {
        if (process.env.NODE_ENV !== 'test') {
            console.error('Erro ao buscar comentários:', error);
        }
        throw error;
    }
}

export async function getCommentsCount(articleId) {
    if (!articleId) {
        return 0;
    }

    try {
        const articleRef = doc(db, 'content', articleId);
        const articleDoc = await getDoc(articleRef);

        if (!articleDoc.exists()) {
            return 0;
        }

        return articleDoc.data().commentsCount || 0;
    } catch (error) {
        if (process.env.NODE_ENV !== 'test') {
            console.error('Erro ao buscar contagem de comentários:', error);
        }
        return 0;
    }
}

export async function updateComment(commentId, newContent, userId) {
    if (!commentId || !newContent || !userId) {
        throw new Error('commentId, newContent e userId são obrigatórios');
    }

    const contentTrimmed = newContent.trim();
    if (contentTrimmed.length < 3) {
        throw new Error('Comentário deve ter no mínimo 3 caracteres');
    }
    if (contentTrimmed.length > 500) {
        throw new Error('Comentário deve ter no máximo 500 caracteres');
    }

    const commentRef = doc(db, 'comments', commentId);

    try {
        const commentDoc = await getDoc(commentRef);

        if (!commentDoc.exists()) {
            throw new Error('Comentário não encontrado');
        }

        const commentData = commentDoc.data();

        if (commentData.isDeleted) {
            throw new Error('Não é possível editar um comentário removido');
        }

        if (commentData.userId !== userId) {
            throw new Error('Você não tem permissão para editar este comentário. Apenas o autor pode editar.');
        }

        // Validação de tempo no cliente (feedback imediato)
        // Usar toMillis() se disponível (objeto Timestamp do Firestore) ou segundos * 1000
        const createdAtMillis = commentData.createdAt?.toMillis
            ? commentData.createdAt.toMillis()
            : (commentData.createdAt?.seconds * 1000 || Date.now());

        const timeDiff = Date.now() - createdAtMillis;
        const ONE_HOUR_IN_MS = 60 * 60 * 1000;

        if (timeDiff > ONE_HOUR_IN_MS) {
            throw new Error('O tempo para editar este comentário expirou. Comentários só podem ser editados até 1 hora após a criação.');
        }

        // Tentar atualizar - o Firestore vai validar o tempo
        // Não validamos tempo no cliente para evitar problemas de sincronização
        await updateDoc(commentRef, {
            content: contentTrimmed,
            updatedAt: serverTimestamp()
        });

        return { id: commentId, ...commentData, content: contentTrimmed };
    } catch (error) {
        if (process.env.NODE_ENV !== 'test') {
            console.error('Erro ao atualizar comentário:', error);
        }

        // Traduzir erros do Firestore para português
        if (error.code === 'permission-denied') {
            // O Firestore retorna permission-denied quando:
            // 1. Tempo expirou (> 1 hora)
            // 2. Usuário não é o dono
            // 3. Comentário deletado
            // Como já validamos dono e deletado no cliente, 
            // se chegou aqui é provavelmente tempo expirado
            throw new Error('Não foi possível salvar a edição. O tempo limite pode ter expirado ou houve um erro de permissão no servidor.');
        }

        if (error.code === 'unauthenticated') {
            throw new Error('Você precisa estar autenticado para editar comentários. Faça login e tente novamente.');
        }

        // Se já é uma mensagem em português, apenas relançar
        if (error.message && !error.code) {
            throw error;
        }

        // Erro genérico
        throw new Error('Erro ao atualizar comentário. Tente novamente mais tarde.');
    }
}

export async function deleteComment(commentId, userId) {
    if (!commentId || !userId) {
        throw new Error('commentId e userId são obrigatórios');
    }

    const commentRef = doc(db, 'comments', commentId);

    try {
        const result = await runTransaction(db, async (transaction) => {
            const commentDoc = await transaction.get(commentRef);

            if (!commentDoc.exists()) {
                throw new Error('Comentário não encontrado');
            }

            const commentData = commentDoc.data();

            if (commentData.userId !== userId) {
                throw new Error('Você não tem permissão para deletar este comentário');
            }

            if (commentData.isDeleted) {
                throw new Error('Este comentário já foi removido');
            }

            const articleRef = doc(db, 'content', commentData.articleId);

            transaction.update(commentRef, {
                content: '[Comentário removido]',
                isDeleted: true,
                updatedAt: serverTimestamp()
            });

            // Decrementar contador no artigo
            transaction.update(articleRef, {
                commentsCount: increment(-1),
                updatedAt: serverTimestamp() // Atualiza também o timestamp do artigo
            });

            return { id: commentId, ...commentData, isDeleted: true };
        });

        return result;
    } catch (error) {
        if (process.env.NODE_ENV !== 'test') {
            console.error('Erro ao deletar comentário:', error);
        }
        throw error;
    }
}
