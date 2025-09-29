const https = require('https');
const fs = require('fs');

// Список известных промокодов Warframe для фильтрации
const knownPromoCodes = [
  'FREESWORD', 'FREEGLYPH', 'WARFRAME', 'PRIMETIME', 'MISSLETEAM',
  'THANKSFORYOURSUPPORT', 'WATCHFULWHISPERS', 'WITCHFIRE', 'NIGHTSOFNABERUS'
];

async function parseGlyphs() {
  try {
    console.log('🔍 Парсим глифы с browse.wf...');
    
    const html = await fetchHTML('https://browse.wf/glyphs');
    
    // Ищем коды в разных форматах
    const codes = findPromoCodes(html);
    
    console.log(`📊 Найдено потенциальных кодов: ${codes.length}`);
    
    if (codes.length > 0) {
      const currentData = JSON.parse(fs.readFileSync('promocodes.json', 'utf8'));
      const newGlyphs = [];
      
      codes.forEach(code => {
        const exists = currentData.active.some(p => p.code === code) ||
                      currentData.expired.some(p => p.code === code);
        
        if (!exists && !knownPromoCodes.includes(code)) {
          newGlyphs.push({
            code: code,
            reward: 'Эксклюзивный глиф',
            expires: '2024-12-31',
            description: 'Автоматически найденный глиф с browse.wf',
            image: 'https://placehold.co/600x400/764ba2/white?text=GLYPH'
          });
        }
      });
      
      if (newGlyphs.length > 0) {
        currentData.active.push(...newGlyphs);
        currentData.last_updated = new Date().toISOString().split('T')[0];
        fs.writeFileSync('promocodes.json', JSON.stringify(currentData, null, 2));
        console.log(`✅ Добавлено новых глифов: ${newGlyphs.length}`);
      } else {
        console.log('ℹ️ Новых глифов не найдено');
      }
    }
    
  } catch (error) {
    console.error('❌ Ошибка парсинга:', error);
  }
}

function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      let data = '';
      response.on('data', (chunk) => data += chunk);
      response.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function findPromoCodes(html) {
  const patterns = [
    /[A-Z0-9]{8,16}/g,  // Стандартные коды
    /[A-Z]-[A-Z0-9]{6,12}/g,  // Коды с дефисами
    /promo[_-]?code[:\s]*([A-Z0-9_-]{8,16})/gi,  // С меткой promo code
    /glyph[:\s]*([A-Z0-9_-]{8,16})/gi  // С меткой glyph
  ];
  
  const codes = new Set();
  
  patterns.forEach(pattern => {
    const matches = html.match(pattern);
    if (matches) {
      matches.forEach(match => {
        // Очищаем код от лишних символов
        const cleanCode = match.replace(/[^A-Z0-9_-]/g, '');
        if (cleanCode.length >= 8 && cleanCode.length <= 16) {
          codes.add(cleanCode);
        }
      });
    }
  });
  
  return Array.from(codes);
}

// Запускаем парсинг
parseGlyphs();
