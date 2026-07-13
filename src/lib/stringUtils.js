// A implementação de stripHtml vive em sanitize.js (ponto único de sanitização).
// Este módulo é mantido para não quebrar os imports existentes.
//
// A versão anterior fazia `tempDiv.innerHTML = html` — o que EXECUTA handlers
// como onerror de <img> no momento da atribuição, mesmo o retorno sendo só texto.
export { stripHtml } from './sanitize';
