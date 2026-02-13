import { useState, useEffect, useRef } from 'react';
import * as esbuild from 'esbuild-wasm';

export const useArtifactCompiler = (fileContent: string) => {
  const [compiledHtml, setCompiledHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    const compile = async () => {
      try {
        // 1. Initialize esbuild (only once)
        if (!isInitialized.current) {
          try {
            await esbuild.initialize({
              worker: true,
              wasmURL: 'https://unpkg.com/esbuild-wasm@0.19.0/esbuild.wasm',
            });
            isInitialized.current = true;
          } catch (initErr) {
            // Already initialized, ignore
            if (!(initErr as Error).message.includes('initialize')) {
               throw initErr
            }
             isInitialized.current = true;
          }
        }

        // 2. Transform Code
        // Transpile JSX/TSX to JS
        const result = await esbuild.transform(fileContent, {
          loader: 'tsx',
          target: 'es2015',
        });

        // 3. Import Rewriter (Smart Version)
        let jsCode = result.code;
        jsCode = jsCode.replace(
          /import\s+([\w{},\s*]+)\s+from\s+['"]([^'"]+)['"]/g, 
          (match, imports, moduleName) => {
             // Skip relative paths (would need virtual FS)
             if (moduleName.startsWith('.')) return ''; 
             
             // 🔥 Force React Version to prevent mismatch
             if (moduleName === 'react') return `import ${imports} from "https://esm.sh/react@18.2.0?bundle"`;
             if (moduleName === 'react-dom') return `import ${imports} from "https://esm.sh/react-dom@18.2.0?bundle"`;
             
             // Libraries
             return `import ${imports} from "https://esm.sh/${moduleName}?bundle"`;
          }
        );

        // 4. Construct HTML
        // Create HTML page to inject into iframe
        const bootloaderScript = `
          import React from "https://esm.sh/react@18.2.0?bundle";
          import { createRoot } from "https://esm.sh/react-dom@18.2.0/client?bundle";
          
          // 🔥 1. Hook Console
          const originalLog = console.log;
          const originalError = console.error;

          console.log = (...args) => {
            // Send message to parent
            window.parent.postMessage({ type: 'CONSOLE_LOG', level: 'log', payload: args.map(String) }, '*');
            originalLog(...args);
          };

          console.error = (...args) => {
            window.parent.postMessage({ type: 'CONSOLE_LOG', level: 'error', payload: args.map(String) }, '*');
            originalError(...args);
          };

          // 🔥 2. Runtime Error Boundary
          window.onerror = function(message, source, lineno, colno, error) {
            const errorMsg = message + ' (' + lineno + ':' + colno + ')';
            document.body.innerHTML = \`
              <div style="color: #ef4444; background: #fef2f2; padding: 1rem; border: 1px solid #fca5a5; font-family: monospace; margin: 1rem; border-radius: 0.5rem;">
                <strong>Runtime Error:</strong><br/>
                \${errorMsg}
              </div>
            \`;
            // Also send to parent console
            console.error(errorMsg);
          };

          // 3. Create Blob URL from Transpiled Code
          const userCodeBlob = new Blob([\`${jsCode}\`], { type: 'text/javascript' });
          const userCodeUrl = URL.createObjectURL(userCodeBlob);

          // 4. Dynamic Import
          import(userCodeUrl).then((Module) => {
            const App = Module.default; // Assume User exports default
            
            if (!App) {
              document.body.innerHTML = '<h3 style="color:red">Error: No default export found in .tsx</h3>';
              return;
            }

            // 5. Mount to div#root
            const root = createRoot(document.getElementById('root'));
            
            // Render the User's App
            root.render(React.createElement(App));
          }).catch(err => {
            console.error(err);
            // This will be caught by window.onerror usually, but just in case
            document.body.innerHTML = '<pre style="color:red; overflow:auto;">' + err.message + '</pre>';
          });
        `;

        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <style>
                body { margin: 0; font-family: sans-serif; opacity: 0; transition: opacity 0.2s; }
                body.loaded { opacity: 1; }
              </style>
              <script src="https://cdn.tailwindcss.com"></script>
              <script>
                // Wait for Tailwind to process
                window.onload = () => document.body.classList.add('loaded');
              </script>
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
      } catch (err: any) {
        setError(err.message);
      }
    };

    if (fileContent) compile();
  }, [fileContent]);

  return { compiledHtml, error };
};
