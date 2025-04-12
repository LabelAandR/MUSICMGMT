// Debug script to directly test card loading
document.addEventListener('DOMContentLoaded', () => {
  // Add a debug button to the page
  const debugButton = document.createElement('button');
  debugButton.textContent = 'Debug Card Loading';
  debugButton.style.position = 'fixed';
  debugButton.style.bottom = '20px';
  debugButton.style.right = '20px';
  debugButton.style.zIndex = '9999';
  debugButton.style.padding = '10px';
  debugButton.style.backgroundColor = '#ff5722';
  debugButton.style.color = 'white';
  debugButton.style.border = 'none';
  debugButton.style.borderRadius = '5px';
  debugButton.style.cursor = 'pointer';
  
  document.body.appendChild(debugButton);
  
  debugButton.addEventListener('click', async () => {
    console.log('Debugging card loading...');
    
    try {
      // 1. Check if user is authenticated
      console.log('Auth token:', localStorage.getItem('token'));
      
      // 2. Try to fetch cards directly
      const response = await fetch('/api/cards/mycards', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const cards = await response.json();
      console.log('Cards from API:', cards);
      
      // 3. Create and display cards in inventory
      const inventoryContainer = document.querySelector('.inventory-cards');
      console.log('Inventory container:', inventoryContainer);
      
      if (inventoryContainer) {
        inventoryContainer.innerHTML = '';
        
        if (cards.length === 0) {
          console.log('No cards found!');
          inventoryContainer.innerHTML = '<p style="color:white;">No cards found!</p>';
        } else {
          console.log(`Creating ${cards.length} mini-cards...`);
          
          cards.forEach(card => {
            const miniCard = document.createElement('div');
            miniCard.className = 'mini-card';
            miniCard.setAttribute('draggable', 'true');
            miniCard.setAttribute('data-card-id', card._id);
            
            // Ensure image path starts with /images/ if it doesn't already
            const imagePath = card.imageFile.startsWith('/images/') 
                ? card.imageFile 
                : `/images/${card.imageFile}`;
            
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
            `;
            
            inventoryContainer.appendChild(miniCard);
          });
        }
      } else {
        console.error('Inventory container not found!');
      }
      
    } catch (error) {
      console.error('Error debugging card loading:', error);
    }
  });
});
