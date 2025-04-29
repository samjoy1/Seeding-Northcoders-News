const request = require("supertest");
const app = require("../app/express_server");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data"); 
const endpointsJson = require("../endpoints.json");

/* Set up your beforeEach & afterAll functions here */
beforeEach(() => {
  return seed(data)
})

afterAll(() => {
  return db.end()
})

describe('get invalid urls', () => {
  test("404: error message for invalid string", () => {
    return request(app)
    .get("/api/invalid")
    .expect(404)
    .then(({body}) => {
      expect(body.msg).toBe("error")
      console.log(body.msg)
    })
  })
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