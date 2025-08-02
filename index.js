const AWS = require('aws-sdk');
const puppeteer = require('puppeteer-core');
const chromium = require('chromium');
const { spawn } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');

// Configurar AWS SDK
AWS.config.update({ region: process.env.AWS_REGION || 'us-east-1' });

/**
 * Handler principal da função Lambda
 */
exports.handler = async (event, context) => {
    console.log('🚀 Iniciando conversão de site para PDF...');
    console.log('Event:', JSON.stringify(event, null, 2));

    try {
        // Extrair URL do evento
        const url = event.url || event.body?.url || event.queryStringParameters?.url;

        if (!url) {
            return createResponse(400, {
                error: 'URL é obrigatória',
                message: 'Forneça uma URL válida no parâmetro "url"'
            });
        }

        // Validar e normalizar URL
        const normalizedUrl = normalizeUrl(url);
        console.log(`📱 URL normalizada: ${normalizedUrl}`);

        // Usar Amazon Q CLI para obter insights
        const qInsights = await consultAmazonQ(normalizedUrl);
        console.log('🤖 Insights do Amazon Q:', qInsights);

        // Gerar PDF baseado nos insights do Amazon Q
        const pdfBuffer = await generatePdfWithInsights(normalizedUrl, qInsights);

        // Converter para base64
        const pdfBase64 = pdfBuffer.toString('base64');

        return createResponse(200, {
            success: true,
            url: normalizedUrl,
            pdfBase64,
            qInsights: qInsights.summary,
            fileSize: pdfBuffer.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Erro na conversão:', error);

        return createResponse(500, {
            error: 'Erro interno do servidor',
            message: error.message,
            requestId: context.awsRequestId
        });
    }
};

/**
 * Normaliza a URL adicionando protocolo se necessário
 */
function normalizeUrl(url) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return `https://${url}`;
    }
    return url;
}

/**
 * Consulta Amazon Q CLI para obter insights sobre a conversão
 */
async function consultAmazonQ(url) {
    console.log('🤖 Consultando Amazon Q CLI...');

    try {
        const prompt = `
        Preciso converter o site ${url} para PDF de forma otimizada.

        Analise e forneça recomendações sobre:
        1. Configurações ideais de página (tamanho, orientação, margens)
        2. Estratégias para capturar conteúdo dinâmico
        3. Otimizações de performance
        4. Tratamento de elementos específicos (imagens, tabelas, gráficos)
        5. Possíveis desafios técnicos

        Responda em formato JSON com as seguintes chaves:
        - pageConfig: {size, orientation, margins}
        - captureStrategy: {waitTime, javascript, images}
        - optimizations: [lista de otimizações]
        - challenges: [possíveis desafios]
        `;

        const qResponse = await executeQCommand(prompt);

        return {
            raw: qResponse,
            summary: extractInsights(qResponse),
            recommendations: extractRecommendations(qResponse)
        };

    } catch (error) {
        console.warn('⚠️ Amazon Q não disponível, usando configurações padrão:', error.message);

        return {
            raw: 'Amazon Q não disponível',
            summary: 'Usando configurações padrão',
            recommendations: getDefaultRecommendations()
        };
    }
}

/**
 * Executa comando Amazon Q CLI
 */
