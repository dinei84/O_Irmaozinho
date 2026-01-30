import { useState, useEffect, useCallback } from 'react';

const MP_SCRIPT = 'https://sdk.mercadopago.com/js/v2';
const SCRIPT_ID = 'mercadopago-sdk';

/**
 * Carrega o script do Mercado Pago e retorna uma instância inicializada.
 * Usado para tokenização de cartão no frontend (CardPaymentForm).
 *
 * @param {string} [publicKey] - VITE_MERCADOPAGO_PUBLIC_KEY
 * @returns {{ mp: object | null, loading: boolean, error: string | null }}
 */
export function useMercadoPago(publicKey) {
    const [mp, setMp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!publicKey) {
            setError('Chave pública do Mercado Pago não configurada (VITE_MERCADOPAGO_PUBLIC_KEY).');
            setLoading(false);
            return;
        }

        const existing = document.getElementById(SCRIPT_ID);
        if (existing) {
            try {
                if (window.MercadoPago) {
                    setMp(new window.MercadoPago(publicKey));
                }
            } catch (e) {
                setError(e.message || 'Erro ao inicializar Mercado Pago.');
            }
            setLoading(false);
            return;
        }

        const script = document.createElement('script');
        script.id = SCRIPT_ID;
        script.src = MP_SCRIPT;
        script.async = true;
        script.onload = () => {
            try {
                setMp(new window.MercadoPago(publicKey));
            } catch (e) {
                setError(e.message || 'Erro ao inicializar Mercado Pago.');
            }
            setLoading(false);
        };
        script.onerror = () => {
            setError('Falha ao carregar SDK do Mercado Pago.');
            setLoading(false);
        };
        document.body.appendChild(script);

        // Não remover o script no cleanup - pode ser usado por outros componentes
        // O script será reutilizado se o componente remontar
        return () => {
            // Cleanup apenas se necessário (ex: mudança de publicKey)
            // Por enquanto, deixamos o script no DOM para reutilização
        };
    }, [publicKey]);

    const createCardToken = useCallback(
        async (cardData) => {
            if (!mp) throw new Error('Mercado Pago não inicializado.');
            const result = await mp.createCardToken({
                cardNumber: String(cardData.cardNumber).replace(/\D/g, ''),
                cardholderName: String(cardData.cardholderName || '').trim(),
                cardExpirationMonth: String(cardData.cardExpirationMonth || '').padStart(2, '0'),
                cardExpirationYear: String(cardData.cardExpirationYear || '').slice(-2),
                securityCode: String(cardData.securityCode || '').replace(/\D/g, ''),
                identificationType: 'CPF',
                identificationNumber: String(cardData.identificationNumber || '').replace(/\D/g, '')
            });
            const id = typeof result === 'string' ? result : (result?.id ?? result?.body?.id);
            if (!id) throw new Error('Token do cartão não retornado pelo Mercado Pago.');
            return id;
        },
        [mp]
    );

    return { mp, loading, error, createCardToken };
}
