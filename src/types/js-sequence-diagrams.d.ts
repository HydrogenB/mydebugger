declare module 'js-sequence-diagrams' {
  interface DiagramInstance {
    drawSVG(elementId: string, options?: { theme?: string }): void;
  }

  interface SequenceDiagrams {
    parse(code: string): DiagramInstance;
  }

  const diagram: SequenceDiagrams;
  export default diagram;
}