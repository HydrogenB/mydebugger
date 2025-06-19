/**
 * © 2025 MyDebugger Contributors – MIT License
 */
self.addEventListener('sync', event => {
  if (event.tag === 'demo-sync') {
    event.waitUntil(Promise.resolve());
  }
});
