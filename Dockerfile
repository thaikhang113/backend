# Sử dụng Node.js phiên bản 18 (ổn định)
FROM node:18-alpine

# Tạo thư mục làm việc trong container
WORKDIR /app

# Copy file package để cài thư viện trước (tận dụng cache)
COPY package*.json ./

# Cài đặt thư viện
RUN npm install

# Copy toàn bộ code vào container
COPY . .

# Mở port 3000
EXPOSE 3000

# Lệnh chạy server
CMD ["npm", "start"]