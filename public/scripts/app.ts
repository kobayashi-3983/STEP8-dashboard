// ダッシュボード内のウィジェットをクリックしたら遷移
document.querySelectorAll(".widget-card").forEach((card) => {
  card.addEventListener("click", () => {
    const link = (card as HTMLElement).dataset.link;
    if (link) {
      window.location.href = link;
    }
  });
});
