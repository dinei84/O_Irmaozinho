import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'framer-motion';
import { ArrowRight, Heart } from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardBody } from '../components/ui/Card';
import { stripHtml } from '../lib/stringUtils';

const Home = () => {
    const [featuredArticle, setFeaturedArticle] = useState(null);
    const [latestArticles, setLatestArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchArticles();
    }, []);

    async function fetchArticles() {
        try {
            setLoading(true);
            const q = query(
                collection(db, 'content'),
                orderBy('createdAt', 'desc'),
                limit(7)
            );
            const querySnapshot = await getDocs(q);
            const articles = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            if (articles.length > 0) {
                setFeaturedArticle(articles[0]);
                setLatestArticles(articles.slice(1));
            }
        } catch (err) {
            console.error('Error fetching articles:', err);
        } finally {
            setLoading(false);
        }
    }

    const getArticleLink = (article) =>
        `/${article.category === 'Crônicas' ? 'cronica' : 'artigo'}/${article.id}`;

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const seconds = timestamp.seconds || timestamp._seconds || timestamp;
        return new Date(seconds * 1000).toLocaleDateString('pt-BR');
    };

    return (
        <div className="pt-24 md:pt-28">
            <section className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[80vh]">
                <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7 }}
                    className="order-2 lg:order-1"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-[#EDE1CD] text-[#8A5A2E] mb-6">
                        fé, esperança e alegria
                    </span>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-secondary leading-[1.08] -tracking-[0.02em] mb-6">
                        Um cantinho de fé<br />
                        <span className="text-primary">para respirar a alma</span>
                    </h1>
                    <p className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-lg mb-8">
                        Reflexões, crônicas e artigos sobre a vida cristã — conteúdo que
                        aquece o coração e fortalece a caminhada.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                            to={featuredArticle ? getArticleLink(featuredArticle) : '/artigos'}
                            variant="primary"
                        >
                            Ler o destaque <ArrowRight size={20} className="ml-2" />
                        </Button>
                        <Button to="/sobre" variant="outline">
                            História
                        </Button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="order-1 lg:order-2 flex justify-center"
                >
                    <div className="relative w-full max-w-lg aspect-square">
                        <div className="absolute inset-4 rounded-full border-2 border-dashed border-primary/20 animate-spin-slow" />
                        <img
                            src="/assets/images/Podcast.png"
                            alt="Fé e Comunidade"
                            className="w-full h-full object-cover rounded-2xl shadow-2xl"
                            fetchPriority="high"
                            onError={(e) => { e.target.src = 'https://placehold.co/600x600?text=O+Irmaozinho' }}
                        />
                    </div>
                </motion.div>
            </section>

            <section className="py-20 md:py-28 bg-background">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12"
                    >
                        <div>
                            <h2 className="text-3xl md:text-4xl font-heading font-bold text-secondary mb-2">
                                Últimos Conteúdos
                            </h2>
                            <p className="text-text-secondary">
                                Artigos e crônicas para fortalecer sua caminhada
                            </p>
                        </div>
                        <Button to="/artigos" variant="ghost" className="hidden md:inline-flex">
                            Ver todos <ArrowRight size={18} className="ml-2" />
                        </Button>
                    </motion.div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                        </div>
                    ) : latestArticles.length === 0 ? (
                        <p className="text-center text-text-secondary py-20">
                            Nenhum conteúdo publicado ainda.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {latestArticles.map((article, index) => (
                                <motion.div
                                    key={article.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <Card className="flex flex-col h-full group">
                                        <div className="relative aspect-[16/9] overflow-hidden">
                                            <img
                                                src={article.imageUrl || 'https://placehold.co/800x450?text=O+Irmaozinho'}
                                                alt={article.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                loading="lazy"
                                                decoding="async"
                                                onError={(e) => { e.target.src = 'https://placehold.co/800x450?text=O+Irmaozinho' }}
                                            />
                                        </div>
                                        <CardBody className="flex flex-col flex-grow gap-3">
                                            <div className="flex items-center gap-3">
                                                <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#EDE1CD] text-[#8A5A2E]">
                                                    {article.category || 'Artigo'}
                                                </span>
                                                {article.createdAt && (
                                                    <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                                                        {formatDate(article.createdAt)}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-xl font-heading font-bold text-secondary leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200">
                                                {article.title}
                                            </h3>
                                            <p className="text-sm text-text-secondary leading-relaxed line-clamp-3 flex-grow">
                                                {stripHtml(article.body)}
                                            </p>
                                        </CardBody>
                                        <div className="px-6 pb-5 pt-0 flex items-center justify-between gap-4">
                                            <Button
                                                to={getArticleLink(article)}
                                                variant="ghost"
                                                className="pl-0 text-sm gap-1.5 group/btn"
                                            >
                                                Ler mais
                                                <ArrowRight size={15} className="transition-transform duration-200 group-hover/btn:translate-x-1" />
                                            </Button>
                                            <div className="flex items-center gap-1.5 text-text-secondary text-sm">
                                                <Heart size={15} className="fill-primary/20 text-primary" />
                                                <span>{article.likesCount || 0}</span>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    <div className="mt-10 text-center md:hidden">
                        <Button to="/artigos" variant="outline" className="w-full">
                            Ver todos os artigos
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
