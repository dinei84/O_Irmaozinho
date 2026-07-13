import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, addDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { validateArticle, normalizeArticle } from '../../lib/validators';
import { sanitizeArticleHtml, stripHtml } from '../../lib/sanitize';
import { logArticleAction, AUDIT_ACTIONS } from '../../services/auditService';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, AlertCircle, Image as ImageIcon, Bold, Italic, Underline } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card, { CardBody } from '../../components/ui/Card';

const ArticleEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser, isAdmin, userRole } = useAuth();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        title: '',
        imageUrl: '',
        category: 'Artigos',
        body: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [validationErrors, setValidationErrors] = useState([]);
    const editorRef = useRef(null);

    useEffect(() => {
        if (isEditMode) {
            fetchArticle();
        }
    }, [id]);

    // Atualizar conteúdo do editor quando formData.body mudar (ao carregar artigo)
    useEffect(() => {
        if (editorRef.current && formData.body !== undefined) {
            // Sanitiza antes de injetar: um artigo salvo antes desta correção pode
            // conter HTML malicioso, e o editor é aberto pelo admin (V-04).
            const safeBody = sanitizeArticleHtml(formData.body);
            // Só atualiza se o conteúdo for diferente (evita loop)
            if (editorRef.current.innerHTML !== safeBody) {
                editorRef.current.innerHTML = safeBody;
            }
        }
    }, [formData.body]);

    async function fetchArticle() {
        try {
            setLoading(true);
            const docRef = doc(db, 'content', id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setFormData(docSnap.data());
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

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    /**
     * Handler para mudanças no editor contentEditable
     */
    function handleEditorChange() {
        if (editorRef.current) {
            // Sanitiza na escrita também (defesa em profundidade): o que for salvo no
            // Firestore já sai limpo, além de ser sanitizado de novo na leitura.
            const htmlContent = sanitizeArticleHtml(editorRef.current.innerHTML);
            // Ensure we're not storing just whitespace or empty tags
            const cleanContent = htmlContent.replace(/<[^>]*>/g, '').trim() === '' ? '' : htmlContent;
            setFormData(prev => ({
                ...prev,
                body: cleanContent
            }));
        }
    }

    /**
     * Handler para eventos de colar no editor.
     * Preserva a formatação básica (negrito, itálico, listas) e descarta tudo que
     * for executável — a sanitização é delegada ao DOMPurify (lib/sanitize.js).
     */
    function handleEditorPaste(e) {
        e.preventDefault();

        const pastedData = e.clipboardData || window.clipboardData;
        const htmlData = pastedData.getData('text/html');
        const plainText = pastedData.getData('text/plain');

        if (htmlData) {
            document.execCommand('insertHTML', false, sanitizeArticleHtml(htmlData));
        } else if (plainText) {
            // Sem HTML: insere como texto plano, escapando o conteúdo
            const escaped = stripHtml(plainText);
            const formattedText = escaped
                .replace(/\r\n/g, '<br>')
                .replace(/\n/g, '<br>')
                .replace(/\r/g, '<br>');
            document.execCommand('insertHTML', false, formattedText);
        }

        setTimeout(handleEditorChange, 0);
    }

    /**
     * Funções para formatação de texto
     */
    function formatText(command, value = null) {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        setTimeout(handleEditorChange, 0);
    }

    function handleFormatButton(command) {
        formatText(command);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSuccess('');
        setValidationErrors([]);

        // Garantir que o conteúdo do editor está sincronizado (e sanitizado)
        if (editorRef.current) {
            const htmlContent = sanitizeArticleHtml(editorRef.current.innerHTML);
            // Ensure we're not storing just whitespace or empty tags
            const cleanContent = htmlContent.replace(/<[^>]*>/g, '').trim() === '' ? '' : htmlContent;
            formData.body = cleanContent;
        }

        // Validação client-side
        const normalized = normalizeArticle(formData);
        const validation = validateArticle(normalized);

        if (!validation.valid) {
            setValidationErrors(validation.errors);
            setError('Por favor, corrija os erros no formulário.');
            return;
        }

        try {
            setLoading(true);
            const articleData = {
                ...normalized,
                updatedAt: serverTimestamp()
            };
            if (isEditMode) {
                // Update existing article
                const docRef = doc(db, 'content', id);
                await updateDoc(docRef, articleData);

                // Log de auditoria
                if (currentUser) {
                    await logArticleAction(
                        AUDIT_ACTIONS.ARTICLE_UPDATED,
                        currentUser.uid,
                        id,
                        { title: normalized.title }
                    );
                }

                setSuccess('Artigo atualizado com sucesso!');
            } else {
                // Create new article
                const docRef = await addDoc(collection(db, 'content'), {
                    ...articleData,
                    createdAt: serverTimestamp()
                });

                // Log de auditoria
                if (currentUser) {
                    await logArticleAction(
                        AUDIT_ACTIONS.ARTICLE_CREATED,
                        currentUser.uid,
                        docRef.id,
                        { title: normalized.title }
                    );
                }

                setSuccess('Artigo criado com sucesso!');
            }

            setTimeout(() => {
                navigate('/admin');
            }, 1500);
        } catch (err) {
            console.error('Error saving article:', err);

            // Mensagens de erro mais específicas
            if (err.code === 'permission-denied') {
                setError('Você não tem permissão para realizar esta ação.');
            } else if (err.code === 'unauthenticated') {
                setError('Você precisa estar autenticado para realizar esta ação.');
            } else {
                setError('Erro ao salvar artigo. Verifique as permissões do Firestore.');
            }
        } finally {
            setLoading(false);
        }
    }

    if (loading && isEditMode) {
        return (
            <div className="min-h-screen bg-background flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-20 px-4">
            <div className="container mx-auto max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        to="/admin"
                        variant="ghost"
                        className="mb-4 flex items-center gap-2"
                    >
                        <ArrowLeft size={20} />
                        Voltar ao Dashboard
                    </Button>
                    <h1 className="text-4xl font-heading font-bold text-secondary">
                        {isEditMode ? 'Editar Artigo' : 'Novo Artigo'}
                    </h1>
                </div>

                {/* Messages */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6"
                    >
                        <div className="flex items-start gap-3">
                            <AlertCircle className="text-red-500" size={20} />
                            <div className="flex-1">
                                <p className="text-red-700 text-sm font-semibold">{error}</p>
                                {validationErrors.length > 0 && (
                                    <ul className="mt-2 list-disc list-inside">
                                        {validationErrors.map((err, index) => (
                                            <li key={index} className="text-red-600 text-xs">
                                                {err}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {success && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-center gap-3 mb-6"
                    >
                        <AlertCircle className="text-green-500" size={20} />
                        <p className="text-green-700 text-sm">{success}</p>
                    </motion.div>
                )}

                {/* Form */}
                <Card>
                    <CardBody className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title */}
                            <div>
                                <label htmlFor="title" className="block text-sm font-semibold text-secondary mb-2">
                                    Título *
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                    placeholder="Digite o título do artigo"
                                    required
                                />
                            </div>

                            {/* Image URL */}
                            <div>
                                <label htmlFor="imageUrl" className="block text-sm font-semibold text-secondary mb-2">
                                    URL da Imagem
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <ImageIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="url"
                                        id="imageUrl"
                                        name="imageUrl"
                                        value={formData.imageUrl}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                        placeholder="https://exemplo.com/imagem.jpg"
                                    />
                                </div>
                                {formData.imageUrl && (
                                    <div className="mt-3">
                                        <img
                                            src={formData.imageUrl}
                                            alt="Preview"
                                            className="w-full max-w-md h-48 object-cover rounded-lg"
                                            onError={(e) => {
                                                e.target.src = 'https://placehold.co/600x400?text=Imagem+Inválida';
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Category */}
                            <div>
                                <label htmlFor="category" className="block text-sm font-semibold text-secondary mb-2">
                                    Categoria
                                </label>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                >
                                    <option value="">Selecione uma categoria</option>
                                    <option value="Artigos">Artigos</option>
                                    <option value="Crônicas">Crônicas</option>
                                </select>
                            </div>

                            {/* Content */}
                            <div>
                                <label htmlFor="body" className="block text-sm font-semibold text-secondary mb-2">
                                    Conteúdo *
                                </label>

                                {/* Toolbar de formatação */}
                                <div className="flex items-center gap-2 p-2 border border-gray-300 border-b-0 rounded-t-xl bg-gray-50">
                                    <button
                                        type="button"
                                        onClick={() => handleFormatButton('bold')}
                                        className="p-2 rounded hover:bg-gray-200 transition-colors"
                                        title="Negrito (Ctrl+B)"
                                        onMouseDown={(e) => e.preventDefault()}
                                    >
                                        <Bold size={18} className="text-gray-700" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleFormatButton('italic')}
                                        className="p-2 rounded hover:bg-gray-200 transition-colors"
                                        title="Itálico (Ctrl+I)"
                                        onMouseDown={(e) => e.preventDefault()}
                                    >
                                        <Italic size={18} className="text-gray-700" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleFormatButton('underline')}
                                        className="p-2 rounded hover:bg-gray-200 transition-colors"
                                        title="Sublinhado (Ctrl+U)"
                                        onMouseDown={(e) => e.preventDefault()}
                                    >
                                        <Underline size={18} className="text-gray-700" />
                                    </button>
                                    <div className="flex-1"></div>
                                    <span className="text-xs text-gray-500">
                                        Atalhos: <kbd className="px-1 py-0.5 bg-white border rounded">Ctrl+B</kbd> Negrito |
                                        <kbd className="px-1 py-0.5 bg-white border rounded ml-1">Ctrl+I</kbd> Itálico
                                    </span>
                                </div>

                                {/* Editor contentEditable */}
                                <div
                                    ref={editorRef}
                                    contentEditable
                                    id="body"
                                    onInput={handleEditorChange}
                                    onPaste={handleEditorPaste}
                                    className="w-full min-h-[300px] px-4 py-3 border border-gray-300 rounded-b-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all font-sans bg-white"
                                    style={{
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                        overflowWrap: 'break-word'
                                    }}
                                    data-placeholder="Digite o conteúdo do artigo..."
                                    suppressContentEditableWarning={true}
                                />

                                {/* Estilo para placeholder */}
                                <style>{`
                                    [contenteditable][data-placeholder]:empty:before {
                                        content: attr(data-placeholder);
                                        color: #9ca3af;
                                        pointer-events: none;
                                    }
                                `}</style>

                                <p className="mt-2 text-sm text-text-secondary">
                                    {formData.body ? formData.body.replace(/<[^>]*>/g, '').length : 0} caracteres (sem HTML)
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="flex items-center gap-2"
                                    disabled={loading}
                                >
                                    <Save size={20} />
                                    {loading ? 'Salvando...' : (isEditMode ? 'Atualizar Artigo' : 'Criar Artigo')}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/admin')}
                                    disabled={loading}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
};

export default ArticleEditor;
