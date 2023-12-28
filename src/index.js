import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});
const Port = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("database failed on app.on", error);
      throw error;
    });
    app.listen(Port, () => {
      console.log("App Listening on Port", Port);
    });
  })
  .catch((error) => {
    console.log("MongoDB Connection faield!", error);
  });
/*
import express from 'express'
const app = express()

(async() =>{
try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    app.on("error",(error) => {
        console.log("databse failed",error)
        throw error
    })
    app.listen(process.env.PORT ,() => {
        console.log("app is listending on",process.env.PORT)
    })
    
} catch (error) {
    console.log("error is",error)
    throw err
}
})()

*/
