#!/bin/bash

# Script para testar Lambda JavaScript localmente

set -e

echo "🧪 Testando Lambda JavaScript localmente"
echo "======================================="

# Verificações
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale Node.js primeiro."
    exit 1
fi

if ! command -v sam &> /dev/null; then
    echo "❌ SAM CLI não encontrado."
    exit 1
fi

echo "📦 Instalando dependências..."
npm install

echo "🧪 Executando testes unitários..."
npm test

echo "🔨 Fazendo build..."
sam build --template-file template-js.yaml

echo "🚀 Testando função Lambda..."
sam local invoke PdfGeneratorFunction \
    --template-file template-js.yaml \
    --event event-js.json

echo ""
echo "✅ Teste concluído!"
echo ""
echo "💡 Para testar a API localmente:"
echo "sam local start-api --template-file template-js.yaml"
echo ""
echo "Em outro terminal, teste com:"
echo "curl -X POST http://127.0.0.1:3000/generate-pdf \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"url\": \"https://example.com\"}'"
