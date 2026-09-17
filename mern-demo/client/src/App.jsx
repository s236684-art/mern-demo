import { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:5000/api/students';

function App() {
  const [students, setStudents] = useState([]);

  const [formData, setFormData] = useState({
    mssv: '',
    name: '',
    email: ''
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // ========================================
  // 1. LẤY DANH SÁCH SINH VIÊN
  // ========================================
  const fetchStudents = async () => {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error('Không thể kết nối Backend');
      }

      const data = await response.json();

      setStudents(Array.isArray(data) ? data : []);

    } catch (error) {
      console.error('Lỗi lấy danh sách:', error);
    }
  };

  // ========================================
  // 2. TỰ ĐỘNG GỌI API KHI MỞ TRANG
  // ========================================
  useEffect(() => {
    fetchStudents();
  }, []);

  // ========================================
  // 3. XỬ LÝ NHẬP DỮ LIỆU
  // ========================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });
  };

  // ========================================
  // 4. BẤM NÚT SỬA
  // ========================================
  const handleEditClick = (student) => {
    const id = student._id || student.id;

    setEditingId(id);

    setFormData({
      mssv: student.mssv || student.studentId || '',
      name: student.name || '',
      email: student.email || ''
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // ========================================
  // 5. THÊM / CẬP NHẬT SINH VIÊN
  // ========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.mssv.trim()) {
      alert('Vui lòng nhập MSSV!');
      return;
    }

    if (!formData.name.trim()) {
      alert('Vui lòng nhập họ tên!');
      return;
    }

    if (!formData.email.trim()) {
      alert('Vui lòng nhập Email!');
      return;
    }

    setLoading(true);

    try {
      let response;

      // ====================================
      // TRƯỜNG HỢP SỬA
      // ====================================
      if (editingId) {

        response = await fetch(`${API_URL}/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            studentId: formData.mssv,
            mssv: formData.mssv,
            name: formData.name,
            email: formData.email
          })
        });

      }

      // ====================================
      // TRƯỜNG HỢP THÊM
      // ====================================
      else {

        response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            studentId: formData.mssv,
            mssv: formData.mssv,
            name: formData.name,
            email: formData.email
          })
        });

      }

      // ====================================
      // KIỂM TRA KẾT QUẢ
      // ====================================
      if (!response.ok) {

        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.error || 'API thực hiện không thành công'
        );
      }

      // ====================================
      // THÔNG BÁO
      // ====================================
      if (editingId) {
        alert('Sửa sinh viên thành công!');
      } else {
        alert('Thêm sinh viên thành công!');
      }

      // ====================================
      // RESET FORM
      // ====================================
      setFormData({
        mssv: '',
        name: '',
        email: ''
      });

      setEditingId(null);

      // ====================================
      // TẢI LẠI DANH SÁCH
      // ====================================
      await fetchStudents();

    } catch (error) {

      console.error('Lỗi:', error);

      alert(
        'Không thể thực hiện!\n\n' +
        error.message
      );

    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // 6. HỦY CHẾ ĐỘ SỬA
  // ========================================
  const handleCancel = () => {

    setEditingId(null);

    setFormData({
      mssv: '',
      name: '',
      email: ''
    });

  };

  // ========================================
  // 7. XÓA SINH VIÊN
  // ========================================
  const handleDelete = async (id) => {

    const confirmDelete = window.confirm(
      'Bạn có chắc chắn muốn xóa sinh viên này?'
    );

    if (!confirmDelete) {
      return;
    }

    try {

      const response = await fetch(
        `${API_URL}/${id}`,
        {
          method: 'DELETE'
        }
      );

      if (!response.ok) {

        const errorData =
          await response.json().catch(() => null);

        throw new Error(
          errorData?.error || 'Xóa thất bại'
        );
      }

      alert('Xóa sinh viên thành công!');

      await fetchStudents();

    } catch (error) {

      console.error('Lỗi xóa:', error);

      alert(
        'Không thể xóa sinh viên!\n\n' +
        error.message
      );

    }
  };

  // ========================================
  // 8. GIAO DIỆN
  // ========================================
  return (
    <div className="container">

      {/* ================================
          TIÊU ĐỀ
      ================================= */}
      <h1>
        Quản Lý Sinh Viên (MERN Stack)
      </h1>


      {/* ================================
          FORM
      ================================= */}
      <form onSubmit={handleSubmit}>

        {/* MSSV */}
        <input
          type="text"
          name="mssv"
          placeholder="MSSV"
          value={formData.mssv}
          onChange={handleChange}
          required
        />

        {/* HỌ TÊN */}
        <input
          type="text"
          name="name"
          placeholder="Họ tên"
          value={formData.name}
          onChange={handleChange}
          required
        />

        {/* EMAIL */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        {/* NÚT */}
        <div className="form-buttons">

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Đang xử lý...'
              : editingId
                ? 'Lưu Cập Nhật'
                : 'Thêm Sinh Viên'
            }
          </button>

          {/* NÚT HỦY */}
          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
            >
              Hủy
            </button>
          )}

        </div>

      </form>


      {/* ================================
          TIÊU ĐỀ DANH SÁCH
      ================================= */}
      <h2>
        Danh Sách Sinh Viên
      </h2>


      {/* ================================
          BẢNG SINH VIÊN
      ================================= */}
      <table>

        <thead>

          <tr>
            <th>MSSV</th>
            <th>Họ Tên</th>
            <th>Email</th>
            <th>Thao Tác</th>
          </tr>

        </thead>


        <tbody>

          {students.length === 0 ? (

            <tr>

              <td
                colSpan="4"
                className="empty"
              >
                Chưa có sinh viên
              </td>

            </tr>

          ) : (

            students.map((student) => {

              const id =
                student._id || student.id;

              return (

                <tr key={id}>

                  {/* MSSV */}
                  <td>
                    {student.mssv ||
                      student.studentId}
                  </td>

                  {/* HỌ TÊN */}
                  <td>
                    {student.name}
                  </td>

                  {/* EMAIL */}
                  <td>
                    {student.email}
                  </td>

                  {/* THAO TÁC */}
                  <td>

                    <button
                      className="edit-btn"
                      onClick={() =>
                        handleEditClick(student)
                      }
                    >
                      Sửa
                    </button>


                    <button
                      className="delete-btn"
                      onClick={() =>
                        handleDelete(id)
                      }
                    >
                      Xóa
                    </button>

                  </td>

                </tr>

              );

            })

          )}

        </tbody>

      </table>

    </div>
  );
}

export default App;