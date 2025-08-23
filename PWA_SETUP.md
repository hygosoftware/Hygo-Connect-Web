# PWA Setup for Hygo Web App

This document provides information about the Progressive Web App (PWA) setup for the Hygo Web Application.

## Features

- **Offline Support**: The app works offline using service workers
- **Installable**: Users can install the app on their devices
- **App-like Experience**: Full-screen mode and native app behavior
- **Automatic Updates**: Service worker updates in the background

## Required Icons

Place the following icons in the `public/icons/` directory:

- `icon-192x192.png` (192x192 pixels)
- `icon-512x512.png` (512x512 pixels)

## Development

### Testing PWA Features

1. Build the app for production:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

3. Open Chrome DevTools (F12) and go to the "Application" tab to:
   - View and debug service workers
   - Inspect the web app manifest
   - Test offline mode
   - Check storage usage

### Testing Installation

1. In Chrome, click the install icon in the address bar (desktop) or use the "Add to Home Screen" prompt (mobile).
2. The app should be installable on all major browsers and mobile devices.

## Deployment

1. Deploy the app to a hosting service that supports HTTPS (required for service workers).
2. Ensure the `next.config.js` has the correct `assetPrefix` if your app is not served from the root domain.

## Troubleshooting

### Service Worker Not Updating
- Clear site data in browser settings
- Unregister old service workers in Chrome DevTools > Application > Service Workers
- Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)

### PWA Not Installable
- Ensure the site is served over HTTPS in production
- Check that the web app manifest is valid
- Verify that all required icons are present

## Customization

### Updating App Name and Colors
Edit the following files to customize the PWA:

1. `public/manifest.json` - App name, colors, and display settings
2. `src/app/layout.tsx` - Theme color and meta tags
3. `public/sw.js` - Caching strategy and offline behavior

## Additional Resources

- [Next.js PWA Documentation](https://github.com/shadowwalker/next-pwa)
- [Web App Manifest Reference](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
