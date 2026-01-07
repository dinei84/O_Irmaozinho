import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Tag, Share2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardBody } from '../components/ui/Card';

const ArticleDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [relatedArticles, setRelatedArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchArticle();
    }, [id]);

    async function fetchArticle() {
        try {
            setLoading(true);
            setError('');

            // Fetch the article
            const docRef = doc(db, 'content', id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const articleData = { id: docSnap.id, ...docSnap.data() };
                setArticle(articleData);

                // Fetch related articles (same category, excluding current)
                if (articleData.category) {
                    const q = query(
                        collection(db, 'content'),
                        where('category', '==', articleData.category),
                        orderBy('createdAt', 'desc'),
                        limit(4)
                    );
                    const querySnapshot = await getDocs(q);
                    const related = querySnapshot.docs
                        .map(doc => ({ id: doc.id, ...doc.data() }))
                        .filter(item => item.id !== id)
                        .slice(0, 3);
                    setRelatedArticles(related);
                }
            } else {
                setError('Artigo não encontrado.');
            }
        } catch (err) {
            console.error('Error fetching article:', err);
            setError('Erro ao carregar artigo.');
        } finally {
            setLoading(false);
        }
    }

    function handleShare() {
        if (navigator.share) {
            navigator.share({
                title: article.title,
                text: article.body?.substring(0, 100) + '...',
                url: window.location.href
            }).catch(err => console.log('Error sharing:', err));
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('Link copiado para a área de transferência!');
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4">
                <h1 className="text-3xl font-heading font-bold text-secondary mb-4">
                    {error || 'Artigo não encontrado'}
                </h1>
                <Button onClick={() => navigate(-1)} variant="primary">
                    <ArrowLeft size={20} className="mr-2" />
                    Voltar
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-20 pb-16">
            <article className="container mx-auto px-4 max-w-4xl">
                {/* Back Button */}
                <Button
                    onClick={() => navigate(-1)}
                    variant="ghost"
                    className="mb-6 flex items-center gap-2"
                >
                    <ArrowLeft size={20} />
                    Voltar
                </Button>

                {/* Article Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Category & Date */}
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                        {article.category && (
                            <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-semibold text-sm">
                                <Tag size={16} />
                                {article.category}
                            </span>
                        )}
                        {article.createdAt && (
                            <span className="inline-flex items-center gap-2 text-text-secondary text-sm">
                                <Calendar size={16} />
                                {new Date(article.createdAt.seconds * 1000).toLocaleDateString('pt-BR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl font-heading font-bold text-secondary mb-6 leading-tight">
                        {article.title}
                    </h1>

                    {/* Share Button */}
                    <div className="mb-8">
                        <Button
                            onClick={handleShare}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <Share2 size={18} />
                            Compartilhar
                        </Button>
                    </div>

                    {/* Featured Image */}
                    {article.imageUrl && (
                        <div className="mb-8 rounded-2xl overflow-hidden shadow-xl">
                            <img
                                src={article.imageUrl}
                                alt={article.title}
                                className="w-full h-auto object-cover"
                                onError={(e) => { e.target.style.display = 'none' }}
                            />
                        </div>
                    )}

                    {/* Article Content */}
                    <div className="prose prose-lg max-w-none mb-12">
                        <div className="text-text-primary leading-relaxed whitespace-pre-wrap text-lg">
                            {article.body}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 my-12"></div>
                </motion.div>

                {/* Related Articles */}
                {relatedArticles.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <h2 className="text-2xl font-heading font-bold text-secondary mb-6">
                            Artigos Relacionados
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {relatedArticles.map((related) => (
                                <Card
                                    key={related.id}
                                    className="flex flex-col h-full cursor-pointer hover:shadow-xl transition-shadow"
                                    onClick={() => navigate(`/${related.category === 'Crônicas' ? 'cronica' : 'artigo'}/${related.id}`)}
                                >
                                    {related.imageUrl && (
                                        <div className="h-40 overflow-hidden">
                                            <img
                                                src={related.imageUrl}
                                                alt={related.title}
                                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                                onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=Artigo' }}
                                            />
                                        </div>
                                    )}
                                    <CardBody className="flex-grow">
                                        <h3 className="text-lg font-heading font-bold text-secondary mb-2 line-clamp-2">
                                            {related.title}
                                        </h3>
                                        <p className="text-text-secondary text-sm line-clamp-2">
                                            {related.body}
                                        </p>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    </motion.div>
                )}
            </article>
        </div>
    );
};

export default ArticleDetail;
