module.exports = app => {
    const blogs = require("../controllers/blog.controller.js");
  
    const router = require("express").Router();
  
    const auth = require("../middleware/auth.js");

    // Create a new blog
    router.post("/create", auth, blogs.create);
  
    // Retrieve all blogs
    router.get("/all", blogs.fetchAll);
  
    // Retrieve all blogs by logged in user
    router.get("/", auth, blogs.fetchAllByLoggedInUser);

    // Retrieve all published blogs
    router.get("/published", blogs.findAllPublished);
  
    // Retrieve a single blog with id
    router.get("/:id", blogs.findOne);
  
    // Update a blog with id
    router.put("/:id", auth, blogs.update);
  
    // Delete a blog with id
    router.delete("/:id", auth, blogs.delete);
  
    // Create a new blog
    // router.delete("/", , blogs.deleteAll);
  
    app.use("/api/blogs", router);
  };
  