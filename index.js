const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

const port = 3000;

// ejsをexpressで利用できるようにejsを指定
app.set("view engine", "ejs");

// expressサーバからpublicフォルダにアクセスできるようにする
app.use(express.static("public"));

// ルーティング処理
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/zoom", (req, res) => {
  res.render("zoom");
});

// connectionイベント(ブラウザからアクセス)があったときの処理
io.on("connection", (socket) => {
  console.log("a user connected");

  // 新たに接続してきたブラウザのみにメッセージを送信
  socket.emit("message", "Zoomクローンにようこそ");

  // アクセスを行ったブラウザ以外にメッセージを送信
  socket.broadcast.emit("message", "新しいユーザが接続されました。");

  // messageイベントを受信した場合
  socket.on("message", (msg) => {
    // 全ブラウザに送信
    io.emit("message", msg);
  });

  // 接続が切れた場合
  socket.on("disconnect", () => {
    io.emit("message", "ユーザからの接続が切れました。");
  });
});

// port3000番号で起動
server.listen(port, () => {
  console.log("listening on *:3000");
});
