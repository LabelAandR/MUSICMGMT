// Simple inventory manager - completely independent of existing code
document.addEventListener('DOMContentLoaded', () => {
  class SimpleInventory {
    constructor() {
      this.cards = [];
      this.authToken = localStorage.getItem('token');
      this.setupEventListeners();
      
      // Initialize immediately if user is logged in
      if (this.authToken) {
        this.loadCards();
      }
    }
    
    setupEventListeners() {
      // Watch for navigation to build screen
      document.getElementById('buildButton')?.addEventListener('click', () => {
        setTimeout(() => this.loadCards(), 100);
      });
      
      // Setup deck slots for drop events
      document.querySelectorAll('.deck-slot').forEach((slot, index) => {
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
          console.log('SimpleInventory: Card dropped with ID:', cardId);
          
          // Find the card data
          const cardData = this.cards.find(c => c._id === cardId);
          if (cardData) {
            // Create a MusicianCard object that ShowManager can use
            const card = new MusicianCard(
              cardData.name,
              cardData.imageFile,
              cardData.hype,
              cardData.physical,
              cardData.concentration,
              cardData.description,
              cardData._id,
              cardData.skill
            );
            
            // Update the ShowManager's selected cards
            const slotIndex = parseInt(slot.getAttribute('data-slot'));
            window.showManager.selectedCards[slotIndex] = card;
            
            // Update the slot display
            this.addCardToSlot(card, slot, slotIndex);
            
            console.log(`SimpleInventory: Added card to slot ${slotIndex}:`, card);
          }
        });
      });
      
      // Add refresh button to the inventory section
      const inventorySections = document.querySelectorAll('.inventory-section');
      inventorySections.forEach(section => {
        const refreshButton = document.createElement('button');
        refreshButton.textContent = 'Refresh Cards';
        refreshButton.className = 'refresh-button';
        refreshButton.style.position = 'absolute';
        refreshButton.style.top = '10px';
        refreshButton.style.right = '10px';
        refreshButton.style.padding = '5px 10px';
        refreshButton.style.backgroundColor = '#b88846';
        refreshButton.style.color = 'white';
        refreshButton.style.border = 'none';
        refreshButton.style.borderRadius = '5px';
        refreshButton.addEventListener('click', () => this.loadCards());
        section.appendChild(refreshButton);
      });
    }
    
    addCardToSlot(card, slot, slotIndex) {
      // Create slot display HTML
      slot.innerHTML = `
        <img src="${card.imageFile}" alt="${card.name}">
        <div class="card-name">${card.name}</div>
        <button class="remove-card" title="Remove card">×</button>
      `;
      slot.classList.remove('empty');
      slot.setAttribute('data-card-id', card._id);

      // Add remove button event
      const removeButton = slot.querySelector('.remove-card');
      removeButton.addEventListener('click', () => {
        this.removeCardFromSlot(slot, slotIndex);
      });
    }
    
    removeCardFromSlot(slot, slotIndex) {
      slot.innerHTML = '';
      slot.classList.add('empty');
      slot.removeAttribute('data-card-id');
      window.showManager.selectedCards[slotIndex] = null;
    }
    
    async loadCards() {
      console.log('SimpleInventory: Loading cards...');
      try {
        const response = await fetch('/api/cards/mycards', {
          headers: {
            'Authorization': `Bearer ${this.authToken}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const cards = await response.json();
        console.log('SimpleInventory: Received cards:', cards);
        this.cards = cards;
        this.renderCards();
      } catch (error) {
        console.error('SimpleInventory: Error loading cards:', error);
      }
    }
    
    renderCards() {
      console.log('SimpleInventory: Rendering cards...');
      const inventoryContainers = document.querySelectorAll('.inventory-cards');
      
      inventoryContainers.forEach(container => {
        // Clear existing content
        container.innerHTML = '';
        
        if (this.cards.length === 0) {
          const message = document.createElement('p');
          message.textContent = 'No cards available';
          message.style.color = 'white';
          message.style.padding = '20px';
          container.appendChild(message);
          return;
        }
        
        this.cards.forEach(card => {
          // Create mini card
          const miniCard = document.createElement('div');
          miniCard.className = 'mini-card';
          miniCard.setAttribute('draggable', 'true');
          miniCard.setAttribute('data-card-id', card._id);
          
          // Handle image path
          const imagePath = card.imageFile.startsWith('/images/') 
              ? card.imageFile 
              : `/images/${card.imageFile}`;
          
          // Card HTML
          miniCard.innerHTML = `
            <div class="card-header">
              <div class="card-title">
                <span class="title-text">${card.name}</span>
              </div>
              <div class="card-stats">
                <span class="physical">💪 ${card.physical}</span>
                <span class="concentration">🧠 ${card.concentration}</span>
                <span class="hype">🎭 ${card.hype}</span>
              </div>
            </div>
            <img src="${imagePath}" alt="${card.name}">
            ${card.skill ? `
            <div class="card-skill">
              <span class="skill-name">${card.skill.name}</span>
            </div>` : ''}
          `;
          
          // Add drag events
          miniCard.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', card._id);
            miniCard.classList.add('dragging');
          });
          
          miniCard.addEventListener('dragend', () => {
            miniCard.classList.remove('dragging');
          });
          
          container.appendChild(miniCard);
        });
      });
    }
  }
  
  // Initialize the simple inventory manager
  window.simpleInventory = new SimpleInventory();
});
