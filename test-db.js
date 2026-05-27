const mongoose = require('mongoose');

const uri = "mongodb+srv://srivastavaalok2214_db_user:QqFhX7YiHcD07oaF@cluster0.fpppkcw.mongodb.net/aesthetic-blueprints?appName=Cluster0";

mongoose.connect(uri)
  .then(() => {
    console.log("Connected to MongoDB!");
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection failed:", err.message);
    process.exit(1);
  });
