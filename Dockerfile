FROM node:18

# تثبيت ffmpeg
RUN apt update && apt install -y ffmpeg

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["node", "index.js"]
