import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Share2, Clock } from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardBody } from '../components/ui/Card';
import LikeButton from '../components/features/likes/LikeButton';
import CommentsSection from '../components/features/comments/CommentsSection';
import TextToSpeechPlayer from '../components/features/textToSpeech/TextToSpeechPlayer';
import HighlightableText from '../components/features/textToSpeech/HighlightableText';

const ReadingProgressBar = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            setProgress(docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-[#E1D2B8]">
            <div
                className="h-full bg-primary transition-all duration-150 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
};

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
            const docRef = doc(db, 'content', id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const articleData = { id: docSnap.id, ...docSnap.data() };
                setArticle(articleData);

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

    const handleShare = useCallback(() => {
        if (navigator.share) {
            navigator.share({
                title: article?.title,
                text: article?.body?.substring(0, 100) + '...',
                url: window.location.href
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    }, [article]);

    const readingTime = article?.body
        ? Math.max(1, Math.ceil(article.body.split(/\s+/).length / 150))
        : 0;

    const articleCategory = article?.category || 'Artigo';

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
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
        <div className="min-h-screen bg-background">
            <ReadingProgressBar />

            <article className="container mx-auto px-4 pt-28 pb-16 max-w-[720px]">
                <Link
                    to={`/${articleCategory === 'Crônicas' ? 'cronicas' : 'artigos'}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors mb-8"
                >
                    <ArrowLeft size={16} />
                    {articleCategory === 'Crônicas' ? 'Crônicas' : 'Artigos'}
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#EDE1CD] text-[#8A5A2E]">
                            {articleCategory}
                        </span>
                        {article.createdAt && (
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                                <Calendar size={13} />
                                {new Date(article.createdAt.seconds * 1000).toLocaleDateString('pt-BR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </span>
                        )}
                    </div>

                    <h1 className="text-4xl md:text-[56px] font-heading font-extrabold text-secondary leading-[1.08] -tracking-[0.02em] mb-6">
                        {article.title}
                    </h1>

                    <div className="flex items-center justify-between gap-4 mb-8 pb-6 border-b border-borda">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-background text-sm font-bold">
                                {(article.authorName || 'O Irmãozinho').charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-secondary">
                                    {article.authorName || 'O Irmãozinho'}
                                </p>
                                <p className="text-xs text-text-secondary flex items-center gap-1">
                                    <Clock size={12} />
                                    {readingTime} min de leitura
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleShare}
                                className="p-2 text-text-secondary hover:text-primary transition-colors rounded-full hover:bg-primary/10"
                                aria-label="Compartilhar"
                            >
                                <Share2 size={20} />
                            </button>
                            <LikeButton
                                contentId={article.id}
                                initialLikesCount={article.likesCount || 0}
                            />
                        </div>
                    </div>

                    <div className="mb-8">
                        <TextToSpeechPlayer
                            text={article.body}
                            title={article.title}
                        />
                    </div>

                    {article.imageUrl && (
                        <div className="mb-10 rounded-2xl overflow-hidden bg-areia">
                            <img
                                src={article.imageUrl}
                                alt={article.title}
                                className="w-full aspect-[16/9] object-cover"
                                onError={(e) => { e.target.style.display = 'none' }}
                            />
                        </div>
                    )}

                    <div className="article-body text-lg leading-[1.75] text-text-primary space-y-6 mb-10">
                        <HighlightableText
                            text={article.body}
                            className="text-text-primary leading-relaxed"
                        />
                    </div>
                </motion.div>

                <div className="border-t border-borda my-12" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mb-12"
                >
                    <CommentsSection articleId={article.id} />
                </motion.div>

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
                                    className="flex flex-col h-full cursor-pointer"
                                    onClick={() => navigate(`/${related.category === 'Crônicas' ? 'cronica' : 'artigo'}/${related.id}`)}
                                >
                                    {related.imageUrl && (
                                        <div className="aspect-[16/9] overflow-hidden">
                                            <img
                                                src={related.imageUrl}
                                                alt={related.title}
                                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                                onError={(e) => { e.target.src = 'https://placehold.co/800x450?text=Artigo' }}
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
