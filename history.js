'use strict';
// 'use strict' は削除しないでください

window.onload = () => {
  const savedHistory = localStorage.getItem("historyData");
  if (!savedHistory) return;

  const rawHistory = JSON.parse(savedHistory);
  const historyList = document.getElementById("history-list");

  // 最新の状態を保持（キーごとの最新状態のみ）
  const latestMap = new Map();
  rawHistory.forEach(item => {
    latestMap.set(item.key, item);
  });

  // ソート：借用日時の新しい順
  const latestHistory = Array.from(latestMap.values()).sort((a, b) => {
    return new Date(b.borrowTime) - new Date(a.borrowTime);
  });

  // 表示
  latestHistory.forEach(item => {
    const listItem = document.createElement("li");
    const isReturned = !!item.returnTime;

    listItem.classList.toggle("unreturned", !isReturned);

    listItem.innerHTML = `
  <div><strong>${item.borrowTime}</strong></div>
  <div> 借用鍵：「<strong>${item.key}</strong>」  借用者: ${item.grade}年 ${item.className}組 ${item.borrower} </div>
  <div class="status">
    ${
      isReturned
        ? `返却者: ${item.returnGrade || '―'}年 ${item.returnClass || '―'}組 ${item.returner || '―'}  (${item.returnTime})`
        : '未返却'
    }
  </div>
`;


    historyList.appendChild(listItem);
  });

  // 最新履歴で更新（必要なら）
  localStorage.setItem("historyData", JSON.stringify(latestHistory));
};


