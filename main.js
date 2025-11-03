const express = require('express');
const fs = require('fs'); // модуль File System для работы с файлами.
const path = require('path'); // Модуль для работы с путями файлов

const app = express();
const port = 3000;
const cors = require('cors')

app.use(cors())

const jsonFilePath = path.join(__dirname, 'mocks/articles-response-mock.json');

// Обработчик GET-запросов по пути /api/items
app.get('/api/items', (req, res) => {
    // Читаем содержимое JSON-файла
    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Ошибка при чтении файла:', err)
            return res.status(500).json({
                message: 'Не удалось прочитать данные с сервера.',
                error: err.message
            });
        }

        try {
            const itemsData = JSON.parse(data);

            // Отправляем распарсенные данные клиенту как JSON
            // Express автоматически установит заголовок 'Content-Type: application/json'
            res.json(itemsData);

        } catch (parseError) {
            console.error('Ошибка при парсинге JSON:', parseError);
            res.status(500).json({
                message: 'Некорректный формат JSON-файла.',
                error: parseError.message
            });
        }
    });
});

app.listen(port, () => {
});