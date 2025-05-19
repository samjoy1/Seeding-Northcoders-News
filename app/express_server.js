const express =  require("express")
const app = express()
const db = require("../db/connection")
const { getApi, getTopics, getArticleById, getArticles, getCommentsByArticleId, postCommentByArticleId, patchArticleById, deleteCommentById, getUsers} = require("../app/news.controller")
const cors = require("cors");

app.use(cors());
app.use(express.json())

app.get("/api/articles/:article_id/comments", getCommentsByArticleId)

app.get("/api", getApi)

app.get("/api/topics", getTopics)

app.get("/api/articles/:article_id", getArticleById)

app.get("/api/articles", getArticles)

app.post("/api/articles/:article_id/comments", postCommentByArticleId)

app.patch("/api/articles/:article_id", patchArticleById)

app.delete("/api/comments/:comment_id", deleteCommentById)

app.get("/api/users", getUsers)

app.all('/*splat', (req, res) => {
    res.status(404).send({ msg: "Path not found"})
})

app.use((err, req, res, next) => {
    if (err.status && err.msg) {
        res.status(err.status).send({msg: err.msg})
    } else if (err.code === "22P02") {
        res.status(400).send({msg: "Invalid input"})
    } else{
        console.error(err)
        res.status(500).send({msg: "Internal server error"})
    }
})
module.exports = app