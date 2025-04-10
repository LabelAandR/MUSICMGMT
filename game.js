class MusicianCard {
    constructor(name, imageFile, hype, physical, concentration, description) {
        this.name = name;
        this.imageFile = 'images_optimized/' + imageFile.replace('.png', '.jpg');  // Updated path to use optimized JPG images
        this.hype = hype;  // Victory points generated
        this.physical = physical;  // Physical energy cost
        this.concentration = concentration;  // Mental energy cost
        this.description = description;
    }

    perform() {
        return {
            hype: this.hype,
            message: `${this.name} performs, generating ${this.hype} hype!`
        };
    }
}

class ShowManager {
    constructor() {
        this.currentScreen = 'main-menu';
        this.selectedCards = [];
        this.availableCards = [
            new MusicianCard('Soulful Singer', 'vocals good.png', 8, 2, 3, 'A powerful voice that resonates with the audience'),
            new MusicianCard('Dark Vocalist', 'vocals evil.png', 7, 1, 4, 'Haunting melodies that captivate listeners'),
            new MusicianCard('Bass Groove', 'bass.png', 6, 2, 2, 'Lays down an irresistible rhythm'),
            new MusicianCard('Drum Thunder', 'drums good.png', 7, 3, 2, 'Drives the beat with explosive energy'),
            new MusicianCard('Guitar Sage', 'guitar mage.png', 8, 2, 3, 'Weaves magical melodies through the air'),
            new MusicianCard('Guitar Warrior', 'guitar ninja.png', 7, 3, 2, 'Shreds with lightning-fast precision'),
            new MusicianCard('Soul Weaver', 'Soulful Evocation.png', 10, 3, 4, 'Creates transcendent musical experiences')
        ];
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Main menu buttons
        document.getElementById('buildButton').addEventListener('click', () => this.showScreen('build-screen'));
        document.getElementById('battleButton').addEventListener('click', () => this.showScreen('show-screen'));

        // Back buttons
        document.getElementById('backToBuild').addEventListener('click', () => this.showScreen('main-menu'));
        document.getElementById('backToBattle').addEventListener('click', () => this.showScreen('main-menu'));

        // Character selection buttons
        document.querySelectorAll('.select-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const cardName = e.target.getAttribute('data-card');
                this.selectCard(cardName);
            });
        });

        // Start show button
        document.getElementById('startBattle').addEventListener('click', () => this.startShow());
    }

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.style.display = 'none';
        });

        // Show the requested screen
        document.getElementById(screenId).style.display = 'block';

        // Update UI for specific screens
        if (screenId === 'build-screen') {
            this.updateBuildScreen();
        } else if (screenId === 'show-screen' && this.selectedCards.length > 0) {
            this.updateShowScreen();
        }
    }

    updateBuildScreen() {
        const selection = document.querySelector('.character-selection');
        selection.innerHTML = '';

        this.availableCards.forEach(card => {
            const isSelected = this.selectedCards.some(selected => selected.name === card.name);
            const disabled = this.selectedCards.length >= 3 && !isSelected;

            const cardHtml = `
                <div class="character-option ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}" data-card="${card.name}">
                    <div class="character-preview">
                        <img src="${card.imageFile}" alt="${card.name}">
                        <h3>${card.name}</h3>
                        <div class="character-stats">
                            <div class="stat"> ${card.hype} Hype</div>
                            <div class="stat physical"> ${card.physical}</div>
                            <div class="stat concentration"> ${card.concentration}</div>
                        </div>
                        <p class="card-description">${card.description}</p>
                    </div>
                    <button class="select-button" data-card="${card.name}" ${disabled ? 'disabled' : ''}>
                        ${isSelected ? 'Remove' : 'Select'} Performer
                    </button>
                </div>
            `;
            selection.insertAdjacentHTML('beforeend', cardHtml);
        });

        // Reattach event listeners
        document.querySelectorAll('.select-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const cardName = e.target.getAttribute('data-card');
                this.selectCard(cardName);
            });
        });
    }

    selectCard(cardName) {
        const card = this.availableCards.find(c => c.name === cardName);
        const index = this.selectedCards.findIndex(c => c.name === cardName);

        if (index === -1) {
            if (this.selectedCards.length < 3) {
                this.selectedCards.push(card);
            }
        } else {
            this.selectedCards.splice(index, 1);
        }

        this.updateBuildScreen();
    }

    updateShowScreen() {
        if (this.selectedCards.length === 3) {
            const performersList = document.querySelector('.battle-arena');
            performersList.innerHTML = this.selectedCards.map(card => `
                <div class="character" id="${card.name.toLowerCase().replace(' ', '-')}">
                    <div class="character-frame">
                        <div class="character-image">
                            <img src="${card.imageFile}" alt="${card.name}">
                        </div>
                        <div class="stats">
                            <div class="stat"> ${card.hype}</div>
                            <div class="stat physical"> ${card.physical}</div>
                            <div class="stat concentration"> ${card.concentration}</div>
                        </div>
                        <div class="character-info">${card.name}</div>
                    </div>
                </div>
            `).join('');
        }
    }

    async startShow() {
        if (this.selectedCards.length !== 3) {
            alert('Please select exactly 3 performers first!');
            return;
        }

        const startButton = document.getElementById('startBattle');
        startButton.disabled = true;
        
        const battleLog = document.getElementById('battleLog');
        battleLog.innerHTML = '';
        
        let totalHype = 0;
        
        for (const card of this.selectedCards) {
            const result = card.perform();
            totalHype += result.hype;
            
            this.log(result.message);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        this.log(` The show is over! Total Hype generated: ${totalHype} points!`);
        startButton.disabled = false;
    }

    log(message) {
        const battleLog = document.getElementById('battleLog');
        const logEntry = document.createElement('div');
        logEntry.textContent = message;
        battleLog.appendChild(logEntry);
        battleLog.scrollTop = battleLog.scrollHeight;
    }
}

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    new ShowManager();
});
