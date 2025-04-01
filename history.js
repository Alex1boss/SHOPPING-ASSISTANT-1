/**
 * history.js - Functionality for the search history page
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize clear history button
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', clearSearchHistory);
    }
    
    // Initialize product card interactions
    initializeProductCards();
});

/**
 * Clear all search history via API
 */
function clearSearchHistory() {
    // Show confirmation dialog
    if (!confirm('Are you sure you want to clear your entire search history? This action cannot be undone.')) {
        return;
    }
    
    // Show loading state
    const clearBtn = document.getElementById('clear-history-btn');
    const originalText = clearBtn.innerHTML;
    clearBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Clearing...';
    clearBtn.disabled = true;
    
    // Call the API to clear history
    fetch('/api/history/clear', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to clear history');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Show success message and update UI
            const historyContainer = document.getElementById('history-container');
            historyContainer.innerHTML = `
                <div class="text-center my-5 fadeIn">
                    <i class="fas fa-check-circle fa-4x mb-3 text-success"></i>
                    <h3 class="mb-3">History Cleared Successfully</h3>
                    <p class="text-light">Your search history has been deleted.</p>
                    <div class="quick-reply-container justify-content-center mt-3">
                        <a href="/" class="btn btn-accent btn-lg mt-3">
                            <i class="fas fa-search me-1"></i> Start New Search
                        </a>
                    </div>
                </div>
            `;
        } else {
            throw new Error(data.error || 'Failed to clear history');
        }
    })
    .catch(error => {
        console.error('Error clearing history:', error);
        alert('Failed to clear history. Please try again later.');
        
        // Reset button
        clearBtn.innerHTML = originalText;
        clearBtn.disabled = false;
    });
}

/**
 * Initialize product card interactions (compare, buy now, etc.)
 */
function initializeProductCards() {
    // Compare buttons
    document.querySelectorAll('.btn-compare').forEach(btn => {
        btn.addEventListener('click', function() {
            // Get product data from closest product card
            const card = this.closest('.card');
            const productName = card.querySelector('.card-title').textContent;
            
            alert(`Compare feature for "${productName}" will be available soon.`);
        });
    });
    
    // Buy now buttons
    document.querySelectorAll('.btn-buy-now').forEach(btn => {
        btn.addEventListener('click', function() {
            // Get affiliate links from card footer
            const card = this.closest('.card');
            const amazonLink = card.querySelector('.amazon-link');
            
            // Redirect to Amazon link or show options
            if (amazonLink && amazonLink.href) {
                window.open(amazonLink.href, '_blank');
            } else {
                const productName = card.querySelector('.card-title').textContent;
                alert(`Please choose a platform to buy "${productName}"`);
            }
        });
    });
    
    // Platform-specific affiliate links
    document.querySelectorAll('.affiliate-links a').forEach(link => {
        link.addEventListener('click', function(e) {
            // Track click for analytics (placeholder)
            const platform = this.classList.contains('amazon-link') ? 'amazon' : 
                            this.classList.contains('bestbuy-link') ? 'bestbuy' : 
                            this.classList.contains('walmart-link') ? 'walmart' : 'other';
            
            const card = this.closest('.card');
            const productName = card.querySelector('.card-title').textContent;
            
            console.log(`User clicked ${platform} link for "${productName}"`);
            // Let the default link behavior proceed
        });
    });
    
    // Initialize proper star ratings
    document.querySelectorAll('.rating').forEach(ratingContainer => {
        // Check if already properly initialized
        if (ratingContainer.getAttribute('data-initialized') === 'true') return;
        
        // Get product card or parent element
        const card = ratingContainer.closest('.card');
        if (!card) return;
        
        // Try to get rating from data or fallback to 4.5
        let rating = parseFloat(ratingContainer.getAttribute('data-rating') || '4.5');
        
        // Replace stars with properly generated stars
        const starsContainer = ratingContainer.querySelector(':scope > i:first-child').parentNode;
        starsContainer.innerHTML = generateStarRating(rating);
        
        // Mark as initialized
        ratingContainer.setAttribute('data-initialized', 'true');
    });
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
