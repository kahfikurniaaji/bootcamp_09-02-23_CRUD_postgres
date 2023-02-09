const fs = require('fs');
const validator = require('validator');

// Function untuk menambahkan kontak
const saveContact = (name, email, mobile) => {

    // Validasi Mobile Phone
    if (!validator.isMobilePhone(mobile, 'id-ID')) {
        console.log('Mobile invalid!');
        return false;
    }

    // Validasi Email
    if (email != null && !validator.isEmail(email)) {
        console.log('Email invalid!');
        return false;
    }

    // Membuat variable untuk path folder
    const dirPath = './data';

    // Membuat variable untuk path file contacts.json
    const dataPath = 'data/contacts.json';

    // Cek folder data dan file contact.json
    if (!fileContactsIsExist()) {
        fs.mkdirSync(dirPath);
        fs.writeFileSync(dataPath, '[]', 'utf-8');
    }

    // Parsing file contacts.json menjadi sebuah array
    const contacts = readFileContacts();

    // Membuat object contact berdasarkan name, mobile, dan email
    const newContact = {
        name,
        mobile
    };

    // Menambahkan property email apabila email tidak undefined
    if (email) {
        newContact.email = email;
    }

    // Cek duplikasi nama
    if (contacts.find((contact) => contact.name.toLowerCase() === name.toLowerCase())) {
        console.log('Nama telah digunakan');
        return false;
    }

    // Menambahkan object contact kedalam array contacts
    contacts.push(newContact);

    // Mengoverwrite file contacts.json
    writeFileContacts(contacts);
    return newContact;
};

// Function untuk mencari kontak
const findContact = (name) => {

    // Jika nama kosong atau undefined
    if (!name) {
        return undefined;
    }

    // Parsing file contacts.json menjadi sebuah array
    const contacts = readFileContacts();

    // Mencari detail kontak
    const contact = contacts.find(contact => contact.name.toLowerCase() === name.toLowerCase());

    // Cek ketersediaan kontak
    if (!contact) {
        return undefined;
    }

    // Jika kontak ditemukan
    return contact;
};

// Function untuk menampilkan seluruh kontak
const listContact = () => {

    // Parsing file contacts.json menjadi sebuah array
    const contacts = readFileContacts();

    // Cek apakah kontak kosong atau tidak
    if (contacts.length < 1) {
        return undefined;
    }

    // Jika kontak tidak kosong
    return contacts;
};

const deleteContact = (name) => {

    // Membuat object contact
    const contact = findContact(name);

    // Cek apakah nama ada di dalam kontak atau tidak
    if (!contact) {
        return undefined;
    }

    // Parsing file contacts.json menjadi sebuah array
    const listContacts = readFileContacts();

    // Mencari detail kontak
    const contacts = listContacts.filter(contact => contact.name.toLowerCase() !== name.toLowerCase());

    // Mengoverwrite file contacts.json
    writeFileContacts(contacts);

    // Mengembalikan object contact
    return contact;
};

const updateContact = (name, newName, email, mobile) => {

    // Jika name kosong atau undefined
    if (!name) {
        console.log('old_name kosong! Harap isi old_name!');
        return undefined;
    }

    // Membuat object contact
    let contact = findContact(name);

    // Cek duplikat nama
    if (!contact) {
        return undefined;
    }

    // Cek apakah nama telah digunakan
    if (findContact(newName)) {
        console.log('Nama kontak telah digunakan');
        return undefined;
    }

    // Delete kontak
    deleteContact(name);

    // Cek apakah newName undefined
    if (!newName) {
        newName = contact.name;
    }

    // Cek apakah email undefined
    if (!email) {
        email = contact.email;
    }

    // Cek apakah mobile undefined
    if (!mobile) {
        mobile = contact.mobile;
    }

    // Simpan kontak
    return saveContact(newName, email, mobile);
};

const readFileContacts = () => {
    // Membuat variable untuk path file contacts.json
    const dataPath = 'data/contacts.json';

    // Parsing file contacts.json menjadi sebuah array
    const contacts = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    // Mengembalikan daftar kontak
    return contacts;
};

const writeFileContacts = (contacts) => {
    // Membuat variable untuk path file contacts.json
    const dataPath = 'data/contacts.json';

    // Mengoverwrite file contacts.json
    const jsonString = JSON.stringify(contacts);
    fs.writeFileSync(dataPath, jsonString);
};

const fileContactsIsExist = () => {
    // Membuat variable untuk path folder
    const dirPath = './data';

    // Cek path folder dirPath
    if (!fs.existsSync(dirPath)) {
        return false;
    }

    // Membuat variable untuk path file contacts.json
    const dataPath = 'data/contacts.json';

    // Cek path file contacts.json
    if (!fs.existsSync(dataPath)) {
        return false;
    }

    // Jika file contacts.js ditemukan
    return true;
};

module.exports = { saveContact, findContact, listContact, deleteContact, updateContact }