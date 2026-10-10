FROM node:20-alpine

WORKDIR /app

# Khai báo ARG để nhận biến môi trường VITE_API_URL khi build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Tắt Strict CI để tránh dừng build do các cảnh báo warning
ENV CI=false

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]