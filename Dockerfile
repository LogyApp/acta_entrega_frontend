# Imagen base: Nginx (servidor web ligero y rápido)
FROM nginx:alpine

# Elimina la configuración por defecto de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia todos los archivos de tu carpeta actual al directorio de Nginx
COPY . /usr/share/nginx/html

# Expone el puerto 8080 (requerido por Cloud Run)
EXPOSE 8080

# Reemplaza el puerto por defecto (80) con 8080 en la config de Nginx
RUN sed -i 's/80/8080/g' /etc/nginx/conf.d/default.conf

# Mantiene Nginx en ejecución
CMD ["nginx", "-g", "daemon off;"]
