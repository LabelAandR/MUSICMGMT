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
            const cardContainer = this.createCardElement(listing);

            container.appendChild(cardContainer);
        });
    }

    createCardElement(listing) {
        const cardContainer = document.createElement('div');
        cardContainer.className = 'card-container';

        const card = document.createElement('div');
        card.className = 'marketplace-card';
        card.innerHTML = `
            <div class="card-header">
                <div class="card-title">
                    <span class="title-text">${listing.card.name}</span>
                </div>
                <div class="card-stats">
                    <span class="physical">💪 ${listing.card.physical}</span>
                    <span class="concentration">🧠 ${listing.card.concentration}</span>
                    <span class="hype">🎭 ${listing.card.hype}</span>
                </div>
            </div>
            <div class="card-image">
                <img src="${listing.card.imageFile}" alt="${listing.card.name}">
            </div>
            <div class="card-details">
                ${listing.card.description ? `
                <div class="flavor-text">${listing.card.description}</div>
                ` : ''}
                ${listing.card.skill ? `
                <div class="card-skill">
                    <span class="skill-name">${listing.card.skill.name}</span>
                    <span class="skill-desc">${listing.card.skill.description}</span>
                </div>
                ` : ''}
            </div>
        `;

        // Add buy button with price
        const buyButton = document.createElement('button');
        buyButton.className = 'buy-button';
        buyButton.dataset.price = listing.price;
        buyButton.addEventListener('click', () => this.buyCard(listing._id));

        cardContainer.appendChild(card);
        cardContainer.appendChild(buyButton);
        return cardContainer;
    }

    async buyCard(listingId) {
        try {
            const listing = this.listings.find(l => l._id === listingId);
            if (!listing) {
                alert('Listing not found');
                return;
            }

            const response = await fetch(`/api/marketplace/buy/${listingId}`, {
                method: 'POST',
                headers: authManager.getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                // Update user's currency display
                document.getElementById('userBalance').textContent = ` ${data.currency}`;
                // Refresh listings and user's inventory
                await this.loadListings();
                await window.showManager.loadUserCards();
                alert(`Successfully purchased ${listing.card.name}!`);
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to purchase card');
            }
        } catch (error) {
            console.error('Error buying card:', error);
            alert('Error purchasing card');
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
