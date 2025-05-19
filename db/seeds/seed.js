const db = require("../connection");
const format = require("pg-format");
const { convertTimestampToDate, createRef, createArticlesLookupObj  } = require("./utils");

const seed = ({ topicData, userData, articleData, commentData }) => {
  return db
  .query(`DROP TABLE IF EXISTS comments, articles, users, topics CASCADE;`)
  .then(() => {
    return db.query(`CREATE TABLE topics (
      slug VARCHAR PRIMARY KEY,
      description VARCHAR,
      img_url VARCHAR(1000)
     );
   `);
  })
  .then(() => {
    return db.query(`CREATE TABLE users (
      username VARCHAR PRIMARY KEY,
      name VARCHAR,
      avatar_url VARCHAR(1000)
      );
    `);
  })
  .then(() => {
    return db.query(`CREATE TABLE articles (
      article_id SERIAL PRIMARY KEY,
      title VARCHAR,
      topic VARCHAR REFERENCES topics(slug),
      author VARCHAR REFERENCES users(username),
      body TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      votes INT DEFAULT 0,
      article_img_url VARCHAR(1000)
      );
    `);
  })
  .then(() => {
    return db.query(`CREATE TABLE comments (
      comment_id SERIAL PRIMARY KEY,
      article_id INT REFERENCES articles(article_id),
      body TEXT,
      votes INT DEFAULT 0,
      author VARCHAR REFERENCES users(username),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  })
  .then(() => {
    const formattedTopics = topicData.map((topic) => {
      return [topic.slug, topic.description, topic.img_url];
    });
    const insertTopicsQuery = format(
      `INSERT INTO topics (slug, description, img_url)
      VALUES %L;`,
      formattedTopics
    );
    return db.query(insertTopicsQuery);
  })
  .then(() => {
    const formattedUsers = userData.map((user) => {
      return [user.username, user.name, user.avatar_url];
    });
    const insertUsersQuery = format(
      `INSERT INTO users (username, name, avatar_url)
      VALUES %L;`,
      formattedUsers
    );
    return db.query(insertUsersQuery);
  })
  .then(() => {
    const formattedArticles = articleData.map((article) => {
      const legitArticle = convertTimestampToDate(article);
      return [
        legitArticle.title,
        legitArticle.topic,
        legitArticle.author,
        legitArticle.body,
        legitArticle.created_at,
        legitArticle.votes,
        legitArticle.article_img_url,
      ];
    });
    const InsertArticlesQuery = format(
      `INSERT INTO articles(title, topic, author, body, created_at, votes, article_img_url)
      VALUES %L RETURNING *;`,
      formattedArticles
    );
    return db.query(InsertArticlesQuery);
  })
  .then((result) => {
    const articlesLookup = createArticlesLookupObj(result.rows);


    const formattedComments = commentData.map((comment) => {
      const legitComment = convertTimestampToDate(comment);
      return [
        articlesLookup[legitComment.article_title],
        legitComment.body,
        legitComment.votes,
        legitComment.author,
        legitComment.created_at,
      ];
    });
    const insertCommentsQuery = format(
      `INSERT INTO comments (article_id, body, votes, author,
      created_at)
      VALUES %L`,
      formattedComments
    );
    return db.query(insertCommentsQuery);
  })
  .then(() => {
    console.log("Seed complete");
  });
};
module.exports = seed;
