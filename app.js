// Import module yang diperlukan
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;
const contacts = require("./contacts");
const methodOverride = require("method-override");
const { body, validationResult, check } = require("express-validator");
const session = require("express-session");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");

const pool = require("./config/db");

app.use(express.json());

// Information using EJS
app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(express.static("img"));
app.use(morgan("dev"));
app.use(methodOverride("_method"));
app.use(cookieParser("secret"));
app.use(flash());

app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "anything",
    resave: true,
    saveUninitialized: true,
  })
);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Request get untuk path root
app.get("/", (req, res) => {
  // res.sendFile('./index.html', { root: __dirname });
  res.render("index", { title: "Home" });
});

app.get("/addasync", async (req, res) => {
  try {
    const name = "kahfi";
    const email = "kahfi@gmail.com";
    const mobile = "085600001111";
    const newCont = await pool.query(
      `INSERT INTO contacts VALUES ('${name}', '${email}', '${mobile}') RETURNING *`
    );
    res.json(newCont);
  } catch (err) {
    console.error(err.message);
  }
});

// Request get untuk path /about
app.get("/about", (req, res) => {
  res.render("about", { title: "About" });
});

app.post(
  "/contact",
  [
    body("name").custom(async (value) => {
      const duplicateCheck = await contacts.findContact(value);
      if (duplicateCheck) {
        throw new Error("Nama sudah ada");
      }
      return true;
    }),
    check("mobile", "Mobile invalid").isMobilePhone("id-ID"),
    check("email", "Email invalid").isEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("contact_add", {
        title: "Add Contact",
        errors: errors.array(),
      });
      console.log(errors.array());
    } else {
      await contacts.saveContact(req.body);
      req.flash("msg", "Data berhasil ditambahkan");
      res.redirect("/contact");
    }
  }
);

// Request get untuk path /contact
app.get("/contact", async (req, res) => {
  const listContacts = await contacts.listContact();
  // const db = await pool.query("SELECT * FROM contacts");
  // const listContacts = db.rows;
  res.render("contact", {
    contacts: listContacts,
    title: "Contact",
    msg: req.flash("msg"),
  });
});

app.get("/contact/add", (req, res) => {
  res.render("contact_add", { title: "Add Contact" });
});

app.get("/contact/:contactName", async (req, res) => {
  // const db = await pool.query(`SELECT * FROM contacts WHERE name = '${req.params.contactName}'`);
  const contact = await contacts.findContact(req.params.contactName);
  // const contact = db.rows[0];
  console.log(contact);
  res.render("contact_detail", { contact, title: "Contact" });
});

app.get("/contact/delete/:contactName", async (req, res) => {
  const contact = await contacts.findContact(req.params.contactName);
  console.log("APP "+contact);
  if (!contact) {
    res.status(404);
    res.send("Data tidak ditemukan");
  } else {
    // await contacts.deleteContact(req.params.contactName);
    await contacts.deleteContact(req.params.contactName)
    req.flash("msg", "Kontak berhasil dihapus");
    res.redirect("/contact");
  }
  // res.redirect("/contact");
});

// Edit Contact
app.get("/contact/edit/:contactName", async (req, res) => {
  const contact = await contacts.findContact(req.params.contactName);
  await res.render("contact_edit", {
    oldName: req.params.contactName,
    contact: JSON.parse(contact),
    title: "Edit",
    // msg: req.flash("msg")
  });
});

app.put(
  "/contact/:contactName",
  [
    body("name").custom(async (value) => {
      let duplicateCheck = await contacts.findContact(value);
      if (JSON.parse(duplicateCheck).name == value) {
        duplicateCheck = false;
      }
      if (duplicateCheck) {
        throw new Error("Nama sudah ada");
      }
      return true;
    }),
    check("mobile", "Mobile invalid").isMobilePhone("id-ID"),
    check("email", "Email invalid").isEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const contact = await contacts.findContact(req.params.contactName);
      res.render("contact_edit", {
        title: "Edit Contact",
        errors: errors.array(),
        contact: req.body,
        oldName: req.params.contactName,
      });
    } else {
      const contact = await contacts.updateContact(
        req.params.contactName,
        req.body.name,
        req.body.email,
        req.body.mobile
      );
      req.flash("msg", "Data berhasil diupdate");
      res.redirect("/contact");
    }
  }
);

app.get("/product/:productId", (req, res) => {
  res.send(
    `Product ID : ${req.params.productId}<br>Category Name : ${req.query.category}`
  );
});

// Request get untuk path /product/:productId/category/:categoryId
app.get("/product/:productId/category/:categoryName", (req, res) => {
  res.send(
    `Product ID : ${req.params.productId}. Category Name : ${req.params.categoryName}`
  );
});

// Request get untuk selain route yang telah ditentukan
app.use("/", (req, res) => {
  res.status(404);
  res.send("Page not found : 404");
});

app.use((req, res, next) => {
  console.log("Time:", Date.now());
  next();
});

// Start server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
