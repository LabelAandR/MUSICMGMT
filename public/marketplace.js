class MarketplaceManager {
    constructor() {
        this.listings = [];
        this.myListings = [];
        this.setupEventListeners();
        this.loadListings();
        this.setupListingModal();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
                const tab = button.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });

        // Inventory card context menu
        document.querySelector('.inventory-cards')?.addEventListener('contextmenu', (e) => {
            const card = e.target.closest('.mini-card');
            if (card) {
                e.preventDefault();
                const cardId = card.getAttribute('data-card-id');
                this.showListingModal(cardId);
            }
        });
    }

    setupListingModal() {
        const modal = document.getElementById('listCardModal');
        const slider = document.getElementById('priceSlider');
        const input = document.getElementById('priceInput');
        const confirmBtn = document.getElementById('confirmList');
        const cancelBtn = document.getElementById('cancelList');

        // Sync slider and input
        slider.addEventListener('input', () => {
            input.value = slider.value;
        });

        input.addEventListener('input', () => {
            slider.value = input.value;
        });

        // Handle modal buttons
        confirmBtn.addEventListener('click', () => {
            this.listCard(modal.getAttribute('data-card-id'), parseInt(input.value));
            modal.classList.remove('active');
        });

        cancelBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    showListingModal(cardId) {
        const modal = document.getElementById('listCardModal');
        modal.setAttribute('data-card-id', cardId);
        modal.classList.add('active');
    }

    async listCard(cardId, price) {
        try {
            const response = await fetch(`/api/marketplace/list/${cardId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authManager.getAuthHeaders()
                },
                body: JSON.stringify({ price })
            });

            if (response.ok) {
                this.loadListings();
                showManager.loadUserCards(); // Refresh inventory
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to list card');
            }
        } catch (error) {
            console.error('Error listing card:', error);
            alert('Error listing card');
        }
    }

    switchTab(tab) {
        // Update button states
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
        });

        // Update content visibility
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tab}-content`);
        });

        // Load appropriate content
        if (tab === 'browse') {
            // Show only other players' listings in browse tab
            const otherListings = this.listings.filter(listing => listing.seller._id !== authManager.userId);
            this.renderListings(otherListings, 'browse-content', false);
        } else if (tab === 'my-listings') {
            // Show only current player's listings in my-listings tab
            const myListings = this.listings.filter(listing => listing.seller._id === authManager.userId);
            this.renderListings(myListings, 'my-listings-content', true);
        }
    }

    async loadListings() {
        try {
            console.log('Loading listings...');
            const response = await fetch('/api/marketplace/listings', {
                headers: authManager.getAuthHeaders()
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Received listings:', data);
            this.listings = data;

            // Update stats
            this.updateMarketplaceStats();

            // Render active tab
            const activeTab = document.querySelector('.tab-button.active')?.getAttribute('data-tab') || 'browse';
            this.switchTab(activeTab);
        } catch (error) {
            console.error('Error loading listings:', error);
        }
    }

    updateMarketplaceStats() {
        const totalListings = document.getElementById('totalListings');
        const avgPrice = document.getElementById('avgPrice');

        if (this.listings.length > 0) {
            const total = this.listings.reduce((sum, listing) => sum + listing.price, 0);
            const avg = Math.round(total / this.listings.length);
            totalListings.textContent = `Listings: ${this.listings.length}`;
            avgPrice.textContent = `Avg. Price: ${avg} `;
        } else {
            totalListings.textContent = 'Listings: 0';
            avgPrice.textContent = 'Avg. Price: 0 ';
        }
    }

    renderListings(listings, containerId, isMyListings) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Container not found:', containerId);
            return;
        }

        container.innerHTML = '';
        
        if (listings.length === 0) {
            container.innerHTML = '<p class="no-listings">No cards listed</p>';
            return;
        }

        listings.forEach(listing => {
            const card = document.createElement('div');
            card.className = 'marketplace-card';
            card.innerHTML = `
                <div class="card-image">
                    <img src="/images/${listing.card.imageFile}" alt="${listing.card.name}">
                </div>
                <div class="card-details">
                    <h3>${listing.card.name}</h3>
                    <p class="card-description">${listing.card.description}</p>
                    <div class="card-stats">
                        <span class="physical">${listing.card.physical}</span>
                        <span class="concentration">${listing.card.concentration}</span>
                        <span class="hype">${listing.card.hype}</span>
                    </div>
                    <div class="listing-info">
                        <span class="seller">Seller: ${listing.seller.username}</span>
                        <span class="price">${listing.price}</span>
                        ${isMyListings ? 
                            `<button class="cancel-listing" data-listing-id="${listing._id}">Cancel Listing</button>` :
                            `<button class="buy-button" data-listing-id="${listing._id}">Buy Card</button>`
                        }
                    </div>
                </div>
            `;

            // Add event listeners based on the tab
            if (isMyListings) {
                const cancelButton = card.querySelector('.cancel-listing');
                if (cancelButton) {
                    cancelButton.addEventListener('click', () => this.cancelListing(listing._id));
                }
            } else {
                const buyButton = card.querySelector('.buy-button');
                if (buyButton) {
                    buyButton.addEventListener('click', () => this.buyCard(listing._id));
                }
            }

            container.appendChild(card);
        });
    }

    async buyCard(listingId) {
        try {
            const response = await fetch(`/api/marketplace/buy/${listingId}`, {
                method: 'POST',
                headers: authManager.getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                // Update user's balance
                document.getElementById('userBalance').textContent = ` ${data.currency}`;
                // Refresh listings and inventory
                this.loadListings();
                showManager.loadUserCards();
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to buy card');
            }
        } catch (error) {
            console.error('Error buying card:', error);
            alert('Error buying card');
        }
    }

    async cancelListing(listingId) {
        try {
            const response = await fetch(`/api/marketplace/delist/${listingId}`, {
                method: 'POST',
                headers: authManager.getAuthHeaders()
            });

            if (response.ok) {
                this.loadListings();
                showManager.loadUserCards(); // Refresh inventory
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to cancel listing');
            }
        } catch (error) {
            console.error('Error canceling listing:', error);
            alert('Error canceling listing');
        }
    }
}

// Initialize the marketplace manager
document.addEventListener('DOMContentLoaded', () => {
    window.marketplaceManager = new MarketplaceManager();
});
