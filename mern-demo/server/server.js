
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());

// ==================== MONGODB SCHEMA ====================
const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

const Student = mongoose.model('Student', studentSchema);

// ==================== HEALTH CHECK ====================
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    database: mongoose.connection.readyState === 1
      ? 'connected'
      : 'disconnected'
  });
});

// ==================== API HELLO ====================
app.get('/api/hello', (req, res) => {
  res.json({
    message: 'Backend Node.js + Express đang hoạt động!'
  });
});

// ==================== GET STUDENTS ====================
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.status(200).json(students);
  } catch (error) {
    console.error('Lỗi lấy danh sách sinh viên:', error.message);
    res.status(500).json({
      error: 'Không thể lấy danh sách sinh viên'
    });
  }
});

// ==================== POST STUDENT ====================
app.post('/api/students', async (req, res) => {
  try {
    // Hỗ trợ cả tên trường mssv và studentId
    const studentId = req.body.studentId || req.body.mssv;
    const { name, email } = req.body;

    if (!studentId || !name || !email) {
      return res.status(400).json({
        error: 'Vui lòng nhập mã sinh viên, họ tên và email'
      });
    }

    const student = await Student.create({
      studentId: String(studentId).trim(),
      name: String(name).trim(),
      email: String(email).trim()
    });

    res.status(201).json(student);
  } catch (error) {
    console.error('Lỗi thêm sinh viên:', error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Mã sinh viên đã tồn tại'
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: error.message
      });
    }

    res.status(500).json({
      error: 'Không thể thêm sinh viên'
    });
  }
});

// ==================== PUT UPDATE STUDENT ====================
app.put('/api/students/:id', async (req, res) => {
  try {
    const updates = {};

    const studentId = req.body.studentId || req.body.mssv;
    if (studentId !== undefined) {
      updates.studentId = String(studentId).trim();
    }
    if (req.body.name !== undefined) {
      updates.name = String(req.body.name).trim();
    }
    if (req.body.email !== undefined) {
      updates.email = String(req.body.email).trim();
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({
        error: 'Không tìm thấy sinh viên'
      });
    }

    res.json(updatedStudent);
  } catch (error) {
    console.error('Lỗi cập nhật sinh viên:', error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Mã sinh viên đã tồn tại'
      });
    }

    res.status(400).json({ error: error.message });
  }
});

// ==================== DELETE STUDENT ====================
app.delete('/api/students/:id', async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(
      req.params.id
    );

    if (!deletedStudent) {
      return res.status(404).json({
        error: 'Không tìm thấy sinh viên'
      });
    }

    res.json({
      message: 'Xóa sinh viên thành công!'
    });
  } catch (error) {
    console.error('Lỗi xóa sinh viên:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==================== START SERVER ====================
async function startServer() {
  const uri = process.env.MONGODB_URI;

  if (!uri ||
      !/^mongodb(\+srv)?:\/\//.test(uri.trim())) {
    console.error(
      'MONGODB_URI bị thiếu hoặc sai định dạng. Hãy kiểm tra Environment trên Render.'
    );
    process.exit(1);
  }

  try {
    // Chỉ mở server sau khi kết nối database thành công
    await mongoose.connect(uri.trim());

    console.log('MongoDB Atlas Connected');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server đang chạy trên port ${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
}

startServer();
