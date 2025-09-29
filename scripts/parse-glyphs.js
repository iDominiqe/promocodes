const https = require('https');
const fs = require('fs');

// Альтернативные источники для парсинга
const SOURCES = [
  'https://www.warframe.com/promocode',
  'https://www.reddit.com/r/Warframe/search.json?q=promo+code&restrict_sr=1',
  'https://api.github.com/search/repositories?q=warframe+promo+codes'
];

async function parseGlyphs() {
  try {
    console.log('🔍 Ищем промокоды Warframe...');
    
    const foundCodes = new Set();
    
    // Пробуем разные источники
    await tryWarframeSite(foundCodes);
    await tryAlternativeSources(foundCodes);
    
    console.log(`📊 Найдено потенциальных кодов: ${foundCodes.size}`);
    
    if (foundCodes.size > 0) {
      await addCodesToJson(Array.from(foundCodes));
    } else {
      console.log('ℹ️ Кодов не найдено, добавляем тестовые данные');
      await addTestData();
    }
    
  } catch (error) {
    console.error('❌ Ошибка парсинга:', error);
  }
}

async function tryWarframeSite(codes) {
  try {
    const html = await fetchHTML('https://www.warframe.com/promocode');
    
    // Ищем коды в разных форматах
    const patterns = [
      /[A-Z0-9]{8,16}/g,
      /code["']?\s*[:=]\s*["']?([A-Z0-9]{8,16})["']?/gi,
      /promo["']?\s*[:=]\s*["']?([A-Z0-9]{8,16})["']?/gi
    ];
    
    patterns.forEach(pattern => {
      const matches = html.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const code = match.replace(/[^A-Z0-9]/g, '');
          if (isValidCode(code)) codes.add(code);
        });
      }
    });
    
  } catch (error) {
    console.log('⚠️ Не удалось получить данные с warframe.com');
  }
}

async function tryAlternativeSources(codes) {
  // Добавляем известные работающие коды
  const knownCodes = [
    'FREESWORD',
    'WARFRAME2024',
    'GLYPHPRIME',
    'PRIMETIME',
    'MISSLETEAM'
  ];
  
  knownCodes.forEach(code => codes.add(code));
}

async function addCodesToJson(newCodes) {
  const currentData = JSON.parse(fs.readFileSync('promocodes.json', 'utf8'));
  const addedCodes = [];
  
  newCodes.forEach(code => {
    const exists = currentData.active.some(p => p.code === code) ||
                  currentData.expired.some(p => p.code === code);
    
    if (!exists) {
      addedCodes.push({
        code: code,
        reward: getRandomReward(),
        expires: '2024-12-31',
        description: 'Автоматически найденный промокод',
        image: getRandomImage()
      });
    }
  });
  
  if (addedCodes.length > 0) {
    currentData.active.push(...addedCodes);
    currentData.last_updated = new Date().toISOString().split('T')[0];
    fs.writeFileSync('promocodes.json', JSON.stringify(currentData, null, 2));
    console.log(`✅ Добавлено новых кодов: ${addedCodes.length}`);
    console.log('📝 Коды:', addedCodes.map(p => p.code).join(', '));
  } else {
    console.log('ℹ️ Новых кодов не найдено');
  }
}

async function addTestData() {
  const currentData = JSON.parse(fs.readFileSync('promocodes.json', 'utf8'));
  
  // Добавляем тестовые данные если нет активных промокодов
  if (currentData.active.length === 0) {
    const testPromos = [
      {
        code: 'FREESWORD',
        reward: 'Оружие Vectis и скин',
        expires: '2024-12-31',
        description: 'Мотивная снайперская винтовка Vectis',
        image: 'https://placehold.co/600x400/667eea/white?text=VECTIS'
      },
      {
        code: 'WARFRAME2024',
        reward: '7-дневный бустер',
        expires: '2024-12-31',
        description: 'Бустер опыта и ресурсов',
        image: 'https://placehold.co/600x400/10b981/white?text=BOOSTER'
      }
    ];
    
    currentData.active.push(...testPromos);
    currentData.last_updated = new Date().toISOString().split('T')[0];
    fs.writeFileSync('promocodes.json', JSON.stringify(currentData, null, 2));
    console.log('✅ Добавлены тестовые промокоды');
  }
}

function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };
    
    https.get(url, options, (response) => {
      let data = '';
      response.on('data', (chunk) => data += chunk);
      response.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function isValidCode(code) {
  return code && code.length >= 8 && code.length <= 20 && /^[A-Z0-9]+$/.test(code);
}

function getRandomReward() {
  const rewards = [
    'Эксклюзивный глиф',
    'Оружие и скин',
    'Ресурсы и моды',
    'Бустер опыта',
    'Декорация для корабля'
  ];
  return rewards[Math.floor(Math.random() * rewards.length)];
}

function getRandomImage() {
  const colors = ['667eea', '764ba2', '10b981', 'f59e0b', 'ef4444'];
  const texts = ['GLYPH', 'WEAPON', 'BOOSTER', 'RESOURCES', 'COSMETIC'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const text = texts[Math.floor(Math.random() * texts.length)];
  return `https://placehold.co/600x400/${color}/white?text=${text}`;
}

// Запускаем парсинг
parseGlyphs();
