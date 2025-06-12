import cloudinary from "cloudinary";
import { app } from "./app.js";
import { connectDB } from "./data/database.js";

connectDB();


cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
})

const PORT = process.env.PORT || 5001

app.listen(PORT, (req, res, next) => {
    console.log('App running in port: ' + PORT + " in " + process.env.NODE_ENV + " mode");
})