import dotenv from "dotenv";
dotenv.config();
import express from "express";
import connectDB from "./config/connectdb.js";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";

const app = express();
const port = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;
//cor policy
app.use(cors());

//database Connection
connectDB(DATABASE_URL);

//JSON
app.use(express.json());

//Load Routes
app.use("/api/user", userRoutes);

app.listen(port, () => {
  console.log(`server listening at ${port}`);
});
