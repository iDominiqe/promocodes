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
                <div class="promo-header">
                    <h3>${promo.code}</h3>
                    <span class="status-badge">🔥 Активен</span>
                </div>
                <div class="promo-code" onclick="copyCode('${promo.code}')">
                    ${promo.code}
                    <small>кликните чтобы скопировать</small>
                </div>
                <p class="reward">${promo.reward}</p>
                <p class="description">${promo.description || ''}</p>
                <p class="expires">⏰ Действует до: ${promo.expires}</p>
            </div>
        `).join('');
    } else {
        activeList.innerHTML = '<p>Нет активных промокодов</p>';
    }
    
    // Показываем истекшие промокоды
    if (data.expired && data.expired.length > 0) {
        expiredList.innerHTML = data.expired.map(promo => `
            <div class="promo-card expired">
                <div class="promo-header">
                    <h3>${promo.code}</h3>
                    <span class="status-badge">⏰ Истек</span>
                </div>
                <p class="reward">${promo.reward}</p>
                <p class="description">${promo.description || ''}</p>
            </div>
        `).join('');
    } else {
        expiredList.innerHTML = '<p>Нет истекших промокодов</p>';
    }
}

// Обновление даты последнего обновления
function updateLastUpdated(date) {
    const footer = document.querySelector('footer');
    footer.innerHTML += `<br><small>Последнее обновление: ${date}</small>`;
}

// Копирование кода в буфер обмена
function copyCode(code) {
    navigator.clipboard.writeText(code).then(() => {
        // Показываем уведомление
        showNotification(`Код "${code}" скопирован!`);
    }).catch(err => {
        console.error('Ошибка копирования:', err);
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

// Добавляем анимацию для уведомления
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .status-badge {
        background: #10b981;
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 15px;
        font-size: 0.8em;
    }
    
    .promo-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }
    
    .promo-code {
        cursor: pointer;
        transition: background-color 0.2s;
    }
    
    .promo-code:hover {
        background-color: #374151 !important;
    }
`;
document.head.appendChild(style);

// Загружаем промокоды при загрузке страницы
document.addEventListener('DOMContentLoaded', loadPromocodes);
