import { TextDecoder, TextEncoder } from 'util';
import { parseCurl, textToHex, hexToText } from '../model/websocketSimulator';

// Node <19 lacks TextEncoder/TextDecoder globally
(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

describe('websocket simulator model', () => {
  it('parses curl command', () => {
    const res = parseCurl("curl 'wss://a.com' -H 'Origin: https://b.com'");
    expect(res.url).toBe('wss://a.com');
    expect(res.origin).toBe('https://b.com');
  });

  it('converts text to hex and back', () => {
    const hex = textToHex('hi');
    expect(hex).toBe('68 69');
    const text = hexToText(hex);
    expect(text).toBe('hi');
  });
});
