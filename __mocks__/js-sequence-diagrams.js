// Mock for js-sequence-diagrams\nmodule.exports = {\n  parse: jest.fn().mockImplementation(() => ({\n    drawSVG: jest.fn()\n  }))\n};
