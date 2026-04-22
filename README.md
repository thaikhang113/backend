# Hotel Management Backend

Backend REST API cho hệ thống quản lý khách sạn. Dự án này xử lý các nghiệp vụ cốt lõi như quản lý khách hàng, nhân viên, phòng, loại phòng, đặt phòng, dịch vụ, hóa đơn, khuyến mãi, đánh giá và báo cáo doanh thu. Backend được xây dựng bằng Node.js và Express, sử dụng PostgreSQL làm cơ sở dữ liệu, đồng thời có sẵn cấu hình để chạy local hoặc bằng Docker Compose.

## Tính năng chính

- Quản lý nhân viên và khách hàng.
- Quản lý phòng, loại phòng và trạng thái phòng.
- Tạo booking cho nhiều phòng, gắn thêm dịch vụ và áp dụng mã khuyến mãi.
- Tạo hóa đơn với tổng tiền phòng, tiền dịch vụ và VAT.
- Quản lý dịch vụ, khuyến mãi và đánh giá từ khách hàng.
- Theo dõi lịch sử thay đổi trạng thái phòng.
- Báo cáo doanh thu theo ngày, tháng, năm và thống kê trạng thái booking.
- Có file SQL để khởi tạo schema và dữ liệu mẫu.

## Công nghệ sử dụng

- Node.js
- Express.js
- PostgreSQL
- Docker / Docker Compose
- `dotenv`, `cors`, `pg`

## Cấu trúc thư mục

```text
backend/
|-- .github/workflows/ # CI/CD với GitHub Actions
|-- config/         # Kết nối database
|-- controllers/    # Xử lý logic nghiệp vụ
|-- deploy/         # Script và systemd files cho auto deploy trên VPS
|-- models/         # Model hỗ trợ
|-- routes/         # Định nghĩa endpoint
|-- utils/          # Tiện ích mở rộng
|-- server.js       # Điểm vào của ứng dụng
|-- hotel_management.sql
|-- Dockerfile
|-- docker-compose.yml
|-- docker-compose.prod.yml
```

## API chính

Tất cả endpoint chính được mount dưới tiền tố `/api`.

- `/api/staff`: CRUD nhân viên
- `/api/customers`: CRUD khách hàng, đăng nhập khách hàng, cập nhật mật khẩu, tìm theo email
- `/api/services`: CRUD dịch vụ
- `/api/rooms`: CRUD phòng, cập nhật trạng thái phòng
- `/api/room-types`: CRUD loại phòng
- `/api/bookings`: tạo, xem, cập nhật, xóa booking
- `/api/invoices`: tạo và quản lý hóa đơn
- `/api/reviews`: quản lý đánh giá
- `/api/promotions`: quản lý mã khuyến mãi
- `/api/reports`: báo cáo doanh thu và thống kê booking

Một số endpoint đáng chú ý:

- `GET /`: kiểm tra API đang hoạt động
- `POST /api/customers/login`: đăng nhập khách hàng
- `PUT /api/customers/update-password`: đổi mật khẩu khách hàng
- `PUT /api/rooms/:id/status`: cập nhật trạng thái phòng và ghi lịch sử thay đổi
- `GET /api/reports/revenue/day`: doanh thu theo ngày
- `GET /api/reports/revenue/month`: doanh thu theo tháng
- `GET /api/reports/revenue/year`: doanh thu theo năm
- `GET /api/reports/stats`: thống kê trạng thái booking

## Chạy local

### 1. Cài dependencies

```bash
npm install
```

### 2. Tạo file môi trường

Sao chép `.env.example` thành `.env`, sau đó cập nhật lại giá trị cho phù hợp.

```bash
cp .env.example .env
```

Nếu chạy local, bạn nên đổi `DB_HOST=db` thành `DB_HOST=localhost`.

### 3. Khởi tạo PostgreSQL

- Tạo database tên `hotel_management`
- Import file `hotel_management.sql`

Ví dụ:

```bash
psql -U postgres -d hotel_management -f hotel_management.sql
```

### 4. Chạy server

