# Server CCPTPM - Backend & Database Setup

## Tổng quan
Phần backend của dự án nhà hàng đặt bàn sử dụng TypeScript, Express.js, và MongoDB Atlas. Phần database bao gồm các collection chính sau.

## Phân công công việc & Danh sách Branch
Dưới đây là bảng phân công nhiệm vụ và tên nhánh dự kiến cho mỗi thành viên của nhóm 7 người. Các nhánh sẽ được tạo checkout từ nhánh `develop`.

Quy ước đặt tên branch: `feat/<tên-viết-tắt>-<nghiệp-vụ>`.

| STT | Thành viên | Vai trò | Phân công công việc (Backend & API) | Tên Branch Đề Xuất |
|:---:|:---|:---|:---|:---|
| 1 | **Lâm Quang Lộc** | Nhóm trưởng | Trang menu, Trang chi tiết món (Products) | `feat/loc-menu-product, main, develop` |
| 2 | **Nguyễn Hữu Tịnh** | Thành viên | Quản lý người dùng (Users) | `feat/tinh-manage-users` |
| 3 | **Đào Nhật Cường** | Thành viên | Đăng nhập, đăng kí, quên mật khẩu, dashboard admin (Auth) | `feat/cuong-auth-dashboard` |
| 4 | **Hoàng Gia Bảo** | Thành viên | Quản lý bàn (Tables) | `feat/bao-manage-tables` |
| 5 | **Phạm Tùng Dương** | Thành viên | Profile cá nhân và lịch sử đặt bàn (Profile/Order Tracking) | `feat/duong-user-profile` |
| 6 | **Huỳnh Trung Hậu** | Thành viên | Đặt bàn (Booking), Quản lý đơn hàng (Orders) | `feat/hau-booking` |
| 7 | **Phạm Thanh Tuấn** | Thành viên | Trang chủ (Home APIs) | `feat/tuan-homepage` |

## Cấu trúc Project
```
server-ccptpm/
├── src/
│   ├── config/
│   │   └── database.ts          # Kết nối MongoDB
│   ├── controllers/             # Logic xử lý API
│   │   ├── AuthController.ts
│   │   ├── UserController.ts
│   │   ├── ProductController.ts
│   │   ├── CategoryController.ts
│   │   ├── TableController.ts
│   │   └── OrderController.ts
│   ├── middlewares/
│   │   └── auth.ts              # JWT authentication middleware
│   ├── models/                  # Mongoose schemas
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   ├── Category.ts
│   │   ├── Table.ts
│   │   └── Order.ts
│   ├── routes/                  # API routes
│   │   ├── AuthRoutes.ts
│   │   ├── UserRoutes.ts
│   │   ├── ProductRoutes.ts
│   │   ├── CategoryRoutes.ts
│   │   ├── TableRoutes.ts
│   │   └── OrderRoutes.ts
│   ├── utils/                   # Helper functions
│   └── app.ts                   # Main Express app
├── public/                      # Static files
├── uploads/                     # Uploaded images
│   ├── avatars/                 # User avatar images
│   ├── products/                # Product images
│   └── categories/              # Category images
├── .env                         # Environment variables
├── package.json
├── tsconfig.json
└── README.md
```

## Database Collections

### 1. User
- **Mô tả**: Lưu trữ thông tin người dùng và admin.
- **Fields**:
  - `name`: Tên người dùng (string, required)
  - `email`: Email (string, required, unique)
  - `password`: Mật khẩu (string, required, hashed với bcrypt)
  - `role`: Vai trò ('admin' hoặc 'user', default: 'user')
  - `createdAt`: Thời gian tạo (Date)
  - `updatedAt`: Thời gian cập nhật (Date)
- **Methods**:
  - `comparePassword`: So sánh mật khẩu

### 2. Product
- **Mô tả**: Lưu trữ thông tin món ăn.
- **Fields**:
  - `name`: Tên món (string, required)
  - `description`: Mô tả (string, required)
  - `price`: Giá (number, required)
  - `image`: Hình ảnh (string, optional)
  - `categories`: Danh sách category (array of ObjectId, ref: 'Category')
  - `createdAt`: Thời gian tạo (Date)
  - `updatedAt`: Thời gian cập nhật (Date)
- **Lưu ý**: Một product có thể thuộc nhiều category (many-to-many).

### 3. Category
- **Mô tả**: Lưu trữ danh mục món ăn.
- **Fields**:
  - `name`: Tên danh mục (string, required)
  - `description`: Mô tả (string, optional)
  - `productCount`: Số lượng product trong category (number, default: 0)
  - `products`: Danh sách product (array of ObjectId, ref: 'Product')
  - `createdAt`: Thời gian tạo (Date)
  - `updatedAt`: Thời gian cập nhật (Date)
