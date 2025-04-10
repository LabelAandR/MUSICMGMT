class MusicianCard {
    constructor(name, imageFile, hype, physical, concentration, description, id = null) {
        this._id = id;
        this.name = name;
        this.imageFile = imageFile;
        this.hype = hype;
        this.physical = physical;
        this.concentration = concentration;
        this.description = description;
    }

    perform() {
        return {
            hype: this.hype,
            message: `${this.name} performs, generating ${this.hype} hype!`
        };
    }

    createMiniCard() {
        const card = document.createElement('div');
        card.className = 'mini-card';
        card.setAttribute('draggable', 'true');
        card.setAttribute('data-card-id', this._id);
        card.innerHTML = `
            <img src="/images/${this.imageFile}" alt="${this.name}">
            <div class="card-name">${this.name}</div>
        `;
        
        // Add drag events
        card.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', this._id);
            card.classList.add('dragging');
        });
        
        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
        });

        return card;
    }
}

class ShowManager {
    constructor() {
        this.currentScreen = 'main-menu';
        this.selectedCards = [null, null, null];
        this.inventory = [];
        this.setupEventListeners();
        this.loadUserCards();

        // Only show main menu if authenticated
        if (authManager.token) {
            this.showScreen('main-menu');
        }
    }

    async loadUserCards() {
        if (!authManager.token) return;

        try {
            const response = await fetch('/api/cards/mycards', {
                headers: authManager.getAuthHeaders()
            });
            const userCards = await response.json();
            this.inventory = userCards.map(card => 
                new MusicianCard(
                    card.name,
                    card.imageFile,
                    card.hype,
                    card.physical,
                    card.concentration,
                    card.description,
                    card._id
                )
            );
            this.updateInventoryDisplay();
        } catch (error) {
            console.error('Error loading user cards:', error);
        }
    }

    updateInventoryDisplay() {
        const container = document.querySelector('.inventory-cards');
        if (!container) return;
        
        container.innerHTML = '';
        this.inventory.forEach(card => {
            const miniCard = card.createMiniCard();
            container.appendChild(miniCard);
        });
    }

    setupEventListeners() {
        // Main menu buttons
        document.getElementById('buildButton')?.addEventListener('click', () => this.showScreen('build-screen'));
        document.getElementById('battleButton')?.addEventListener('click', () => this.showScreen('show-screen'));
        document.getElementById('marketplaceButton')?.addEventListener('click', () => this.showScreen('marketplace-screen'));

        // Back buttons
        document.getElementById('backToBuild')?.addEventListener('click', () => this.showScreen('main-menu'));
        document.getElementById('backToBattle')?.addEventListener('click', () => this.showScreen('main-menu'));
        document.getElementById('backToMarket')?.addEventListener('click', () => this.showScreen('main-menu'));

        // Start show button
        document.getElementById('startBattle')?.addEventListener('click', () => this.startShow());

        this.setupCardSlots();
    }

    setupCardSlots() {
        const slots = document.querySelectorAll('.deck-slot');
        slots.forEach((slot, index) => {
            slot.addEventListener('dragover', (e) => {
                e.preventDefault();
                slot.classList.add('dragover');
            });

            slot.addEventListener('dragleave', () => {
                slot.classList.remove('dragover');
            });

            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                slot.classList.remove('dragover');
                const cardId = e.dataTransfer.getData('text/plain');
                const card = this.inventory.find(c => c._id === cardId);
                if (card) {
                    this.addCardToSlot(card, slot);
                    const slotIndex = parseInt(slot.getAttribute('data-slot'));
                    this.selectedCards[slotIndex] = card;
                }
            });
        });
    }

    addCardToSlot(card, slot) {
        slot.innerHTML = `
            <img src="/images/${card.imageFile}" alt="${card.name}">
            <div class="card-name">${card.name}</div>
            <button class="remove-card" title="Remove card">×</button>
        `;
        slot.classList.remove('empty');
        slot.setAttribute('data-card-id', card._id);

        const removeButton = slot.querySelector('.remove-card');
        removeButton.addEventListener('click', () => {
            this.removeCardFromSlot(slot);
            const slotIndex = parseInt(slot.getAttribute('data-slot'));
            this.selectedCards[slotIndex] = null;
        });
    }

    removeCardFromSlot(slot) {
        slot.innerHTML = '';
        slot.classList.add('empty');
        slot.removeAttribute('data-card-id');
    }

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.style.display = 'none';
        });

        // Show the requested screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.style.display = 'block';
        }

        // Always show header except on auth screen
        const header = document.getElementById('game-header');
        if (header) {
            header.style.display = screenId === 'auth-screen' ? 'none' : 'block';
        }

        // Update UI for specific screens
        if (screenId === 'build-screen') {
            this.renderDeckSlots();
        } else if (screenId === 'show-screen') {
            this.renderSelectedCards();
        }

        this.currentScreen = screenId;
    }

    renderDeckSlots() {
        document.querySelectorAll('.deck-slot').forEach((slot, index) => {
            slot.innerHTML = '';
            const card = this.selectedCards[index];
            if (card) {
                const miniCard = card.createMiniCard();
                slot.appendChild(miniCard);
            }
        });
    }

    renderSelectedCards() {
        const arena = document.querySelector('.battle-arena');
        if (!arena) return;
        
        arena.innerHTML = '';
        this.selectedCards.forEach(card => {
            if (card) {
                const cardElement = document.createElement('div');
                cardElement.className = 'battle-card';
                cardElement.innerHTML = `
                    <img src="/images/${card.imageFile}" alt="${card.name}">
                    <h3>${card.name}</h3>
                    <div class="card-stats">
                        <span class="physical">💪 ${card.physical}</span>
                        <span class="concentration">🧠 ${card.concentration}</span>
                        <span>🎭 ${card.hype}</span>
                    </div>
                `;
                arena.appendChild(cardElement);
            }
        });
    }

    async startShow() {
        const filledSlots = this.selectedCards.filter(card => card !== null && card !== undefined);
        if (filledSlots.length !== 3) {
            alert('You need exactly 3 performers to start the show!');
            return;
        }

        const battleLog = document.getElementById('battleLog');
        if (!battleLog) return;
        
        battleLog.innerHTML = '';

        let totalHype = 0;
        for (const card of this.selectedCards) {
            if (!card) continue;
            const result = card.perform();
            totalHype += result.hype;
            
            const logEntry = document.createElement('p');
            logEntry.textContent = result.message;
            battleLog.appendChild(logEntry);
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const finalResult = document.createElement('h3');
        finalResult.textContent = `Show complete! Total Hype generated: ${totalHype}! 🎉`;
        battleLog.appendChild(finalResult);

        // Update user's earnings
        try {
            await fetch('/api/users/show-complete', {
                method: 'POST',
                headers: authManager.getAuthHeaders(),
                body: JSON.stringify({ hype: totalHype })
            });
            authManager.updateUserInfo();
        } catch (error) {
            console.error('Error updating show results:', error);
        }
    }
}

// Initialize the game manager
window.showManager = new ShowManager();
