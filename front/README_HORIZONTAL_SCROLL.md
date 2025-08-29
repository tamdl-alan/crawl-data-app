# Tính năng Scroll Ngang cho Table

## Tổng quan

Đã thêm tính năng scroll ngang cho tất cả các table trong ứng dụng. Khi table có quá nhiều cột và vượt quá chiều rộng màn hình, người dùng có thể scroll ngang để xem tất cả các cột.

## Các thay đổi đã thực hiện

### 1. Cập nhật DataTable.vue
- Thêm wrapper div với class `table-container` để hỗ trợ scroll ngang
- Giữ nguyên tính năng scroll dọc với `overflow-y-auto max-h-130`

### 2. Cập nhật TableSampleClients.vue
- Thêm wrapper div với class `table-container`
- Đảm bảo template có một root element duy nhất

### 3. Cập nhật CSS (_table.css)
- Thêm styles cho `.table-container` với `overflow-x-auto`
- Tùy chỉnh scrollbar với màu sắc phù hợp với theme
- Hỗ trợ cả light mode và dark mode

### 4. Demo Table
- Thêm demo table với 13 cột để test tính năng scroll ngang
- Sử dụng các màu sắc từ hệ thống design

## Cách sử dụng

### Sử dụng DataTable component
```vue
<DataTable
  :data="yourData"
  :columns="yourColumns"
  :checkable="true"
  :sortable="true"
  :per-page="10"
  @edit="handleEdit"
  @delete="handleDelete"
/>
```

### Định nghĩa columns với các tùy chọn width khác nhau

#### 1. Fixed Width (Chiều rộng cố định)
```javascript
const columns = [
  { key: 'name', label: 'Name', sortable: true, width: '150px' },
  { key: 'email', label: 'Email', sortable: true, width: '200px' },
  { key: 'phone', label: 'Phone', sortable: true, width: '140px' },
]
```

#### 2. Min Width (Chiều rộng tối thiểu)
```javascript
const columns = [
  { key: 'name', label: 'Name', sortable: true, minWidth: '120px' },
  { key: 'email', label: 'Email', sortable: true, minWidth: '180px' },
  { key: 'phone', label: 'Phone', sortable: true, minWidth: '140px' },
]
```

#### 3. Min-Max Width (Chiều rộng tối thiểu và tối đa)
```javascript
const columns = [
  { key: 'name', label: 'Name', sortable: true, minWidth: '120px', maxWidth: '200px' },
  { key: 'email', label: 'Email', sortable: true, minWidth: '180px', maxWidth: '300px' },
  { key: 'phone', label: 'Phone', sortable: true, minWidth: '140px', maxWidth: '180px' },
]
```

#### 4. Flex Grow (Tự động mở rộng)
```javascript
const columns = [
  { key: 'name', label: 'Name', sortable: true, width: '150px' },
  { key: 'email', label: 'Email', sortable: true, flexGrow: 2, minWidth: '180px' },
  { key: 'phone', label: 'Phone', sortable: true, width: '140px' },
  { key: 'description', label: 'Description', sortable: true, flexGrow: 1, minWidth: '200px' },
]
```

#### 5. Responsive Width (Phần trăm)
```javascript
const columns = [
  { key: 'name', label: 'Name', sortable: true, width: '20%', minWidth: '120px' },
  { key: 'email', label: 'Email', sortable: true, width: '30%', minWidth: '180px' },
  { key: 'phone', label: 'Phone', sortable: true, width: '15%', minWidth: '140px' },
  { key: 'company', label: 'Company', sortable: true, width: '25%', minWidth: '150px' },
  { key: 'status', label: 'Status', sortable: true, width: '10%', minWidth: '100px' },
]
```

#### 6. Kết hợp nhiều thuộc tính
```javascript
const columns = [
  { key: 'name', label: 'Name', sortable: true, width: '150px', minWidth: '120px' },
  { key: 'email', label: 'Email', sortable: true, flexGrow: 2, minWidth: '180px', maxWidth: '400px' },
  { key: 'phone', label: 'Phone', sortable: true, width: '140px', minWidth: '120px' },
  { key: 'description', label: 'Description', sortable: true, flexGrow: 1, minWidth: '200px' },
]
```

### Column Sort Type (Loại sắp xếp cột)

#### 1. String Sort (Mặc định)
```javascript
{ key: 'name', label: 'Name', sortable: true }
```

