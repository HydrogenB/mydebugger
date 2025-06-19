self.addEventListener('push', evt => {
  const data = evt.data?.json() ?? { title: 'MyDebugger Push', body: 'Default body' };
  evt.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      tag: 'mydebugger-push-test',
      icon: '/icons/pwa-push-test.png'
    })
  );
});
