const request = require("supertest");
const app = require("../app/express_server");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data"); 
const endpointsJson = require("../endpoints.json");
require('jest-sorted');
/* Set up your beforeEach & afterAll functions here */
beforeEach(() => {
  return seed(data)
})

afterAll(() => {
  return db.end()
})

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
        console.log(endpoints)
      });
  });
});

describe("GET /api/topics", () => {
  test("returns a 200 status and an array of topic objects", () => {
    return request(app)
    .get("/api/topics")
    .expect(200)
    .then((response) => {
    
     
    expect(Array.isArray(response.body.topics)).toBe(true);
    
   
    expect(response.body.topics).toHaveLength(3);
    console.log(response.body.topics)
    
  
    expect(response.body.topics[0]).toHaveProperty("slug", "mitch");
    expect(response.body.topics[0]).toHaveProperty("description", "The man, the Mitch, the legend");
    })
  });
});

describe("GET /api/articles/:article_id", () => {
  test("200: responds with an article object with correct properties", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        const article = body.article;
        expect(article).toHaveProperty("author", expect.any(String));
        expect(article).toHaveProperty("title", expect.any(String));
        expect(article).toHaveProperty("article_id", 1);
        expect(article).toHaveProperty("body", expect.any(String));
        expect(article).toHaveProperty("topic", expect.any(String));
        expect(article).toHaveProperty("created_at", expect.any(String));
        expect(article).toHaveProperty("votes", expect.any(Number));
        expect(article).toHaveProperty("article_img_url", expect.any(String));
       console.log(article)
      });
  });

  test("400: invalid article ID format", () => {
    return request(app)
      .get("/api/articles/banana")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid input");
        console.log(body.msg)
      });
  });

  test("404: valid ID but article does not exist", () => {
    return request(app)
      .get("/api/articles/9999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article not found");
      });
  });
});

describe("GET /api/articles", () => {
  test("200: should return an array of article objects with properties: author, title, article_id, topic, created_at, votes, article_img_url and comment_count - this is the total count of comments referencing this article_id", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then( ( {body} ) => {
        expect(Array.isArray(body.articles)).toBe(true)
        expect(body.articles).toHaveLength(13)
        expect(body.articles).toBeSortedBy("created_at", {descending: true})
        body.articles.forEach((article) => {
          expect(article).toHaveProperty("author")
          expect(article).toHaveProperty("title")
          expect(article).toHaveProperty("article_id")
          expect(article).toHaveProperty("topic")
          expect(article).toHaveProperty("created_at")
          expect(article).toHaveProperty("votes")
          expect(article).toHaveProperty("article_img_url")
          expect(article).toHaveProperty("comment_count")
          expect(typeof article.comment_count).toBe("number")
          expect(article.comment_count).toBeGreaterThanOrEqual(0)
        })
      });
  });
});
