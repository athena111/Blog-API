const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../server");

require("dotenv").config();

let blogId = null;
let loggedInUser = null;
let randomEmail = '';
let testToken = '';

const chars = 'abcdefghijklmnopqrstuvwxyz1234567890';
let string = '';
for(var ii=0; ii<15; ii++){
    string += chars[Math.floor(Math.random() * chars.length)];
}

randomEmail = string + '@gmail.com';
// Generates a random "Gmail"

/* Connecting to the database before each test. */
beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
  });
  
  /* Closing database connection after each test. */
  afterAll(async () => {
    await mongoose.connection.close();
  })

  describe("GET /api/blogs/all", () => {
    it("should return all blog posts", async () => {
      const res = await request(app).get("/api/blogs/all");
      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe("Test blog routes", () => {

    describe("POST /api/blogs/create", () => {
      test("It responds with a new blog", async () => {
  
          const user = await request(app)
          .post("/api/user/signup")
          .send({
            first_name: "Jessica",
            last_name: "Yanki",
            email: randomEmail,
            password: "yanki123"
          });
        
          if(user) {
            loggedInUser = await request(app)
            .post("/api/user/login")
            .send({
              email: randomEmail,
              password: "yanki123"
            });
        
            testToken += loggedInUser.body?.token;
        }
          const newBlog = await request(app)
            .post("/api/blogs/create")
            .set({Authorization: `Bearer ${testToken}`})
            .send({
              title: `${string}`,
              description: "Gossips about the Life of upper East Side",
              body: "Hi, i'm Gossip Girl xoxo.",
              tags: "blog, new york, gossip, hungry, cranky, luxury, parties, bored"
            });
            // console.log('response', newBlog);
            blogId = newBlog.body.id;
            expect(newBlog.statusCode).toBe(200);
            expect(newBlog.body && typeof newBlog.body === 'object').toBe(true);
            expect(newBlog.body).toHaveProperty(
                  "title",
                  "description",
                  "author",
                  "state",
                  "read_count",
                  "reading_time",
                  "tags",
                  "body"
            );
            expect(typeof newBlog.body.read_count).toBe("number");
            expect(newBlog.body.author && typeof newBlog.body.author === 'string').toBe(true);
      });
    });
    
    describe("GET /api/blogs/:id", () => {
      it("should return one blog", async () => {
        const res = await request(app)
        .get(`/api/blogs/${blogId}`)
        .set({Authorization: `Bearer ${testToken}`});
        expect(res.statusCode).toBe(200);
        expect(res.body && typeof res.body === 'object').toBe(true);
        expect(res.body).toHaveProperty(
              "title",
              "description",
              "author",
              "state",
              "read_count",
              "reading_time",
              "tags",
              "body"
        );
        expect(typeof res.body.read_count).toBe("number");
        expect(res.body.author && typeof res.body.author === 'object').toBe(true);
      });
    });

    describe("GET /api/blogs/", () => {
      it("should return all posts by authenticated user", async () => {
        const res = await request(app)
        .get("/api/blogs/")
        .set({Authorization: `Bearer ${testToken}`});
        expect(res.statusCode).toBe(200);
        expect(res.body.data.length).toBeGreaterThan(0);
      });
    });

    describe("GET /api/blogs/published", () => {
      it("should return all published blog posts", async () => {
        const res = await request(app).get("/api/blogs/published");
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
      });
    });

    describe("PUT /api/blogs/:id", () => {
      it("should update a blog post", async () => {
        const res = await request(app)
        .put(`/api/blogs/${blogId}`)
        .set({Authorization: `Bearer ${testToken}`})
        .send({
          title: `${string} ${string}`
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBeDefined();
      });
    });
    
  });