import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { logArticleAction, AUDIT_ACTIONS } from '../../services/auditService';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, LogOut, FileText, AlertCircle, Search, Package } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card, { CardBody } from '../../components/ui/Card';

const Dashboard = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const { logout, currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchArticles();
    }, []);

    async function fetchArticles() {
        try {
            setLoading(true);
            const querySnapshot = await getDocs(collection(db, 'content'));
            const articlesData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setArticles(articlesData);
            setError('');
        } catch (err) {
            console.error('Error fetching articles:', err);
            setError('Erro ao carregar artigos. Verifique as permissões do Firestore.');
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id) {
        if (!window.confirm('Tem certeza que deseja deletar este artigo?')) {
            return;
        }

        try {
            // Buscar informações do artigo antes de deletar (para o log)
            const articleRef = doc(db, 'content', id);
            const articleSnap = await getDoc(articleRef);
            const articleData = articleSnap.exists() ? articleSnap.data() : null;

            // Deletar o artigo
            await deleteDoc(articleRef);
            
            // Remover da lista local
            setArticles(articles.filter(article => article.id !== id));

            // Log de auditoria
            if (currentUser) {
                await logArticleAction(
                    AUDIT_ACTIONS.ARTICLE_DELETED,
                    currentUser.uid,
                    id,
                    { title: articleData?.title || 'Artigo desconhecido' }
                );
            }
        } catch (err) {
            console.error('Error deleting article:', err);
            
            // Mensagens de erro mais específicas
            if (err.code === 'permission-denied') {
                alert('Você não tem permissão para deletar este artigo.');
            } else if (err.code === 'unauthenticated') {
                alert('Você precisa estar autenticado para realizar esta ação.');
            } else {
                alert('Erro ao deletar artigo. Tente novamente.');
            }
        }
    }

    async function handleLogout() {
        try {
            await logout();
            navigate('/login');
        } catch (err) {
            console.error('Error logging out:', err);
        }
    }

    // Filter articles based on search query
    const filteredArticles = articles.filter(article => {
        const query = searchQuery.toLowerCase();
        return (
            article.title?.toLowerCase().includes(query) ||
            article.category?.toLowerCase().includes(query) ||
            article.body?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="min-h-screen bg-background py-20 px-4">
            <div className="container mx-auto max-w-7xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-heading font-bold text-secondary mb-2">
                            Dashboard Administrativo
                        </h1>
                        <p className="text-text-secondary">
                            Bem-vindo, {currentUser?.email}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            to="/admin/new"
                            variant="primary"
                            className="flex items-center gap-2"
                        >
                            <Plus size={20} />
                            Novo Artigo
                        </Button>
                        <Button
                            to="/admin/products"
                            variant="secondary"
                            className="flex items-center gap-2"
                        >
                            <Package size={20} />
                            Produtos
                        </Button>
                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <LogOut size={20} />
                            Sair
                        </Button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-center gap-3 mb-6"
                    >
                        <AlertCircle className="text-red-500" size={20} />
                        <p className="text-red-700 text-sm">{error}</p>
                    </motion.div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <Card>
                                <CardBody className="flex items-center gap-4">
                                    <div className="p-3 bg-primary/10 rounded-lg">
                                        <FileText className="text-primary" size={24} />
                                    </div>
                                    <div>
                                        <p className="text-text-secondary text-sm">Total de Artigos</p>
                                        <p className="text-3xl font-bold text-secondary">
                                            {searchQuery ? `${filteredArticles.length} / ${articles.length}` : articles.length}
                                        </p>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>

                        {/* Articles List */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <h2 className="text-2xl font-heading font-bold text-secondary">
                                        Todos os Artigos
                                    </h2>
                                    <div className="relative w-full md:w-96">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Pesquisar por título, categoria ou conteúdo..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {filteredArticles.length === 0 ? (
                                <div className="p-12 text-center">
                                    <FileText className="mx-auto text-gray-300 mb-4" size={48} />
                                    <p className="text-text-secondary">
                                        {searchQuery ? 'Nenhum artigo encontrado para sua pesquisa.' : 'Nenhum artigo encontrado.'}
                                    </p>
                                    <Button to="/admin/new" variant="primary" className="mt-4">
                                        Criar Primeiro Artigo
                                    </Button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Título
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Categoria
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Data
                                                </th>
                                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Ações
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {filteredArticles.map((article) => (
                                                <motion.tr
                                                    key={article.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            {article.imageUrl && (
                                                                <img
                                                                    src={article.imageUrl}
                                                                    alt={article.title}
                                                                    className="w-12 h-12 rounded-lg object-cover"
                                                                    onError={(e) => { e.target.style.display = 'none' }}
                                                                />
                                                            )}
                                                            <div>
                                                                <p className="font-semibold text-secondary">
                                                                    {article.title || 'Sem título'}
                                                                </p>
                                                                <p className="text-sm text-text-secondary line-clamp-1">
                                                                    {article.body?.substring(0, 60)}...
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                                            {article.category || 'Sem categoria'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-text-secondary">
                                                        {article.createdAt ? new Date(article.createdAt.seconds * 1000).toLocaleDateString('pt-BR') : 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Link
                                                                to={`/admin/edit/${article.id}`}
                                                                className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                            >
                                                                <Edit2 size={18} />
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(article.id)}
                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
