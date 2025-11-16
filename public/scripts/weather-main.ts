
type City = {
  region: string;
  name: string;
  lat: number;
  lon: number;
};

type DailyForecast = {
  max: string;
  min: string;
  icon: string;
  desc: string;
  pop: number;
};

const cities: City[] = [
  { region: '北海道', name: '札幌', lat: 43.0621, lon: 141.3544 },
  { region: '北海道', name: '釧路', lat: 42.9849, lon: 144.3813 },
  { region: '東北', name: '仙台', lat: 38.2688, lon: 140.8719 },
  { region: '関東', name: '東京', lat: 35.6895, lon: 139.6917 },
  { region: '北陸', name: '新潟', lat: 37.9026, lon: 139.0236 },
  { region: '中部', name: '名古屋', lat: 35.1815, lon: 136.9066 },
  { region: '北陸', name: '金沢', lat: 36.5947, lon: 136.6256 },
  { region: '近畿', name: '大阪', lat: 34.6937, lon: 135.5023 },
  { region: '中国', name: '広島', lat: 34.3853, lon: 132.4553 },
  { region: '四国', name: '高知', lat: 33.5597, lon: 133.5311 },
  { region: '九州', name: '福岡', lat: 33.5902, lon: 130.4017 },
  { region: '九州', name: '鹿児島', lat: 31.5966, lon: 130.5571 },
  { region: '沖縄', name: '那覇', lat: 26.2124, lon: 127.6809 },
];

// HTML参照
const dateRow = document.getElementById('date-row') as HTMLTableRowElement;
const body = document.getElementById('weather-body') as HTMLTableSectionElement;

init();

async function init() {
  // 日付ヘッダー
  const today = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = `${d.getMonth() + 1}/${d.getDate()}(${
      ['日', '月', '火', '水', '木', '金', '土'][d.getDay()]
    })`;
    const th = document.createElement('th');
    th.textContent = dateStr;
    dateRow.appendChild(th);
  }

  // 地域ごとに行を作成
  let currentRegion = '';
  for (const city of cities) {
    if (city.region !== currentRegion) {
      const regionRow = document.createElement('tr');
      const regionCell = document.createElement('td');
      regionCell.colSpan = 7;
      regionCell.classList.add('region');
      regionCell.textContent = city.region;
      regionRow.appendChild(regionCell);
      body.appendChild(regionRow);
      currentRegion = city.region;
    }

    const tr = document.createElement('tr');
    const cityCell = document.createElement('td');
    cityCell.classList.add('city');
    cityCell.textContent = city.name;
    tr.appendChild(cityCell);

    const daily = await fetchDailyForecast(city.lat, city.lon);

    daily.slice(0, 6).forEach((day) => {
      const td = document.createElement('td');
      td.innerHTML = `
        <img src="https://openweathermap.org/img/wn/${day.icon}@2x.png" alt="${day.desc}">
        <div class="temp">
          <span class="max-temp">${day.max}℃</span> /
          <span class="min-temp">${day.min}℃</span>
        </div>
        <div class="pop">💧${Math.round(day.pop)}%</div>
        <div class="desc ${getWeatherClass(day.desc)}">${day.desc}</div>
      `;
      tr.appendChild(td);
    });

    body.appendChild(tr);
  }
}

// === サーバー経由版 ===
async function fetchDailyForecast(
  lat: number,
  lon: number
): Promise<DailyForecast[]> {
  const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
  const raw = await res.json();

  const dailyMap: Record<string, any[]> = {};

  for (const item of raw.list) {
    const date = new Date(item.dt * 1000);
    const key = date.toISOString().split("T")[0];
    if (!dailyMap[key]) dailyMap[key] = [];
    dailyMap[key].push(item);
  }

  return Object.values(dailyMap)
    .slice(0, 6)
    .map((items) => {
      const temps = items.map((i) => i.main.temp);
      return {
        max: Math.max(...temps).toFixed(0),
        min: Math.min(...temps).toFixed(0),
        icon: items[Math.floor(items.length / 2)].weather[0].icon,
        desc: items[Math.floor(items.length / 2)].weather[0].description,
        pop:
          (items.reduce((a, b) => a + (b.pop || 0), 0) / items.length) * 100,
      };
    });
}

function getWeatherClass(desc: string): string {
  if (desc.includes('晴')) return 'sunny';
  if (desc.includes('曇')) return 'cloudy';
  if (desc.includes('雨')) return 'rainy';
  if (desc.includes('雪')) return 'snowy';
  return '';
}
