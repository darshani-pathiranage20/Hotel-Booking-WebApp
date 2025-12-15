import express from "express";
import "dotenv/config";
import cors from "cors";
import dbconnection from "./configs/dbconnection.js";
import { clerkMiddleware } from '@clerk/express';
import clerkWebhooks from "./controllers/clerkWebhooks.js";

// connect to database
dbconnection()

// create app using express
const app = express();
app.use(cors()) // enable CORS for all routes


//middleware 
app.use(express.json()) // all request will be pass using the json methos
app.use(clerkMiddleware())

// API endpoint to listen to clerk webhooks
// IMPORTANT: Webhook route MUST come BEFORE express.json()
// Clerk needs raw body for signature verification
app.post("/api/clerk", clerkWebhooks);


app.get('/', (req, res) => res.send("API is working, im good "))

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});