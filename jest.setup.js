// Setup global para testes Jest

// Mock do AWS SDK
jest.mock("aws-sdk", () => ({
  config: {
    update: jest.fn(),
  },
}));

// Mock do Puppeteer
jest.mock("puppeteer-core", () => ({
  launch: jest.fn(() =>
    Promise.resolve({
      newPage: jest.fn(() =>
        Promise.resolve({
          setViewport: jest.fn(),
          goto: jest.fn(),
          waitForTimeout: jest.fn(),
          pdf: jest.fn(() => Promise.resolve(Buffer.from("fake-pdf-content"))),
        })
      ),
      close: jest.fn(),
    })
  ),
}));

// Mock do Chromium
jest.mock("chromium", () => ({
  path: "/fake/path/to/chromium",
}));

// Configurar timeout global para testes
jest.setTimeout(30000);
