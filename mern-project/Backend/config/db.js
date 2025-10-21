const mongoose = require("mongoose");
// const db =
//   "mongodb+srv://root:Password@mern-project.hopg3fs.mongodb.net/?retryWrites=true&w=majority&appName=mern-project";
const db = "mongodb+srv://root:Password@mern-project.hopg3fs.mongodb.net/";

mongoose.set("strictQuery", true, "useNewUrlParser", true);

const connectDB = async () => {
  try {
    await mongoose.connect(db);
    console.log("MongoDB is Connected...");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};
module.exports = connectDB;
