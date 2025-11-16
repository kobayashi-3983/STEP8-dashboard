// public/scripts/shared/Widget.ts
export class Widget {
  el: HTMLElement;

  constructor(selector: string) {
    const element = document.querySelector(selector);
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }
    this.el = element as HTMLElement;
  }

  render(html: string) {
    this.el.innerHTML = html;
  }
}
