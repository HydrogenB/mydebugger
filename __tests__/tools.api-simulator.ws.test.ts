import { parseCurl, textToHex, hexToText } from '../src/tools/api-simulator/lib/websocketSimulator';

describe('WebSocket simulator helpers', () => {
  test('parseCurl extracts url and origin', () => {
    const c = parseCurl("curl 'wss://ws.example.com' -H 'Origin: https://a'\n");
    expect(c.url).toBe('wss://ws.example.com');
    expect(c.origin).toBe('https://a');
  });

  test('hex/text conversion roundtrip', () => {
    const hex = textToHex('Hi');
    expect(hexToText(hex)).toBe('Hi');
  });
});


