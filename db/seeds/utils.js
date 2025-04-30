const db = require("../../db/connection");


exports.convertTimestampToDate = ({ created_at, ...otherProperties }) => {
  if (!created_at) return { ...otherProperties };
  return { created_at: new Date(created_at), ...otherProperties };
};

exports.createRef = (data) => {
  const result = {};
  data.forEach((article) => {
    result[article.title] = article.article_id;
  });
  return result;
};

exports.createArticlesLookupObj = (articlesData) => {
  if (articlesData.length === 0) {
    return {};
  }
  const lookupObj = {}
  articlesData.forEach((article) => {
    lookupObj[article.title] = article.article_id;
  })
  return lookupObj

}