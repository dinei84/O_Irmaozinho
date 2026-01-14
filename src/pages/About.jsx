import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
    return (
        <div className="pt-24 pb-16 container mx-auto px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto"
            >
                <h1 className="text-4xl font-heading font-bold text-secondary mb-8 text-center">Sobre O Irmãozinho</h1>

                <div className="prose prose-lg mx-auto text-text-secondary">
                    <p className="mb-6">
                        O Irmãozinho nasceu do desejo de compartilhar a mensagem do Evangelho de uma forma
                        leve, moderna e acessível. Acreditamos que a vida cristã é uma jornada de alegria,
                        esperança e constante aprendizado.
                    </p>

                    <h2 className="text-2xl font-heading font-bold text-secondary mt-12 mb-4">Nossa Missão</h2>
                    <p className="mb-6">
                        Inspirar e edificar vidas através de conteúdos que conectam a fé bíblica com os
                        desafios e oportunidades do mundo contemporâneo.
                    </p>

                    <h2 className="text-2xl font-heading font-bold text-secondary mt-12 mb-4">O Que Acreditamos</h2>
                    <ul className="list-disc pl-6 space-y-2 mb-6">
                        <li>Na Bíblia como a Palavra de Deus.</li>
                        <li>Na graça salvadora de Jesus Cristo.</li>
                        <li>Na importância da comunidade e do amor ao próximo.</li>
                    </ul>
                </div>
            </motion.div>
        </div>
    );
};

export default About;
