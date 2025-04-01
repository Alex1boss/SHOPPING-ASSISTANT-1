/**
 * main.js - Common functionality for the ShopAI application
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Handle image loading errors
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            handleImageError(this);
        });
    });
    
    // Initialize luxury theme enhancements
    if (document.body.classList.contains('luxury-theme')) {
        initializeBillionDollarUI();
    }
    
    // Add scroll listener to handle luxury navbar effect
    window.addEventListener('scroll', function() {
        if (document.querySelector('.luxury-navbar')) {
            if (window.scrollY > 10) {
                document.querySelector('.luxury-navbar').classList.add('scrolled');
            } else {
                document.querySelector('.luxury-navbar').classList.remove('scrolled');
            }
        }
    });
});

/**
 * Handle image loading errors by replacing with a placeholder
 * @param {HTMLImageElement} img - The image element that failed to load
 */
function handleImageError(img) {
    // Get product name or fallback text
    let fallbackText = 'Product';
    if (img.alt) {
        fallbackText = img.alt.charAt(0);
    } else if (img.closest('.product-card')) {
        const titleEl = img.closest('.product-card').querySelector('.product-title');
        if (titleEl && titleEl.textContent) {
            fallbackText = titleEl.textContent.charAt(0);
        }
    }
    
    // Create SVG placeholder
    const bgcolor = '#1e1e1e';
    const textcolor = '#8a2be2';
    const svgUrl = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Crect width='100%25' height='100%25' fill='${bgcolor}'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='36' fill='${textcolor}'%3E${fallbackText}%3C/text%3E%3C/svg%3E`;
    
    img.src = svgUrl;
    img.classList.add('bg-placeholder');
}

/**
 * Format price as a string with a currency symbol
 * @param {number} price - The price to format
 * @param {string} [currency='$'] - The currency symbol to use
 * @returns {string} Formatted price string
 */
function formatPrice(price, currency = '$') {
    if (price === null || price === undefined || isNaN(price)) {
        return 'N/A';
    }
    return `${currency}${parseFloat(price).toFixed(2)}`;
}

/**
 * Calculate discount percentage between original and current price
 * @param {number} originalPrice - The original price
 * @param {number} currentPrice - The current price
 * @returns {number} Discount percentage or 0 if calculation isn't possible
 */
function calculateDiscount(originalPrice, currentPrice) {
    if (!originalPrice || !currentPrice || originalPrice <= 0) {
        return 0;
    }
    return Math.round((originalPrice - currentPrice) / originalPrice * 100);
}

/**
 * Generate HTML for star ratings
 * @param {number} rating - The rating value (0-5)
 * @returns {string} HTML string representing the star rating
 */
function generateStarRating(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    // Add half star if needed
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

/**
 * Generate a platform-specific CSS class based on platform name
 * @param {string} platform - The platform name
 * @returns {string} CSS class for the platform
 */
function getPlatformClass(platform) {
    const platformMap = {
        'amazon': 'amazon-badge',
        'walmart': 'walmart-badge',
        'bestbuy': 'bestbuy-badge',
        'target': 'target-badge',
        'ebay': 'ebay-badge'
    };
    
    platform = platform.toLowerCase();
    return platformMap[platform] || '';
}

/**
 * Display error message in an alert container
 * @param {string} message - The error message to display
 * @param {string} containerId - ID of the container element
 * @param {number} [duration=5000] - Duration in ms before auto-hiding (0 for no auto-hide)
 */
function showError(message, containerId = 'error-container', duration = 5000) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const messageElement = container.querySelector(':scope > span') || container;
    messageElement.textContent = message;
    container.classList.remove('d-none');
    
    if (duration > 0) {
        setTimeout(() => {
            container.classList.add('d-none');
        }, duration);
    }
}

/**
 * Copy text to clipboard
 * @param {string} text - The text to copy
 * @returns {Promise<boolean>} Promise that resolves to true if successful
 */
function copyToClipboard(text) {
    // Use Clipboard API if available
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text)
            .then(() => true)
            .catch(() => {
                // Fallback for older browsers
                return fallbackCopyToClipboard(text);
            });
    }
    
    return fallbackCopyToClipboard(text);
}

/**
 * Fallback method to copy text to clipboard
 * @param {string} text - The text to copy
 * @returns {boolean} True if successful
 */
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    let success = false;
    try {
        success = document.execCommand('copy');
    } catch (err) {
        console.error('Error copying text to clipboard', err);
    }
    
    document.body.removeChild(textArea);
    return success;
}

/**
 * Share content using the Web Share API or fallback to copying a URL
 * @param {Object} shareData - Share data object (title, text, url)
 * @returns {Promise<boolean>} Promise that resolves to true if successful
 */
function shareContent(shareData) {
    // Use Web Share API if available
    if (navigator.share) {
        return navigator.share(shareData)
            .then(() => true)
            .catch(error => {
                console.error('Error sharing', error);
                // Fallback to copying the URL
                return copyToClipboard(shareData.url || window.location.href);
            });
    }
    
    // Fallback to copying the URL
    return copyToClipboard(shareData.url || window.location.href);
}

/**
 * Set up social sharing buttons for a product
 * @param {string} productName - Name of the product
 * @param {string} productUrl - URL of the product
 */
function setupSharingButtons(productName, productUrl) {
    const title = `Check out this deal on ${productName}`;
    const text = `I found a great deal on ${productName} using ShopAI!`;
    const url = productUrl || window.location.href;
    
    // Twitter share
    document.querySelectorAll('.share-twitter').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
            window.open(twitterUrl, '_blank');
        });
    });
    
    // Facebook share
    document.querySelectorAll('.share-facebook').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            window.open(facebookUrl, '_blank');
        });
    });
    
    // Copy link button
    document.querySelectorAll('.share-copy-link').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            copyToClipboard(url).then(success => {
                if (success) {
                    // Show success message
                    const originalText = btn.innerHTML;
                    btn.innerHTML = '<i class="fas fa-check me-1"></i> Copied!';
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                    }, 2000);
                }
            });
        });
    });
    
    // Generic share button
    document.querySelectorAll('.share-button').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            shareContent({title, text, url});
        });
    });
}

/**
 * Initialize billion-dollar luxury UI enhancements
 * Adds animations, effects, and interactions for the premium luxury experience
 */
function initializeBillionDollarUI() {
    console.log('Initializing billion-dollar luxury UI');
    
    // Add fade-in animations to key elements
    document.querySelectorAll('.luxury-card, .luxury-product-card, .super-deal-card')
        .forEach((el, index) => {
            el.classList.add('billion-fade-in');
            el.style.animationDelay = `${index * 0.1}s`;
        });
    
    // Add shine effects to premium elements
    document.querySelectorAll('.luxury-brand-icon, .super-deal-exclusive-tag, .luxury-view-deal-btn')
        .forEach(el => {
            el.classList.add('billion-shine');
        });
    
    // Add floating animations to selected elements
    document.querySelectorAll('.luxury-product-image-container, .super-deal-card')
        .forEach(el => {
            el.classList.add('billion-float');
        });
    
    // Add glow effects to accent elements
    document.querySelectorAll('.luxury-platform-badge, .luxury-deal-score, .luxury-brand-icon')
        .forEach(el => {
            el.classList.add('billion-glow');
        });
    
    // Add pulse effect to call-to-action buttons
    document.querySelectorAll('.super-deal-btn, .btn-primary')
        .forEach(el => {
            el.classList.add('billion-pulse');
        });
    
    // Initialize 3D tilt effect for product cards
    setupTiltEffect();
    
    // Initialize particle effects on hover
    setupParticleEffects();
    
    // Initialize smooth transitions for all interactive elements
    document.querySelectorAll('a, button, .card, .nav-link')
        .forEach(el => {
            if (!el.classList.contains('billion-transition')) {
                el.classList.add('billion-transition');
            }
        });
}

/**
 * Set up advanced 3D tilt effect for luxury cards
 */
function setupTiltEffect() {
    document.querySelectorAll('.luxury-product-card').forEach(card => {
        card.classList.add('billion-tilt');
        
        // Create inner container for 3D transform if needed
        if (!card.querySelector('.billion-tilt-inner')) {
            const children = Array.from(card.children);
            const inner = document.createElement('div');
            inner.classList.add('billion-tilt-inner');
            
            // Move all children to the inner container
            children.forEach(child => inner.appendChild(child));
            card.appendChild(inner);
        }
        
        // Add mouse move handler for tilt effect
        card.addEventListener('mousemove', handleTilt);
        card.addEventListener('mouseleave', resetTilt);
    });
}

/**
 * Handle mouse movement for 3D tilt effect
 * @param {MouseEvent} e - Mouse event
 */
function handleTilt(e) {
    const card = this;
    const inner = card.querySelector('.billion-tilt-inner');
    const rect = card.getBoundingClientRect();
    
    // Calculate mouse position relative to card center
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate rotation based on mouse position
    const rotateX = (centerY - y) / 20;
    const rotateY = (x - centerX) / 20;
    
    // Apply 3D transformation
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    inner.style.transform = 'translateZ(30px)';
}

/**
 * Reset tilt effect when mouse leaves the element
 */
function resetTilt() {
    const card = this;
    const inner = card.querySelector('.billion-tilt-inner');
    
    card.style.transform = 'perspective(1000px)';
    inner.style.transform = 'translateZ(0)';
}

/**
 * Set up particle effects for luxury UI elements
 */
function setupParticleEffects() {
    // Add particle effect to buttons on click
    document.querySelectorAll('.super-deal-btn, .luxury-view-deal-btn').forEach(btn => {
        btn.addEventListener('click', createParticles);
    });
}

/**
 * Create particle effect on click
 * @param {MouseEvent} e - Click event
 */
function createParticles(e) {
    const btn = this;
    const rect = btn.getBoundingClientRect();
    
    // Create multiple particles
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('span');
        particle.classList.add('billion-particle');
        
        // Set starting position at click point
        particle.style.left = `${e.clientX - rect.left}px`;
        particle.style.top = `${e.clientY - rect.top}px`;
        
        // Set random end position
        const x = (Math.random() - 0.5) * 200;
        const y = (Math.random() - 0.5) * 200;
        particle.style.setProperty('--x', `${x}px`);
        particle.style.setProperty('--y', `${y}px`);
        
        // Add particle to button
        btn.appendChild(particle);
        
        // Remove particle after animation completes
        setTimeout(() => {
            if (particle.parentNode === btn) {
                btn.removeChild(particle);
            }
        }, 1500);
    }
}
