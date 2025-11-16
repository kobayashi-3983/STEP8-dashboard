export const initThemeToggle = (): void => {
  const lightBtn = document.getElementById('light-btn') as HTMLButtonElement | null;
  const darkBtn = document.getElementById('dark-btn') as HTMLButtonElement | null;

  if (!lightBtn || !darkBtn) return;

  // 保存されたテーマを取得（なければ light）
  const savedTheme =
    (localStorage.getItem('dashboard-theme') as 'light' | 'dark') || 'light';

  document.body.setAttribute('data-theme', savedTheme);
  updateActiveButton(savedTheme);

  // ボタンイベント
  lightBtn.addEventListener('click', () => switchTheme('light'));
  darkBtn.addEventListener('click', () => switchTheme('dark'));
};

const switchTheme = (theme: 'light' | 'dark'): void => {
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem('dashboard-theme', theme);
  updateActiveButton(theme);
};

const updateActiveButton = (theme: 'light' | 'dark'): void => {
  const lightBtn = document.getElementById('light-btn');
  const darkBtn = document.getElementById('dark-btn');

  if (!lightBtn || !darkBtn) return;

  if (theme === 'light') {
    lightBtn.classList.add('active');
    darkBtn.classList.remove('active');
  } else {
    darkBtn.classList.add('active');
    lightBtn.classList.remove('active');
  }
};
