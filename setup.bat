@echo off
echo 🚀 Configurando O Irmãozinho...

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não está instalado!
    echo 📥 Instale Node.js em: https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar se npm está instalado
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm não está instalado!
    pause
    exit /b 1
)

echo ✅ Node.js e npm encontrados

REM Instalar dependências
echo 📦 Instalando dependências...
npm install

REM Verificar se o arquivo .env existe
if not exist ".env" (
    echo ⚠️  Arquivo .env não encontrado!
    echo 📝 Criando arquivo .env de exemplo...
    
    (
        echo # Firebase Configuration
        echo FIREBASE_API_KEY=sua_chave_aqui
        echo FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
        echo FIREBASE_PROJECT_ID=seu_projeto_id
        echo FIREBASE_STORAGE_BUCKET=seu_projeto.firebasestorage.app
        echo FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
        echo FIREBASE_APP_ID=seu_app_id
        echo FIREBASE_MEASUREMENT_ID=seu_measurement_id
        echo.
        echo # Admin Credentials ^(opcional^)
        echo ADMIN_EMAIL=admin@example.com
        echo ADMIN_PASSWORD=sua_senha_segura
        echo.
        echo # Environment
        echo NODE_ENV=development
    ) > .env
    
    echo 📋 Arquivo .env criado! Edite com suas chaves reais do Firebase.
    echo 🔑 Substitua os valores 'sua_chave_aqui' pelas suas chaves reais.
    echo.
    echo ⏸️  Pressione qualquer tecla quando terminar de editar o .env...
    pause >nul
)

REM Gerar configuração do Firebase
echo 🔧 Gerando configuração do Firebase...
npm run build

if %errorlevel% equ 0 (
    echo ✅ Configuração gerada com sucesso!
) else (
    echo ❌ Erro ao gerar configuração. Verifique o arquivo .env.
    pause
    exit /b 1
)

echo.
echo 🎉 Setup concluído!
echo.
echo 📋 Próximos passos:
echo 1. Edite o arquivo .env com suas chaves reais do Firebase
echo 2. Execute 'npm run build' para gerar a configuração
echo 3. Execute 'npm run dev' para iniciar o servidor
echo.
echo 🔒 Suas chaves estão protegidas no arquivo .env
echo 📁 O arquivo .env está no .gitignore e não será enviado para o repositório
pause
