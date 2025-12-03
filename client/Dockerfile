# Dockerfile para cliente estático (HTML, CSS, JS)
FROM nginx:alpine

# Copiar archivos del cliente al directorio de Nginx
COPY . /usr/share/nginx/html

# Copiar configuración personalizada de Nginx para SPA
RUN echo 'server { \n\
    listen 80; \n\
    location / { \n\
        root /usr/share/nginx/html; \n\
        index index.html; \n\
        try_files $uri $uri/ /index.html; \n\
    } \n\
}' > /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]
