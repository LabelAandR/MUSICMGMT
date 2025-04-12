class MusicianCard {
    constructor(name, imageFile, hype, physical, concentration, description, id = null, skill = null) {
        this._id = id;
        this.name = name;
        this.imageFile = imageFile;
        this.hype = hype;
        this.physical = physical;
        this.concentration = concentration;
        this.description = description;
        this.skill = skill;
    }

    perform(activeEffects = {}) {
        let finalHype = this.hype;
        let message = `${this.name} performs`;

        // Apply this card's skill first to get base hype value
        let newEffects = { ...activeEffects };
        if (this.skill) {
            switch (this.skill.effect) {
                case 'next_card_hype_multiplier_2x':
                    newEffects.next_card_hype_multiplier_2x = true;
                    message += " and inspires the next performer!";
                    break;
                case 'next_card_stats_boost_2':
                    newEffects.next_card_stats_boost_2 = true;
                    message += " and shares ancient wisdom!";
                    break;
                case 'add_physical_to_hype':
                    finalHype += this.physical;
                    message += ` and channels ${this.physical} physical power into hype!`;
                    break;
                case 'next_two_cards_hype_boost_3':
                    newEffects.next_two_cards_hype_boost_3 = 2;
                    message += " and lays down a groove that will boost the next two performers!";
                    break;
                case 'copy_previous_hype':
                    if (activeEffects.previous_hype) {
                        finalHype = activeEffects.previous_hype;
                        message += ` and echoes the previous performance`;
                    }
                    break;
            }
        }

        // Then apply active effects to the final hype value
        if (activeEffects.next_card_hype_multiplier_2x) {
            finalHype *= 2;
            message += " with doubled hype from inspiration!";
            delete activeEffects.next_card_hype_multiplier_2x;
        }

        if (activeEffects.next_card_stats_boost_2) {
            finalHype += 2;
            message += " with enhanced stats";
            delete activeEffects.next_card_stats_boost_2;
        }

        if (activeEffects.next_two_cards_hype_boost_3) {
            finalHype += 3;
            message += " with a groovy boost";
            activeEffects.next_two_cards_hype_boost_3--;
            if (activeEffects.next_two_cards_hype_boost_3 <= 0) {
                delete activeEffects.next_two_cards_hype_boost_3;
            }
        }

        // Store this card's final hype for potential copy effects
        newEffects.previous_hype = finalHype;

        message += ` generating ${finalHype} hype! 🎵`;
        return { hype: finalHype, message, newEffects };
    }

    createMiniCard() {
        const card = document.createElement('div');
        card.className = 'mini-card';
        card.setAttribute('draggable', 'true');
        card.setAttribute('data-card-id', this._id);
        
        // Ensure image path starts with /images/ if it doesn't already
        const imagePath = this.imageFile.startsWith('/images/') 
            ? this.imageFile 
            : `/images/${this.imageFile}`;
        
        card.innerHTML = `
            <div class="card-header">
                <div class="card-title">
                    <span class="title-text">${this.name}</span>
                </div>
                <div class="card-stats">
                    <span class="physical">💪 ${this.physical}</span>
                    <span class="concentration">🧠 ${this.concentration}</span>
                    <span class="hype">🎭 ${this.hype}</span>
                </div>
            </div>
            <img src="${imagePath}" alt="${this.name}">
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
            console.log('Loading user cards...');
            const response = await fetch('/api/cards/mycards', {
                headers: authManager.getAuthHeaders()
            });
            const userCards = await response.json();
            console.log('Received user cards:', userCards);
            
            this.inventory = userCards.map(card => 
                new MusicianCard(
                    card.name,
                    card.imageFile,
                    card.hype,
                    card.physical,
                    card.concentration,
                    card.description,
                    card._id,
                    card.skill
                )
            );
            console.log('Created inventory:', this.inventory);
            this.updateInventoryDisplay();
        } catch (error) {
            console.error('Error loading user cards:', error);
        }
    }

    updateInventoryDisplay() {
        const container = document.querySelector('.inventory-cards');
        if (!container) {
            console.error('Inventory container not found');
            return;
        }
        
        console.log('Updating inventory display with cards:', this.inventory);
        container.innerHTML = '';
        this.inventory.forEach(card => {
            const miniCard = card.createMiniCard();
            container.appendChild(miniCard);
        });
    }

    async startShow() {
        const filledSlots = this.selectedCards.filter(card => card !== null && card !== undefined);
        if (filledSlots.length === 0) {
            alert('You need at least one performer to start the show!');
            return;
        }

        const messageBox = document.getElementById('battleLog');
        if (!messageBox) return;
        
        messageBox.innerHTML = '';
        let totalHype = 0;
        let activeEffects = {}; // Reset active effects at start of show

        for (const card of this.selectedCards) {
            if (!card) continue;

            // Perform the card's action with current active effects
            const result = card.perform(activeEffects);
            
            // Update total hype
            totalHype += result.hype;

            // Update active effects for next card
            activeEffects = result.newEffects;

            // Display the message
            const messageElement = document.createElement('div');
            messageElement.className = 'battle-message';
            messageElement.textContent = result.message;
            messageBox.appendChild(messageElement);

            // Add a small delay for dramatic effect
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Show final result
        const finalMessage = document.createElement('div');
        finalMessage.className = 'battle-message final';
        finalMessage.textContent = `Show complete! Total hype generated: ${totalHype}! 🎉`;
        messageBox.appendChild(finalMessage);

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
                
                let skillHtml = '';
                if (card.skill) {
                    skillHtml = `
                        <div class="card-skill">
                            <span class="skill-name">✨ ${card.skill.name}</span>
                            <span class="skill-desc">${card.skill.description}</span>
                        </div>
                    `;
                }

                cardElement.innerHTML = `
                    <div class="card-title">
                        <span class="title-text">${card.name}</span>
                    </div>
                    <div class="card-stats">
                        <span class="physical">💪 ${card.physical}</span>
                        <span class="concentration">🧠 ${card.concentration}</span>
                        <span class="hype">🎭 ${card.hype}</span>
                    </div>
                    <div class="card-image">
                        <img src="${card.imageFile}" alt="${card.name}">
                    </div>
                    <div class="card-details">
                        <p class="card-description">${card.description}</p>
                    </div>
                    ${skillHtml}
                `;
                arena.appendChild(cardElement);
            }
        });
    }

    setupEventListeners() {
        // Main menu buttons
        document.getElementById('buildButton')?.addEventListener('click', () => {
            console.log('Build button clicked');
            this.showScreen('build-screen');
        });
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
                console.log('Card dropped with ID:', cardId);
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
            <img src="${card.imageFile}" alt="${card.name}">
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
        console.log('Showing screen:', screenId);
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.style.display = 'none';
        });

        // Show selected screen
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.style.display = 'block';
            this.currentScreen = screenId;

            // Update header visibility
            const header = document.getElementById('game-header');
            header.style.display = screenId !== 'auth-screen' ? 'block' : 'none';

            // Update UI for specific screens
            if (screenId === 'build-screen') {
                console.log('Updating build screen');
                this.updateInventoryDisplay();
                this.renderDeckSlots();
            } else if (screenId === 'show-screen') {
                this.renderSelectedCards();
            }
        }
    }
}

// Initialize the game manager
window.showManager = new ShowManager();
