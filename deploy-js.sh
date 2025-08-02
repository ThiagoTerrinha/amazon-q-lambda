#!/bin/bash

# Script de deploy para Lambda JavaScript com Amazon Q

set -e

echo "🚀 Deploy Lambda JavaScript com Amazon Q CLI"
echo "============================================"

# Verificações
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale Node.js primeiro."
    exit 1
fi

if ! command -v sam &> /dev/null; then
    echo "❌ SAM CLI não encontrado. Instale com:"
    echo "   brew install aws-sam-cli"
    exit 1
fi

if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI não encontrado. Instale e configure primeiro."
    exit 1
fi

# Verificar se Amazon Q CLI está disponível
if ! aws q help &> /dev/null; then
    echo "⚠️  Amazon Q CLI não encontrado. A função usará configurações padrão."
    echo "   Para instalar: aws configure set cli_binary_format raw-in-base64-out"
fi

# Configurações
STACK_NAME="pdf-generator-js-stack"
REGION="us-east-1"
ENVIRONMENT="dev"

echo "📦 Instalando dependências..."
npm install

echo "🧪 Executando testes..."
npm test

echo "🔨 Fazendo build..."
sam build --template-file template-js.yaml

echo "🚀 Fazendo deploy..."
sam deploy \
    --template-file .aws-sam/build/template-js.yaml \
    --stack-name ${STACK_NAME} \
    --region ${REGION} \
    --parameter-overrides Environment=${ENVIRONMENT} \
    --capabilities CAPABILITY_IAM \
    --no-fail-on-empty-changeset \
    --resolve-s3

# Obter URL da API
echo "✅ Deploy concluído!"
API_URL=$(aws cloudformation describe-stacks \
    --stack-name ${STACK_NAME} \
    --region ${REGION} \
    --query 'Stacks[0].Outputs[?OutputKey==`PdfGeneratorApiUrl`].OutputValue' \
    --output text)

echo ""
echo "🌐 URL da API: ${API_URL}"
echo ""
echo "📋 Exemplo de uso:"
echo "curl -X POST ${API_URL} \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"url\": \"https://github.com\"}'"
echo ""
echo "🧪 Para testar localmente:"
echo "sam local start-api --template-file template-js.yaml"
