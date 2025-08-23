# Crawl Data App - Products Management

Ứng dụng quản lý sản phẩm với giao diện Vue.js và backend Node.js/Express.

## Tính năng

- **DataTable Component**: Table linh hoạt có thể tùy chỉnh columns và data
- **CRUD Operations**: Thêm, sửa, xóa, xem sản phẩm
- **Sorting**: Sắp xếp theo các cột khác nhau
- **Pagination**: Phân trang dữ liệu
- **Responsive Design**: Giao diện responsive cho mobile và desktop
- **Real-time Updates**: Cập nhật dữ liệu real-time

## Cấu trúc Project

```
crawl-data-app/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── index.ts        # Main server file
│   │   └── seed.js         # Database seeder
│   └── package.json
├── front/                   # Frontend Vue.js
│   ├── src/
│   │   ├── components/
│   │   │   ├── DataTable.vue    # Table component linh hoạt
│   │   │   └── ProductForm.vue  # Form thêm/sửa sản phẩm
│   │   └── views/
│   │       └── ProductView.vue  # Trang quản lý sản phẩm
│   └── package.json
└── README.md
```

## Cài đặt và Chạy

### Backend

1. Cài đặt dependencies:
```bash
cd backend
npm install
```

2. Cấu hình database:
- Đảm bảo PostgreSQL đang chạy
- Cập nhật `DATABASE_URL` trong file `.env` hoặc sử dụng default

3. Chạy server:
```bash
npm run dev
```

4. Seed dữ liệu mẫu (tùy chọn):
```bash
npm run seed
```

### Frontend

1. Cài đặt dependencies:
```bash
cd front
npm install
```

2. Chạy development server:
```bash
npm run dev
```

## API Endpoints

### Products

- `GET /api/products` - Lấy danh sách sản phẩm
- `GET /api/products/:id` - Lấy chi tiết sản phẩm
- `POST /api/products` - Tạo sản phẩm mới
- `PUT /api/products/:id` - Cập nhật sản phẩm
- `DELETE /api/products/:id` - Xóa sản phẩm

### Query Parameters

- `sortBy`: Trường để sắp xếp (name, price, category, stock, created_at)
- `sortOrder`: Thứ tự sắp xếp (asc, desc)
- `page`: Trang hiện tại
- `limit`: Số lượng item mỗi trang

## Components

### DataTable.vue

Table component linh hoạt với các tính năng:

**Props:**
- `data`: Array dữ liệu hiển thị
- `columns`: Array cấu hình columns
- `checkable`: Boolean cho phép chọn multiple rows
- `sortable`: Boolean cho phép sort
- `perPage`: Số item mỗi trang

**Events:**
- `edit`: Khi click nút edit
- `delete`: Khi click nút delete
- `view`: Khi click nút view
- `selection-change`: Khi thay đổi selection

**Column Configuration:**
```javascript
const columns = [
  { 
    key: 'name', 
    label: 'Product Name', 
    sortable: true,
    render: (value) => value // Custom render function
  }
]
```

### ProductForm.vue

Form component để thêm/sửa sản phẩm:

**Props:**
- `modelValue`: Boolean hiển thị/ẩn form
- `product`: Object sản phẩm cần edit
- `isEdit`: Boolean chế độ edit

**Events:**
- `save`: Khi lưu form với data

## Database Schema

```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Tính năng nâng cao

1. **Custom Column Rendering**: Có thể tùy chỉnh cách hiển thị từng cột
2. **Sorting**: Sắp xếp theo nhiều trường khác nhau
3. **Pagination**: Phân trang với navigation
4. **Form Validation**: Validation form với error messages
5. **Loading States**: Hiển thị loading khi fetch data
6. **Notifications**: Thông báo kết quả các operations
7. **Responsive Design**: Tương thích mobile và desktop

## Cách sử dụng DataTable cho các use cases khác

DataTable component được thiết kế để tái sử dụng cho nhiều loại dữ liệu khác nhau:

```javascript
// Ví dụ cho Users
const userColumns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { 
    key: 'status', 
    label: 'Status', 
    render: (value) => value === 'active' ? 'Active' : 'Inactive'
  }
]

// Ví dụ cho Orders
const orderColumns = [
  { key: 'id', label: 'Order ID', sortable: true },
  { key: 'customer', label: 'Customer', sortable: true },
  { 
    key: 'total', 
    label: 'Total', 
    render: (value) => `$${value.toFixed(2)}`
  },
  { 
    key: 'status', 
    label: 'Status', 
    render: (value) => `<span class="badge badge-${value}">${value}</span>`
  }
]
```
