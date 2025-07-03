'use strict';

(() => {
  // 返却対象アイテム
  let pendingReturnItem = null;

  // 履歴データと貸出中の鍵セット
  let historyData = [];
  let borrowedKeys = new Set();

  // DOM要素
  const historyList = document.getElementById('history-list');
  const borrowerInfo = document.getElementById('borrower-info');
  const borrowForm = document.getElementById('borrow-form');
  const returnModal = document.getElementById('return-modal');
  const modalOverlay = document.getElementById('modal-overlay');
  const returnForm = document.getElementById('return-form');
  const cancelReturnBtn = document.getElementById('cancel-return');

  // ローカルストレージキー
  const STORAGE_HISTORY_KEY = 'historyData';

  // 初期化
  window.addEventListener('load', () => {
    const savedHistory = localStorage.getItem(STORAGE_HISTORY_KEY);
    if (savedHistory) {
      try {
        historyData = JSON.parse(savedHistory);
        borrowedKeys = new Set(historyData.filter(item => !item.returnTime).map(item => item.key));
      } catch {
        historyData = [];
        borrowedKeys = new Set();
      }
    }
    refreshHistoryList();
  });

  // 履歴一覧を更新
  function refreshHistoryList() {
    historyList.innerHTML = '';

    const unreturned = historyData.filter(item => !item.returnTime);

    if (unreturned.length === 0) {
      const li = document.createElement('li');
      li.textContent = '現在借用中の鍵はありません。';
      li.classList.add('empty-list');
      historyList.appendChild(li);
      borrowerInfo.textContent = '';
      return;
    }

    unreturned.forEach(item => addHistoryItemToDOM(item));
  }

  // 履歴アイテムをDOMに追加
  function addHistoryItemToDOM(item) {
    const li = document.createElement('li');

    const infoText = `${item.borrowTime} - ${item.grade}年 ${item.className}組 ${item.borrower} が「${item.key}」を借用`;
    const infoP = document.createElement('p');
    infoP.textContent = infoText;
    li.appendChild(infoP);

    const returnBtn = document.createElement('button');
    returnBtn.textContent = '返却';
    returnBtn.setAttribute('aria-label', `${item.key}を返却`);
    returnBtn.type = 'button';
    returnBtn.addEventListener('click', () => openReturnModal(item));
    li.appendChild(returnBtn);

    historyList.appendChild(li);
  }

  // 貸出処理
  borrowForm.addEventListener('submit', e => {
    e.preventDefault();

    const grade = borrowForm['borrowerGrade'].value;
    const className = borrowForm['borrowerClass'].value;
    const number = borrowForm['borrowerNumber'].value.trim();
    const borrower = borrowForm['borrowerName'].value.trim();
    const key = borrowForm['keySelect'].value;

    if (!grade || !className || !number || !borrower || !key) {
      alert('すべての項目を正しく入力してください。');
      return;
    }

    if (borrowedKeys.has(key)) {
      alert(`「${key}」は現在貸出中です。返却されるまで借用できません。`);
      return;
    }

    // 借用日時
    const borrowTime = new Date().toLocaleString();

    // 履歴追加
    const newRecord = {
      key,
      borrower,
      grade,
      className,
      number,
      borrowTime,
      returnTime: null,
      returner: null
    };

    historyData.push(newRecord);
    borrowedKeys.add(key);
    saveToLocalStorage();

    // UI更新
    refreshHistoryList();
    borrowerInfo.textContent = `${key} の借用者: ${borrower}`;

    // フォームリセット
    borrowForm.reset();
    borrowForm['borrowerGrade'].focus();
  });

  // 返却モーダルを開く
  function openReturnModal(item) {
    pendingReturnItem = item;
    returnModal.classList.remove('hidden');
    modalOverlay.classList.remove('hidden');

    // フォーム初期化
    returnForm.reset();
    returnForm['returnGrade'].focus();
  }

  // 返却モーダルを閉じる
  function closeReturnModal() {
    pendingReturnItem = null;
    returnModal.classList.add('hidden');
    modalOverlay.classList.add('hidden');
  }

  // 返却フォームの送信処理
  returnForm.addEventListener('submit', e => {
    e.preventDefault();

    if (!pendingReturnItem) return;

    const grade = returnForm['returnGrade'].value;
    const className = returnForm['returnClass'].value;
    const number = returnForm['returnNumber'].value.trim();
    const returner = returnForm['returnName'].value.trim();

    if (!grade || !className || !number || !returner) {
      alert('すべての項目を正しく入力してください。');
      return;
    }

    // 借用者と返却者が同じか簡易チェック（必要に応じて強化可能）
    // if (
    //   grade !== pendingReturnItem.grade ||
    //   className !== pendingReturnItem.className ||
    //   number !== pendingReturnItem.number ||
    //   returner !== pendingReturnItem.borrower
    // ) {
    //   const ok = confirm(
    //     '入力された返却者情報が借用者情報と異なります。本当に返却処理を行いますか？'
    //   );
    //   if (!ok) return;
    // }

    // 返却日時を追加
    pendingReturnItem.returnTime = new Date().toLocaleString();
    pendingReturnItem.returner = returner;
     pendingReturnItem.returnGrade = grade;       // ★追加
  pendingReturnItem.returnClass = className;   // ★追加
  pendingReturnItem.returnNumber = number; 

    // 鍵を返却済みに
    borrowedKeys.delete(pendingReturnItem.key);
    saveToLocalStorage();
    refreshHistoryList();

    // モーダル閉じる
    closeReturnModal();

    // 返却情報を画面に表示（数秒だけ）
    borrowerInfo.textContent = `${pendingReturnItem.key} は返却されました。`;
    setTimeout(() => {
      borrowerInfo.textContent = '';
    }, 5000);
  });

  // キャンセルボタン
  cancelReturnBtn.addEventListener('click', e => {
    e.preventDefault();
    closeReturnModal();
  });

  // オーバーレイクリックでモーダル閉じる
  modalOverlay.addEventListener('click', closeReturnModal);

  // Escキーでモーダル閉じる
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !returnModal.classList.contains('hidden')) {
      closeReturnModal();
    }
  });

  // サンプルの番号データマップ（本来はDBやlocalStorageなどから取得）
