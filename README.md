# MobileWeb - Mobile-Optimized Website

A modern, responsive website built with mobile-first design principles. This project showcases best practices for creating stunning mobile web experiences.

## Features

### Core Features
- **Mobile-First Design**: Optimized for mobile devices with responsive layouts
- **Progressive Web App (PWA)**: Installable, offline-capable web application
- **Modern UI/UX**: Clean, intuitive interface with smooth animations
- **Performance Optimized**: Fast loading with lazy loading and caching
- **Cross-Browser Compatible**: Works on all modern browsers
- **Touch-Friendly**: Optimized for touch interactions on mobile devices

### Pages Included
1. **Home Page** - Hero section, features, testimonials, stats
2. **About Us** - Company story, team, values, timeline
3. **Services** - Service offerings, pricing, process
4. **Portfolio** - Project showcase with filtering
5. **Blog** - Articles with category filtering
6. **Contact** - Contact form, methods, FAQ, map
7. **Offline** - Offline mode page

### Technical Features
- **Service Worker**: For offline caching and background sync
- **Manifest File**: For PWA installation
- **Lazy Loading**: Images load only when visible
- **Intersection Observer**: For scroll animations
- **Form Validation**: Client-side validation with feedback
- **Touch Support**: Swipe gestures and touch events
- **Reduced Motion**: Respects user's motion preferences

## Project Structure

```
mobile-website/
├── index.html                 # Home page
├── manifest.json             # PWA manifest
├── sw.js                     # Service worker
├── .htaccess                 # Apache configuration
├── README.md                 # This file
├── css/
│   ├── styles.css            # Main styles
│   └── animations.css        # Animation styles
├── js/
│   ├── main.js               # Main JavaScript
│   ├── slider.js             # Testimonials slider
│   └── animations.js         # Animation controller
├── pages/
│   ├── about.html            # About page
│   ├── services.html         # Services page
│   ├── portfolio.html        # Portfolio page
│   ├── blog.html             # Blog page
│   ├── contact.html          # Contact page
│   ├── contact-form.js       # Contact form validation
│   └── offline.html          # Offline page
└── images/                   # Image assets
```

## Getting Started

### Local Development

1. **Clone or Download**: Get the project files
2. **Open in Browser**: Simply open `index.html` in your browser
3. **Local Server**: For best results, use a local server:
   ```bash
   # Using Python 3
   python3 -m http.server 8000
   
   # Using PHP
   php -S localhost:8000
   
   # Using Node.js (with http-server)
   npx http-server -p 8000
   ```
4. **Access**: Open `http://localhost:8000` in your browser

### Production Deployment

1. **Web Server**: Upload to any web server (Apache, Nginx, etc.)
2. **HTTPS**: Ensure HTTPS is enabled for PWA features
3. **Cache**: Configure proper cache headers
4. **Service Worker**: Ensure the service worker can be registered

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome | ✅ Full Support |
| Firefox | ✅ Full Support |
| Safari | ✅ Full Support |
| Edge | ✅ Full Support |
| Opera | ✅ Full Support |
| IE 11 | ❌ Not Supported |

## Performance Optimization

### Techniques Used
- **Lazy Loading**: Images load only when they enter the viewport
- **Code Splitting**: JavaScript is organized into separate files
- **Minification**: CSS and JS are ready for minification
- **Caching**: Service worker caches assets for offline use
- **Compression**: .htaccess includes Gzip compression rules
- **Preloading**: Critical resources are preloaded

### Performance Metrics
- **First Contentful Paint**: < 1s
- **Largest Contentful Paint**: < 2s
- **First Input Delay**: < 100ms
- **Cumulative Layout Shift**: < 0.1

## Customization

### Colors
Edit CSS variables in `css/styles.css`:
```css
:root {
    --primary: #6200ea;
    --secondary: #03dac6;
    --text-primary: #2c3e50;
    --bg-primary: #ffffff;
    /* ... */
}
```

### Typography
Update font imports in HTML head:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

### Content
Edit the HTML files directly to change content, images, and links.

### Images
Replace placeholder images in the `images/` directory or update image URLs in HTML files.

## PWA Configuration

### Manifest
Edit `manifest.json` to customize:
- App name
- Description
- Icons
- Theme colors
- Display mode

### Service Worker
Customize `sw.js` to:
- Add/remove cached assets
- Modify caching strategies
- Add background sync logic
- Implement push notifications

## Testing

### Mobile Testing
- **Chrome DevTools**: Use device emulation
- **BrowserStack**: Test on real devices
- **Responsive Design Checker**: Online tools

### Lighthouse Audit
Run Lighthouse in Chrome DevTools to check:
- Performance
- Accessibility
- Best Practices
- SEO

### Validation
- **HTML**: Use W3C Validator
- **CSS**: Use W3C CSS Validator
- **JavaScript**: Use ESLint

## Accessibility

### Features
- Semantic HTML5
- ARIA labels where needed
- Keyboard navigation support
- Focus management
- Color contrast ratios
- Reduced motion support

### Testing
- **Keyboard Navigation**: Tab through all interactive elements
- **Screen Reader**: Test with NVDA or VoiceOver
- **Color Contrast**: Use WebAIM Contrast Checker

## SEO

### On-Page SEO
- Semantic HTML structure
- Proper heading hierarchy
- Meta tags (title, description)
- OpenGraph tags (for social sharing)
- Sitemap ready

### Technical SEO
- Mobile-friendly design
- Fast loading speed
- HTTPS security
- Structured data ready
- Canonical URLs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Credits

- **Design**: Mobile-first responsive design
- **Icons**: Font Awesome 6
- **Fonts**: Inter from Google Fonts
- **Images**: Placeholder images from Unsplash

## Support

For questions or support, please contact:
- Email: info@mobileweb.com
- Website: https://mobileweb.com

---

Built with ❤️ for the mobile web.
