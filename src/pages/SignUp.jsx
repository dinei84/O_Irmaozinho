import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Lock, Mail, User, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import { isValidEmail, validatePassword } from '../lib/validators';

const SignUp = () => {
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false,
        newsletter: false,
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { signup, currentUser, userRole, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    // Redirecionar se já estiver logado
    useEffect(() => {
        if (!authLoading && currentUser && userRole !== null) {
            const isUserAdmin = userRole === 'admin';
            if (isUserAdmin) {
                navigate('/admin', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        }
    }, [currentUser, userRole, authLoading, navigate]);

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Limpar erro do campo quando o usuário começar a digitar
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    }

    function validateForm() {
        const newErrors = {};

        // Validação de nome
        if (!formData.displayName || formData.displayName.trim().length === 0) {
            newErrors.displayName = 'Nome é obrigatório';
        } else if (formData.displayName.trim().length < 2) {
            newErrors.displayName = 'Nome deve ter no mínimo 2 caracteres';
        } else if (formData.displayName.length > 100) {
            newErrors.displayName = 'Nome deve ter no máximo 100 caracteres';
        }

        // Validação de email
        if (!formData.email || formData.email.trim().length === 0) {
            newErrors.email = 'Email é obrigatório';
        } else if (!isValidEmail(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        // Validação de senha
        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.valid) {
            newErrors.password = passwordValidation.errors[0];
        }

        // Validação de confirmação de senha
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Confirme sua senha';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'As senhas não coincidem';
        }

        // Validação de termos
        if (!formData.acceptTerms) {
            newErrors.acceptTerms = 'Você deve aceitar os termos de uso';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            setErrors({});

            await signup(formData.email, formData.password, {
                displayName: formData.displayName.trim(),
                preferences: {
                    newsletter: formData.newsletter,
                },
            });

            // O useEffect acima vai cuidar do redirecionamento quando userRole for atualizado
        } catch (err) {
            console.error('❌ Erro no cadastro:', err);
            console.error('Código do erro:', err.code);
            console.error('Mensagem do erro:', err.message);
            console.error('Erro completo:', JSON.stringify(err, null, 2));
            
            let errorMessage = 'Falha ao criar conta. Tente novamente.';

            // Mensagens de erro mais amigáveis
            if (err.code === 'auth/email-already-in-use') {
                errorMessage = 'Este email já está em uso. Faça login ou use outro email.';
            } else if (err.code === 'auth/invalid-email') {
                errorMessage = 'Email inválido. Verifique e tente novamente.';
            } else if (err.code === 'auth/weak-password') {
                errorMessage = 'Senha muito fraca. Use uma senha mais forte.';
            } else if (err.code === 'auth/network-request-failed') {
                errorMessage = 'Erro de conexão. Verifique sua internet.';
            } else if (err.code) {
                errorMessage = `Erro: ${err.code}. ${err.message || 'Tente novamente.'}`;
            }

            setErrors({ submit: errorMessage });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 transform origin-top-right"></div>
                <div className="absolute bottom-0 left-0 w-1/3 h-full bg-secondary/5 -skew-x-12 transform origin-bottom-left"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full space-y-8 relative z-10 bg-white p-8 rounded-2xl shadow-xl"
            >
                <div>
                    <h2 className="mt-6 text-center text-3xl font-heading font-bold text-secondary">
                        Criar Conta
                    </h2>
                    <p className="mt-2 text-center text-sm text-text-secondary">
                        Junte-se ao O Irmãozinho
                    </p>
                </div>

                {errors.submit && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-center gap-3"
                    >
                        <AlertCircle className="text-red-500" size={20} />
                        <p className="text-red-700 text-sm">{errors.submit}</p>
                    </motion.div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Nome */}
                        <div>
                            <label htmlFor="displayName" className="block text-sm font-medium text-secondary mb-1">
                                Nome Completo
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="displayName"
                                    name="displayName"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    className={`appearance-none relative block w-full px-3 py-3 pl-10 border ${
                                        errors.displayName ? 'border-red-500' : 'border-gray-300'
                                    } placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-all`}
                                    placeholder="Seu nome completo"
                                    value={formData.displayName}
                                    onChange={handleChange}
                                />
                            </div>
                            {errors.displayName && (
                                <p className="mt-1 text-sm text-red-600">{errors.displayName}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-secondary mb-1">
                                Endereço de Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className={`appearance-none relative block w-full px-3 py-3 pl-10 border ${
                                        errors.email ? 'border-red-500' : 'border-gray-300'
                                    } placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-all`}
                                    placeholder="seu@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        {/* Senha */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-secondary mb-1">
                                Senha
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    className={`appearance-none relative block w-full px-3 py-3 pl-10 border ${
                                        errors.password ? 'border-red-500' : 'border-gray-300'
                                    } placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-all`}
                                    placeholder="Mínimo 6 caracteres"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>

                        {/* Confirmar Senha */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary mb-1">
                                Confirmar Senha
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    className={`appearance-none relative block w-full px-3 py-3 pl-10 border ${
                                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                    } placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-all`}
                                    placeholder="Digite a senha novamente"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                            )}
                        </div>
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-3">
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="newsletter"
                                    name="newsletter"
                                    type="checkbox"
                                    checked={formData.newsletter}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="newsletter" className="text-text-secondary">
                                    Desejo receber emails com novidades e ofertas especiais
                                </label>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="acceptTerms"
                                    name="acceptTerms"
                                    type="checkbox"
                                    required
                                    checked={formData.acceptTerms}
                                    onChange={handleChange}
                                    className={`h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded ${
                                        errors.acceptTerms ? 'border-red-500' : ''
                                    }`}
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="acceptTerms" className="text-text-secondary">
                                    Aceito os{' '}
                                    <Link to="/termos" className="text-primary hover:underline">
                                        termos de uso
                                    </Link>{' '}
                                    e{' '}
                                    <Link to="/privacidade" className="text-primary hover:underline">
                                        política de privacidade
                                    </Link>
                                </label>
                            </div>
                        </div>
                        {errors.acceptTerms && (
                            <p className="text-sm text-red-600">{errors.acceptTerms}</p>
                        )}
                    </div>

                    <div>
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full flex justify-center"
                            disabled={loading}
                        >
                            {loading ? 'Criando conta...' : 'Criar Conta'}
                            {!loading && <ArrowRight size={18} className="ml-2" />}
                        </Button>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-text-secondary">
                            Já tem uma conta?{' '}
                            <Link to="/login" className="text-primary font-medium hover:underline">
                                Fazer login
                            </Link>
                        </p>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default SignUp;

