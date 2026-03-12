import { useState, useEffect, useRef, useCallback } from "react";
import * as esbuild from "esbuild-wasm";

let esbuildInitialized = false;
let esbuildInitPromise: Promise<void> | null = null;

const initEsbuild = async () => {
  if (esbuildInitialized) return;
  if (esbuildInitPromise) {
    await esbuildInitPromise;
    return;
  }

  esbuildInitPromise = esbuild
    .initialize({
      wasmURL: "https://unpkg.com/esbuild-wasm@0.27.3/esbuild.wasm",
    })
    .then(() => {
      esbuildInitialized = true;
    })
    .catch((err) => {
      if (!(err as Error).message?.includes("initialize")) {
        throw err;
      }
      esbuildInitialized = true;
    });

  await esbuildInitPromise;
};

export const useArtifactCompiler = (fileContent: string) => {
  const [compiledHtml, setCompiledHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isCompiling = useRef(false);

  const compile = useCallback(async (code: string) => {
    if (isCompiling.current) return;
    isCompiling.current = true;

    try {
      setIsLoading(true);
      setError(null);

      await initEsbuild();

      const result = await esbuild.transform(code, {
        loader: "tsx",
        target: "es2020",
        jsx: "automatic",
      });

      let jsCode = result.code;
      jsCode = jsCode.replace(
        /import\s+([\w{},\s*]+)\s+from\s+['"]([^'"]+)['"]/g,
        (match, imports, moduleName) => {
          if (moduleName.startsWith(".")) return "";
          if (moduleName === "react")
            return `import ${imports} from "https://esm.sh/react@18.2.0?bundle"`;
          if (moduleName === "react-dom")
            return `import ${imports} from "https://esm.sh/react-dom@18.2.0?bundle"`;
          return `import ${imports} from "https://esm.sh/${moduleName}?bundle"`;
        },
      );

      const bootloaderScript = `
        import React from "https://esm.sh/react@18.2.0?bundle";
        import { createRoot } from "https://esm.sh/react-dom@18.2.0/client?bundle";
        
        const originalLog = console.log;
        const originalError = console.error;

        console.log = (...args) => {
          window.parent.postMessage({ type: 'CONSOLE_LOG', level: 'log', payload: args.map(String) }, '*');
          originalLog(...args);
        };

        console.error = (...args) => {
          window.parent.postMessage({ type: 'CONSOLE_LOG', level: 'error', payload: args.map(String) }, '*');
          originalError(...args);
        };

        window.onerror = function(message, source, lineno, colno, error) {
          const errorMsg = message + ' (' + lineno + ':' + colno + ')';
          document.body.innerHTML = \`
            <div style="color: #ef4444; background: #fef2f2; padding: 1rem; border: 1px solid #fca5a5; font-family: monospace; margin: 1rem; border-radius: 0.5rem;">
              <strong>Runtime Error:</strong><br/>
              \${errorMsg}
            </div>
          \`;
          console.error(errorMsg);
        };

        window.onunhandledrejection = function(event) {
          const errorMsg = event.reason?.message || String(event.reason);
          document.body.innerHTML = \`
            <div style="color: #ef4444; background: #fef2f2; padding: 1rem; border: 1px solid #fca5a5; font-family: monospace; margin: 1rem; border-radius: 0.5rem;">
              <strong>Async Error:</strong><br/>
              \${errorMsg}
            </div>
          \`;
          console.error(errorMsg);
        };

        const userCode = \`${jsCode.replace(/`/g, "\\`").replace(/\$/g, "\\$")}\`;
        const userCodeBlob = new Blob([userCode], { type: 'text/javascript' });
        const userCodeUrl = URL.createObjectURL(userCodeBlob);

        import(userCodeUrl).then((Module) => {
          const App = Module.default;
          
          if (!App) {
            document.body.innerHTML = '<h3 style="color:red">Error: No default export found in .tsx</h3>';
            return;
          }

          const root = createRoot(document.getElementById('root'));
          root.render(React.createElement(App));
          document.body.classList.add('loaded');
        }).catch(err => {
          console.error(err);
          document.body.innerHTML = '<pre style="color:red; overflow:auto; padding: 1rem;">' + err.message + '</pre>';
        });
      `;

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
              body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
            </style>
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <body>
            <div id="root"></div>
            <script type="module">
              ${bootloaderScript}
            </script>
          </body>
        </html>
      `;

      setCompiledHtml(html);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setIsLoading(false);
      isCompiling.current = false;
    }
  }, []);

  useEffect(() => {
    if (fileContent) {
      compile(fileContent);
    }
  }, [fileContent, compile]);

  return { compiledHtml, error, isLoading };
};
