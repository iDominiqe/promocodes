async function loadWeapons() {
    try {
        const response = await fetch('data/weapons.json');
        const data = await response.json();
        displayWeapons(data.weapons);
    } catch (error) {
        console.error('Ошибка загрузки оружия:', error);
    }
}

function displayWeapons(weapons) {
    const container = document.getElementById('weapons-list');
    
    container.innerHTML = weapons.map(weapon => `
        <div class="weapon-card" data-type="${weapon.type}">
            <img src="${weapon.image}" alt="${weapon.name}">
            <h3>${weapon.name}</h3>
            <p>${weapon.description}</p>
            <div class="weapon-stats">
                <span>Мастерство: ${weapon.mastery_rank}</span>
                <span>Тип: ${weapon.type}</span>
            </div>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', loadWeapons);
