const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const port = 3000

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.get('/zoom', (req, res) => {
    res.render('zoom');
});

io.on('connection', (socket => {
    console.log('ユーザが接続しました');
}))

app.listen(port, () => {
    console.log('listening on *:3000');
})
