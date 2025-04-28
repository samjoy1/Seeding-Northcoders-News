const express =  require("express")
const app = express()
const db = require("../db/connection")
const { getApi, getTopics} = require("../app/news.controller")

app.use(express.json())

app.get("/api", getApi)

app.get("/api/topics", getTopics)

module.exports = app