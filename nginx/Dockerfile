
# Stage 1: Build React frontend
FROM node:22-alpine AS frontend-build

WORKDIR /frontend

COPY frontend/package*.json ./

RUN npm ci

COPY frontend/ ./

RUN npm run build

# Stage 2: Nginx reverse proxy
FROM nginx:1.30.6-alpine3.24-slim

# Remove default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy React production build
COPY --from=frontend-build /frontend/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
