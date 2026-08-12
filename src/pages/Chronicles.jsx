import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'framer-motion';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import LikeButton from '../components/features/likes/LikeButton';
import { ArrowRight, Star } from 'lucide-react';
import { stripHtml } from '../lib/stringUtils';

const Chronicles = () => {
    const [chronicles, setChronicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [featuredChronicle, setFeaturedChronicle] = useState(null);

    useEffect(() => {
        fetchChronicles();
    }, []);

    async function fetchChronicles() {
        try {
            setLoading(true);
            const q = query(
                collection(db, 'content'),
                where('category', '==', 'Crônicas'),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            const chroniclesData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Set the newest chronicle as featured
            if (chroniclesData.length > 0) {
                setFeaturedChronicle(chroniclesData[0]);
                setChronicles(chroniclesData.slice(1)); // Rest of the chronicles
            }
        } catch (err) {
            console.error('Error fetching chronicles:', err);
        } finally {
            setLoading(false);
        }
    }

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const seconds = timestamp.seconds || timestamp._seconds || timestamp;
        return new Date(seconds * 1000).toLocaleDateString('pt-BR');
    };

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
                    <h1 className="text-4xl font-heading font-bold text-secondary mb-4">Crônicas</h1>
                    <p className="text-text-secondary max-w-2xl mx-auto">
                        Histórias e reflexões do cotidiano cristão.
                    </p>
                </div>

                {/* Featured Chronicle */}
                {featuredChronicle && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-16"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Star className="text-primary fill-primary" size={24} />
                            <h2 className="text-2xl font-heading font-bold text-secondary">Crônica em Destaque</h2>
                        </div>
                        <Card className="grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden">
                            {featuredChronicle.imageUrl && (
                                <div className="h-64 md:h-auto relative overflow-hidden">
                                    <img
                                        src={featuredChronicle.imageUrl}
                                        alt={featuredChronicle.title}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                        onError={(e) => { e.target.src = 'https://placehold.co/800x600?text=Crônica+Destaque' }}
                                    />
                                </div>
                            )}
                            <CardBody className="flex flex-col justify-center p-8 md:p-12">
                                <div className="flex items-center gap-4 text-sm text-text-secondary mb-4">
                                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                                        <Star size={14} className="fill-primary" />
                                        Novo
                                    </span>
                                    {featuredChronicle.createdAt && (
                                        <span>
                                            {new Date(featuredChronicle.createdAt.seconds * 1000).toLocaleDateString('pt-BR')}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-2xl md:text-3xl font-heading font-bold text-secondary mb-4">
                                    {featuredChronicle.title}
                                </h3>
                                <p className="text-text-secondary mb-6 leading-relaxed line-clamp-4">
                                    {stripHtml(featuredChronicle.body)}
                                </p>
                                <div className="flex items-center justify-between gap-4">
                                    <Button to={`/cronica/${featuredChronicle.id}`} variant="secondary" className="self-start">
                                        Ler Crônica Completa <ArrowRight size={18} className="ml-2" />
                                    </Button>
                                    <LikeButton
                                        contentId={featuredChronicle.id}
                                        initialLikesCount={featuredChronicle.likesCount || 0}
                                        className="flex-shrink-0"
                                    />
                                </div>
                            </CardBody>
                        </Card>
                    </motion.div>
                )}

                {/* Other Chronicles */}
                {chronicles.length > 0 && (
                    <>
                        <h2 className="text-2xl font-heading font-bold text-secondary mb-8">Todas as Crônicas</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {chronicles.map((chronicle, index) => (
                                <motion.div
                                    key={chronicle.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <Card className="flex flex-col h-full group">
                                        <div className="relative aspect-[16/9] overflow-hidden">
                                            <img
                                                src={chronicle.imageUrl || 'https://placehold.co/800x450?text=O+Irmaozinho'}
                                                alt={chronicle.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                onError={(e) => { e.target.src = 'https://placehold.co/800x450?text=O+Irmaozinho' }}
                                            />
                                        </div>
                                        <CardBody className="flex flex-col flex-grow gap-3">
                                            <div className="flex items-center gap-3">
                                                <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#EDE1CD] text-[#8A5A2E]">
                                                    {chronicle.category || 'Crônica'}
                                                </span>
                                                {chronicle.createdAt && (
                                                    <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                                                        {formatDate(chronicle.createdAt)}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-xl font-heading font-bold text-secondary leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200">
                                                {chronicle.title}
                                            </h3>
                                            <p className="text-sm text-text-secondary leading-relaxed line-clamp-3 flex-grow">
                                                {stripHtml(chronicle.body)}
                                            </p>
                                        </CardBody>
                                        <div className="px-6 pb-5 pt-0 flex items-center justify-between gap-4">
                                            <Button
                                                to={`/cronica/${chronicle.id}`}
                                                variant="ghost"
                                                className="pl-0 text-sm gap-1.5 group/btn"
                                            >
                                                Ler mais
                                                <ArrowRight size={15} className="transition-transform duration-200 group-hover/btn:translate-x-1" />
                                            </Button>
                                            <LikeButton
                                                contentId={chronicle.id}
                                                initialLikesCount={chronicle.likesCount || 0}
                                                className="flex-shrink-0"
                                            />
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </>
                )}

                {/* Empty State */}
                {!featuredChronicle && chronicles.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-text-secondary text-lg">Nenhuma crônica publicada ainda.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chronicles;
