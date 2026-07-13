import DOMPurify from 'dompurify';

/**
 * Ponto único de sanitização de HTML da aplicação.
 *
 * O corpo dos artigos é HTML armazenado no Firestore e renderizado com
 * dangerouslySetInnerHTML. Sem sanitização, um artigo com
 * `<img src=x onerror="...">` executa JavaScript no navegador de todo leitor —
 * inclusive no do admin, herdando os privilégios dele (V-04 da auditoria).
 *
 * Toda renderização de HTML vindo do banco DEVE passar por aqui.
 * Ver docs/seguranca/AUDITORIA_SEGURANCA.md
 */

const ARTICLE_CONFIG = {
    ALLOWED_TAGS: [
        'p', 'br', 'hr',
        'strong', 'b', 'em', 'i', 'u', 's',
        'h2', 'h3', 'h4',
        'blockquote', 'q',
        'ul', 'ol', 'li',
        'a', 'img', 'figure', 'figcaption',
        'span', 'div'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel', 'class'],
    // Bloqueia javascript:, data: (exceto imagens) e outros esquemas perigosos
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|\/|#)/i,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style']
};

/**
 * Sanitiza HTML de artigo/crônica para renderização segura.
 * Use SEMPRE antes de dangerouslySetInnerHTML.
 *
 * @param {string} dirty - HTML não confiável
 * @returns {string} HTML seguro para renderizar
 */
export function sanitizeArticleHtml(dirty) {
    if (!dirty) return '';
    return DOMPurify.sanitize(String(dirty), ARTICLE_CONFIG);
}

/**
 * Extrai texto puro de um HTML, descartando todas as tags.
 *
 * Usar isto — e não `div.innerHTML = html; div.textContent` — porque atribuir a
 * innerHTML já dispara handlers como onerror de <img> antes de qualquer leitura.
 *
 * @param {string} dirty - HTML não confiável
 * @returns {string} Texto puro
 */
export function stripHtml(dirty) {
    if (!dirty) return '';
    return DOMPurify.sanitize(String(dirty), {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
        KEEP_CONTENT: true
    });
}
