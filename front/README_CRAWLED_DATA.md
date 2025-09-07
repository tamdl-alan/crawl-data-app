# Crawled Data Frontend

## Overview

Crawled Data frontend là một trang quản lý dữ liệu đã crawl từ các nguồn khác nhau (Goat, Snkrdunk, etc.) với đầy đủ tính năng CRUD.

## Features

### ✅ **CRUD Operations:**
- **Create**: Thêm mới dữ liệu crawl
- **Read**: Xem danh sách và chi tiết dữ liệu
- **Update**: Chỉnh sửa dữ liệu đã có
- **Delete**: Xóa dữ liệu (soft delete)

### ✅ **Table Features:**
- **Pagination**: Phân trang dữ liệu
- **Sorting**: Sắp xếp theo nhiều cột
- **Search**: Tìm kiếm dữ liệu
- **Responsive**: Hiển thị tốt trên mobile

### ✅ **Form Validation:**
- Required fields validation
- Numeric fields validation
- Real-time error display

## Components

### 1. **CrawledDataView.vue**
- Main view component
- Quản lý state và API calls
- Hiển thị table và form modal

### 2. **CrawledDataForm.vue**
- Form component cho Create/Edit
- Validation logic
- Responsive layout với grid

## Table Columns

| Column | Type | Sortable | Description |
|--------|------|----------|-------------|
| # | Number | ❌ | Sequential number |
| Product URL | String | ❌ | URL của sản phẩm |
| Product Name | String | ✅ | Tên sản phẩm |
| Size Goat | String | ✅ | Size trên Goat |
| Price Goat | Number | ✅ | Giá trên Goat ($) |
| Size Snkrdunk | String | ✅ | Size trên Snkrdunk |
| Price Snkrdunk | Number | ✅ | Giá trên Snkrdunk ($) |
| Profit Amount | Number | ✅ | Lợi nhuận ($) |
| Selling Price | Number | ✅ | Giá bán ($) |
| Image | Boolean | ❌ | Có hình ảnh hay không |
| Note | String | ❌ | Ghi chú |
| Created | Date | ✅ | Ngày tạo |

## Form Fields

### Required Fields:
- **Product URL**: URL của sản phẩm
- **Product Name**: Tên sản phẩm

### Optional Fields:
- **Size Goat**: Size trên Goat (e.g., "US 9")
- **Price Goat**: Giá trên Goat (number, min: 0)
- **Size Snkrdunk**: Size trên Snkrdunk (e.g., "US 9")
- **Price Snkrdunk**: Giá trên Snkrdunk (number, min: 0)
- **Profit Amount**: Lợi nhuận (number, min: 0)
- **Selling Price**: Giá bán (number, min: 0)
- **Image URL**: URL hình ảnh
- **Note**: Ghi chú (textarea)

## API Integration

### Base URL: `http://13.215.70.39:3000/crawled-data`

### Endpoints:
- `GET /crawled-data` - Lấy danh sách
- `GET /crawled-data/:id` - Lấy chi tiết
- `POST /crawled-data` - Tạo mới
- `PUT /crawled-data/:id` - Cập nhật
- `DELETE /crawled-data/:id` - Xóa (soft delete)

## Usage

### 1. **Access the page:**
```
http://13.215.70.39:5173/#/crawled-data
```

### 2. **Add new data:**
- Click "Add Data" button
- Fill required fields (Product URL, Product Name)
- Fill optional fields as needed
- Click "Confirm" to save

### 3. **Edit data:**
- Click edit icon (pencil) on any row
- Modify fields as needed
- Click "Confirm" to save changes

### 4. **Delete data:**
- Click delete icon (trash) on any row
- Confirm deletion
- Data will be soft deleted (del_flag = 2)

### 5. **Sort data:**
- Click column headers to sort
- Toggle between ascending/descending

## Navigation

Menu item "Crawled Data" đã được thêm vào sidebar navigation.

## Error Handling

- **Network errors**: Hiển thị notification với màu đỏ
- **Validation errors**: Hiển thị lỗi dưới từng field
- **API errors**: Hiển thị message từ server

## Responsive Design

- **Desktop**: Full table với tất cả columns
- **Tablet**: Responsive table
- **Mobile**: Stacked layout cho form fields

## Dependencies

- Vue 3 Composition API
- Tailwind CSS
- Heroicons (MDI)
- Custom components (DataTable, FormField, etc.)

## Development

### File Structure:
```
front/src/
├── views/
│   └── CrawledDataView.vue          # Main view
├── components/
│   └── CrawledDataForm.vue          # Form component
└── router/
    └── index.js                     # Route configuration
```

### Key Features:
- **Reactive data**: Sử dụng Vue 3 ref() và reactive()
- **Form validation**: Client-side validation
- **API integration**: Fetch API với error handling
- **State management**: Local state với Vue 3 Composition API
- **Component communication**: Props và emits
