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
      id: 'link-tracer',
      name: 'Link Tracer',
      description: 'Trace redirect chains',
      categoryId: 'utilities',
      route: '/tools/link-tracer',
      isNew: true,
      isPopular: true,
    };

    expect(tool.id).toBe('link-tracer');
    expect(tool.name).toBe('Link Tracer');
    expect(tool.description).toBe('Trace redirect chains');
    expect(tool.categoryId).toBe('utilities');
    expect(tool.route).toBe('/tools/link-tracer');
    expect(tool.isNew).toBe(true);
    expect(tool.isPopular).toBe(true);
  });
});
