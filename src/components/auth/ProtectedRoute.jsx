import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { canAccessAdmin } from '../../lib/roles';

/**
 * Componente para proteger rotas que requerem autenticação
 * Por padrão, apenas verifica se o usuário está autenticado
 */
const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { currentUser, isAdmin, loading } = useAuth();

    // Aguarda verificação de autenticação
    if (loading) {
        return (
            <div className="min-h-screen bg-background flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Se não está autenticado, redireciona para login
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    // Se a rota requer admin e o usuário não é admin, redireciona
    if (requireAdmin && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
