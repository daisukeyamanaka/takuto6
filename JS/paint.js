// 初期画面起動時
// 初期変数定義
//

var turn = 0; // ターン 1:黒、-1:白
// 盤面の状況を二次元配列で定義
var ban_ar = new Array(8);
for (var x = 0; x < ban_ar.length; x++) {
  ban_ar[x] = new Array(8);
}
const db = firebase.firestore().collection("chat");
$("#send").on("click", function () {
  const data = {
    name: $("#name").val(),
    text: $("#text").val(),
    time: firebase.firestore.FieldValue.serverTimestamp(),
  };
  db.add(data);
  $("#text").val("");
});

db.orderBy('time', 'desc').onSnapshot(function (querySnapshot) {
  console.log(querySnapshot.docs);
  const dataArray = [];
  querySnapshot.docs.forEach(function (doc) {
    const data = {
      id: doc.id,
      data: doc.data(),
    };
    dataArray.push(data);
  });

  console.log(dataArray);
  const tagArray = [];
  dataArray.forEach(function (data) {
    tagArray.push(`
    <div id="${data.id}">
      <p>${
        data.data.name
      } at ${convertTimestampToDatetime(data.data.time)}</p>
      <p>${data.data.text}</p>
    </div>
  `);
  });

  $("#output").html(tagArray);
});

// HTMLで定義したテーブルを取得
var ban = document.getElementById("field");

// 取得したテーブルに盤面生成
ban_new();

// 盤面を初期化する
ban_init();

// クリックした時に実行されるイベント
for (var x = 0; x < 8; x++) {
  for (var y = 0; y < 8; y++) {
    var select_cell = ban.rows[x].cells[y];
    select_cell.onclick = function () {
      // クリックされた場所に石をおく
      ban_set1(this.parentNode.rowIndex, this.cellIndex);
      cheng_turn();
    };
  }
}

// テーブルで盤面を作成する処理
function ban_new() {
  for (var x = 0; x < 8; x++) {
    var tr = document.createElement("tr");
    ban.appendChild(tr);
    for (var y = 0; y < 8; y++) {
      var img_element = document.createElement("img");
      var td = document.createElement("td");
      console.log("x" + x + "y" + y);
      td.id = "x" + x + "y" + y;
      //td.background = './image/gokuu_0016.png';
      img_element.src = "./image/gokuu_0016.png";
      tr.appendChild(td);
    }
  }
}

// 盤面を初期化する処理
function ban_init() {
  // 全てをクリア
  const min = 0;
  const max = 8;
  const randomNumber = Math.floor(Math.random() * (max - min)) + min;
  const randomNumber1 = Math.floor(Math.random() * (max - min)) + min;
  console.log(randomNumber);
  console.log(randomNumber1);
  var Beam = "Beam";
  for (var x = 0; x < 8; x++) {
    for (var y = 0; y < 8; y++) {
      ban_ar[x][y] = 0;
    }
  }
  ban_ar[randomNumber][randomNumber1] = Beam;
  // ターンも初期化
  turn = 0;
  cheng_turn();
  ban_set();
}

