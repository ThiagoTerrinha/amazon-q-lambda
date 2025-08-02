# Amazon Q Lambda - JavaScript PDF Generator

🚀 **Função Lambda em JavaScript que converte sites em PDF usando Amazon Q CLI para otimização inteligente**

## 🌟 Funcionalidades

- ✅ **Conversão inteligente**: Sites para PDF usando Puppeteer
- 🤖 **Amazon Q CLI**: Otimização automática baseada em IA
- 📱 **Responsivo**: Detecta e adapta para diferentes tipos de conteúdo
- 🎯 **API REST**: Interface HTTP para integração fácil
- 🧪 **Testável**: Testes unitários e integração local
- 🔧 **Configurável**: Personalização baseada em insights do Q

## 🏗️ Arquitetura

```
🌐 Site URL → 🤖 Amazon Q CLI → ⚙️ Configuração Otimizada → 🎭 Puppeteer → 📄 PDF
                    ↓
               📊 Insights & Recomendações
```

## 📋 Pré-requisitos

- **Node.js 18+**
- **AWS CLI** configurado
- **SAM CLI** para deployment
- **Amazon Q CLI** (opcional, usa fallback se não disponível)

## 🚀 Instalação Rápida

```bash
# 1. Instalar dependências
npm install

# 2. Testar localmente
./test-js-local.sh

# 3. Deploy para AWS
./deploy-js.sh
```

## 🧪 Testes Locais

### Teste da Função Lambda

```bash
sam local invoke PdfGeneratorFunction --event event-js.json
```

### Teste da API

```bash
# Terminal 1: Iniciar API local
sam local start-api --template-file template-js.yaml

# Terminal 2: Testar endpoint
curl -X POST http://127.0.0.1:3000/generate-pdf \
  -H 'Content-Type: application/json' \
  -d '{"url": "https://github.com"}'
```

### Testes Unitários

```bash
npm test
```

## 📡 Como o Amazon Q CLI é Usado

### 1. **Consulta Inteligente**

```javascript
const prompt = `
Preciso converter o site ${url} para PDF de forma otimizada.
Analise e forneça recomendações sobre:
1. Configurações ideais de página
2. Estratégias para capturar conteúdo dinâmico
3. Otimizações de performance
`;

const qResponse = await executeQCommand(prompt);
```

### 2. **Extração de Insights**

```javascript
// O sistema analisa a resposta do Q e extrai:
{
  pageConfig: { format: 'A4', orientation: 'landscape' },
  captureStrategy: { waitTime: 5000, javascript: true },
  optimizations: ['high-quality-rendering', 'compress-images']
}
```

### 3. **Aplicação Automática**

```javascript
// Configurações aplicadas no Puppeteer
const pdfOptions = {
  format: recommendations.pageConfig.format,
  landscape: recommendations.pageConfig.orientation === "landscape",
  // ... outras configurações otimizadas
};
```

## 🎯 Uso da API

### Endpoint Principal

```
POST /generate-pdf
```

### Request Body

```json
{
  "url": "https://example.com"
}
```

### Response

```json
{
  "success": true,
  "url": "https://example.com",
  "pdfBase64": "JVBERi0xLjQK...",
  "qInsights": {
    "pageConfig": {
      "format": "A4",
      "orientation": "portrait"
    },
    "captureStrategy": {
      "waitTime": 3000,
      "javascript": true
    }
  },
  "fileSize": 245760,
  "timestamp": "2025-08-02T10:30:00.000Z"
}
```

## 🖥️ Cliente JavaScript

### Uso Programático

```javascript
const PdfGeneratorClient = require("./pdf-client");

const client = new PdfGeneratorClient("https://your-api-url");

// Gerar e salvar PDF
await client.savePdf("https://github.com", "github.pdf");
```

### Uso via CLI

```bash
# Básico
node pdf-client.js https://github.com

# Com arquivo de saída específico
node pdf-client.js https://aws.amazon.com aws-docs.pdf

# Com URL da API customizada
node pdf-client.js https://example.com output.pdf https://your-api-url
```

## ⚙️ Configuração

### Variáveis de Ambiente

```bash
NODE_ENV=production
AWS_REGION=us-east-1
```

### Template SAM

- **Runtime**: Node.js 18.x
- **Memory**: 1024 MB
- **Timeout**: 60 segundos
- **Permissions**: Bedrock, Logs

## 🤖 Como Amazon Q Otimiza

### Análise Automática

1. **Tipo de Site**: Blog, e-commerce, documentação
2. **Conteúdo Dinâmico**: JavaScript, AJAX, animações
3. **Layout**: Responsivo, fixo, complexo
4. **Elementos**: Tabelas, gráficos, imagens

### Recomendações Aplicadas

- **Formato de Página**: A4, Letter, A3 baseado no conteúdo
- **Orientação**: Portrait/Landscape para melhor layout
- **Tempo de Espera**: Ajustado para conteúdo dinâmico
- **Qualidade**: Otimizada para tipo de conteúdo

## 🔍 Monitoramento

### CloudWatch Logs

```bash
aws logs tail /aws/lambda/pdf-generator-js-dev --follow
```

### Métricas Importantes

- **Duração**: Tempo de conversão
- **Erro Rate**: Taxa de falhas
- **Memory Usage**: Uso de memória
- **Cold Starts**: Inicializações frias

## 🚨 Troubleshooting

### Amazon Q CLI não disponível

```
⚠️ Amazon Q CLI não encontrado. A função usará configurações padrão.
```

**Solução**: A função funciona normalmente com configurações otimizadas padrão.

### Timeout na conversão

```
Error: Navigation timeout of 30000 ms exceeded
```

**Solução**: Site muito lento, ajustar timeout ou verificar conectividade.

### Memória insuficiente

```
Error: Process out of memory
```

**Solução**: Aumentar memória da Lambda no template.yaml (até 3008 MB).

## 📊 Performance

### Benchmarks Típicos

- **Site simples**: 2-5 segundos
- **Site com JavaScript**: 5-10 segundos
- **Site complexo**: 10-15 segundos
- **Tamanho médio PDF**: 200KB - 2MB

### Otimizações Automáticas

- **Compressão de imagens**
- **Remoção de elementos desnecessários**
- **Otimização de fontes**
- **Cache de recursos**

## 🔐 Segurança

### Validações

- ✅ URL sanitization
- ✅ Timeout limits
- ✅ Memory limits
- ✅ CORS headers

### Boas Práticas

- JavaScript desabilitado por padrão para sites suspeitos
- Logs estruturados para auditoria
- Permissões IAM mínimas

## 🌍 Deployment

### Ambiente de Desenvolvimento

```bash
./deploy-js.sh
# Stack: pdf-generator-js-stack-dev
```

### Ambiente de Produção

```bash
ENVIRONMENT=prod ./deploy-js.sh
# Stack: pdf-generator-js-stack-prod
```

## 📝 Logs Estruturados

```javascript
console.log("🚀 Iniciando conversão de site para PDF...");
console.log("🤖 Insights do Amazon Q:", qInsights);
console.log("📄 Gerando PDF com Puppeteer...");
console.log("✅ PDF gerado com sucesso! Tamanho: 245760 bytes");
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Faça commit: `git commit -m 'Adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra Pull Request

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

🎯 **Desenvolvido com Amazon Q CLI para otimização inteligente de conversão PDF**
