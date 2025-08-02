#!/usr/bin/env node

/**
 * Cliente JavaScript para usar a API de geração de PDF
 */

const axios = require("axios");
const fs = require("fs");
const path = require("path");

class PdfGeneratorClient {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
  }

  async generatePdf(url, options = {}) {
    console.log(`🌐 Gerando PDF para: ${url}`);
    console.log(`📡 API URL: ${this.apiUrl}`);

    try {
      const payload = {
        url,
        ...options,
      };

      console.log("📤 Enviando requisição...");
      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 120000, // 2 minutos
      });

      if (response.data.success) {
        console.log("✅ PDF gerado com sucesso!");
        console.log(`📊 Tamanho: ${response.data.fileSize} bytes`);
        console.log(
          `🤖 Insights do Amazon Q: ${JSON.stringify(
            response.data.qInsights,
            null,
            2
          )}`
        );

        return response.data;
      } else {
        throw new Error("Falha na geração do PDF");
      }
    } catch (error) {
      console.error("❌ Erro na requisição:", error.message);

      if (error.response) {
        console.error("📄 Detalhes do erro:", error.response.data);
      }

      throw error;
    }
  }

  async savePdf(url, outputPath, options = {}) {
    try {
      const result = await this.generatePdf(url, options);

      // Decodificar base64
      const pdfBuffer = Buffer.from(result.pdfBase64, "base64");

      // Salvar arquivo
      fs.writeFileSync(outputPath, pdfBuffer);

      console.log(`💾 PDF salvo em: ${outputPath}`);

      return {
        filePath: outputPath,
        fileSize: pdfBuffer.length,
        qInsights: result.qInsights,
      };
    } catch (error) {
      console.error("❌ Erro ao salvar PDF:", error.message);
      throw error;
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log("📋 Uso: node pdf-client.js <url> [output-file] [api-url]");
    console.log("");
    console.log("Exemplos:");
    console.log("  node pdf-client.js https://github.com");
    console.log("  node pdf-client.js https://aws.amazon.com aws-docs.pdf");
    console.log(
      "  node pdf-client.js https://example.com output.pdf https://your-api-url"
    );
    process.exit(1);
  }

  const url = args[0];
  const outputFile = args[1] || generateOutputFilename(url);
  const apiUrl =
    args[2] ||
    "https://your-api-id.execute-api.us-east-1.amazonaws.com/dev/generate-pdf";

  console.log("🤖 Cliente PDF Generator com Amazon Q");
  console.log("===================================");

  const client = new PdfGeneratorClient(apiUrl);

  try {
    await client.savePdf(url, outputFile);

    console.log("");
    console.log("🎉 Conversão concluída com sucesso!");
    console.log(`📄 Arquivo: ${outputFile}`);
  } catch (error) {
    console.log("");
    console.log("💥 Falha na conversão");
    process.exit(1);
  }
}

function generateOutputFilename(url) {
  // Gerar nome de arquivo baseado na URL
  const domain = url.replace(/https?:\/\//, "").replace(/[^a-zA-Z0-9]/g, "_");
  return `pdf_${domain}_${Date.now()}.pdf`;
}

// Exportar classe para uso como módulo
module.exports = PdfGeneratorClient;

// Executar CLI se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}
