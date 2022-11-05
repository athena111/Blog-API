module.exports = mongoose => {
    const schema = mongoose.Schema(
        {
            email: {
                type: String,
                required: true,
                unique: true
            },
            first_name: {
                type: String,
                required: true
            },
            last_name: {
                type: String,
                required: true
            },
            password: {
                type: String,
                required: true
            },
        },
        {timestamps: true}
    );

    schema.method("toJSON", function() {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
      });

      const users = mongoose.model("users", schema);
      return users;
};