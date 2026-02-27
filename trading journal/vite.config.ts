import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // string shorthand:
      // http://localhost:5173/foo
      //   -> http://localhost:4567/foo
      '/foo': 'http://localhost:4567',
      // with options:
      // http://localhost:5173/api/bar
      //   -> http://jsonplaceholder.typicode.com/bar
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
      // with RegExp:
      // http://localhost:5173/fallback/
      //   -> http://jsonplaceholder.typicode.com/
      '^/fallback/.*': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path,
      },

    },
    // Proxying websockets or socket.io:
    // ws://localhost:5173/socket.io
    //   -> ws://localhost:5174/socket.io
    // Exercise caution using `rewriteWsOrigin` as it can leave the
    // proxying open to CSRF attacks.
    '/socket.io': {
      target: 'ws://localhost:5174',
      ws: true,
      rewriteWsOrigin: true,
    },
  },
},
)

// https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     proxy: {
//       '/api': {
//         target: 'http://127.0.0.1:3001',
//         changeOrigin: true,
//         secure: false,
//         rewrite: (path) => path,
//       },
//     },
//   },
// })
