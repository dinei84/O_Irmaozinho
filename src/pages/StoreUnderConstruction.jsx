import React from 'react';
import { motion } from 'framer-motion';
import { Hammer, BookOpen, Mail } from 'lucide-react';
import Button from '../components/ui/Button';

/**
 * Página temporária da Loja.
 *
 * A loja está fora do ar enquanto o meio de pagamento é revisto
 * (ver docs/arquitetura/ESTUDO_GATEWAY_ASAAS.md e a OS_PAYMENT_001).
 *
 * PARA REATIVAR A LOJA: em src/App.jsx, volte as rotas /store e /checkout
 * a apontar para <Store /> e <Checkout />. Este arquivo pode então ser
 * removido — `src/pages/Store.jsx` e `src/pages/Checkout.jsx` seguem
 * intactos e não foram alterados.
 */
const StoreUnderConstruction = () => {
    return (
        <div className="pt-24 pb-16 container mx-auto px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto text-center"
            >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-areia mb-8">
                    <Hammer className="w-9 h-9 text-primary" aria-hidden="true" />
                </div>

                <h1 className="text-4xl font-heading font-bold text-secondary mb-5">
                    A Loja está em construção
                </h1>

                <p className="text-lg text-text-secondary mb-4">
                    Estamos preparando a loja com calma e cuidado — especialmente a parte
                    de pagamento, para que sua compra seja simples e segura.
                </p>

                <p className="text-lg text-text-secondary mb-10">
                    Volte em breve. Enquanto isso, os artigos e crônicas continuam
                    por aqui, como sempre.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
                    <Button to="/artigos" variant="primary">
                        <BookOpen className="w-5 h-5 mr-2" aria-hidden="true" />
                        Ler os artigos
                    </Button>
                    <Button to="/cronicas" variant="outline">
                        Ver as crônicas
                    </Button>
                </div>

                <div className="border-t border-borda pt-8">
                    <p className="text-sm text-text-secondary flex items-center justify-center gap-2">
                        <Mail className="w-4 h-4" aria-hidden="true" />
                        Já fez um pedido antes?{' '}
                        <a
                            href="/orders"
                            className="text-primary font-bold hover:text-primary-dark underline underline-offset-4"
                        >
                            Consulte seus pedidos
                        </a>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default StoreUnderConstruction;
