// Загрузка промокодов
async function loadPromocodes() {
    try {
        const response = await fetch('promocodes.json');
        const data = await response.json();
        
        displayPromocodes(data);
        updateLastUpdated(data.last_updated);
        
    } catch (error) {
        console.error('Ошибка загрузки промокодов:', error);
        document.getElementById('loading').innerHTML = 
            '❌ Ошибка загрузки промокодов. Попробуйте позже.';
    }
}

// Отображение промокодов
function displayPromocodes(data) {
    const activeList = document.getElementById('active-list');
    const expiredList = document.getElementById('expired-list');
    const loading = document.getElementById('loading');
    
    // Скрываем загрузку
    loading.classList.add('hidden');
    
    // Показываем активные промокоды
    if (data.active && data.active.length > 0) {
        activeList.innerHTML = data.active.map(promo => `
            <div class="promo-card active">
                ${getPromoImage(promo.image, promo.reward)}
                <div class="promo-header">
                    <h3>${promo.code}</h3>
                    <span class="status-badge active">Активен</span>
                </div>
                <p class="reward">${promo.reward}</p>
                <p class="description">${promo.description || ''}</p>
                <p class="expires">Действует до: ${promo.expires}</p>
                <div class="promo-actions">
                    <button class="action-btn copy-btn" onclick="copyCode('${promo.code}')">
                        📋 Скопировать код
                    </button>
                    <a href="https://www.warframe.com/promocode?code=${promo.code}" 
                       target="_blank" 
                       class="action-btn redeem-btn">
                        🎮 Активировать
                    </a>
                </div>
            </div>
        `).join('');
    } else {
        activeList.innerHTML = '<p>😔 Нет активных промокодов</p>';
    }
    
    // Показываем истекшие промокоды
    if (data.expired && data.expired.length > 0) {
        expiredList.innerHTML = data.expired.map(promo => `
            <div class="promo-card expired">
                ${getPromoImage(promo.image, promo.reward)}
                <div class="promo-header">
                    <h3>${promo.code}</h3>
                    <span class="status-badge expired">Истек</span>
                </div>
                <p class="reward">${promo.reward}</p>
                <p class="description">${promo.description || ''}</p>
            </div>
        `).join('');
    } else {
        expiredList.innerHTML = '<p>📭 Нет истекших промокодов</p>';
    }
}

// Генерация изображения промокода
function getPromoImage(imagePath, reward) {
    if (imagePath && imagePath !== 'images/') {
        return `<img src="${imagePath}" alt="${reward}" class="promo-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">`;
    }
    return `
        <div class="promo-image image-placeholder">
            🎁
        </div>
    `;
}

// Обновление даты последнего обновления
function updateLastUpdated(date) {
    const footer = document.querySelector('footer');
    footer.innerHTML += `<br><small>Последнее обновление: ${date}</small>`;
}

// Копирование кода в буфер обмена
function copyCode(code) {
    navigator.clipboard.writeText(code).then(() => {
        showNotification(`✅ Код "${code}" скопирован в буфер обмена!`);
    }).catch(err => {
        // Fallback для старых браузеров
        const textArea = document.createElement('textarea');
        textArea.value = code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification(`✅ Код "${code}" скопирован!`);
    });
}

// Показ уведомления
function showNotification(message) {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem 2rem;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Удаляем через 3 секунды
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Загружаем промокоды при загрузке страницы
document.addEventListener('DOMContentLoaded', loadPromocodes);
