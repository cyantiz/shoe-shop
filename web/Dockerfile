FROM node:lts-alpine
WORKDIR /app
COPY package*.json ./
RUN yarn install
COPY . .
EXPOSE 4173
ENV VITE_API_URL=https://pomme.tech/api
ENV VITE_CLOUDINARY_NAME=cyantiz
ENV VITE_CLOUDINARY_PRESET=pomme_img
RUN yarn build
ENTRYPOINT ["yarn"]
CMD ["preview"]
