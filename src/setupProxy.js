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
    const isProduction = process.env.NODE_ENV === 'production';
  
    const target = isProduction
      ? 'https://spotify-podcast-switcher-v3-production.up.railway.app'
      : 'http://localhost:8888';
  
    app.use(
      '/auth/**',
      createProxyMiddleware({
        target,
        changeOrigin: true,
      })
    );
  };