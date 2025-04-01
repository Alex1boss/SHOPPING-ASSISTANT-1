/**
 * ShopAI - Smart Shopping Assistant
 * Product card functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    setupCardEffects();
    setupDealLinks();
});

/**
 * Setup 3D tilt effect and animations for cards
 */
function setupCardEffects() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        // Add hover animation
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.1)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.05)';
        });
        
        // Add subtle tilt effect if not on mobile
        if (window.innerWidth > 768) {
            addTiltEffect(card);
        }
    });
}

/**
 * Add 3D tilt effect to a card element
 * @param {HTMLElement} card - Card element
 */
function addTiltEffect(card) {
    // Skip if on mobile
    if (window.innerWidth <= 768) return;
    
    // Variables
    let requestId = null;
    let mouseX = 0;
    let mouseY = 0;
    let cardWidth = card.offsetWidth;
    let cardHeight = card.offsetHeight;
    let cardCenterX = card.offsetLeft + cardWidth / 2;
    let cardCenterY = card.offsetTop + cardHeight / 2;
    let maxRotation = 3; // Maximum rotation in degrees
    let currentRotateX = 0;
    let currentRotateY = 0;
    let targetRotateX = 0;
    let targetRotateY = 0;
    const damping = 0.1; // Lower value = smoother but slower transition
    
    // Update transform
    function updateTransform() {
        // Calculate the difference between current and target rotation
        let diffX = targetRotateX - currentRotateX;
        let diffY = targetRotateY - currentRotateY;
        
        // Apply damping
        currentRotateX += diffX * damping;
        currentRotateY += diffY * damping;
        
        // Apply transform
        card.style.transform = `rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg)`;
        
        // Continue animation
        if (Math.abs(diffX) > 0.1 || Math.abs(diffY) > 0.1) {
            requestId = requestAnimationFrame(updateTransform);
        } else {
            cancelAnimationFrame(requestId);
            requestId = null;
        }
    }
    
    // Mouse move handler
    card.addEventListener('mousemove', function(e) {
        // Get card bounding box
        const rect = card.getBoundingClientRect();
        
        // Calculate mouse position relative to card center
        const mouseXRel = e.clientX - rect.left - rect.width / 2;
        const mouseYRel = e.clientY - rect.top - rect.height / 2;
        
        // Calculate target rotation
        targetRotateX = -mouseYRel / rect.height * maxRotation;
        targetRotateY = mouseXRel / rect.width * maxRotation;
        
        // Start animation if not already running
        if (!requestId) {
            requestId = requestAnimationFrame(updateTransform);
        }
    });
    
    // Mouse leave handler - reset rotation
    card.addEventListener('mouseleave', function() {
        targetRotateX = 0;
        targetRotateY = 0;
        
        // Start animation if not already running
        if (!requestId) {
            requestId = requestAnimationFrame(updateTransform);
        }
    });
}

/**
 * Setup tracking for deal links
 */
function setupDealLinks() {
    const dealLinks = document.querySelectorAll('.view-deal-btn');
    
    dealLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Track click in a real app
            const productName = this.closest('.product-card').querySelector('.product-title').textContent;
            const platform = this.closest('.product-card').querySelector('.platform-name').textContent;
            
            // In a real app, send tracking data to analytics
            console.log(`Deal click: ${productName} on ${platform}`);
            
            // For demo, show toast instead of redirecting
            if (link.getAttribute('href') === '#') {
                e.preventDefault();
                window.showSuccess(`You would now be redirected to ${platform} to view this deal`);
            }
        });
    });
}

/**
 * Setup Compare buttons
 */
function setupCompareButtons() {
    const compareButtons = document.querySelectorAll('.compare-btn');
    
    compareButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productName = this.closest('.product-card').querySelector('.product-title').textContent;
            
            // In a real app, add to comparison
            window.showSuccess(`Added "${productName}" to comparison. This feature will be fully implemented soon.`);
        });
    });
}