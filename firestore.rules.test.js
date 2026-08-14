/**
 * @vitest-environment node
 *
 * Testes das Firestore Security Rules — o perímetro de segurança da aplicação.
 *
 * Cada bloco corresponde a uma vulnerabilidade da auditoria
 * (docs/seguranca/AUDITORIA_SEGURANCA.md) e existe para garantir que ela não volte.
 * As V-03 e V-04 entraram no código como ajustes "temporários de debug" e ficaram
 * meses sem ser notadas justamente porque não havia teste nenhum aqui.
 *
 * Cada vulnerabilidade tem DOIS testes: o ataque falha, e o fluxo legítimo continua
 * funcionando. Sem o segundo, a próxima correção "segura" quebra o produto.
 *
 * Executar:  npm run test:rules
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
    initializeTestEnvironment,
    assertFails,
    assertSucceeds
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { doc, setDoc, updateDoc, getDoc, addDoc, collection, deleteDoc, getDocs, serverTimestamp } from 'firebase/firestore';

let testEnv;

const ALICE = 'alice-uid';
const BOB = 'bob-uid';
const ADMIN = 'admin-uid';

/** Contexto de usuário comum: token com email (usado por expectedUserName nas rules) */
const asUser = (uid, email) =>
    testEnv.authenticatedContext(uid, { email: email ?? `${uid}@teste.com` }).firestore();

/** Contexto de usuário com displayName (claim `name` no token) */
const asNamedUser = (uid, name, email) =>
    testEnv.authenticatedContext(uid, { name, email: email ?? `${uid}@teste.com` }).firestore();

const asAdmin = () =>
    testEnv.authenticatedContext(ADMIN, { role: 'admin', email: 'admin@teste.com' }).firestore();

const anonymous = () => testEnv.unauthenticatedContext().firestore();

beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
        projectId: 'demo-oirmaozinho',
        firestore: {
            rules: readFileSync('firestore.rules', 'utf8'),
            host: '127.0.0.1',
            port: 8085
        }
    });
});

afterAll(async () => {
    await testEnv?.cleanup();
});