#### 2. Number Sort
```javascript
{ key: 'price', label: 'Price', sortable: true, sortType: 'number' }
{ key: 'salary', label: 'Salary', sortable: true, sortType: 'number' }
```

#### 3. Date Sort
```javascript
{ key: 'created_at', label: 'Created', sortable: true, sortType: 'date' }
{ key: 'updated_at', label: 'Updated', sortable: true, sortType: 'date' }
```

#### 4. Kết hợp với các thuộc tính khác
```javascript
const columns = [
  { key: 'name', label: 'Name', sortable: true, width: '150px', align: 'left' },
  { key: 'price', label: 'Price', sortable: true, width: '120px', align: 'right', sortType: 'number' },
  { key: 'date', label: 'Date', sortable: true, width: '120px', align: 'center', sortType: 'date' },
  { key: 'status', label: 'Status', sortable: true, width: '100px', align: 'center' },
]
```

## Tính năng

- **Scroll ngang tự động**: Khi table quá rộng, thanh scroll ngang sẽ xuất hiện
- **Scroll dọc**: Vẫn giữ nguyên tính năng scroll dọc với giới hạn chiều cao
- **Responsive**: Hoạt động tốt trên mọi kích thước màn hình
- **Theme support**: Hỗ trợ cả light mode và dark mode
- **Custom scrollbar**: Thanh scroll được tùy chỉnh với màu sắc đẹp mắt
- **Bulk operations**: Hỗ trợ thao tác hàng loạt với checkbox
- **Smart sorting**: Sắp xếp thông minh theo loại dữ liệu
- **Flexible column width**: Hỗ trợ nhiều cách chỉnh chiều rộng column
  - Fixed width (chiều rộng cố định)
  - Min width (chiều rộng tối thiểu)
  - Max width (chiều rộng tối đa)
  - Flex grow (tự động mở rộng)
  - Responsive width (phần trăm)
  - Kết hợp nhiều thuộc tính
- **Smart sorting**: Hỗ trợ sắp xếp thông minh theo loại dữ liệu
  - String sort (mặc định)
  - Number sort (cho giá, số lượng, v.v.)
  - Date sort (cho ngày tháng)
- **Bulk operations**: Hỗ trợ thao tác hàng loạt
  - Check all / Uncheck all với trạng thái indeterminate
  - Modal xác nhận khi check all
  - Bulk delete với xác nhận và API call
  - Hiển thị số lượng items đã chọn (có thể từ nhiều trang)
  - Tích hợp checkbox thông minh với 3 trạng thái

## Màu sắc sử dụng

Sử dụng các màu từ hệ thống design:
- **Light mode**: 
  - Track: `bg-gray-100`
  - Thumb: `bg-gray-300`
  - Hover: `bg-gray-400`
- **Dark mode**:
  - Track: `bg-slate-700`
  - Thumb: `bg-slate-600`
  - Hover: `bg-slate-500`

## Test

Để test tính năng scroll ngang và column width:
1. Mở trang Tables hoặc sử dụng DataTableDemo component
2. Xem demo table "Demo Table with Horizontal Scroll"
3. Table có 13 cột sẽ vượt quá chiều rộng màn hình
4. Sử dụng thanh scroll ngang để xem tất cả các cột
5. Sử dụng ColumnWidthDemo component để xem các cách khác nhau để chỉnh chiều rộng column

Để test tính năng bulk delete:
1. Mở trang CrawledData
2. Check vào checkbox ở header để chọn tất cả items trên trang hiện tại
3. Hoặc check từng item riêng lẻ
4. Khi chỉ một số items được chọn, checkbox header sẽ hiển thị icon minus (indeterminate)
5. Khi click check all hoặc indeterminate, modal xác nhận sẽ xuất hiện
6. Khi có items được chọn, thanh "Bulk Actions" sẽ xuất hiện
7. Có thể chọn items từ nhiều trang khác nhau
8. Click "Delete Selected" để xóa hàng loạt
9. Xác nhận trong modal popup và thực hiện API call

## Demo Components

### DataTableDemo
- Demo table với 13 cột để test scroll ngang
- Sử dụng các cấu hình width khác nhau

### ColumnWidthDemo
- Demo 5 loại cấu hình column width khác nhau:
  1. Fixed Width Columns
  2. Flexible Width Columns (Min Width)
  3. Mixed Width Columns
  4. Responsive Width Columns (%)
  5. Advanced Width Configuration

## Lưu ý

- Tính năng này hoạt động tự động cho tất cả các table
- Không cần thay đổi code hiện tại
- Tương thích ngược với các table đã có
