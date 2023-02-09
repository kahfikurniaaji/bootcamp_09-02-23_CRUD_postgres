// Import module yang diperlukan
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const morgan = require('morgan');
const app = express();
const port = 3000;
const contacts = require('./contacts');

// Information using EJS
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.static('img'));
app.use(morgan('dev'));

// Request get untuk path root
app.get('/', (req, res) => {
    // res.sendFile('./index.html', { root: __dirname });
    res.render('index', { title: 'Home' });
})

// Request get untuk path /about
app.get('/about', (req, res, next) => {
    res.render('about', { title: 'About' });
    // next();
})

// Request get untuk path /contact
app.get('/contact', (req, res) => {
    const listContacts = contacts.listContact();

    res.render('contact', { contacts: listContacts, title: 'Contact' });
})

app.get('/product/:productId', (req, res) => {
    res.send(`Product ID : ${req.params.productId}<br>Category Name : ${req.query.category}`);
})

// Request get untuk path /product/:productId/category/:categoryId
app.get('/product/:productId/category/:categoryName', (req, res) => {
    res.send(`Product ID : ${req.params.productId}. Category Name : ${req.params.categoryName}`);
})

// Request get untuk selain route yang telah ditentukan
app.use('/', (req, res) => {
    res.status(404);
    res.send('Page not found : 404');
})

app.use((req, res, next) => {
    console.log('Time:', Date.now())
    next();
})

// Start server
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})