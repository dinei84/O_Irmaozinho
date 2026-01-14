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
 * Busca todos os fornecedores
 * @param {boolean} activeOnly - Se true, retorna apenas fornecedores ativos
 * @returns {Promise<Array>}
 */
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

/**
 * Busca um fornecedor por ID
 * @param {string} id - ID do fornecedor
 * @returns {Promise<Object|null>}
 */
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

/**
 * Cria um novo fornecedor
 * @param {Object} supplierData - Dados do fornecedor
 * @returns {Promise<string>} - ID do fornecedor criado
 */
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

/**
 * Atualiza um fornecedor
 * @param {string} id - ID do fornecedor
 * @param {Object} supplierData - Dados atualizados
 * @returns {Promise<void>}
 */
export async function updateSupplier(id, supplierData) {
    try {
        const data = {
            ...supplierData,
            updatedAt: serverTimestamp()
        };
        
        // Remove campos que não devem ser atualizados
        delete data.createdAt;
        delete data.id;
        
        const docRef = doc(db, 'suppliers', id);
        await updateDoc(docRef, data);
    } catch (error) {
        console.error('Erro ao atualizar fornecedor:', error);
        throw error;
    }
}

/**
 * Deleta um fornecedor (soft delete - marca como inativo)
 * @param {string} id - ID do fornecedor
 * @returns {Promise<void>}
 */
export async function deleteSupplier(id) {
    try {
        // Soft delete - marca como inativo
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

