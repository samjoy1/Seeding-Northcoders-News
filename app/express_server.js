const express =  require("express")
const app = express()
const db = require("../db/connection")
const { getApi, getTopics, getArticleById, getArticles, getCommentsByArticleId} = require("../app/news.controller")

app.use(express.json())

app.get("/api/articles/:article_id/comments", getCommentsByArticleId)

app.get("/api", getApi)

app.get("/api/topics", getTopics)

app.get("/api/articles/:article_id", getArticleById)

app.get("/api/articles", getArticles)


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