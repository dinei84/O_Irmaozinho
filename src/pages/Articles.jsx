import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'framer-motion';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ArrowRight, Star } from 'lucide-react';

const Articles = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [featuredArticle, setFeaturedArticle] = useState(null);

    useEffect(() => {
        fetchArticles();
    }, []);

    async function fetchArticles() {
        try {
            setLoading(true);
            const q = query(
                collection(db, 'content'),
                where('category', '==', 'Artigos'),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            const articlesData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Set the newest article as featured
            if (articlesData.length > 0) {
                setFeaturedArticle(articlesData[0]);
                setArticles(articlesData.slice(1)); // Rest of the articles
            }
        } catch (err) {
            console.error('Error fetching articles:', err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="pt-24 pb-16 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-heading font-bold text-secondary mb-4">Artigos</h1>
                    <p className="text-text-secondary max-w-2xl mx-auto">
                        Conteúdo para edificar sua fé e inspirar seu dia a dia.
                    </p>
                </div>

                {/* Featured Article */}
                {featuredArticle && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-16"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Star className="text-primary fill-primary" size={24} />
                            <h2 className="text-2xl font-heading font-bold text-secondary">Artigo em Destaque</h2>
                        </div>
                        <Card className="grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden">
                            {featuredArticle.imageUrl && (
                                <div className="h-64 md:h-auto relative overflow-hidden">
                                    <img
                                        src={featuredArticle.imageUrl}
                                        alt={featuredArticle.title}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                        onError={(e) => { e.target.src = 'https://placehold.co/800x600?text=Artigo+Destaque' }}
                                    />
                                </div>
                            )}
                            <CardBody className="flex flex-col justify-center p-8 md:p-12">
                                <div className="flex items-center gap-4 text-sm text-text-secondary mb-4">
                                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                                        <Star size={14} className="fill-primary" />
                                        Novo
                                    </span>
                                    {featuredArticle.createdAt && (
                                        <span>
                                            {new Date(featuredArticle.createdAt.seconds * 1000).toLocaleDateString('pt-BR')}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-2xl md:text-3xl font-heading font-bold text-secondary mb-4">
                                    {featuredArticle.title}
                                </h3>
                                <p className="text-text-secondary mb-8 leading-relaxed line-clamp-4">
                                    {featuredArticle.body}
                                </p>
                                <Button to={`/artigo/${featuredArticle.id}`} variant="secondary" className="self-start">
                                    Ler Artigo Completo <ArrowRight size={18} className="ml-2" />
                                </Button>
                            </CardBody>
                        </Card>
                    </motion.div>
                )}

                {/* Other Articles */}
                {articles.length > 0 && (
                    <>
                        <h2 className="text-2xl font-heading font-bold text-secondary mb-8">Todos os Artigos</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {articles.map((article) => (
                                <motion.div
                                    key={article.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <Card className="flex flex-col h-full">
                                        {article.imageUrl && (
                                            <div className="h-48 overflow-hidden">
                                                <img
                                                    src={article.imageUrl}
                                                    alt={article.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                                    onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=Artigo' }}
                                                />
                                            </div>
                                        )}
                                        <CardBody className="flex-grow">
                                            <div className="text-xs text-primary font-semibold mb-2">
                                                {article.category?.toUpperCase() || 'ARTIGO'}
                                            </div>
                                            <h3 className="text-xl font-heading font-bold text-secondary mb-3">
                                                {article.title}
                                            </h3>
                                            <p className="text-text-secondary text-sm line-clamp-3">
                                                {article.body}
                                            </p>
                                        </CardBody>
                                        <div className="p-6 pt-0 mt-auto">
                                            <Button to={`/artigo/${article.id}`} variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary-dark">
                                                Ler mais <ArrowRight size={16} className="ml-1" />
                                            </Button>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </>
                )}

                {/* Empty State */}
                {!featuredArticle && articles.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-text-secondary text-lg">Nenhum artigo publicado ainda.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Articles;
