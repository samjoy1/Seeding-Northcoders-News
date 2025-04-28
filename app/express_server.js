const express =  require("express")
const app = express()
const db = require("../db/connection")
const { getApi } = require("../app/news.controller")

app.get("/api", getApi)

module.exports = app