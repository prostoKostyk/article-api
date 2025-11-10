const express = require("express");

const app = express();
const port = 3000;
const cors = require("cors")

const fs = require("fs");
const path = require("path");


const {Pool} = require("pg");
const dbConfig = require("./dbConfig");
const pool = new Pool(dbConfig);
const jsonParser = express.json();
const mockJsonFilePath = path.join(__dirname, "mocks/articles-response-mock.json");

app.use(cors())

async function getAllArticles() {
    const SQL_SELECT_ALL_ARTICLES = "SELECT * FROM articles;"
    try {
        const result = await pool.query(SQL_SELECT_ALL_ARTICLES);
        return result.rows;
    } catch (err) {
        console.error("Get all articles SQL error:", err);
        throw err;
    } finally {
    }
}

async function postArticle(article) {
    const query = `INSERT INTO articles(title, content, _created, "group", "subGroup", "order", "imageUrls",
                                        "ignoreHtml", done, _changed, _createdby, _changedby, _version)
                   VALUES ('${article.title}',
                           '${article.content ?? ""}',
                           '${article._created ?? new Date(Date.now()).toISOString()}',
                           '${article.group}',
                           '${article.subGroup}',
                           ${article.order},
                           '${article.imageUrls ?? ""}',
                           ${article.ignoreHtml ?? false},
                           ${article.done ?? false},
                           '${article._changed ?? new Date(Date.now()).toISOString()}',
                           '${article._createdby ?? ""}',
                           '${article._changedby ?? ""}',
                           ${article._version ?? 1}) RETURNING *`;
    try {
        const result = await pool.query(query);
        return result.rows
    } catch (err) {
        console.error("SQL Post article error:", err);
        console.log(query);
        throw err;
    } finally {
    }
}

async function updateArticle(article) {
    const query = `UPDATE articles
                   SET title        = '${article.title}',
                       content      = '${article.content ?? ""}',
                       "group"      ='${article.group}',
                       "subGroup"   = '${article.subGroup}',
                       "ignoreHtml" = ${article.ignoreHtml ?? false},
                       done         = ${article.done ?? false},
                       _changed     = '${new Date(Date.now()).toISOString()}',
                       _changedby   = '${article._changedby ?? ""}',
                       _version     = '${article._version ?? 1}'
                   WHERE _id = '${article._id}' RETURNING *`
    try {
        const result = await pool.query(query);
        return result.rows
    } catch (err) {
        console.error("SQL Update article error:", err);
        console.log(query);
        throw err;
    } finally {
    }
}

async function deleteArticle(id) {
    const query = `DELETE
                   FROM articles
                   WHERE _id = '${id}'`
    try {
        const result = await pool.query(query);
        return result.rows
    } catch (err) {
        console.error("SQL Delete article error:", err);
        console.log(query);
        throw err;
    } finally {
    }
}

app.get("/rest/articles", (req, res) => {
    getAllArticles()
        .then(data => {
            res.json(data);
        })
        .catch(error => {
            console.error("Get all articles error", error);
        })
        .finally(() => {
        });
});

app.post("/rest/article", jsonParser, (req, res) => {
    if (!req.body) {
        return res.sendStatus(400); // Bad Request if no body is present
    }
    postArticle(req.body)
        .then(data => {
            res.json(data);
        })
        .catch(error => {
            console.error("Post article error:", error);
        })
        .finally(() => {
        })
});

app.put("/rest/article", jsonParser, (req, res) => {
    if (!req.body) {
        return res.sendStatus(400); // Bad Request if no body is present
    }
    updateArticle(req.body)
        .then(data => {
            res.json(data);
        })
        .catch(error => {
            console.error("Update article error:", error);
        })
        .finally(() => {
        })
});

app.delete("/rest/article/:id", jsonParser, (req, res) => {
    const articleId = req.params.id;
    if (!articleId) {
        return res.sendStatus(400); // Bad Request if no body is present
    }
    deleteArticle(articleId)
        .then(data => {
            res.json(data);
        })
        .catch(error => {
            console.error("Delete article error:", error);
        })
        .finally(() => {
        })
});

// Post all articles from mock json
app.post("/rest/json-articles", (req, res) => {
    fs.readFile(mockJsonFilePath, "utf8", (err, data) => {
        if (err) {
            console.error("File reading error:", err)
            return res.status(500).json({
                message: "File reading error",
                error: err.message
            });
        }
        try {
            const itemsData = JSON.parse(data);
            itemsData.forEach(v => {
                delete v._keywords;
                delete v._tags;
                postArticle(v)
                    .then(data => {
                        return data;
                    })
                    .catch(error => {
                        console.error("Post mock articles error:", error);
                    })
                    .finally(() => {
                    })

            })
        } catch (parseError) {
            console.error("JSON parse error:", parseError);
            res.status(500).json({
                message: "JSON parse error.",
                error: parseError.message
            });
        }
    });
});

app.listen(port, () => {
    console.log("listen " + port)
});