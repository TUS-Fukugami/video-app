const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

const port = 3000

// ejsをexpressで利用できるようにejsを指定
app.set('view engine', 'ejs');

// expressサーバからpublicフォルダにアクセスできるようにする
app.use(express.static('public'));

// ルーティング処理
app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.get('/zoom', (req, res) => {
    res.render('zoom');
});

// connectionイベント(ブラウザからアクセス)があったときの処理
io.on('connection', (socket) => {
    console.log('ユーザが接続しました');
    // messageイベントを受信した場合
    socket.on('message', (msg) => {
        console.log("jusin")
        // 全ブラウザに送信
        io.emit('message', msg)
    })
})

// port3000番号で起動
server.listen(port, () => {
    console.log('listening on *:3000');
})
