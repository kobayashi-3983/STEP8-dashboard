// public/shared/Widget.ts
export abstract class Widget {
  protected el: HTMLElement;

  constructor(selector: string) {
    const target = document.querySelector(selector);
    if (!target) throw new Error(`Widget root '${selector}' not found`);
    this.el = target as HTMLElement;
  }

  abstract init(): void | Promise<void>;

  protected render(html: string) {
    this.el.innerHTML = html;
  }

  /** 🛑 エラー表示用（共通） */
  protected showError(message: string = "データを読み込めませんでした。") {
    this.el.innerHTML = `
      <div class="widget-error">
        ⚠ ${message}
      </div>`;
  }
}
