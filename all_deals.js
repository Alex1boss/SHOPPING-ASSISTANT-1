/**
 * ShopAI - Smart Shopping Assistant
 * All Deals page functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('query');
    const isLuxury = urlParams.get('luxury') === 'true';
    const category = urlParams.get('category') || ''; // Get category parameter if provided

    // Elements
    const dealsContainer = document.getElementById('deals-container');
    const loadingIndicator = document.getElementById('loading-indicator');
    const emptyState = document.getElementById('empty-state');
    const errorState = document.getElementById('error-state');
    const errorMessage = document.getElementById('error-message');
    const retryButton = document.getElementById('retry-button');
    const filteredCount = document.getElementById('filtered-count');
    const filtersForm = document.getElementById('filters-form');
    const sortBySelect = document.getElementById('sort-by');
    
    // Platform filters
    const platformRadios = document.querySelectorAll('input[name="platform"]');
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    const minRatingSelect = document.getElementById('min-rating');
    const inStockCheckbox = document.getElementById('in-stock-only');
    
    // Card template
    const dealCardTemplate = document.getElementById('deal-card-template');
    
    // Default sort config
    let sortBy = 'deal_score';
    let sortOrder = 'desc';
    
    // Current deals data
    let currentDeals = [];
    
    // Retry button handler
    retryButton.addEventListener('click', function() {
        errorState.classList.add('d-none');
        loadingIndicator.classList.remove('d-none');
        loadDeals();
    });
    
    // Filters form submission
    filtersForm.addEventListener('submit', function(e) {
        e.preventDefault();
        loadDeals();
    });
    
    // Sort by change handler
    sortBySelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        sortBy = this.value;
        sortOrder = selectedOption.dataset.order || 'asc';
        
        // If it's a score or rating, default to desc order
        if (sortBy === 'deal_score' || sortBy === 'rating' || sortBy === 'discount') {
            sortOrder = 'desc';
        }
        
        loadDeals();
    });
    
    // Load deals
    async function loadDeals() {
        if (!query) {
            showError("No search query provided");
            return;
        }
        
        // Show loading state
        loadingIndicator.classList.remove('d-none');
        dealsContainer.classList.add('d-none');
        emptyState.classList.add('d-none');
        errorState.classList.add('d-none');
        
        // Get selected platform
        let selectedPlatform = '';
        for (const radio of platformRadios) {
            if (radio.checked && radio.value !== '') {
                selectedPlatform = radio.value;
                break;
            }
        }
        
        // Build API URL with query parameters
        const apiUrl = new URL('/api/all-deals', window.location.origin);
        apiUrl.searchParams.append('query', query);
        if (selectedPlatform) apiUrl.searchParams.append('platform', selectedPlatform);
        if (category) apiUrl.searchParams.append('category', category);  // Include category parameter
        apiUrl.searchParams.append('sort_by', sortBy);
        apiUrl.searchParams.append('sort_order', sortOrder);
        
        const minPrice = parseFloat(minPriceInput.value);
        const maxPrice = parseFloat(maxPriceInput.value);
        const minRating = parseFloat(minRatingSelect.value);
        
        if (!isNaN(minPrice)) apiUrl.searchParams.append('min_price', minPrice);
        if (!isNaN(maxPrice)) apiUrl.searchParams.append('max_price', maxPrice);
        if (!isNaN(minRating)) apiUrl.searchParams.append('min_rating', minRating);
        if (inStockCheckbox.checked) apiUrl.searchParams.append('in_stock', 'true');
        if (isLuxury) apiUrl.searchParams.append('luxury', 'true');
        
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to load deals');
            }
            
            if (!data.deals || data.deals.length === 0) {
                showEmptyState();
                return;
            }
            
            // Update the filtered count
            filteredCount.textContent = data.filtered_deals;
            
            // Store current deals
            currentDeals = data.deals;
            
            // Render deals
            renderDeals(data.deals);
            
            // Show the deals container
            dealsContainer.classList.remove('d-none');
            loadingIndicator.classList.add('d-none');
            
            // If category was detected but not in the original query, show a message
            if (data.category && data.enhanced_query !== data.query) {
                window.showSuccess(`Showing ${data.category} results for "${data.query}"`);
            }
            
        } catch (error) {
            console.error('Error loading deals:', error);
            showError(error.message || "Failed to load deals. Please try again later.");
        }
    }
    
    // Render deals
    function renderDeals(deals) {
        // Clear the container
        dealsContainer.innerHTML = '';
        
        deals.forEach(deal => {
            const dealCard = dealCardTemplate.content.cloneNode(true);
            
            // Set image
            const productImage = dealCard.querySelector('.product-image');
            productImage.src = deal.image_url || 'https://via.placeholder.com/300x300?text=No+Image';
            productImage.alt = deal.name;
            
            // Set platform badge
            const platformBadge = dealCard.querySelector('.platform-name');
            platformBadge.textContent = deal.platform;
            dealCard.querySelector('.product-platform-badge').style.backgroundColor = getPlatformColor(deal.platform);
            
            // Set deal score badge
            const scoreValue = dealCard.querySelector('.score-value');
            scoreValue.textContent = deal.deal_score;
            
            // Set color based on score
            const scoreBadge = dealCard.querySelector('.deal-score-badge');
            if (deal.deal_score >= 90) {
                scoreBadge.classList.add('excellent');
            } else if (deal.deal_score >= 80) {
                scoreBadge.classList.add('great');
            } else if (deal.deal_score >= 70) {
                scoreBadge.classList.add('good');
            } else if (deal.deal_score >= 60) {
                scoreBadge.classList.add('fair');
            } else {
                scoreBadge.classList.add('poor');
            }
            
            // Set title
            dealCard.querySelector('.product-title').textContent = deal.name;
            
            // Set rating
            const starsElement = dealCard.querySelector('.stars');
            starsElement.innerHTML = generateStars(deal.rating);
            dealCard.querySelector('.rating-value').textContent = deal.rating;
            dealCard.querySelector('.review-count').textContent = `(${deal.review_count})`;
            
            // Set prices
            const currentPrice = dealCard.querySelector('.current-price');
            currentPrice.textContent = formatPrice(deal.price);
            
            const originalPrice = dealCard.querySelector('.original-price');
            if (deal.original_price && deal.original_price > deal.price) {
                originalPrice.textContent = formatPrice(deal.original_price);
            } else {
                originalPrice.style.display = 'none';
            }
            
            // Set discount badge
            const discountBadge = dealCard.querySelector('.discount-badge');
            if (deal.discount_percent) {
                discountBadge.textContent = `-${deal.discount_percent}%`;
            } else {
                discountBadge.style.display = 'none';
            }
            
            // Set description
            dealCard.querySelector('.product-description').textContent = 
                deal.description ? (deal.description.length > 100 ? deal.description.substring(0, 100) + '...' : deal.description) : '';
            
            // Set features
            const featuresList = dealCard.querySelector('.features-list');
            if (deal.key_features && deal.key_features.length > 0) {
                deal.key_features.slice(0, 3).forEach(feature => {
                    const li = document.createElement('li');
                    li.textContent = feature;
                    featuresList.appendChild(li);
                });
            } else {
                dealCard.querySelector('.key-features').style.display = 'none';
            }
            
            // Set deal link
            const dealLink = dealCard.querySelector('.view-deal-btn');
            dealLink.href = deal.product_url || '#';
            
            // Set compare button
            const compareBtn = dealCard.querySelector('.compare-btn');
            compareBtn.addEventListener('click', function() {
                window.showSuccess('Compare functionality will be implemented in a future update');
            });
            
            // Append the card to the container
            dealsContainer.appendChild(dealCard);
        });
        
        // Initialize product card effects
        if (typeof setupCardEffects === 'function') {
            setupCardEffects();
        }
    }
    
    // Show empty state
    function showEmptyState() {
        dealsContainer.classList.add('d-none');
        loadingIndicator.classList.add('d-none');
        errorState.classList.add('d-none');
        emptyState.classList.remove('d-none');
    }
    
    // Show error state
    function showError(message) {
        dealsContainer.classList.add('d-none');
        loadingIndicator.classList.add('d-none');
        emptyState.classList.add('d-none');
        
        errorMessage.textContent = message;
        errorState.classList.remove('d-none');
    }
    
    // Format price as currency
    function formatPrice(price) {
        return price ? '$' + parseFloat(price).toFixed(2) : 'N/A';
    }
    
    // Generate star rating HTML
    function generateStars(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        
        let starsHtml = '';
        for (let i = 0; i < fullStars; i++) {
            starsHtml += '<i class="fas fa-star text-warning"></i>';
        }
        
        if (halfStar) {
            starsHtml += '<i class="fas fa-star-half-alt text-warning"></i>';
        }
        
        for (let i = 0; i < emptyStars; i++) {
            starsHtml += '<i class="far fa-star text-warning"></i>';
        }
        
        return starsHtml;
    }
    
    // Get platform color
    function getPlatformColor(platform) {
        const platformColors = {
            'Amazon': '#FF9900',
            'Walmart': '#0071DC',
            'Best Buy': '#0046BE',
            'Target': '#CC0000',
            'eBay': '#E53238'
        };
        
        return platformColors[platform] || '#6c757d';
    }
    
    // Load deals on page load
    loadDeals();
});