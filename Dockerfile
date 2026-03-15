FROM php:8.4-apache

RUN apt-get update && apt-get install -y \
    libpq-dev libzip-dev zip unzip git curl \
    && docker-php-ext-install pdo pdo_pgsql zip \
    && a2enmod rewrite headers

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction
RUN npm install --legacy-peer-deps && npm run build
RUN chmod -R 777 storage bootstrap/cache
RUN chown -R www-data:www-data /var/www/html

ENV APACHE_DOCUMENT_ROOT=/var/www/html/public

RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf
RUN echo '<Directory /var/www/html/public>\nOptions Indexes FollowSymLinks\nAllowOverride All\nRequire all granted\n</Directory>' >> /etc/apache2/apache2.conf

EXPOSE 80

CMD php artisan config:clear && php artisan migrate --force && php artisan db:seed --class=ShopSeeder --force && apache2-foreground
