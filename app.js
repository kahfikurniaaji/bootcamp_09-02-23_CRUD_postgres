// Import module yang diperlukan
const express = require('express');
const app = express();
const port = 3000;

// Request get untuk path root
app.get('/', (req, res) => {
    res.sendFile('./index.html', { root: __dirname });
})

// Request get untuk path /about
app.get('/about', (req, res) => {
    res.send('this is about page!');
})

// Request get untuk path /contact
app.get('/contact', (req, res) => {
    res.send('this is contact page!');
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