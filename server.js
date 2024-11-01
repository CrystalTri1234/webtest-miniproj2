const express = require('express');
const cors = require('cors');
const multer = require('multer'); // นำเข้า multer
const path = require('path'); // นำเข้า path สำหรับจัดการนามสกุลไฟล์
const app = express();
const port = 3000;

// ตั้งค่าการเก็บไฟล์ที่อัปโหลด
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // กำหนดที่เก็บไฟล์
    },
    filename: (req, file, cb) => {
        const productName = req.body.name; // ใช้ชื่อผลิตภัณฑ์แทน
        const ext = path.extname(file.originalname); // ดึงนามสกุลไฟล์
        const sanitizedProductName = productName.replace(/[^a-zA-Z0-9]/g, '_'); // แทนที่อักขระพิเศษด้วย _
        cb(null, `${sanitizedProductName}${ext}`); // กำหนดชื่อไฟล์ตามชื่อผลิตภัณฑ์
    }
});

const upload = multer({ storage: storage }); // สร้าง instance ของ multer

app.use(express.json());
app.use(cors()); // เปิดใช้งาน CORS เพื่อให้สื่อสารกับ frontend ได้

let orders = []; // เก็บคำสั่งซื้อทั้งหมด
let products = []; // เก็บข้อมูลผลิตภัณฑ์ทั้งหมด

// ฟังก์ชันช่วยตรวจสอบว่าข้อมูลถูกส่งมาครบถ้วน
const validateOrder = (order) => {
    const { name, email, address, cart, total } = order;
    return name && email && address && cart && total;
};

// Endpoint สำหรับรับคำสั่งซื้อ
app.post('/order', (req, res) => {
    const order = req.body;
    if (!validateOrder(order)) {
        return res.status(400).json({ message: 'Invalid order data' });
    }

    orders.push(order); // เก็บคำสั่งซื้อ
    console.log('Order received:', order);
    res.status(200).json({ message: 'Order placed successfully!' });
});

// Endpoint สำหรับดึงคำสั่งซื้อทั้งหมด
app.get('/orders', (req, res) => {
    res.json(orders); // ส่งคำสั่งซื้อกลับไปยัง frontend
});

// ฟังก์ชันช่วยตรวจสอบผลิตภัณฑ์
const validateProduct = (product) => {
    const { name, price } = product;
    return name && price;
};

// Endpoint สำหรับเพิ่มผลิตภัณฑ์ใหม่ (รวมการอัปโหลดรูปภาพ)
app.post('/products', upload.single('image'), (req, res) => { // ใช้ upload.single เพื่อจัดการไฟล์ภาพ
    console.log(req.body); // เพิ่มบรรทัดนี้
    console.log(req.file); // เพิ่มบรรทัดนี้
    
    const product = req.body;

    if (!req.file) {
        return res.status(400).json({ message: 'Image file is required' });
    }

    if (!validateProduct(product)) {
        return res.status(400).json({ message: 'Invalid product data' });
    }

    product.id = products.length + 1; // กำหนด ID อัตโนมัติ
    product.imagePath = req.file.path; // เก็บ path ของไฟล์ภาพที่อัปโหลด
    products.push(product); // เพิ่มผลิตภัณฑ์ลงในอาร์เรย์
    console.log('Product added:', product);
    res.status(201).json(product); // ส่งกลับผลิตภัณฑ์ที่ถูกเพิ่ม
});

// Endpoint สำหรับดึงข้อมูลผลิตภัณฑ์ทั้งหมด
app.get('/products', (req, res) => {
    res.json(products); // ส่งผลิตภัณฑ์ทั้งหมดกลับไปยัง frontend
});

// เริ่มต้นเซิร์ฟเวอร์
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
