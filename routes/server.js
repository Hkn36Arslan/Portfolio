const express = require("express");
const multer = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

// Statik dosyalar için dizinleri ayarla
app.use(express.static(path.join(__dirname, "..", "public"))); // public dizinini ayarlayın
app.use(express.static(path.join(__dirname, "..", "public", "views"))); // views dizinini ayarlayın
app.use('/uploads', express.static(path.join(__dirname, "uploads"))); // Yüklenen dosyalar için
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // JSON verilerini işlemek için

// data.json dosyasını sunmak için bir endpoint oluştur
app.get("/get-data", (req, res) => {
    res.sendFile(path.join(__dirname, "data.json")); // data.json'u sunun
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadsDir = path.join(__dirname, "uploads");
        cb(null, uploadsDir); // Yükleme hedef klasörü
    },
    filename: function (req, file, cb) {
        const name = `${req.body.name}_${req.body.email}${path.extname(file.originalname)}`; // Kullanıcı ismi ve e-posta ile dosya adı oluştur
        cb(null, name); // Dosya adını güncelle
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // Maksimum 2MB
    fileFilter: function (req, file, cb) {
        const validTypes = /(\.jpg|\.jpeg|\.png|\.pdf|\.docx)$/i;
        if (!validTypes.test(file.originalname)) {
            return cb(new Error('Invalid file type. Only .jpg, .jpeg, .png, .pdf, .docx allowed.'));
        }
        cb(null, true);
    }
});

// İletişim formu gönderimi
app.post('/contact', upload.single('file'), (req, res) => {
    const { name, email, message } = req.body;

    // Sunucu tarafı validasyonu
    if (!name || !email || !message || !req.file) {
        return res.status(400).send('All fields are required!');
    }

    // JSON dosyasına kaydet
    const newEntry = {
        name,
        email,
        message,
        file: req.file.filename,
        timestamp: new Date().toISOString()
    };

    // formInformation.json dosyasını oku, yeni veriyi ekle ve geri yaz
    fs.readFile(path.join(__dirname, "formInformation.json"), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading data file.');
        }
        let jsonData = [];
        if (data) {
            jsonData = JSON.parse(data); // Var olan verileri işle
        }
        jsonData.push(newEntry); // Yeni veriyi ekle

        fs.writeFile(path.join(__dirname, "formInformation.json"), JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error writing data file.');
            }
            res.send('Your message has been sent successfully!');
        });
    });
});

app.post('/chatBot', (req, res) => {
    const { message } = req.body;
    // Sunucu tarafı validasyonu
    if (!message) {
        return res.status(400).send('Message is required!');
    }

    setTimeout(() => {
        res.status(200).send(message);
    }, 3000);
});

// Ana sayfa için route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "index.html")); // index.html'i sunun
});

// Sunucuyu başlat
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});
