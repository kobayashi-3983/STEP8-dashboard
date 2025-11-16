// public/scripts/widgets/weather-widget.ts
import { Widget } from '../shared/Widget.js';
export class WeatherWidget extends Widget {
    async init() {
        try {
            const res = await fetch('/api/weather?city=東京');
            if (!res.ok)
                throw new Error('Weather API 失敗');
            const data = await res.json();
            const html = `
    <h1 class="weather-title">⛅ 天気アプリ</h1>
      <div class="weather-content">
        <div class="weather-header">
          <h3>東京</h3>
          <div class="desc">${data.current.desc}</div>
        </div>
        <div class="weather-main">
          <img src="https://openweathermap.org/img/wn/${data.current.icon}@2x.png">
          <div class="temps">
            <div class="now">${data.current.temp.toFixed(1)}℃</div>
            <div class="feel">体感 ${data.current.feels_like.toFixed(1)}℃</div>
            <div class="range">
              <span class="max">↑${data.current.max}℃</span>
              <span class="min">↓${data.current.min}℃</span>
            </div>
          </div>
        </div>
        <div class="forecast">
          ${data.forecast
                .map((d) => `   
            <div class="day">
              <div class="date">${d.date}</div>
              <img src="https://openweathermap.org/img/wn/${d.icon}.png">
              <div class="range">
            <span class="max">${d.max}℃</span> /
            <span class="min">${d.min}℃</span>
            </div>
            </div>
          `)
                .join('')}
        </div>
      </div>
    `;
            this.render(html);
        }
        catch (err) {
            console.error('WeatherWidget Error:', err);
            this.render(`
        <div class="widget-error">
          ⚠ 天気データを取得できませんでした。
        </div>
      `);
        }
        this.el.style.cursor = 'pointer';
        this.el.addEventListener('click', () => {
            window.location.href = './weather.html';
        });
    }
}
