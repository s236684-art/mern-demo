const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Kết nối MongoDB Atlas (Câu 33)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Atlas Connected...'))
  .catch(err => console.error('MongoDB connection error:', err));

// Mongoose Schema & Model (Câu 35)
const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true }
});
const Student = mongoose.model('Student', studentSchema);

// API Hello (Câu 22)
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Backend Node.js + Express đang hoạt động!' });
});

// REST APIs cho Student (Câu 36 - 39)
// GET: Lấy danh sách sinh viên
app.post('/api/students', async (req, res) => {
  try {
    const { mssv, name, email } = req.body;

    const student = new Student({
      studentId: mssv,
      mssv: mssv,
      name: name,
      email: email
    });

    const savedStudent = await student.save();

    res.status(201).json(savedStudent);

  } catch (error) {
    console.error('Lỗi thêm sinh viên:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

// POST: Thêm sinh viên mới
app.post('/api/students', async (req, res) => {
  try {
    const newStudent = await Student.create(req.body);
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT: Cập nhật thông tin sinh viên
app.put('/api/students/:id', async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedStudent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE: Xóa sinh viên
app.delete('/api/students/:id', async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Xóa sinh viên thành công!' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server đang chạy trên port ${PORT}`);
});
// server/index.js hoặc server/routes/students.js
app.put('/api/students/:id', async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Trả về dữ liệu mới sau khi cập nhật
    );
    if (!updatedStudent) return res.status(404).json({ message: "Không tìm thấy sinh viên" });
    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});