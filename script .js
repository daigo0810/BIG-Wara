'use strict';

let historyData = [];
let borrowedKeys = new Set();



function refreshHistoryList() {
  const historyList = document.getElementById("history-list");
  historyList.innerHTML = "";

  historyData
    .filter(item => !item.returnTime)  // 未返却のみ表示
    .forEach(item => {
      addHistoryToDOM(item);
    });
}







let pendingReturnItem = null;

function closeReturnModal() {
  document.getElementById("return-modal").style.display = "none";
  pendingReturnItem = null;
}

document.getElementById("confirm-return").onclick = function () {
  const grade = document.getElementById("return-grade").value;
  const className = document.getElementById("return-class").value;
  const number = document.getElementById("return-number").value;
  const name = document.getElementById("return-name").value;

  if (!grade || !className || !number || !name) {
    alert("すべての項目を入力してください");
    return;
  }

  const returnTime = new Date().toLocaleString();
  pendingReturnItem.returnTime = returnTime;
  pendingReturnItem.returner = {
    grade,
    className,
    number,
    name
  };

  borrowedKeys.delete(pendingReturnItem.key);
  alert(`返却が完了しました\n${grade}${className}${number} ${name} が返却`);

  closeReturnModal();
  saveToLocalStorage();
  refreshHistoryList();
};





      // ページ読み込み時に履歴と貸出状態を復元
      window.onload = function () {
  const savedHistory = localStorage.getItem("historyData");
  if (savedHistory) {
    historyData = JSON.parse(savedHistory);
  }

  borrowedKeys = new Set(historyData.filter(item => !item.returnTime).map(item => item.key));

  refreshHistoryList();  // ここで未返却のみ表示
};



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

          const borrowTime = new Date();
          const borrowTimeStr = borrowTime.toLocaleString();

          const historyItem = {
            key: selectedKey,
            borrower,
            grade,
            className,
            number,
            borrowTime: borrowTimeStr,
            returnTime: null
          };

          borrowedKeys.add(selectedKey);
          historyData.push(historyItem);
          addHistoryToDOM(historyItem);
          saveToLocalStorage();
        } else {
          alert("名前と番号を入力してください。");
        }
      }

      // 履歴をHTMLに追加
      function addHistoryToDOM(historyItem) {
  const historyList = document.getElementById("history-list");
  const listItem = document.createElement("li");

  const message = document.createElement("p");
  message.textContent = `${historyItem.borrowTime} - ${historyItem.grade}年 ${historyItem.className}組 ${historyItem.number}番 ${historyItem.borrower} が「${historyItem.key}」を借用`;
  listItem.appendChild(message);

  if (!historyItem.returnTime) {
    const returnButton = document.createElement("button");
    returnButton.textContent = "返却";
    returnButton.onclick = function () {
      pendingReturnItem = historyItem;
      document.getElementById("return-modal").style.display = "block";
    };
    listItem.appendChild(returnButton);
  } else if (historyItem.returner) {
    const returnInfo = document.createElement("p");
    const r = historyItem.returner;
    returnInfo.textContent = `返却: ${historyItem.returnTime} by ${r.grade}年${r.className}組${r.number}番 ${r.name}`;
    listItem.appendChild(returnInfo);
  }

  historyList.appendChild(listItem);
}


      // localStorage に保存
      function saveToLocalStorage() {
        localStorage.setItem("historyData", JSON.stringify(historyData));
        localStorage.setItem("borrowedKeys", JSON.stringify(Array.from(borrowedKeys)));
      }
 