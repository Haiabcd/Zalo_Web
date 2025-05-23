# 1. Dùng image Node chính thức
FROM node:18

# 2. Tạo thư mục app trong container
WORKDIR /usr/src/zalo-app

# 3. Sao chép file cấu hình
COPY package*.json ./

# 4. Cài đặt thư viện
RUN npm install

# 5. Sao chép mã nguồn còn lại
COPY . .

# 6. Expose cổng ứng dụng chạy (ví dụ: 3000)
EXPOSE 5001

# 7. Lệnh để chạy ứng dụng
CMD ["node", "index.js"]
