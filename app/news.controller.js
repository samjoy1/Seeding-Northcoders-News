const {selectTopics, selectArticleById, selectArticles, selectCommentsByArticleId} = require("../app/news.model")
const endpoints =  require("../endpoints.json")


exports.getApi = (req, res) => {
    res.status(200).send({endpoints})
}

exports.getTopics = (req, res, next) => {
    selectTopics()
    .then(topics => {
        res.status(200).send({topics})
    })
    .catch(next)
}


exports.getArticleById = (req, res, next) => {
    const {article_id} = req.params;
    selectArticleById(article_id)
    .then((article) => {
        res.status(200).send({article})
    })
    .catch(next)
}

exports.getArticles = (req, res, next) => {
    selectArticles()
    .then((articles) => {
        res.status(200).send({articles})
    })
    .catch(next)
}

exports.getCommentsByArticleId = (req, res, next) => {
    const { article_id } = req.params
    const pendingArticleById = selectArticleById(article_id)
    const pendingCommentsById = selectCommentsByArticleId(article_id)
    
    Promise.all([pendingCommentsById, pendingArticleById])
    .then(([comments]) => {
        res.status(200). send ({ comments })
    })
    .catch(next)
}