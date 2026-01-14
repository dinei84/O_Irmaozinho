import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'framer-motion';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ArrowRight, Star } from 'lucide-react';

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
                                <p className="text-text-secondary mb-8 leading-relaxed line-clamp-4">
                                    {featuredChronicle.body}
                                </p>
                                <Button to={`/cronica/${featuredChronicle.id}`} variant="secondary" className="self-start">
                                    Ler Crônica Completa <ArrowRight size={18} className="ml-2" />
                                </Button>
                            </CardBody>
                        </Card>
                    </motion.div>
                )}

                {/* Other Chronicles */}
                {chronicles.length > 0 && (
                    <>
                        <h2 className="text-2xl font-heading font-bold text-secondary mb-8">Todas as Crônicas</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {chronicles.map((chronicle) => (
                                <motion.div
                                    key={chronicle.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <Card className="flex flex-col h-full">
                                        {chronicle.imageUrl && (
                                            <div className="h-48 overflow-hidden">
                                                <img
                                                    src={chronicle.imageUrl}
                                                    alt={chronicle.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                                    onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=Crônica' }}
                                                />
                                            </div>
                                        )}
                                        <CardBody className="flex-grow">
                                            <div className="text-xs text-primary font-semibold mb-2">
                                                {chronicle.category?.toUpperCase() || 'CRÔNICA'}
                                            </div>
                                            <h3 className="text-xl font-heading font-bold text-secondary mb-3">
                                                {chronicle.title}
                                            </h3>
                                            <p className="text-text-secondary text-sm line-clamp-3">
                                                {chronicle.body}
                                            </p>
                                        </CardBody>
                                        <div className="p-6 pt-0 mt-auto">
                                            <Button to={`/cronica/${chronicle.id}`} variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary-dark">
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