```bash
npm start
```

Nếu muốn dùng chế độ auto-reload với script `npm run dev`, bạn cần cài `nodemon` trước:

```bash
npm install -g nodemon
npm run dev
```

Server mặc định chạy tại `http://localhost:5000`.

## Chạy bằng Docker

```bash
docker compose up --build
```

Khi chạy bằng Docker Compose:

- Backend được expose ở `http://localhost:5000`
- PostgreSQL dùng service name `db`
- File `hotel_management.sql` sẽ được import khi database khởi tạo lần đầu

## CI/CD

Repo hiện dùng mô hình:

- `CI` trên GitHub Actions: chạy khi có `push` hoặc `pull_request`, cài dependency, dựng PostgreSQL, import `hotel_management.sql`, build Docker image, khởi động API và smoke test endpoint `/` cùng `/api/rooms`.
- `CD` trên chính VPS: VPS tự `git fetch` repo theo chu kỳ, nếu có commit mới trên `main` thì tự `git pull` và `docker-compose -f docker-compose.prod.yml up -d --build`.

Điểm chính của cách này là GitHub không cần biết IP, user, SSH key hay password của VPS. Toàn bộ thông tin server chỉ nằm trên chính VPS, nên giảm tối đa rủi ro lộ hạ tầng qua repo hoặc GitHub Actions.

### File phục vụ auto deploy

- `deploy/update.sh`: script kiểm tra commit mới và tự deploy
- `deploy/backend-autodeploy.service`: systemd service chạy deploy một lần
- `deploy/backend-autodeploy.timer`: systemd timer chạy định kỳ mỗi phút
- `deploy/install-autodeploy.sh`: script bootstrap để cài auto deploy trên VPS
- `deploy/nginx-backend.conf`: reverse proxy mẫu để public backend qua `nginx`

### Luồng deploy

1. Bạn push code lên `main`
2. GitHub Actions chạy `CI`
3. VPS tự kiểm tra repo public theo chu kỳ
4. Nếu có commit mới, VPS tự kéo code và rebuild container

### Lưu ý bảo mật

- Không cần lưu bất kỳ thông tin VPS nào trong GitHub repository hoặc GitHub Actions secrets
- Không commit IP, user, password, private key hoặc file `.env` production vào repo
- Nếu repo vẫn để public, ai cũng xem được source code nhưng không có dữ liệu truy cập VPS
- Nên đổi mật khẩu root và ưu tiên SSH key nếu còn truy cập thủ công vào VPS
- `docker-compose.prod.yml` bind backend vào `127.0.0.1:5000`, còn public traffic nên đi qua `nginx` trên `80/443`

## Biến môi trường

```env
PORT=5000
DB_USER=postgres
DB_HOST=db
DB_NAME=hotel_management
DB_PASSWORD=root
DB_PORT=5432
JWT_SECRET=your_jwt_secret_key_should_be_long_and_secure
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
```

## Luồng nghiệp vụ nổi bật

- Khi tạo booking, hệ thống có thể kiểm tra mã khuyến mãi còn hiệu lực trước khi lưu đơn đặt phòng.
- Booking hỗ trợ gắn nhiều phòng và nhiều dịch vụ phát sinh trong cùng một giao dịch.
- Sau khi booking được tạo thành công, backend sẽ gọi tiện ích gửi email xác nhận.
- Khi cập nhật trạng thái phòng, hệ thống ghi lại lịch sử vào bảng `Room_Status_History`.
- Khi tạo hóa đơn, backend tự tính tổng tiền phòng, tổng tiền dịch vụ, VAT và số tiền cuối cùng.

## Lưu ý

- `utils/email.js` và `utils/scheduler.js` hiện đang ở mức mô phỏng/log, chưa phải luồng gửi email production hoàn chỉnh.
- File `hotel_management.sql` không chỉ tạo bảng mà còn có dữ liệu mẫu để test nhanh.
- Các route hiện chưa gắn middleware phân quyền đầy đủ, nên phù hợp để tiếp tục mở rộng thêm auth và authorization nếu dùng cho production.