// 盤面状況(配列)を実際の盤面へ反映させる処理(初期化用)
function ban_set() {
  var stone = "";
  var URL = "";
  for (var x = 0; x < 8; x++) {
    for (var y = 0; y < 8; y++) {
      switch (ban_ar[x][y]) {
        case 0:
          stone = "";
          URL = "";
          break;
        case -1:
          stone = "○";
          URL = '<img src="./image/ra.png" >';
          break;
        case 1:
          stone = "●";
          URL = '<img src="./image/gokuu_0016.png" >';
          break;
      }
      //ban.rows[x].cells[y].innerText = stone;
      //https://teratail.com/questions/73966
      ban.rows[x].cells[y].innerHTML = URL;
    }
  }
}
// 盤面状況(配列)を実際の盤面へ反映させる処理
function ban_set1(posion_x, posion_y) {
  // 現状の配置をバックアップ

  var stone = "";
  //縦一列をクリック者の色に変更
  if (ban_ar[posion_x][posion_y] == "Beam") {
    startTimer();
    for (var x = 0; x < 8; x++) {
      ban_ar[x][posion_y] = turn;
    }
  } else {
    ban_ar[posion_x][posion_y] = turn;
  }
  var URL = "";
  for (var x = 0; x < 8; x++) {
    for (var y = 0; y < 8; y++) {
      switch (ban_ar[x][y]) {
        case 0:
          stone = "";
          URL = "";
          break;
        case -1:
          stone = "○";
          URL = '<img src="./image/ra.png" >';
          break;
        case 1:
          stone = "●";
          URL = '<img src="./image/gokuu_0016.png" >';
          break;
      }
      //ban.rows[x].cells[y].innerText = stone;
      ban.rows[x].cells[y].innerHTML = URL;
    }
  }
  return true;
}
var ban_bak = new Array(8);
for (var i = 0; i < ban_ar.length; i++) {
  ban_bak[i] = new Array(8);
}
for (var x = 0; x < 8; x++) {
  for (var y = 0; y < 8; y++) {
    ban_bak[x][y] = 0;
  }
}
// ターンを変更する処理
function cheng_turn() {
  var tarn_msg = document.getElementById("view_tarn");
  if (turn == 0) {
    // 0は最初として、メッセージのみで処理終了
    turn = 1;
    tarn_msg.textContent = "ごくうの番です。";
    return;
  }
  // ターンを変更
  turn = turn * -1;
  // ターンを交代して、置けるところがあるか確認する
  // 現状の配置をバックアップ
  for (var x = 0; x < 8; x++) {
    for (var y = 0; y < 8; y++) {
      ban_bak[x][y] = ban_ar[x][y];
    }
  }
  var white_cnt = 0;
  var black_cnt = 0;
  for (var x = 0; x < 8; x++) {
    for (var y = 0; y < 8; y++) {
      // 空白マスのみおけるのでチェック
      // それ以外は石の数を加算
      switch (ban_ar[x][y]) {
        case 0:
          break;
        case -1:
          white_cnt++;
          break;
        case 1:
          black_cnt++;
          break;
      }
    }
  }

  // 白と黒の合計が8*8=64の場合は処理終了
  if (white_cnt + black_cnt == 64) {
    if (white_cnt == black_cnt) {
      alert("勝負は引分です。");
    } else if (white_cnt > black_cnt) {
      alert(
        "勝負は、ごくう：" +
          black_cnt +
          "対、ラディッツ：" +
          white_cnt +
          "で、ラディッツの勝ちです。"
      );
    } else {
      alert(
        "勝負は、ごくう：" +
          black_cnt +
          "対、ラディッツ：" +
          white_cnt +
          "で、ごくうの勝ちです。"
      );
    }
  }

  // ターンを表示する
  switch (turn) {
    case -1:
      tarn_msg.textContent = "ラディッツの番です。";
      break;
    case 1:
      tarn_msg.textContent = "ごくうの番です。";
      break;
  }
}
//グローバル変数宣言
var v = document.getElementById("video");

// タイマーの開始(タイムアウト後の処理も併せて記述)https://www.nishishi.com/javascript-tips/temp-box-settimeout.html
function startTimer() {
  //https://www.javadrive.jp/javascript/webpage/index4.html
  document.getElementById("video").style.display = "block";
  v.load();
  v.play();
  timerId = setTimeout(closeBox, 120000); //二分
}

function closeBox() {
  // 動画
  console.log("death");
  document.getElementById("video").style.display = "none";
  v.pause();
}
//localstrage
//セーブ処理
function ban_seab() {
  localStorage.setItem("array", JSON.stringify(ban_ar));
}
//ロード処理
function ban_load() {
  let data = JSON.parse(localStorage.getItem("array"));
  ban_ar = data;
  ban_set();
  //削除
  localStorage.removeItem("array");
}
// 日時をいい感じの形式にする関数
// chatapp.html内に記述してある関数

function convertTimestampToDatetime(timestamp) {
  const _d = timestamp ? new Date(timestamp * 1000) : new Date();
  const Y = _d.getFullYear();
  const m = (_d.getMonth() + 1).toString().padStart(2, '0');
  const d = _d.getDate().toString().padStart(2, '0');
  const H = _d.getHours().toString().padStart(2, '0');
  const i = _d.getMinutes().toString().padStart(2, '0');
  const s = _d.getSeconds().toString().padStart(2, '0');
  return `${Y}/${m}/${d} ${H}:${i}:${s}`;
}
