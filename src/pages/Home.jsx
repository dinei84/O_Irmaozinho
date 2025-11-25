import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardBody } from '../components/ui/Card';

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
            // Get the 4 most recent articles (1 for featured + 3 for latest)
            const q = query(
                collection(db, 'content'),
                orderBy('createdAt', 'desc'),
                limit(4)
            );
            const querySnapshot = await getDocs(q);
            const articles = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            if (articles.length > 0) {
                setFeaturedArticle(articles[0]); // First one is featured
                setLatestArticles(articles.slice(1, 4)); // Next 3 are latest
            }
        } catch (err) {
            console.error('Error fetching articles:', err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="pt-20">
            {/* Hero Section */}
            <section className="relative min-h-[80vh] flex items-center bg-gradient-to-b from-background to-white overflow-hidden">
                <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="z-10"
                    >
                        <h1 className="text-4xl md:text-6xl font-heading font-bold text-secondary leading-tight mb-6">
                            Bem-vindo ao <br />
                            <span className="text-primary">O Irmãozinho</span>
                        </h1>
                        <p className="text-lg md:text-xl text-text-secondary mb-8 leading-relaxed max-w-lg">
                            Compartilhando artigos, vídeos e reflexões sobre a vida Cristã.
                            Uma jornada de fé, esperança e alegria para inspirar seu crescimento espiritual.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button to="/artigos" variant="primary">
                                Leia o Artigo em Destaque
                            </Button>
                            <Button to="/sobre" variant="outline">
                                Conheça Nossa História
                            </Button>
                        </div>
                    </motion.div>

                    {/* Hero Image */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative z-10 flex justify-center"
                    >
                        <div className="relative w-full max-w-md aspect-square rounded-full bg-secondary/5 p-8">
                            <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/20 animate-spin-slow"></div>
                            <img
                                src="/assets/images/Podcast.png"
                                alt="Fé e Comunidade"
                                className="w-full h-full object-cover rounded-full shadow-2xl"
                                onError={(e) => { e.target.src = 'https://placehold.co/600x600?text=O+Irmaozinho' }}
                            />
                        </div>
                    </motion.div>
                </div>

                {/* Background Elements */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 transform origin-top-right"></div>
            </section>

            {/* Featured Article */}
            <section className="py-24 bg-gradient-to-b from-white to-background">
                <div className="container mx-auto px-4">
                    {/* Animated Title */}
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <motion.div
                            className="inline-flex items-center gap-3 mb-4"
                            animate={{
                                scale: [1, 1.05, 1],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatType: "reverse"
                            }}
                        >
                            <Sparkles className="text-primary" size={32} />
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-secondary">
                                Artigo em Destaque
                            </h2>
                            <Sparkles className="text-primary" size={32} />
                        </motion.div>
                        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                            Reflexão especial para fortalecer sua caminhada de fé
                        </p>
                    </motion.div>

                    {/* Featured Article Card */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : featuredArticle ? (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                        >
                            <Card className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-0 overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow duration-500">
                                <div className="lg:col-span-2 h-80 lg:h-auto relative overflow-hidden">
                                    <motion.img
                                        src={featuredArticle.imageUrl || 'https://placehold.co/800x600?text=Artigo+Destaque'}
                                        alt={featuredArticle.title}
                                        className="absolute inset-0 w-full h-full object-cover"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.5 }}
                                        onError={(e) => { e.target.src = 'https://placehold.co/800x600?text=Artigo+Destaque' }}
                                    />
                                    <div className="absolute top-4 left-4">
                                        <motion.span
                                            className="bg-primary text-white px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2 shadow-lg"
                                            animate={{
                                                y: [0, -5, 0],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                repeatType: "reverse"
                                            }}
                                        >
                                            <Star size={16} className="fill-white" />
                                            NOVO
                                        </motion.span>
                                    </div>
                                </div>
                                <CardBody className="lg:col-span-3 flex flex-col justify-center p-10 md:p-14">
                                    <div className="flex items-center gap-4 text-sm text-text-secondary mb-6">
                                        <span className="bg-primary/10 text-primary px-4 py-2 rounded-full font-semibold">
                                            {featuredArticle.category || 'Artigo'}
                                        </span>
                                        {featuredArticle.createdAt && (
                                            <span className="flex items-center gap-2">
                                                {new Date(featuredArticle.createdAt.seconds * 1000).toLocaleDateString('pt-BR')}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-3xl md:text-4xl font-heading font-bold text-secondary mb-6 leading-tight">
                                        {featuredArticle.title}
                                    </h3>
                                    <p className="text-text-secondary text-lg mb-10 leading-relaxed line-clamp-4">
                                        {featuredArticle.body}
                                    </p>
                                    <Button
                                        to={`/${featuredArticle.category === 'Crônicas' ? 'cronica' : 'artigo'}/${featuredArticle.id}`}
                                        variant="secondary"
                                        className="self-start text-lg px-8 py-4"
                                    >
                                        Ler Artigo Completo <ArrowRight size={20} className="ml-2" />
                                    </Button>
                                </CardBody>
                            </Card>
                        </motion.div>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-text-secondary text-lg">Nenhum artigo publicado ainda.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Latest Content Preview */}
            <section className="py-20 bg-background">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl font-heading font-bold text-secondary mb-2">Últimos Conteúdos</h2>
                            <p className="text-text-secondary">Artigos e crônicas recentes</p>
                        </div>
                        <Button to="/artigos" variant="ghost" className="hidden md:inline-flex">
                            Ver Todos <ArrowRight size={18} className="ml-2" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {latestArticles.map((article) => (
                            <Card key={article.id} className="flex flex-col h-full">
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
                                    <Button
                                        to={`/${article.category === 'Crônicas' ? 'cronica' : 'artigo'}/${article.id}`}
                                        variant="ghost"
                                        className="pl-0 hover:bg-transparent hover:text-primary-dark text-sm inline-flex items-center"
                                    >
                                        Ler mais <ArrowRight size={16} className="ml-1" />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <div className="mt-8 text-center md:hidden">
                        <Button to="/artigos" variant="outline" className="w-full">
                            Ver Todos os Artigos
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
