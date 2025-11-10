// dbConfig.js
require('dotenv').config(); // Для загрузки переменных окружения из .env файла

const config = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
    ssl: {
        rejectUnauthorized: false
    }
};

module.exports = config;