beforeEach(async () => {
    await testEnv.clearFirestore();

    // Semeia os dados ignorando as rules (Admin SDK)
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
        const db = ctx.firestore();

        await setDoc(doc(db, 'orders/pedido-do-bob'), {
            userId: BOB,
            items: [{ productId: 'p1', name: 'Livro', price: 500, quantity: 1, subtotal: 500 }],
            subtotal: 500,
            finalTotal: 500,
            customer: { name: 'Bob', email: 'bob@teste.com' },
            shippingAddress: { street: 'Rua 1', city: 'SP', state: 'SP', zipCode: '01000-000' },
            payment: { method: 'pix', status: 'pending', gateway: 'mercadopago' },
            orderStatus: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await setDoc(doc(db, 'orders/pedido-da-alice'), {
            userId: ALICE,
            items: [{ productId: 'p1', name: 'Livro', price: 500, quantity: 1, subtotal: 500 }],
            subtotal: 500,
            finalTotal: 500,
            customer: { name: 'Alice', email: 'alice@teste.com' },
            shippingAddress: { street: 'Rua 2', city: 'SP', state: 'SP', zipCode: '01000-000' },
            payment: { method: 'pix', status: 'pending', gateway: 'mercadopago' },
            orderStatus: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await setDoc(doc(db, 'content/artigo-1'), {
            title: 'Artigo de teste',
            body: '<p>corpo</p>',
            category: 'Artigos',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await setDoc(doc(db, 'comments/comentario-da-alice'), {
            articleId: 'artigo-1',
            userId: ALICE,
            userName: 'alice',
            content: 'Comentário original da Alice',
            isDeleted: false,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await setDoc(doc(db, 'suppliers/fornecedor-1'), {
            name: 'Editora Parceira',
            email: 'contato@editora.com',
            type: 'third_party',
            orderMethod: 'email',
            orderEmail: 'pedidos@editora.com',
            commissionRate: 0.25,       // dado comercial sensível
            paymentMethod: 'centralized',
            active: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('V-02 · criação de pedido no servidor (price tampering)', () => {
    // Pedido com total adulterado (R$ 0,01) — exatamente o exploit da V-02.
    const pedidoFraudulento = {
        userId: ALICE,
        items: [{ productId: 'p1', name: 'Livro', price: 500, quantity: 1, subtotal: 500 }],
        subtotal: 0.01,
        finalTotal: 0.01,
        customer: { name: 'Alice', email: 'alice@teste.com' },
        shippingAddress: { street: 'Rua 2', city: 'SP', state: 'SP', zipCode: '01000-000' },
        payment: { method: 'pix', status: 'pending', gateway: 'mercadopago' },
        orderStatus: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    };

    it('ATAQUE: usuário autenticado NÃO cria pedido direto (total adulterado)', async () => {
        const db = asUser(ALICE);
        await assertFails(
            setDoc(doc(db, 'orders/pedido-fraudulento'), pedidoFraudulento)
        );
    });

    it('ATAQUE: visitante anônimo NÃO cria pedido', async () => {
        const db = anonymous();
        await assertFails(
            setDoc(doc(db, 'orders/pedido-anonimo'), pedidoFraudulento)
        );
    });

    it('LEGÍTIMO: dono ainda lê o próprio pedido', async () => {
        const db = asUser(ALICE);
        await assertSucceeds(getDoc(doc(db, 'orders/pedido-da-alice')));
    });

    it('LEGÍTIMO: dono ainda cancela o próprio pedido pendente', async () => {
        const db = asUser(ALICE);
        await assertSucceeds(
            updateDoc(doc(db, 'orders/pedido-da-alice'), {
                orderStatus: 'cancelled',
                updatedAt: serverTimestamp(),
                statusHistory: [{ status: 'cancelled', changedBy: ALICE }]
            })
        );
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('V-03 · escrita em pedidos', () => {
    it('ATAQUE: usuário autenticado NÃO altera o pedido de outro usuário', async () => {
        const db = asUser(ALICE);
        await assertFails(
            updateDoc(doc(db, 'orders/pedido-do-bob'), {
                orderStatus: 'paid',
                updatedAt: serverTimestamp()
            })
        );
    });

    it('ATAQUE: usuário NÃO marca o próprio pedido como pago sem pagar', async () => {
        const db = asUser(ALICE);
        await assertFails(
            updateDoc(doc(db, 'orders/pedido-da-alice'), {
                orderStatus: 'paid',
                'payment.status': 'approved',
                updatedAt: serverTimestamp()
            })
        );
    });

    it('ATAQUE: usuário NÃO redireciona a entrega do pedido alheio', async () => {
        const db = asUser(ALICE);
        await assertFails(
            updateDoc(doc(db, 'orders/pedido-do-bob'), {
                shippingAddress: { street: 'Rua do Atacante', city: 'X', state: 'X', zipCode: '00000-000' },
                updatedAt: serverTimestamp()
            })
        );
    });

    it('LEGÍTIMO: dono cancela o próprio pedido pendente', async () => {
        const db = asUser(ALICE);
        await assertSucceeds(
            updateDoc(doc(db, 'orders/pedido-da-alice'), {
                orderStatus: 'cancelled',
                updatedAt: serverTimestamp(),
                statusHistory: [{ status: 'cancelled', changedBy: ALICE }]
            })
        );
    });

    it('LEGÍTIMO: admin atualiza qualquer pedido', async () => {
        const db = asAdmin();
        await assertSucceeds(
            updateDoc(doc(db, 'orders/pedido-do-bob'), {
                orderStatus: 'shipped',
                updatedAt: serverTimestamp()
            })
        );
    });

    it('não vaza pedido de outro usuário na leitura', async () => {
        const db = asUser(ALICE);
        await assertFails(getDoc(doc(db, 'orders/pedido-do-bob')));
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('V-04 · criação de conteúdo (vetor do XSS armazenado)', () => {
    const artigo = {
        title: 'Artigo malicioso',
        body: '<img src=x onerror="alert(1)">',
        category: 'Artigos',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    };

    it('ATAQUE: usuário comum NÃO cria artigo', async () => {
        const db = asUser(ALICE);
        await assertFails(addDoc(collection(db, 'content'), artigo));
    });

    it('ATAQUE: visitante anônimo NÃO cria artigo', async () => {
        const db = anonymous();
        await assertFails(addDoc(collection(db, 'content'), artigo));
    });

    it('ATAQUE: usuário comum NÃO edita artigo existente', async () => {
        const db = asUser(ALICE);
        await assertFails(
            updateDoc(doc(db, 'content/artigo-1'), {
                body: '<script>alert(1)</script>',
                updatedAt: serverTimestamp()
            })
        );
    });

    it('LEGÍTIMO: admin cria artigo', async () => {
        const db = asAdmin();
        await assertSucceeds(
            addDoc(collection(db, 'content'), {
                title: 'Artigo do admin',
                body: '<p>conteúdo</p>',
                category: 'Artigos',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            })
        );
    });

    it('LEGÍTIMO: qualquer um lê o conteúdo público', async () => {
        await assertSucceeds(getDoc(doc(anonymous(), 'content/artigo-1')));
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('V-08 · comentários', () => {
    it('ATAQUE: autor NÃO altera campos além do texto ao editar', async () => {
        const db = asUser(ALICE, 'alice@teste.com');
        await assertFails(
            updateDoc(doc(db, 'comments/comentario-da-alice'), {
                content: 'texto editado',
                userName: 'Administrador',       // tentativa de forjar identidade
                updatedAt: serverTimestamp()
            })
        );
    });

    it('ATAQUE: usuário NÃO edita comentário de outro', async () => {
        const db = asUser(BOB);
        await assertFails(
            updateDoc(doc(db, 'comments/comentario-da-alice'), {
                content: 'sequestrado pelo Bob',
                updatedAt: serverTimestamp()
            })
        );
    });

    it('ATAQUE: usuário NÃO publica comentário assinando como outro nome', async () => {
        const db = asUser(ALICE, 'alice@teste.com');
        await assertFails(
            addDoc(collection(db, 'comments'), {
                articleId: 'artigo-1',
                userId: ALICE,
                userName: 'Administrador',        // token diz "alice"
                content: 'Comunicado oficial falso',
                isDeleted: false,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            })
        );
    });

    it('LEGÍTIMO: usuário comenta com o nome do próprio token (displayName)', async () => {
        const db = asNamedUser(ALICE, 'Alice Silva', 'alice@teste.com');
        await assertSucceeds(
            addDoc(collection(db, 'comments'), {
                articleId: 'artigo-1',
                userId: ALICE,
                userName: 'Alice Silva',
                content: 'Que reflexão linda, obrigada!',
                isDeleted: false,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            })
        );
    });

    it('LEGÍTIMO: sem displayName, o nome é o prefixo do e-mail', async () => {
        const db = asUser(BOB, 'bob@teste.com');
        await assertSucceeds(
            addDoc(collection(db, 'comments'), {
                articleId: 'artigo-1',
                userId: BOB,
                userName: 'bob',
                content: 'Comentário do usuário antigo, sem displayName',
                isDeleted: false,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            })
        );
    });

    it('LEGÍTIMO: autor edita apenas o texto do próprio comentário', async () => {
        const db = asUser(ALICE, 'alice@teste.com');
        await assertSucceeds(
            updateDoc(doc(db, 'comments/comentario-da-alice'), {
                content: 'Texto corrigido pela autora',
                updatedAt: serverTimestamp()
            })
        );
    });

    it('ATAQUE: autor NÃO edita comentário fora da janela de 1h', async () => {
        await testEnv.withSecurityRulesDisabled(async (ctx) => {
            await setDoc(doc(ctx.firestore(), 'comments/comentario-antigo'), {
                articleId: 'artigo-1',
                userId: ALICE,
                userName: 'alice',
                content: 'Comentário de dois dias atrás',
                isDeleted: false,
                createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
                updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000)
            });
        });

        const db = asUser(ALICE, 'alice@teste.com');
        await assertFails(
            updateDoc(doc(db, 'comments/comentario-antigo'), {
                content: 'Reescrevendo a história dois dias depois',
                updatedAt: serverTimestamp()
            })
        );
    });

    it('ninguém apaga comentário fisicamente (apenas soft delete)', async () => {
        const db = asUser(ALICE);
        await assertFails(deleteDoc(doc(db, 'comments/comentario-da-alice')));
    });
});

// V-11 (leitura de fornecedores restrita a admin) é o passo R-14, do Sprint 1.
// Os testes entram aqui junto com a correção.
