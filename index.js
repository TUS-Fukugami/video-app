const express = require("express");
const app = express();
const server = require("http").createServer(app);
//コンフリクト用ダミーコメント
const { ExpressPeerServer } = require("peer");
const io = require("socket.io")(server);

const port = 3000;

const peerServer = ExpressPeerServer(server, {
  debug: true,
});

const rooms = [];

// コンフリクトテストコメント

// ejsをexpressで利用できるようにejsを指定
app.set("view engine", "ejs");

// パス/peerjsにpeerServerをマウント
app.use('/peerjs', peerServer);

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

  // 1.join-roomイベントを受信した場合(roomに参加者が入ったとき)
  socket.on('join-room', (roomId, name, peerId) => {
    rooms.push({
      roomId,
      name,
      id: socket.id,
      peerId,
    })
    socket.join(roomId);
    socket.emit('message', `Bot: ${name}さん、zoomクローンにようこそ!`);
    socket.broadcast.in(roomId).emit('message', `${name}さんが接続しました`);

    // user-connectedイベントを部屋内の全ブラウザに送信
    socket.broadcast.in(roomId).emit('user-connected', peerId, socket.id);

    //membersイベント送信
    const members = rooms.filter(room => room.roomId == roomId);
    io.in(roomId).emit('members', members);
  });

  // 2.messageイベントを受信した場合
  socket.on("message", (msg) => {
    // 同じroomにいるブラウザにのみ送信
    const room = rooms.find(room => room.id == socket.id);
    if (room)
      io.in(room.roomId).emit('message', `${room.name}: ${msg}`);
  });

  // 3.接続が切れた場合
  socket.on("disconnect", () => {
    // 対応するユーザ情報を削除
    const room = rooms.find(room => room.id == socket.id);
    const index = rooms.findIndex(room => room.id == socket.id);
    if (index !== -1) rooms.splice(index, 1);

    // membersの更新
    if (room) {
      io.in(room.roomId).emit('message', `Bot :${room.name}が退出しました`);
      socket.broadcast.in(room.roomId).emit('user-disconnected', room.peerId);
      const members = rooms.filter(rm => rm.roomId == room.roomId);
      io.in(room.roomId).emit('members', members);
    }
  });
});

// port3000番号で起動
server.listen(port, () => {
  console.log("listening on *:3000");
});
