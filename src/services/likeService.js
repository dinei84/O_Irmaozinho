import {
    doc,
    getDoc,
    setDoc,
    deleteDoc,
    runTransaction,
    increment,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export async function toggleLike(contentId, userId) {
    if (!contentId || !userId) {
        throw new Error('contentId e userId são obrigatórios');
    }

    const likeId = `${contentId}_${userId}`;
    const likeRef = doc(db, 'likes', likeId);
    const contentRef = doc(db, 'content', contentId);

    try {
        const result = await runTransaction(db, async (transaction) => {
            const likeDoc = await transaction.get(likeRef);
            const contentDoc = await transaction.get(contentRef);

            if (!contentDoc.exists()) {
                throw new Error('Artigo não encontrado');
            }

            if (likeDoc.exists()) {
                transaction.delete(likeRef);
                transaction.update(contentRef, {
                    likesCount: increment(-1),
                    updatedAt: serverTimestamp()
                });
                return { action: 'unliked', likeId };
            } else {
                transaction.set(likeRef, {
                    contentId,
                    userId,
                    createdAt: serverTimestamp()
                });
                transaction.update(contentRef, {
                    likesCount: increment(1),
                    updatedAt: serverTimestamp()
                });
                return { action: 'liked', likeId };
            }
        });

        return result;
    } catch (error) {
        console.error('Erro ao alternar curtida:', error);
        throw error;
    }
}

export async function hasUserLiked(contentId, userId) {
    if (!contentId || !userId) {
        return false;
    }

    try {
        const likeId = `${contentId}_${userId}`;
        const likeRef = doc(db, 'likes', likeId);
        const likeDoc = await getDoc(likeRef);
        return likeDoc.exists();
    } catch (error) {
        console.error('Erro ao verificar curtida:', error);
        return false;
    }
}

export async function getLikesCount(contentId) {
    if (!contentId) {
        return 0;
    }

    try {
        const contentRef = doc(db, 'content', contentId);
        const contentDoc = await getDoc(contentRef);

        if (!contentDoc.exists()) {
            return 0;
        }

        return contentDoc.data().likesCount || 0;
    } catch (error) {
        console.error('Erro ao buscar contagem de curtidas:', error);
        return 0;
    }
}

export async function getUserLikes(userId, limit = 50) {
    if (!userId) {
        return [];
    }

    try {
        const { collection, query, where, getDocs, orderBy, limit: limitQuery } = await import('firebase/firestore');
        const q = query(
            collection(db, 'likes'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limitQuery(limit)
        );
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Erro ao buscar curtidas do usuário:', error);
        throw error;
    }
}

export async function getMostLikedContent(category = null, limit = 10) {
    try {
        const { collection, query, where, getDocs, orderBy, limit: limitQuery } = await import('firebase/firestore');
        
        let q;
        if (category) {
            q = query(
                collection(db, 'content'),
                where('category', '==', category),
                orderBy('likesCount', 'desc'),
                limitQuery(limit)
            );
        } else {
            q = query(
                collection(db, 'content'),
                orderBy('likesCount', 'desc'),
                limitQuery(limit)
            );
        }
        
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Erro ao buscar conteúdo mais curtido:', error);
        throw error;
    }
}
