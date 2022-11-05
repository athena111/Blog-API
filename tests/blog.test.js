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
beforeEach(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
  });
  
  /* Closing database connection after each test. */
  afterEach(async () => {
    await mongoose.connection.close();
  })

//   beforeAll(async () => {
//   // create a user for authorized routes
//   const user = await request(app)
//   .post("/api/user/signup")
//   .send({
//     first_name: "Jessica",
//     last_name: "Yanki",
//     email: randomEmail,
//     password: "yanki123"
//   });

//   if(user) {
//     loggedInUser = await request(app)
//     .post("/api/user/login")
//     .send({
//       email: randomEmail,
//       password: "yanki123"
//     });

//     testToken += loggedInUser.body?.token;

//     console.log('TOKEN 1', testToken);

//   }

//   });

  describe("GET /api/blogs/all", () => {
    it("should return all products", async () => {
      const res = await request(app).get("/api/blogs/all");
      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

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
      console.log('token', testToken);
        const newBlog = await request(app)
          .post("/api/blogs/create")
          .send({
            title: "Gossip Girl",
            description: "Gossips about the Life of upper East Side",
            body: "Hi, i'm Gossip Girl xoxo.",
            tags: "blog, new york, gossip, hungry, cranky, luxury, parties, bored"
          })
          .set("Authorization", `Bearer ${testToken}`);
          blogId = newBlog.body.id;
          expect(newBlog.statusCode).toBe(200);
          expect(newBlog.body && typeof res.body === 'object').toBe(true);
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
          expect(typeof res.body.read_count).toBe("number");
          expect(res.body.author && typeof res.body.author === 'object').toBe(true);
    });
  });


  describe("GET /api/blogs/:id", () => {
    it("should return one blog", async () => {
      const res = await request(app)
      .get(`/api/blogs/${blogId}`)
      .set("Authorization", `Bearer ${testToken}`);
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