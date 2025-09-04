# Guia de Deploy - O Irmãozinho

Este guia explica como fazer o deploy do site "O Irmãozinho" em diferentes plataformas.

## 📋 Pré-requisitos

- Todos os arquivos do projeto
- Acesso a um serviço de hospedagem web
- Conhecimento básico de FTP/SFTP (para alguns métodos)

## 🌐 Opções de Deploy

### 1. Netlify (Recomendado - Gratuito)

1. Acesse [netlify.com](https://netlify.com)
2. Faça login ou crie uma conta
3. Arraste a pasta do projeto para a área de deploy
4. Aguarde o processamento
5. Seu site estará disponível em uma URL fornecida

**Vantagens:**
- Deploy automático
- HTTPS gratuito
- CDN global
- Formulários funcionais

### 2. Vercel (Gratuito)

1. Acesse [vercel.com](https://vercel.com)
2. Conecte com GitHub/GitLab
3. Faça upload do projeto
4. Deploy automático

### 3. GitHub Pages (Gratuito)

1. Crie um repositório no GitHub
2. Faça upload dos arquivos
3. Vá em Settings > Pages
4. Selecione a branch main
5. Site disponível em `username.github.io/repository-name`

### 4. Hospedagem Tradicional (cPanel)

1. Acesse o painel de controle da hospedagem
2. Vá para o Gerenciador de Arquivos
3. Navegue até a pasta `public_html`
4. Faça upload de todos os arquivos
5. Extraia se necessário

## ⚙️ Configurações Pós-Deploy

### 1. Configurar Domínio Personalizado

Se você tem um domínio próprio:
- Configure os DNS para apontar para o serviço de hospedagem
- Aguarde a propagação (até 48h)

### 2. Configurar HTTPS

A maioria dos serviços modernos oferece HTTPS automático:
- Netlify: Automático
- Vercel: Automático  
- GitHub Pages: Automático

### 3. Configurar Redirects (Opcional)

Para melhor SEO, configure redirects:
```
# _redirects (Netlify)
/admin /pages/admin.html
/loja /pages/store.html
```

## 🔧 Otimizações para Produção

### 1. Minificar CSS e JS

Use ferramentas como:
- [CSS Minifier](https://cssminifier.com/)
- [JS Minifier](https://javascript-minifier.com/)

### 2. Otimizar Imagens

- Comprima imagens usando [TinyPNG](https://tinypng.com/)
- Use formatos modernos (WebP) quando possível
- Implemente lazy loading

### 3. Configurar Cache

Adicione headers de cache (se suportado):
```
# _headers (Netlify)
/*
  Cache-Control: public, max-age=31536000
  
/*.html
  Cache-Control: public, max-age=0, must-revalidate
```

## 📊 Monitoramento

### 1. Google Analytics

Adicione o código de tracking no `<head>` de todas as páginas:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

### 2. Google Search Console

1. Acesse [search.google.com/search-console](https://search.google.com/search-console)
2. Adicione sua propriedade
3. Verifique a propriedade
4. Envie o sitemap

## 🛡️ Segurança

### 1. Proteger Painel Admin

Para maior segurança em produção:
- Mude as credenciais padrão
- Implemente autenticação mais robusta
- Use HTTPS sempre

### 2. Backup Regular

- Configure backups automáticos
- Mantenha cópias locais
- Teste a restauração periodicamente

## 📱 Testes Pós-Deploy

### 1. Checklist de Funcionalidades

- [ ] Navegação entre páginas
- [ ] Responsividade em diferentes dispositivos
- [ ] Carrinho de compras
- [ ] Login administrativo
- [ ] Formulários de contato
- [ ] Links de redes sociais

### 2. Ferramentas de Teste

- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [GTmetrix](https://gtmetrix.com/)
- [Responsive Design Checker](https://responsivedesignchecker.com/)

## 🚨 Solução de Problemas

### Problema: Páginas não carregam
**Solução**: Verifique se todos os arquivos foram enviados e se os caminhos estão corretos.

### Problema: CSS/JS não funciona
**Solução**: Verifique os caminhos relativos nos arquivos HTML.

### Problema: Admin não funciona
**Solução**: Verifique se o JavaScript está habilitado e se não há erros no console.

## 📞 Suporte

Para problemas específicos de deploy:
1. Verifique a documentação da plataforma escolhida
2. Consulte os logs de erro
3. Teste localmente primeiro

## 🔄 Atualizações

Para atualizar o site:
1. Faça as alterações localmente
2. Teste completamente
3. Faça novo deploy seguindo o mesmo processo
4. Verifique se tudo funciona corretamente

---

**Nota**: Este guia cobre os métodos mais comuns. Para necessidades específicas, consulte a documentação da plataforma escolhida.
