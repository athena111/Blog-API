const db = require("../models");
const Blog = db.blogs;

// Create and Save a new blog
exports.create = (req, res) => {
  // Validate request
  if (!req.body.title || !req.body.body) {
    return res.status(400).send({ message: "Title/body can not be empty!" });
  }

  // Create a blog
  const blogData = new Blog({
    title: req.body.title,
    description: req.body.description,
    body: req.body.body,
    author: req.body.userId,
    reading_time: readingTime(req.body.body),
    tags: req.body.tags
  });

  // Save blog in the database
  blogData
    .save(blogData)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the blog."
      });
    });
};

exports.fetchAll = (req, res) => {

  const {author, title, tags, orderBy} = req.query;

  const { page = 1, limit = 20 } = req.query;

  const queryParams = {};

  if(author) queryParams.author = author;
  if(title) queryParams.title = title?.toString();
  if(tags) queryParams.tags = tags?.toString();

  let orderParams = {};
  if(orderBy?.toString() == 'read_count') orderParams = {read_count: -1};
  if(orderBy?.toString() == 'reading_time') orderParams = {reading_time: -1};
  if(orderBy?.toString() == 'timestamp') orderParams = {created_at: -1};

  Blog.find(queryParams)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort(orderParams)
    .exec()
    .then(data => {
      res.send({
        data,
        currentPage: page,
        limit
      });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving blogs."
      });
    });
}

exports.fetchAllByLoggedInUser = (req, res) => {

  const state = req.query.state;

  const { page = 1, limit = 20 } = req.query;

  let condition = state ? 
  { state: { $regex: new RegExp(state), $options: "i" }, author: req.body.userId } : 
  {author: req.body.userId};

  Blog.find(condition).limit(limit * 1)
    .skip((page - 1) * limit)
    .exec()
    .then(data => {
      res.send({
        data,
        currentPage: page,
        limit
      });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving blogs."
      });
    });
}


// Retrieve all blogs from the database.
exports.findAll = (req, res) => {
  const title = req.query.title;

  const { page = 1, limit = 10 } = req.query;

  let condition = title ? { title: { $regex: new RegExp(title), $options: "i" } } : {};

  blogData.find(condition).limit(limit * 1)
    .skip((page - 1) * limit)
    .exec()
    .then(data => {
      res.send({
        data,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving blogs."
      });
    });
};

// Find a single blog with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Blog.findById(id)
    .populate("author", "first_name last_name email")
    .then(data => {
      if (!data) {
        res.status(404).send({ message: "Not found blog with id " + id });
      } else {
        updateReadCount(id);
        res.send(data);
      }
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: "Error retrieving blog with id=" + id });
    });
};

// Update a blog by the id in the request
exports.update = async (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }

  const id = req.params.id;

  const data = await Blog.findById(id);

    if(!data) return res.status(404).send({message: "Blog post not found!"});
    
    if(data && data.author.toString() !== req.body.userId.toString()) {
      return res.status(403).send({message: "Forbidden!"});
    }


  Blog.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        return res.status(404).send({
          message: `Cannot update blog with id=${id}. Maybe blog was not found!`
        });
      } else return res.send({ message: "blog was updated successfully." });
    })
    .catch(err => {
      return res.status(500).send({
        message: "Error updating blog with id=" + id
      });
    });
};

// Delete a blog with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Blog.findByIdAndRemove(id, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete blog with id=${id}. Maybe blog was not found!`
        });
      } else {
        res.send({
          message: "blog was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete blog with id=" + id
      });
    });
};

// Delete all blogs from the database.
exports.deleteAll = (req, res) => {
  Blog.deleteMany({})
    .then(data => {
      res.send({
        message: `${data.deletedCount} blogs were deleted successfully!`
      });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all blogs."
      });
    });
};

// Find all published blogs
exports.findAllPublished = (req, res) => {
  Blog.find({ published: true })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving blogs."
      });
    });
};

function readingTime(string){
  const wordsPerMinute = 183;
  const noOfWords = string.split(/\s/g).length;
  const mins = noOfWords / wordsPerMinute;
  const readTime = Math.ceil(mins);
  return readTime;
}

const updateReadCount = async (id) => {
  const blog = await Blog.findById(id);
  if(blog) {
    const newBlogCount = blog.read_count + 1;
    await Blog.findByIdAndUpdate(id, {read_count: newBlogCount}, { useFindAndModify: false });
    return;
  }
  return;
}