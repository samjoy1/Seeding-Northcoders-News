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
        expect(article).toHaveProperty("comment_count", expect.any(Number))
      });
    });

    test("200: comment_count is 0 when the article has no comments", () => {
      return request(app)
        .get("/api/articles/2") 
        .expect(200)
        .then(({ body }) => {
          expect(body.article.comment_count).toBe(0);
        });
    });

  test("400: invalid article ID format", () => {
    return request(app)
      .get("/api/articles/banana")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid input");
        
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

describe("GET /api/articles/:article_id/comments", () => {
  test("200: responds with an array of comments for the given article_id, sorted by date descending", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments.length).toBe(11)
        expect(Array.isArray(body.comments)).toBe(true);
        body.comments.forEach((comment) => {
          expect(comment).toEqual(
            expect.objectContaining({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              article_id: 1,
            })
          );
        });
        expect(body.comments).toBeSortedBy("created_at", { descending: true });
      });
  });

  test("400: responds with bad request for invalid article_id", () => {
    return request(app)
      .get("/api/articles/banana/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid input");
      });
  });

  test("200: responds with an empty array if article exists but has no comments", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toEqual([]);
      });
  });

  test("404: valid but non-existent article ", () => {
    return request(app)
    .get("/api/articles/9999/comments")
    .expect(404)
    .then(({ body }) => {
      expect(body.msg).toBe("Article not found")
    })
  })

});

describe("POST /api/articles/:article_id/comments", () => {
  test("201: responds with the posted comment", () => {
    const newComment = {
      username: "butter_bridge",
      body: "This is a test comment!",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        expect(body.comment).toBe("This is a test comment!");
      });
  });

  test("400: missing username or body", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({ username: "butter_bridge" })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Missing required fields");
      });
  });

  test("404: posting to a non-existent article", () => {
    return request(app)
      .post("/api/articles/9999/comments")
      .send({ username: "butter_bridge", body: "test" })
      .expect(404);
  });

  test("400: invalid article_id", () => {
    return request(app)
      .post("/api/articles/not-a-number/comments")
      .send({ username: "butter_bridge", body: "Invalid ID test" })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid input");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("200: increments the vote count and returns the updated article", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: 1 })
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toEqual(
          expect.objectContaining({
            article_id: 1,
            votes: expect.any(Number), 
            title: expect.any(String),
            topic: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            created_at: expect.any(String),
            article_img_url: expect.any(String),
          })
        );
      });
  });

  test("200: decreases the vote count and returns the updated article", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: -10 })
      .expect(200)
      .then(({ body }) => {
        expect(body.article.votes).toEqual(90);
      });
  });

  test("200: increases the vote count and returns the updated article", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: +54 })
      .expect(200)
      .then(({ body }) => {
        expect(body.article.votes).toEqual(154);
      });
  });

  test("400: responds with error if inc_votes is missing", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({})
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid inc_votes value");
      });
  });

  test("400: responds with error if inc_votes is not a number", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: "banana" })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid inc_votes value");
      });
  });

  test("400: responds with error if article_id is invalid", () => {
    return request(app)
      .patch("/api/articles/not-a-number")
      .send({ inc_votes: 1 })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid input");
      });
  });

  test("404: responds with error if article does not exist", () => {
    return request(app)
      .patch("/api/articles/9999")
      .send({ inc_votes: 1 })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article not found");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("204: deletes a comment successfully", () => {
    return request(app)
      .delete("/api/comments/1") 
      .expect(204);
  });

  test("404: comment not found", () => {
    return request(app)
      .delete("/api/comments/9999") 
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Comment not found");
      });
  });

  test("400: invalid comment_id", () => {
    return request(app)
      .delete("/api/comments/not-a-number")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid input");
      });
  });
});

describe("GET /api/users", () => {
  test("200: responds with an array of user objects with correct properties", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.users)).toBe(true);
        expect(body.users.length).toBeGreaterThan(0);
        body.users.forEach((user) => {
          expect(user).toEqual(
            expect.objectContaining({
              username: expect.any(String),
              name: expect.any(String),
              avatar_url: expect.any(String),
            })
          );
        });
      });
  });
  test("404: responds with an error for invalid path", () => {
    return request(app)
      .get("/api/userz") 
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Path not found");
      });
  });
});

describe("GET /api/articles with queries", () => {
  test("200: sorts articles by title ascending", () => {
    return request(app)
      .get("/api/articles?sort_by=title&order=asc")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("title", { ascending: true });
      });
  });

  test("200: defaults to sorting by created_at descending", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("created_at", { descending: true });
      });
  });

  test("400: invalid sort_by column", () => {
    return request(app)
      .get("/api/articles?sort_by=notacolumn")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid sort_by query");
      });
  });

  test("400: invalid order value", () => {
    return request(app)
      .get("/api/articles?order=sideways")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid order query");
      });
  });
});

describe("GET /api/articles?topic=...", () => {
  test("200: responds with only articles matching a valid topic", () => {
    return request(app)
      .get("/api/articles?topic=mitch") 
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(Array.isArray(articles)).toBe(true);
        expect(articles.length).toBeGreaterThan(0);
        articles.forEach((article) => {
          expect(article).toHaveProperty("topic", "mitch");
        });
      });
  });

  test("200: responds with an empty array if topic exists but no articles under it", () => {
    return request(app)
      .get("/api/articles?topic=paper") 
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toEqual([]);
      });
  });

  test("404: responds with 'Topic not found' for a non-existent topic", () => {
    return request(app)
      .get("/api/articles?topic=notarealtopic")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Topic not found");
      });
  });
});
