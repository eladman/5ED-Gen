const CACHE_VERSION = 'v1'; // Increment this when you deploy major changes

module.exports = {
  // Service worker registration options
  register: true,
  scope: '/',
  sw: 'sw.js',
  
  // PWA Update Strategy
  clientsClaim: false, // Set to false to allow update notifications
  skipWaiting: false, // Changed to false to allow update notifications
  
  // Cache settings
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: `${CACHE_VERSION}-google-fonts`,
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    {
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: `${CACHE_VERSION}-static-font-assets`,
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
      },
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: `${CACHE_VERSION}-static-image-assets`,
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    {
      urlPattern: /\/_next\/image\?url=.+$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: `${CACHE_VERSION}-next-image`,
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
    {
      urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: `${CACHE_VERSION}-next-data`,
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
    {
      urlPattern: /\/api\/(?!auth).*$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: `${CACHE_VERSION}-api-cache`,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60, // 1 hour
        },
      },
    },
    {
      urlPattern: /.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: `${CACHE_VERSION}-others`,
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
        networkTimeoutSeconds: 10,
      },
    },
  ],
  
  // Offline settings
  fallbacks: {
    document: '/offline.html',
  },
  
  // Development settings
  disable: process.env.NODE_ENV === 'development',
  
  // Build settings
  buildExcludes: [/middleware-manifest\.json$/],
}; 