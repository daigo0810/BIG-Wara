'use strict';

let historyData = [];
let borrowedKeys = new Set();

function borrowKey() {
  const selectedKey = document.getElementById("key-select").value;
  const borrower = document.getElementById("yourName").value;
  const grade = document.querySelector(".borrowerGrade").value;
  const className = document.querySelector(".borrowerClass").value;
  const number = document.getElementById("myNumber").value;

  if (borrowedKeys.has(selectedKey)) {
    alert(`「${selectedKey}」は現在貸出中です。返却されるまで借用できません。`);
    return;
  }

  if (borrower && number) {
    const displayDiv = document.getElementById("borrower-info");
    displayDiv.textContent = `${selectedKey} の借用者: ${borrower}`;

    const borrowTime = new Date().toLocaleString();

    // 同じキーがある履歴を削除（未返却が重複しないように）
    historyData = historyData.filter(item => item.key !== selectedKey || item.returnTime);

    const historyItem = {
      key: selectedKey,
      borrower,
      grade,
      className,
      number,
      borrowTime,
      returnTime: null,
      returner: null // 返却者情報
    };

    borrowedKeys.add(selectedKey);
    historyData.push(historyItem);
    refreshHistoryList();
    saveToLocalStorage();
  } else {
    alert("名前と番号を入力してください。");
  }
}

function refreshHistoryList() {
  const historyList = document.getElementById("history-list");
  historyList.innerHTML = "";

  historyData.forEach(item => {
    addHistoryToDOM(item);
  });
}

function addHistoryToDOM(historyItem) {
  const historyList = document.getElementById("history-list");
  const listItem = document.createElement("li");

  const message = document.createElement("p");
  message.textContent = `${historyItem.borrowTime} - ${historyItem.grade}${historyItem.className}${historyItem.number} ${historyItem.borrower} が「${historyItem.key}」を借用`;
  listItem.appendChild(message);

  if (historyItem.returnTime && historyItem.returner) {
    const returnInfo = document.createElement("p");
    returnInfo.textContent = `返却: ${historyItem.returnTime} by ${historyItem.returner.grade}${historyItem.returner.className}${historyItem.returner.number} ${historyItem.returner.name}`;
    listItem.appendChild(returnInfo);
  }

  // 返却済みでない場合のみボタン表示
  if (!historyItem.returnTime) {
    const returnButton = document.createElement("button");
    returnButton.textContent = "返却";

    returnButton.onclick = function () {
        console.log("返却ボタンが押されました");

      // 🔽 返却者情報の入力
      const returnGrade = prompt("返却者の学年を入力してください（例: 1, 2, 3, 専）:");
      if (!returnGrade) return;

      const returnClass = prompt("返却者のクラスを入力してください（例: A, B, C, D）:");
      if (!returnClass) return;

      const returnNumber = prompt("返却者の番号を入力してください:");
      if (!returnNumber) return;

      const returnName = prompt("返却者の名前を入力してください:");
      if (!returnName) return;

      const returnTime = new Date().toLocaleString();

      historyItem.returnTime = returnTime;
      historyItem.returner = {
        grade: returnGrade,
        className: returnClass,
        number: returnNumber,
        name: returnName
      };

      borrowedKeys.delete(historyItem.key);
      alert(`返却が完了しました。\n返却者: ${returnGrade}${returnClass}${returnNumber} ${returnName}\n時間: ${returnTime}`);

      refreshHistoryList();
      saveToLocalStorage();
    };

    listItem.appendChild(returnButton);
  }

  historyList.appendChild(listItem);
}

function saveToLocalStorage() {
  localStorage.setItem("historyData", JSON.stringify(historyData));
  localStorage.setItem("borrowedKeys", JSON.stringify(Array.from(borrowedKeys)));
}

window.onload = () => {
  const savedHistory = localStorage.getItem("historyData");
  const savedBorrowed = localStorage.getItem("borrowedKeys");

  if (savedHistory) {
    historyData = JSON.parse(savedHistory);
  }

  if (savedBorrowed) {
    borrowedKeys = new Set(JSON.parse(savedBorrowed));
  }

  refreshHistoryList();
};
