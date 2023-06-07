const express = require('express');

const app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/shared', (req, res) => {
    res.render('shared');
});

app.get('/', (req, res) => {
    const roomID = req.query.id;
    res.render('index', { roomID });
});

module.exports = app;
