const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../server");

require("dotenv").config();

/* Connecting to the database before each test. */
beforeEach(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
  });
  
  /* Closing database connection after each test. */
  afterEach(async () => {
    await mongoose.connection.close();
  })

describe("POST /api/user/login", () => {
    test("It responds with the user token", async () => {
        const newUser = await request(app)
          .post("/api/user/login")
          .send({
            email: "abc@xyz.com",
            password: "amani6"
          });
          expect(newUser.body).toHaveProperty("token","email","fullname");
          expect(newUser.statusCode).toBe(200);
    });
  });