import { ToolCategory, Tool } from '@/models';

describe('Tool and ToolCategory models', () => {
  it('should correctly create a ToolCategory object', () => {
    const category: ToolCategory = {
      id: 'encoding',
      name: 'Encoding Tools',
      description: 'Tools for encoding and decoding data',
      icon: 'encode',
    };

    expect(category.id).toBe('encoding');
    expect(category.name).toBe('Encoding Tools');
    expect(category.description).toBe('Tools for encoding and decoding data');
    expect(category.icon).toBe('encode');
  });

  it('should correctly create a Tool object', () => {
    const tool: Tool = {
      id: 'jwt-decoder',
      name: 'JWT Decoder',
      description: 'Decode and inspect JWT tokens',
      categoryId: 'security',
      route: '/modules/jwt-decoder',
      isNew: true,
      isPopular: true,
    };

    expect(tool.id).toBe('jwt-decoder');
    expect(tool.name).toBe('JWT Decoder');
    expect(tool.description).toBe('Decode and inspect JWT tokens');
    expect(tool.categoryId).toBe('security');
    expect(tool.route).toBe('/modules/jwt-decoder');
    expect(tool.isNew).toBe(true);
    expect(tool.isPopular).toBe(true);
  });
});
