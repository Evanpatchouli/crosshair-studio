import history from 'connect-history-api-fallback'

function historyPlugin() {
  return {
    name: 'vite-plugin-history',
    configureServer(server) {
      server.middlewares.use(history({
        rewrites: [
          { from: /\/main/, to: '/main.html' },
          { from: /\/monitor/, to: '/monitor.html' },
        ],
        htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'],
      }))
    }
  }
}

export default historyPlugin;