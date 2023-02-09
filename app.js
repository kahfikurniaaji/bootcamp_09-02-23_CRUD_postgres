// Import module yang diperlukan
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const app = express();
const port = 3000;

// Information using EJS
app.set('view engine', 'ejs');
app.use(expressLayouts);

// Request get untuk path root
app.get('/', (req, res) => {
    // res.sendFile('./index.html', { root: __dirname });
    res.render('index', { title: 'Home' });
})

// Request get untuk path /about
app.get('/about', (req, res) => {
    res.render('about', { title: 'About' });
})

// Request get untuk path /contact
app.get('/contact', (req, res) => {
    const contacts = [{
        name: 'Kahfi',
        mobile: '085721476789'
    }, {
        name: 'Kurnia',
        mobile: '085700000001'
    }, {
        name: 'Aji',
        mobile: '085700000002'
    }];
    res.render('contact', { contacts, title: 'Contact' });
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

// Start server
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})