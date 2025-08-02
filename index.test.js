const { handler } = require("./index");
const mockContext = require("aws-lambda-mock-context");

describe("PDF Generator Lambda", () => {
  let context;

  beforeEach(() => {
    context = mockContext();
  });

  test("deve validar URL obrigatória", async () => {
    const event = {};

    const response = await handler(event, context);

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toBe("URL é obrigatória");
  });

  test("deve normalizar URL sem protocolo", async () => {
    const event = {
      url: "example.com",
    };

    // Mock para Amazon Q CLI falhar e usar configurações padrão
    const originalSpawn = require("child_process").spawn;
    require("child_process").spawn = jest.fn(() => ({
      stdout: { on: jest.fn() },
      stderr: { on: jest.fn() },
      on: jest.fn((event, callback) => {
        if (event === "close") callback(1); // Simular falha
      }),
      kill: jest.fn(),
    }));

    const response = await handler(event, context);

    // Deve funcionar mesmo com Q CLI falhando
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.url).toBe("https://example.com");

    // Restaurar spawn original
    require("child_process").spawn = originalSpawn;
  });

  test("deve lidar com erro na geração de PDF", async () => {
    const event = {
      url: "https://site-inexistente-12345.com",
    };

    const response = await handler(event, context);

    expect(response.statusCode).toBe(500);
    const body = JSON.parse(response.body);
    expect(body.error).toBe("Erro interno do servidor");
  });
});

describe("Funções auxiliares", () => {
  const {
    normalizeUrl,
    extractPageConfig,
    extractCaptureStrategy,
    getDefaultRecommendations,
  } = require("./index");

  test("normalizeUrl deve adicionar https://", () => {
    expect(normalizeUrl("example.com")).toBe("https://example.com");
    expect(normalizeUrl("https://example.com")).toBe("https://example.com");
    expect(normalizeUrl("http://example.com")).toBe("http://example.com");
  });

  test("extractPageConfig deve detectar landscape", () => {
    const response =
      "Para melhor visualização, recomendo usar orientação landscape";
    const config = extractPageConfig(response);

    expect(config.orientation).toBe("landscape");
  });

  test("extractCaptureStrategy deve configurar tempo de espera", () => {
    const response = "Site tem conteúdo dynamic que precisa de JavaScript";
    const strategy = extractCaptureStrategy(response);

    expect(strategy.waitTime).toBe(3000);
    expect(strategy.javascript).toBe(true);
  });

  test("getDefaultRecommendations deve retornar configuração válida", () => {
    const recommendations = getDefaultRecommendations();

    expect(recommendations.pageConfig.format).toBe("A4");
    expect(recommendations.captureStrategy.waitTime).toBe(2000);
    expect(Array.isArray(recommendations.optimizations)).toBe(true);
  });
});
