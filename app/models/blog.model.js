const { Schema } = require("mongoose")

module.exports = mongoose => {
    const schema = mongoose.Schema(
      {
        title: {
          type: String,
          required: true,
          unique: true
        },
        description: String,
        author: {
          type: Schema.Types.ObjectId,
          ref: "users",
        },
        state: {
          type: String,
          enum: ['draft', 'published'],
          default: 'draft'
        },
        read_count: {
          type: Number,
          default: 0
        },
        reading_time : {
          type: Number,
          required: true
        },
        tags: String,
        body: {
          type: String,
          required: true
        }
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const blog = mongoose.model("blog", schema);
    return blog;
  };
  