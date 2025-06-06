/**
 * © 2025 MyDebugger Contributors – MIT License
 */

/**
 * Model representing a tool category
 */
export interface ToolCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

/**
 * Model representing a tool
 */
export interface Tool {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  route: string;
  /** optional emoji or icon name */
  icon?: string;
  isNew?: boolean;
  isPopular?: boolean;
}

/**
 * List of currently available tools in the application
 */
export const availableTools: Tool[] = [
  {
    id: "link-tracer",
    name: "Link Tracer",
    description: "Trace the complete redirect path of any URL.",
    categoryId: "utilities",
    route: "/tools/link-tracer",
    isNew: true,
  },
  {
    id: "url-encoder",
    name: "URL Encoder/Decoder",
    description: "Encode or decode URL components easily.",
    categoryId: "utilities",
    route: "/tools/url-encoder",
    icon: "🔗",
    isPopular: true,
  },
  {
    id: "headers-analyzer",
    name: "HTTP Headers Analyzer",
    description: "Inspect and validate HTTP response headers.",
    categoryId: "security",
    route: "/tools/headers-analyzer",
    icon: "📊",
  },
  {
    id: "regex-tester",
    name: "Regex Tester",
    description: "Test regular expressions in real time.",
    categoryId: "testing",
    route: "/tools/regex-tester",
    icon: "🔍",
  },
  {
    id: "base64-image-debugger",
    name: "Base64 Image Debugger",
    description: "Decode and preview base64 encoded images.",
    categoryId: "formatters",
    route: "/tools/base64-image-debugger",
    icon: "🖼️",
  },
];
