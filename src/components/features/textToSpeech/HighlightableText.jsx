import React, { useEffect, useRef, useState } from 'react';
import { useTextToSpeech } from '../../../hooks/useTextToSpeech';
import { sanitizeArticleHtml } from '../../../lib/sanitize';

/**
 * Componente que envolve o texto e destaca parágrafos durante a leitura
 * Divide o texto em parágrafos e destaca o atual baseado em estimativa de tempo
 */
const HighlightableText = ({ text, children, className = '' }) => {
    const { isPlaying, rate } = useTextToSpeech();
    const [currentParagraphIndex, setCurrentParagraphIndex] = useState(-1);
    const containerRef = useRef(null);
    const paragraphRefs = useRef([]);
    const timeoutsRef = useRef([]);

    // Dividir texto em parágrafos (usar quebras de linha duplas ou simples)
    const paragraphs = React.useMemo(() => {
        if (!text) return [];
        return text.split(/\n\s*\n|\n+/).filter(p => p.trim().length > 0);
    }, [text]);

    useEffect(() => {
        // Limpar timeouts anteriores
        timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
        timeoutsRef.current = [];

        if (isPlaying && paragraphs.length > 0 && containerRef.current) {
            // Iniciar destaque
            setCurrentParagraphIndex(0);

            // Estimar duração por parágrafo (baseado em ~150 palavras por minuto)
            // Ajustar pela velocidade (rate)
            const wordsPerMinute = 150 * rate;
            const wordsPerSecond = wordsPerMinute / 60;

            // Calcular intervalo entre parágrafos
            const calculateParagraphDuration = (paragraphText) => {
                const wordCount = paragraphText.trim().split(/\s+/).length;
                return Math.max(500, (wordCount / wordsPerSecond) * 1000); // mínimo 500ms
            };

            // Scroll inicial para primeiro parágrafo
            const firstElement = paragraphRefs.current[0] || containerRef.current;
            if (firstElement) {
                firstElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }

            // Configurar intervalos para cada parágrafo
            let accumulatedTime = 0;

            paragraphs.forEach((para, index) => {
                if (index > 0) {
                    accumulatedTime += calculateParagraphDuration(paragraphs[index - 1]);

                    const timeout = setTimeout(() => {
                        setCurrentParagraphIndex(index);

                        // Scroll automático para manter parágrafo visível
                        const paraElement = paragraphRefs.current[index] || containerRef.current;
                        if (paraElement) {
                            paraElement.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center',
                            });
                        }
                    }, accumulatedTime);

                    timeoutsRef.current.push(timeout);
                }
            });
        } else {
            // Parar destaque
            setCurrentParagraphIndex(-1);
        }

        return () => {
            // Cleanup
            timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
            timeoutsRef.current = [];
        };
    }, [isPlaying, rate, paragraphs, text]);

    // Se não há parágrafos claros, apenas aplicar highlight condicional no conteúdo
    if (paragraphs.length <= 1) {
        return (
            <div
                ref={containerRef}
                className={`${className} ${isPlaying
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 rounded-md transition-all duration-500'
                        : ''
                    }`}
            >
                {children}
            </div>
        );
    }

    // Renderizar com parágrafos destacáveis
    return (
        <div ref={containerRef} className={className}>
            {paragraphs.map((paragraph, index) => {
                const isHighlighted = currentParagraphIndex === index && isPlaying;

                return (
                    <p
                        key={index}
                        ref={(el) => {
                            paragraphRefs.current[index] = el;
                        }}
                        className={`mb-4 last:mb-0 transition-all duration-500 ${isHighlighted
                                ? 'bg-yellow-50 dark:bg-yellow-900/20 px-4 py-3 rounded-md shadow-sm border-l-4 border-primary'
                                : ''
                            }`}
                        dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(paragraph.trim()) }}
                    />
                );
            })}
        </div>
    );
};

export default HighlightableText;
