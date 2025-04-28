const {selectTopics} = require("../app/news.model")
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
