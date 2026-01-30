import { 
    collection, 
    getDocs, 
    doc, 
    getDoc, 
    addDoc, 
    updateDoc, 
    deleteDoc,
    query,
    where,
    serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Busca o fornecedor padrão (O Irmaozinho) ou cria se não existir
 */
export async function getOrCreateDefaultSupplier() {
    try {
        // Buscar fornecedor padrão
        const q = query(
            collection(db, 'suppliers'),
            where('isDefault', '==', true),
            where('active', '==', true)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return {
                id: doc.id,
                ...doc.data()
            };
        }

        // Se não existe, criar fornecedor padrão
        const defaultSupplier = {
            name: 'O Irmaozinho',
            email: 'contato@oirmaozinho.com',
            phone: '',
            type: 'own',
            isDefault: true,
            orderMethod: 'direct_sale',
            orderEmail: '',
            orderEmailTemplate: '',
            commissionRate: 0,
            paymentMethod: 'none',
            bankAccount: null,
            verified: true,
            active: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'suppliers'), defaultSupplier);
        return {
            id: docRef.id,
            ...defaultSupplier
        };
    } catch (error) {
        console.error('Erro ao buscar/criar fornecedor padrão:', error);
        throw error;
    }
}

export async function getAllSuppliers(activeOnly = true) {
    try {
        let q;
        
        if (activeOnly) {
            q = query(collection(db, 'suppliers'), where('active', '==', true));
        } else {
            q = collection(db, 'suppliers');
        }
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Erro ao buscar fornecedores:', error);
        throw error;
    }
}

export async function getSupplier(id) {
    try {
        const docRef = doc(db, 'suppliers', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            };
        }
        
        return null;
    } catch (error) {
        console.error('Erro ao buscar fornecedor:', error);
        throw error;
    }
}

export async function createSupplier(supplierData) {
    try {
        const data = {
            ...supplierData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(db, 'suppliers'), data);
        return docRef.id;
    } catch (error) {
        console.error('Erro ao criar fornecedor:', error);
        throw error;
    }
}

export async function updateSupplier(id, supplierData) {
    try {
        const data = {
            ...supplierData,
            updatedAt: serverTimestamp()
        };
        
        delete data.createdAt;
        delete data.id;
        
        const docRef = doc(db, 'suppliers', id);
        await updateDoc(docRef, data);
    } catch (error) {
        console.error('Erro ao atualizar fornecedor:', error);
        throw error;
    }
}

export async function deleteSupplier(id) {
    try {
        const docRef = doc(db, 'suppliers', id);
        await updateDoc(docRef, {
            active: false,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Erro ao deletar fornecedor:', error);
        throw error;
    }
}

