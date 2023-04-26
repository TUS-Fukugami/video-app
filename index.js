const express = require("express");
const app = express();
const port = 3000

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.get('/zoom', (req, res) => {
    res.render('zoom');
});

app.listen(port, () => {
    console.log('listening on *:3000');
})
