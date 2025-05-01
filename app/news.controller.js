const {selectTopics, selectArticleById, selectArticles, selectCommentsByArticleId, insertCommentByArticleId, updateArticleById, removeCommentById} = require("../app/news.model")
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

exports.postCommentByArticleId = (req, res, next) => {
    const { article_id } =  req.params
    const { username, body } =  req.body
  

  if (!username || !body) {
    return res.status(400).send({msg: "Missing required fields"})
  }

  Promise.all([
    selectArticleById(article_id),
    insertCommentByArticleId(article_id, username, body),
  ])
  .then(([unused, comment]) => {
    res.status(201).send({comment: comment.body})
  })
  .catch(next)
}

exports.patchArticleById = (req, res, next) => {
    const { article_id } = req.params
    const {inc_votes} = req.body
    if (typeof inc_votes !== "number") {
        return res.status(400).send({msg: "Invalid inc_votes value"})
    }

    updateArticleById(article_id, inc_votes)
    .then((updatedArticle) => {
        res.status(200).send({ article: updatedArticle})
    })
    .catch(next)
}

exports.deleteCommentById = (req, res, next) => {
    const { comment_id } = req.params
    removeCommentById(comment_id)
    .then(() => {
        res.status(204).send()
    })
    .catch(next)
}