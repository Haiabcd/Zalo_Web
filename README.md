# Cấu hình trước khi chạy project
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:management
docker run --name redis-container -d -p 6379:6379 redis
# Tạo file .evn
# Nội dung file .env
# 
npm install
npm run dev
