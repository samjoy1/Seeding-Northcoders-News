const express =  require("express")
const app = express()
const db = require("../db/connection")
const { getApi, getTopics} = require("../app/news.controller")

app.use(express.json())

app.get("/api", getApi)

app.get("/api/topics", getTopics)

app.get('/*splat', (req, res) => {
    res.status(404).send({msg: 'error'})
})

module.exports = app