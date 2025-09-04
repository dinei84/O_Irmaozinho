# O Irmãozinho - Site/Blog Cristão

Um site/blog moderno e responsivo focado em compartilhar artigos, vídeos e reflexões sobre a vida cristã. Desenvolvido com HTML, CSS e JavaScript puro, seguindo princípios de design mobile-first e UX moderno.

## 🎯 Características Principais

- **Design Responsivo**: Mobile-first com excelente adaptação para todos os dispositivos
- **Identidade Visual Cristã**: Paleta de cores inspiradora e design moderno
- **Sistema de Navegação**: Menu interativo com animações suaves
- **Store Integrada**: Sistema de e-commerce com carrinho funcional
- **Painel Administrativo**: Editor de conteúdo protegido por login
- **Performance Otimizada**: Código leve e carregamento rápido

## 🚀 Funcionalidades

### Páginas Principais
- **Home**: Hero section, artigo em destaque, últimos conteúdos
- **Sobre**: Apresentação da marca e missão
- **Artigos**: Listagem de artigos cristãos
- **Crônicas**: Reflexões e experiências pessoais
- **Store**: Loja de produtos cristãos com carrinho

### Sistema Administrativo
- Login protegido (usuário: `admin`, senha: `oirmaozinho2025`)
- Editor rich text para criação de conteúdo
- Gerenciamento de artigos e crônicas
- Sistema de rascunhos e publicação

### E-commerce
- Catálogo de produtos por categorias
- Carrinho de compras funcional
- Sistema de busca de produtos
- Cálculo automático de totais

## 🎨 Paleta de Cores

- **Laranja Primário**: #FF8C42
- **Marrom/Castanho**: #8B4513  
- **Ciano Secundário**: #20B2AA
- **Verde**: #32CD32
- **Neutros**: Branco, cinza claro, cinza escuro

## 📁 Estrutura do Projeto

```
o-irmaozinho/
├── index.html              # Página principal
├── pages/                  # Páginas do site
│   ├── sobre.html
│   ├── artigos.html
│   ├── cronicas.html
│   ├── store.html
│   └── admin.html
├── css/                    # Estilos
│   ├── main.css           # CSS principal (importa todos)
│   ├── reset.css          # Reset CSS
│   ├── variables.css      # Variáveis CSS
│   ├── components.css     # Componentes reutilizáveis
│   ├── header.css         # Cabeçalho
│   ├── footer.css         # Rodapé
│   ├── home.css           # Página inicial
│   ├── pages.css          # Páginas internas
│   ├── store.css          # Loja
│   └── admin.css          # Painel administrativo
├── js/                     # Scripts
│   ├── components.js      # Componentes JS
│   ├── animations.js      # Animações
│   ├── store.js           # Funcionalidades da loja
│   └── admin.js           # Painel administrativo
└── assets/                # Recursos
    ├── images/            # Imagens
    └── icons/             # Ícones
```

## 🛠️ Como Usar

### Executar Localmente

1. Clone ou baixe o projeto
2. Navegue até a pasta do projeto
3. Execute um servidor HTTP local:
   ```bash
   python3 -m http.server 8000
   ```
4. Acesse `http://localhost:8000` no navegador

### Acesso Administrativo

1. Acesse `/pages/admin.html`
2. Use as credenciais:
   - **Usuário**: admin
   - **Senha**: oirmaozinho2025
3. Crie e gerencie conteúdo através do editor

### Personalização

- **Cores**: Edite as variáveis CSS em `css/variables.css`
- **Conteúdo**: Use o painel admin ou edite diretamente os arquivos HTML
- **Produtos**: Modifique o objeto `products` em `js/store.js`

## 📱 Responsividade

O site foi desenvolvido com abordagem mobile-first:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

## 🔧 Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: Flexbox, Grid, Custom Properties
- **JavaScript ES6+**: Funcionalidades interativas
- **Local Storage**: Persistência de dados do carrinho e admin

## 📈 Performance

- Código otimizado para carregamento rápido
- Imagens responsivas
- CSS e JS minificados em produção
- Lazy loading implementado

## 🎯 Público-Alvo

- Cristãos em busca de crescimento espiritual
- Pessoas interessadas em reflexões sobre fé
- Jovens e adultos que acessam principalmente pelo celular

## 📞 Suporte

Para dúvidas sobre implementação ou customização, consulte a documentação do código ou entre em contato através dos canais oficiais do projeto.

## 📄 Licença

Este projeto foi desenvolvido para uso específico da marca "O Irmãozinho". Todos os direitos reservados.
