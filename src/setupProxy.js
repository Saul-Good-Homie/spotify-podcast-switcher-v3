// const { createProxyMiddleware } = require('http-proxy-middleware');

// module.exports = function (app) {
//     app.use('/auth/**', 
//         createProxyMiddleware({ 
//             target: 'http://localhost:8888'
//         })
//     );
// };

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  // Detect whether app is running in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Set the proxy target URL based on whether app is in development mode or not
  const target = isDevelopment
    ? 'http://localhost:8888'
    : 'https://spotify-podcast-switcher-v3-production.up.railway.app';

  // Configure the proxy middleware
  app.use(
    '/auth/**',
    createProxyMiddleware({
      target,
      changeOrigin: true,
    })
  );
};
