const fs = require("fs");
const validator = require("validator");
const pool = require("./config/db");

// Function untuk membuat contact baru
const saveContact = async (contact) => {
  // Membuat object contact kosong
  const result = {};

  // Cek apakah name dan mobile tidak kosong
  if (contact.name && contact.mobile) {
    // Validasi mobile
    if (validator.isMobilePhone(contact.mobile, "id-ID")) {
      // Parsing file contacts.json menjadi sebuah array
      const contacts = await listContact();

      // Cek duplikasi nama
      if (
        !contacts.find(
          (result) => result.name.toLowerCase() === contact.name.toLowerCase()
        )
      ) {
        // Mengembalikan object contact jika name dan mobile valid
        if (!contact.email) {
          result.name = contact.name;
          result.mobile = contact.mobile;
          await pool.query(
            `INSERT INTO contacts(name, mobile) VALUES ('${result.name}', '${result.mobile}')`
          );
          return result;
        }

        // Mengembalikan object contact jika name, email, dan mobile valid
        if (contact.email && validator.isEmail(contact.email)) {
          result.name = contact.name;
          result.email = contact.email;
          result.mobile = contact.mobile;
          await pool.query(
            `INSERT INTO contacts VALUES ('${result.name}', '${result.email}', '${result.mobile}')`
          );
          return result;
        }
      }
    }
  }

  // Mengembalikan nilai false jika kontak tidak valid
  return false;
};

// Function untuk mencari kontak
const findContact = async (name) => {
  // Parsing seluruh database contact menjadi sebuah array
  const contacts = await listContact();

  // Membuat object contact
  const contact = contacts.find(
    (contact) => contact.name.toLowerCase() === name.toLowerCase()
  );

  // Mengembalikan object contact jika kontak ditemukan
  if (contact) {
    return contact;
  }

  // Mengembalikan nilai false jika kontak tidak ditemukan
  return false;
};

// Mengambil seluruh data contacts
const listContact = async () => {
  // Parsing seluruh database contact menjadi sebuah array
  const db = await pool.query("SELECT * FROM contacts");
  const contacts = db.rows;

  // Mengembalikan object contacts jika kontak tidak kosong
  if (contacts) {
    return contacts;
  }

  // Mengembalikan nilai false jika kontak kosong
  return false;
};

// Function untuk delete contact
const deleteContact = async (name) => {
  // Membuat object contact
  const contact = findContact(name);

  // Jika contact ditemukan
  if (contact) {
    // Memfilter contacts
    await pool.query(`DELETE FROM contacts WHERE contacts.name = '${name}';`);
    return contact;
  }

  // Jika gagal hapus contact
  return false;
};

// Function untuk mengupdate contact
const updateContact = async (searchName, name, email, mobile) => {
  // Parsing seluruh database contact menjadi sebuah array
  const contacts = await listContact();

  // Mencari index nama yang akan di edit
  const index = contacts.findIndex(
    (contact) => contact.name.toLowerCase() === searchName.toLowerCase()
  );

  // Membuat object contact
  const contact = { ...contacts[index] };

  // Jika data ditemukan
  if (index !== -1) {
    // Jika name tidak kosong, dan name belum digunakan
    if (name && !nameIsExist(name)) {
      contact.name = name;
    }

    // Jika mobile valid, maka contact.mobile di replace oleh value parameter mobile
    if (isMobilePhone(mobile)) {
      contact.mobile = mobile;
    }

    // Jika email valid, maka contact.email di replace oleh value parameter email
    if (isEmail(email)) {
      contact.email = email;
    }

    // Cek jika isi object contacts[index] tidak sama dengan object contact
    if (!contactIsEquals(contacts[index], contact)) {
      // Cek jika email kosong
      if (!email) {
        contacts[index].name = contact.name;
        contacts[index].mobile = contact.mobile;
        //   writeFileContacts(contacts);
        await pool.query(
          `UPDATE contacts SET name = '${contacts[index].name}', mobile = '${contacts[index].mobile}' WHERE name = '${searchName}'`
        );
        return contacts[index];
      }

      // Jika email tidak kosong
      contacts[index].name = contact.name;
      contacts[index].email = contact.email;
      contacts[index].mobile = contact.mobile;
      writeFileContacts(contacts);
      await pool.query(
        `UPDATE contacts SET name = '${contacts[index].name}', email = '${contacts[index].email}', mobile = '${contacts[index].mobile}' WHERE name = '${searchName}'`
      );
      return contacts[index];
    }
  }

  // Jika gagal mengupdate contact
  return false;
};

// Function untuk mengecek apakah nama sudah ada didalam kontak
const nameIsExist = (name) => {
  // Parsing file contacts.json menjadi sebuah array
  const contacts = readFileContacts();

  // Mencari kontak
  if (
    contacts.find(
      (contact) => contact.name.toLowerCase() === name.toLowerCase()
    )
  ) {
    // Mengembalikan nilai true jika nama kontak telah digunakan
    return true;
  }

  // Mengembalikan nilai false jika nama kontak belum digunakan
  return false;
};
// Function untuk membandingkan 2 buah contact
const contactIsEquals = (contactA, contactB) => {
  // Membuat object result
  let result = true;

  // Cek apakah name sama atau tidak
  if (contactA.name !== contactB.name) {
    result = false;
  }

  // Cek apakah email sama atau tidak
  if (contactA.email !== contactB.email) {
    result = false;
  }

  // Cek apakah mobile sama atau tidak
  if (contactA.mobile !== contactB.mobile) {
    result = false;
  }

  // Mengembalikan nilai result
  return result;
};

// Function untuk mengecek apakah mobile valid atau tidak
const isMobilePhone = (mobile) => {
  // Jika mobile kosong
  if (!mobile) {
    return false;
  }

  // Jika mobile tidak valid
  if (!validator.isMobilePhone(mobile, "id-ID")) {
    return false;
  }

  // Jika mobile valid
  return true;
};

// Function untuk mengecek apakah email valid atau tidak
const isEmail = (email) => {
  // Jika email kosong
  if (!email) {
    return false;
  }

  // Jika email tidak valid
  if (!validator.isEmail(email)) {
    return false;
  }

  // Jika email valid
  return true;
};

const readFileContacts = () => {
  // Membuat variable untuk path file contacts.json
  const dataPath = "data/contacts.json";

  // Parsing file contacts.json menjadi sebuah array
  const contacts = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  // Mengembalikan daftar kontak
  return contacts;
};

const writeFileContacts = (contacts) => {
  // Membuat variable untuk path file contacts.json
  const dataPath = "data/contacts.json";

  // Mengoverwrite file contacts.json
  const jsonString = JSON.stringify(contacts);
  fs.writeFileSync(dataPath, jsonString);
};

const fileContactsIsExist = () => {
  // Membuat variable untuk path folder
  const dirPath = "./data";

  // Cek path folder dirPath
  if (!fs.existsSync(dirPath)) {
    return false;
  }

  // Membuat variable untuk path file contacts.json
  const dataPath = "data/contacts.json";

  // Cek path file contacts.json
  if (!fs.existsSync(dataPath)) {
    return false;
  }

  // Jika file contacts.js ditemukan
  return true;
};

module.exports = {
  saveContact,
  findContact,
  listContact,
  deleteContact,
  updateContact,
};
