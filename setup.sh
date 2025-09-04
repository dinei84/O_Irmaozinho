#!/bin/bash

# Setup script para O Irmãozinho
echo "🚀 Configurando O Irmãozinho..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado!"
    echo "📥 Instale Node.js em: https://nodejs.org/"
    exit 1
fi

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não está instalado!"
    exit 1
fi

echo "✅ Node.js e npm encontrados"

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Verificar se o arquivo .env existe
if [ ! -f ".env" ]; then
    echo "⚠️  Arquivo .env não encontrado!"
    echo "📝 Criando arquivo .env de exemplo..."
    
    cat > .env << EOF
# Firebase Configuration
FIREBASE_API_KEY=sua_chave_aqui
FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
FIREBASE_PROJECT_ID=seu_projeto_id
FIREBASE_STORAGE_BUCKET=seu_projeto.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
FIREBASE_APP_ID=seu_app_id
FIREBASE_MEASUREMENT_ID=seu_measurement_id

# Admin Credentials (opcional)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=sua_senha_segura

# Environment
NODE_ENV=development
EOF
    
    echo "📋 Arquivo .env criado! Edite com suas chaves reais do Firebase."
    echo "🔑 Substitua os valores 'sua_chave_aqui' pelas suas chaves reais."
    echo ""
    echo "⏸️  Pressione Enter quando terminar de editar o .env..."
    read
fi

# Gerar configuração do Firebase
echo "🔧 Gerando configuração do Firebase..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Configuração gerada com sucesso!"
else
    echo "❌ Erro ao gerar configuração. Verifique o arquivo .env."
    exit 1
fi

echo ""
echo "🎉 Setup concluído!"
echo ""
echo "📋 Próximos passos:"
echo "1. Edite o arquivo .env com suas chaves reais do Firebase"
echo "2. Execute 'npm run build' para gerar a configuração"
echo "3. Execute 'npm run dev' para iniciar o servidor"
echo ""
echo "🔒 Suas chaves estão protegidas no arquivo .env"
echo "📁 O arquivo .env está no .gitignore e não será enviado para o repositório"
