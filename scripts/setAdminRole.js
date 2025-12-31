#!/usr/bin/env node

/**
 * Script para configurar role de admin no Firebase Authentication
 * 
 * Uso:
 *   npm run admin:set <uid>
 *   node scripts/setAdminRole.js <uid>
 * 
 * Onde <uid> é o UID do usuário no Firebase Authentication
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cores para output no terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function main() {
  // Pegar UID dos argumentos
  const args = process.argv.slice(2);
  const uid = args[0];

  if (!uid) {
    logError('UID do usuário não fornecido!');
    console.log('\nUso:');
    console.log('  npm run admin:set <uid>');
    console.log('  node scripts/setAdminRole.js <uid>');
    console.log('\nExemplo:');
    console.log('  npm run admin:set abc123def456ghi789');
    console.log('\nPara obter o UID do usuário:');
    console.log('  1. Acesse o Firebase Console');
    console.log('  2. Vá em Authentication > Users');
    console.log('  3. Encontre o usuário e copie o UID');
    process.exit(1);
  }

  // Verificar se o serviceAccountKey.json existe
  const serviceAccountPath = join(__dirname, '..', 'serviceAccountKey.json');
  let serviceAccount;

  try {
    const fileContent = readFileSync(serviceAccountPath, 'utf8');
    serviceAccount = JSON.parse(fileContent);
    logInfo('serviceAccountKey.json encontrado');
  } catch (error) {
    logError('serviceAccountKey.json não encontrado!');
    console.log('\nPara obter o serviceAccountKey.json:');
    console.log('  1. Acesse o Firebase Console: https://console.firebase.google.com/');
    console.log('  2. Selecione seu projeto');
    console.log('  3. Vá em Configurações do Projeto (ícone de engrenagem)');
    console.log('  4. Na aba "Contas de serviço", clique em "Gerar nova chave privada"');
    console.log('  5. Salve o arquivo JSON como "serviceAccountKey.json" na raiz do projeto');
    console.log('  6. IMPORTANTE: Este arquivo está no .gitignore e NÃO deve ser commitado!');
    process.exit(1);
  }

  try {
    // Inicializar Firebase Admin
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      logInfo('Firebase Admin inicializado');
    }

    // Verificar se o usuário existe
    logInfo(`Verificando usuário com UID: ${uid}`);
    let user;
    try {
      user = await admin.auth().getUser(uid);
      logSuccess(`Usuário encontrado: ${user.email || user.phoneNumber || 'Sem email/telefone'}`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        logError(`Usuário com UID "${uid}" não encontrado!`);
        console.log('\nVerifique o UID no Firebase Console:');
        console.log('  Authentication > Users');
        process.exit(1);
      }
      throw error;
    }

    // Verificar role atual
    const customClaims = user.customClaims || {};
    const currentRole = customClaims.role || 'user';
    
    if (currentRole === 'admin') {
      logWarning('Usuário já é admin!');
      console.log('\nRole atual:', currentRole);
      console.log('Custom Claims:', JSON.stringify(customClaims, null, 2));
      process.exit(0);
    }

    // Definir role de admin
    logInfo('Configurando role de admin...');
    await admin.auth().setCustomUserClaims(uid, {
      ...customClaims,
      role: 'admin',
    });

    logSuccess('Role de admin configurada com sucesso!');
    console.log('\nDetalhes:');
    console.log(`  UID: ${uid}`);
    console.log(`  Email: ${user.email || 'N/A'}`);
    console.log(`  Role anterior: ${currentRole}`);
    console.log(`  Role nova: admin`);
    
    logWarning('\n⚠️  IMPORTANTE: O usuário precisa fazer LOGOUT e LOGIN novamente para ver as mudanças!');
    console.log('\nIsso acontece porque o token JWT precisa ser atualizado para incluir os novos Custom Claims.');
    
    // Verificar se há mais admins (opcional - requer permissões no Firestore)
    try {
      const db = admin.firestore();
      const adminDoc = await db.collection('admins').doc(uid).get();
      if (!adminDoc.exists) {
        logInfo('Criando registro na coleção "admins"...');
        await db.collection('admins').doc(uid).set({
          email: user.email || null,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          createdBy: 'script',
        });
        logSuccess('Registro criado na coleção "admins"');
      }
    } catch (error) {
      logWarning('Não foi possível criar registro na coleção "admins" (pode ser normal se as regras não permitirem)');
    }

  } catch (error) {
    logError('Erro ao configurar admin role:');
    console.error(error);
    process.exit(1);
  }
}

// Executar
main().then(() => {
  process.exit(0);
}).catch((error) => {
  logError('Erro fatal:');
  console.error(error);
  process.exit(1);
});

