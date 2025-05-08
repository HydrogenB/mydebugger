/**
 * Stub implementation of js-sequence-diagrams for build process
 * This is used only for the build to succeed
 * The real implementation would be loaded at runtime in a browser
 */
const mock = {
  parse: (code) => ({
    drawSVG: (containerId, options = {}) => {
      console.warn('js-sequence-diagrams mock called');
      // This is just a stub - real implementation would render SVG
    }
  })
};

export default mock;