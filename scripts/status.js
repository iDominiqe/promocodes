// Конфигурация серверов для мониторинга
const SERVERS = [
    { name: 'Логин сервер', url: 'https://warframe.com', region: 'Глобальный' },
    { name: 'Игровой сервер EU', url: 'https://content.warframe.com', region: 'Европа' },
    { name: 'Игровой сервер NA', url: 'https://content.origin.warframe.com', region: 'Северная Америка' },
    { name: 'Торговая площадка', url: 'https://warframe.market', region: 'Маркет' },
    { name: 'Форум', url: 'https://forums.warframe.com', region: 'Форум' },
    { name: 'Wiki', url: 'https://warframe.fandom.com', region: 'База знаний' }
];

// Статистика игроков (заглушка - в реальности нужно API)
const PLAYER_STATS = {
    online: '45,000+',
    peak: '67,892',
    update: '5 минут назад'
};

async function initStatusPage() {
    updateLastChecked();
    await checkAllServers();
    updatePlayerStats();
    startAutoRefresh();
}

function updateLastChecked() {
    const now = new Date();
    document.getElementById('last-check').textContent = now.toLocaleString('ru-RU');
    document.getElementById('status-last-updated').textContent = 
        `Последнее обновление: ${now.toLocaleString('ru-RU')}`;
}

async function checkAllServers() {
    const serverList = document.getElementById('server-status');
    serverList.innerHTML = '<div class="loading">Проверка серверов...</div>';

    const results = [];
    
    for (const server of SERVERS) {
        const status = await checkServerStatus(server);
        results.push({ ...server, status });
    }

    displayServerStatus(results);
}

async function checkServerStatus(server) {
    try {
        const startTime = Date.now();
        const response = await fetch(server.url, { 
            method: 'HEAD',
            mode: 'no-cors',
            cache: 'no-cache'
        });
        const responseTime = Date.now() - startTime;

        // Если запрос прошел, считаем сервер онлайн
        return {
            online: true,
            responseTime: responseTime,
            lastChecked: new Date()
        };
    } catch (error) {
        return {
            online: false,
            responseTime: null,
            lastChecked: new Date(),
            error: error.message
        };
    }
}

function displayServerStatus(servers) {
    const serverList = document.getElementById('server-status');
    const overallStatus = document.querySelector('.status-card.online h3');
    
    let onlineCount = 0;
    let totalResponseTime = 0;
    let responseCount = 0;

    serverList.innerHTML = servers.map(server => {
        const isOnline = server.status.online;
        const responseTime = server.status.responseTime;
        
        if (isOnline) {
            onlineCount++;
            if (responseTime) {
                totalResponseTime += responseTime;
                responseCount++;
            }
        }

        return `
            <div class="server-card ${isOnline ? 'online' : 'offline'}">
                <div class="server-header">
                    <h3>${server.name}</h3>
                    <span class="status-indicator ${isOnline ? 'online' : 'offline'}">
                        ${isOnline ? '🟢 Онлайн' : '🔴 Офлайн'}
                    </span>
                </div>
                <p class="server-region">${server.region}</p>
                ${isOnline && responseTime ? 
                    `<p class="response-time">⏱ ${responseTime} мс</p>` : 
                    '<p class="response-time">⏱ -- мс</p>'
                }
                <small>Проверено: ${server.status.lastChecked.toLocaleTimeString('ru-RU')}</small>
            </div>
        `;
    }).join('');

    // Обновляем общий статус
    const overallOnline = onlineCount === SERVERS.length;
    overallStatus.textContent = overallOnline ? '🟢 Все системы в норме' : '🟡 Частичные перебои';
    
    // Обновляем среднее время ответа
    if (responseCount > 0) {
        const avgResponseTime = Math.round(totalResponseTime / responseCount);
        document.getElementById('response-time').textContent = `${avgResponseTime} мс`;
    }
}

function updatePlayerStats() {
    // Заглушка - в реальности нужно API Steam или Warframe
    document.getElementById('players-online').textContent = PLAYER_STATS.online;
    
    // Добавляем историю инцидентов
    const incidentList = document.getElementById('incident-list');
    incidentList.innerHTML = `
        <div class="incident-item resolved">
            <span class="incident-status">✅ Решено</span>
            <span class="incident-date">28.09.2024 14:30</span>
            <p>Плановое техническое обслуживание - завершено</p>
        </div>
        <div class="incident-item monitoring">
            <span class="incident-status">🔍 Мониторинг</span>
            <span class="incident-date">25.09.2024 09:15</span>
            <p>Повышенная нагрузка на сервера аутентификации</p>
        </div>
        <div class="incident-item resolved">
            <span class="incident-status">✅ Решено</span>
            <span class="incident-date">20.09.2024 18:45</span>
            <p>Обновление безопасности - завершено</p>
        </div>
    `;
}

function startAutoRefresh() {
    // Обновляем каждые 5 минут
    setInterval(() => {
        console.log('Авто-обновление статуса серверов...');
        initStatusPage();
    }, 5 * 60 * 1000);
}

// Запускаем при загрузке страницы
document.addEventListener('DOMContentLoaded', initStatusPage);