- **Lưu ý**: Một category có thể chứa nhiều product (many-to-many).

### 4. Table
- **Mô tả**: Lưu trữ thông tin bàn và trạng thái.
- **Fields**:
  - `number`: Số bàn (number, required, unique)
  - `capacity`: Sức chứa (number, required)
  - `status`: Trạng thái ('available', 'occupied', 'reserved', default: 'available')
  - `createdAt`: Thời gian tạo (Date)
  - `updatedAt`: Thời gian cập nhật (Date)

### 5. Order
- **Mô tả**: Lưu trữ thông tin đơn hàng.
- **Fields**:
  - `user`: Người dùng đặt hàng (ObjectId, ref: 'User', required)
  - `table`: Bàn được đặt (ObjectId, ref: 'Table', required)
  - `products`: Danh sách món với số lượng (array of {product: ObjectId, quantity: number})
  - `total`: Tổng tiền (number, required)
  - `status`: Trạng thái ('pending', 'confirm', 'cancel', 'complete', default: 'pending')
  - `createdAt`: Thời gian tạo (Date)
  - `updatedAt`: Thời gian cập nhật (Date)

## Hướng dẫn cho thành viên
- Mỗi thành viên làm việc trên nhánh riêng, merge vào develop, rồi từ develop lên main.
- Sử dụng TypeScript cho tất cả code backend.
- Bảo mật: JWT cho authentication, bcrypt cho password hashing.
- Kết nối MongoDB Atlas qua Mongoose.
- Khi thêm/sửa model, cập nhật file README này nếu cần.

## Cài đặt
1. Cài đặt dependencies: `npm install`
2. Tạo file `.env` với các biến môi trường cần thiết (MONGO_URI, JWT_SECRET, PORT)
3. Chạy development server: `npm run dev`
4. Build production: `npm run build` rồi `npm start`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký user mới
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `GET /api/auth/profile` - Lấy thông tin profile (cần auth)

### Users (Admin only)
- `GET /api/users` - Lấy tất cả users
- `GET /api/users/:id` - Lấy user theo ID
- `PUT /api/users/:id` - Cập nhật user
- `DELETE /api/users/:id` - Xóa user

### Products
- `GET /api/products` - Lấy tất cả products (public)
- `GET /api/products/:id` - Lấy product theo ID
- `POST /api/products` - Tạo product mới (admin)
- `PUT /api/products/:id` - Cập nhật product (admin)
- `DELETE /api/products/:id` - Xóa product (admin)

### Categories
- `GET /api/categories` - Lấy tất cả categories (public)
- `GET /api/categories/:id` - Lấy category theo ID
- `POST /api/categories` - Tạo category mới (admin)
- `PUT /api/categories/:id` - Cập nhật category (admin)
- `DELETE /api/categories/:id` - Xóa category (admin)

### Tables
- `GET /api/tables` - Lấy tất cả tables (public)
- `GET /api/tables/:id` - Lấy table theo ID
- `POST /api/tables` - Tạo table mới (admin)
- `PUT /api/tables/:id` - Cập nhật table (admin)
- `DELETE /api/tables/:id` - Xóa table (admin)

### Orders
- `GET /api/orders` - Lấy tất cả orders (admin)
- `GET /api/orders/my-orders` - Lấy orders của user hiện tại
- `GET /api/orders/:id` - Lấy order theo ID
- `POST /api/orders` - Tạo order mới
- `PUT /api/orders/:id/status` - Cập nhật trạng thái order (admin)
- `DELETE /api/orders/:id` - Xóa order (admin)

## File Upload
- **Thư mục**: `uploads/`
  - `uploads/avatars/` - Ảnh avatar người dùng
  - `uploads/products/` - Ảnh sản phẩm
  - `uploads/categories/` - Ảnh danh mục
- **Giới hạn**: 5MB cho mỗi file, chỉ chấp nhận ảnh (jpeg, jpg, png, gif, webp)
- **API endpoints**:
  - `PUT /api/auth/profile` - Upload avatar (form-data: avatar) → lưu vào `uploads/avatars/`
  - `POST /api/products` - Upload ảnh product (form-data: image) → lưu vào `uploads/products/`
  - `PUT /api/products/:id` - Upload ảnh product (form-data: image) → lưu vào `uploads/products/`
  - `POST /api/categories` - Upload ảnh category (form-data: image) → lưu vào `uploads/categories/`
  - `PUT /api/categories/:id` - Upload ảnh category (form-data: image) → lưu vào `uploads/categories/`
- **Truy cập file**: `/uploads/avatars/filename`, `/uploads/products/filename`, `/uploads/categories/filename`