async function executeQCommand(prompt) {
    return new Promise((resolve, reject) => {
        const qProcess = spawn('aws', ['q', 'ask', prompt], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let output = '';
        let errorOutput = '';

        qProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        qProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        qProcess.on('close', (code) => {
            if (code === 0) {
                resolve(output.trim());
            } else {
                reject(new Error(`Amazon Q CLI falhou: ${errorOutput}`));
            }
        });

        // Timeout de 30 segundos
        setTimeout(() => {
            qProcess.kill();
            reject(new Error('Timeout na consulta ao Amazon Q'));
        }, 30000);
    });
}

/**
 * Extrai insights da resposta do Amazon Q
 */
function extractInsights(qResponse) {
    try {
        // Tentar extrair JSON da resposta
        const jsonMatch = qResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        // Se não encontrar JSON, extrair informações por padrões
        return {
            pageConfig: extractPageConfig(qResponse),
            captureStrategy: extractCaptureStrategy(qResponse),
            summary: qResponse.substring(0, 200) + '...'
        };

    } catch (error) {
        console.warn('Erro ao extrair insights:', error.message);
        return {
            summary: 'Resposta do Amazon Q processada com configurações padrão'
        };
    }
}

/**
 * Extrai configurações de página da resposta do Q
 */
function extractPageConfig(response) {
    const config = {
        format: 'A4',
        orientation: 'portrait',
        margin: '1cm'
    };

    if (response.toLowerCase().includes('landscape') || response.toLowerCase().includes('horizontal')) {
        config.orientation = 'landscape';
    }

    if (response.toLowerCase().includes('letter')) {
        config.format = 'Letter';
    }

    return config;
}

/**
 * Extrai estratégia de captura da resposta do Q
 */
function extractCaptureStrategy(response) {
    return {
        waitTime: response.toLowerCase().includes('dynamic') ? 3000 : 1000,
        javascript: !response.toLowerCase().includes('disable javascript'),
        images: !response.toLowerCase().includes('no images'),
        fullPage: true
    };
}

/**
 * Extrai recomendações estruturadas
 */
function extractRecommendations(qResponse) {
    const recommendations = getDefaultRecommendations();

    try {
        const response = qResponse.toLowerCase();

        // Analisar recomendações de formato
        if (response.includes('landscape')) {
            recommendations.pageConfig.orientation = 'landscape';
        }

        if (response.includes('a3') || response.includes('large')) {
            recommendations.pageConfig.format = 'A3';
        }

        // Analisar estratégias de captura
        if (response.includes('javascript') || response.includes('dynamic')) {
            recommendations.captureStrategy.javascript = true;
            recommendations.captureStrategy.waitTime = 5000;
        }

        if (response.includes('high quality') || response.includes('print quality')) {
            recommendations.optimizations.push('high-quality-rendering');
        }

    } catch (error) {
        console.warn('Erro ao extrair recomendações:', error.message);
    }

    return recommendations;
}

/**
 * Configurações padrão quando Amazon Q não está disponível
 */
function getDefaultRecommendations() {
    return {
        pageConfig: {
            format: 'A4',
            orientation: 'portrait',
            margin: '1cm'
        },
        captureStrategy: {
            waitTime: 2000,
            javascript: true,
            images: true,
            fullPage: true
        },
        optimizations: [
            'compress-images',
            'optimize-fonts',
            'remove-unnecessary-elements'
        ]
    };
}

/**
 * Gera PDF usando Puppeteer com base nos insights do Amazon Q
 */
async function generatePdfWithInsights(url, qInsights) {
    console.log('📄 Gerando PDF com Puppeteer...');

    const recommendations = qInsights.recommendations;

    const browser = await puppeteer.launch({
        executablePath: chromium.path,
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--single-process'
        ]
    });

    try {
        const page = await browser.newPage();

        // Configurar viewport baseado nas recomendações
        const isLandscape = recommendations.pageConfig.orientation === 'landscape';
        await page.setViewport({
            width: isLandscape ? 1920 : 1080,
            height: isLandscape ? 1080 : 1920,
            deviceScaleFactor: 2
        });

        // Navegar para a página
        console.log(`🌐 Navegando para: ${url}`);
        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Aguardar tempo recomendado pelo Amazon Q
        const waitTime = recommendations.captureStrategy.waitTime || 2000;
        console.log(`⏳ Aguardando ${waitTime}ms para carregamento completo...`);
        await page.waitForTimeout(waitTime);

        // Configurações do PDF baseadas nas recomendações do Q
        const pdfOptions = {
            format: recommendations.pageConfig.format || 'A4',
            landscape: recommendations.pageConfig.orientation === 'landscape',
            margin: {
                top: recommendations.pageConfig.margin || '1cm',
                bottom: recommendations.pageConfig.margin || '1cm',
                left: recommendations.pageConfig.margin || '1cm',
                right: recommendations.pageConfig.margin || '1cm'
            },
            printBackground: true,
            preferCSSPageSize: false
        };

        console.log('⚙️ Configurações do PDF:', pdfOptions);

        // Gerar PDF
        const pdfBuffer = await page.pdf(pdfOptions);

        console.log(`✅ PDF gerado com sucesso! Tamanho: ${pdfBuffer.length} bytes`);

        return pdfBuffer;

    } finally {
        await browser.close();
    }
}

/**
 * Cria resposta HTTP padronizada
 */
function createResponse(statusCode, body) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'POST,OPTIONS'
        },
        body: JSON.stringify(body, null, 2)
    };
}