const userDataMap = {
  "11": {grade: "3", className: "D", name: "菅原そうた"},
  "12": {grade: "3", className: "B", name: "芳賀ひなた"},
  "13": {grade: "3", className: "A", name: "中川しゅんすけ"},
  "14": {grade: "3", className: "C", name: "別所だいご"},
};

window.onload = () => {
  const borrowerNumberInput = document.getElementById("borrower-number");
  const borrowerGradeSelect = document.getElementById("borrower-grade");
  const borrowerClassSelect = document.getElementById("borrower-class");
  const borrowerNameInput = document.getElementById("borrower-name");

  const returnNumberInput = document.getElementById("return-number");
  const returnGradeSelect = document.getElementById("return-grade");
  const returnClassSelect = document.getElementById("return-class");
  const returnNameInput = document.getElementById("return-name");

  borrowerNumberInput.addEventListener("input", () => {
    const number = borrowerNumberInput.value.trim();
    if (userDataMap[number]) {
      const data = userDataMap[number];
      borrowerGradeSelect.value = data.grade;
      borrowerClassSelect.value = data.className;
      borrowerNameInput.value = data.name;
    } else {
      borrowerGradeSelect.value = "";
      borrowerClassSelect.value = "";
      borrowerNameInput.value = "";
    }
  });

  returnNumberInput.addEventListener("input", () => {
    const number = returnNumberInput.value.trim();
    if (userDataMap[number]) {
      const data = userDataMap[number];
      returnGradeSelect.value = data.grade;
      returnClassSelect.value = data.className;
      returnNameInput.value = data.name;
    } else {
      returnGradeSelect.value = "";
      returnClassSelect.value = "";
      returnNameInput.value = "";
    }
  });
};


  // ローカルストレージに保存
  function saveToLocalStorage() {
    localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(historyData));
  }
})();
