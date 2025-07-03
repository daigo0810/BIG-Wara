'use strict'
// 1行目に記載している 'use strict' は削除しないでください

window.onload = () => {
  const savedHistory = localStorage.getItem("historyData");
  if (savedHistory) {
    const rawHistory = JSON.parse(savedHistory);
    const historyList = document.getElementById("history-list");

    // 最新の状態を保持する Map を作成（キーごとの最新履歴のみ）
    const latestMap = new Map();
    rawHistory.forEach(item => {
      latestMap.set(item.key, item); // 同じ key の履歴は上書きされる
    });

    // 配列に変換して borrowTime で降順ソート（新しい順）
    const latestHistory = Array.from(latestMap.values()).sort((a, b) => {
      return new Date(b.borrowTime) - new Date(a.borrowTime);
    });

    // 表示
    latestHistory.forEach(item => {
      const listItem = document.createElement("li");
      listItem.textContent = `${item.borrowTime} - ${item.grade}年 ${item.className}組 ${item.number}番 ${item.borrower} が「${item.key}」を借用 ${
        item.returnTime ? `(返却: ${item.returnTime})` : '(未返却)'
      }`;
      historyList.appendChild(listItem);
    });

    // 最新履歴で localStorage を更新（必要に応じて）
    localStorage.setItem("historyData", JSON.stringify(latestHistory));
  }
};

