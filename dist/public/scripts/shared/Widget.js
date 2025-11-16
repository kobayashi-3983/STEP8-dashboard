// public/scripts/shared/Widget.ts
export class Widget {
    constructor(selector) {
        const element = document.querySelector(selector);
        if (!element) {
            throw new Error(`Element not found: ${selector}`);
        }
        this.el = element;
    }
    render(html) {
        this.el.innerHTML = html;
    }
}
