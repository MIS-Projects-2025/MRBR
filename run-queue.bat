@echo off
cd /d D:\xampp\htdocs\MRBR
php artisan queue:work --stop-when-empty