import express, { Express, Request, Response } from "express"
import mongoose from "mongoose"
import cors from "cors"
import bodyParser from "body-parser"
import * as path from "path"
import routes from "./routes"

require("dotenv").config()

const app: Express = express()

const PORT: string | number = process.env.PORT || 4000

const allowedOrigin = process.env.CORS_ORIGIN ?? "https://react.jenniina.fi"

// // Debug environment variables (commented in production)
// console.log("Environment check:")
// console.log("Allowed CORS Origin:", allowedOrigin)
// console.log("NODE_ENV:", process.env.NODE_ENV)
// console.log("MONGO_USER exists:", !!process.env.MONGO_USER)
// console.log("MONGO_PASSWORD exists:", !!process.env.MONGO_PASSWORD)
// console.log("MONGO_CLUSTER exists:", !!process.env.MONGO_CLUSTER)
// console.log("MONGO_DB exists:", !!process.env.MONGO_DB)
// console.log(
//   "MONGO_USER value:",
//   process.env.MONGO_USER
//     ? process.env.MONGO_USER.substring(0, 3) + "***"
//     : "undefined"
// )

app.use(
  cors({
    origin: allowedOrigin,
    methods: ["GET", "HEAD", "OPTIONS", "POST", "PUT", "DELETE"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "x-api-key",
    ],
    exposedHeaders: ["Content-Type"],
  })
)
app.use(express.json())
app.use(bodyParser.json())
// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }))

// API routes first
app.use("/api", routes)

// Serve static files from the React frontend with explicit options
app.use(
  express.static(path.join(__dirname, "frontend", "client"), {
    maxAge: "1d",
    setHeaders: (res, path) => {
      if (path.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript")
      } else if (path.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css")
      }
    },
  })
)

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK" })
})

// Catch-all handler: send back React's index.html file for client-side routing
// This should only catch routes that don't exist as files
app.use((req: Request, res: Response, next) => {
  // Skip if it's an API route
  if (req.path.startsWith("/api/")) {
    return next()
  }

  // Skip if it looks like a file (has extension)
  if (req.path.includes(".") && !req.path.endsWith("/")) {
    return res.status(404).send("File not found")
  }

  // Serve index.html for SPA routes
  res.sendFile(path.join(__dirname, "frontend", "client", "index.html"))
})

const uri: string = `mongodb+srv://${encodeURIComponent(
  process.env.MONGO_USER || ""
)}:${encodeURIComponent(process.env.MONGO_PASSWORD || "")}@${
  process.env.MONGO_CLUSTER
}.zzpvtsc.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`

// // Debug the MongoDB URI (commented in production)
// console.log("MongoDB URI (masked):", uri.replace(/:([^:@]+)@/, ":***@"))
// console.log("Raw password length:", process.env.MONGO_PASSWORD?.length || 0)
// console.log(
//   "Encoded password length:",
//   encodeURIComponent(process.env.MONGO_PASSWORD || "").length
// )

const options = { useNewUrlParser: true, useUnifiedTopology: true }

mongoose
  .connect(uri)
  .then(() => {
    console.log("MongoDB connected successfully")
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    )
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message)
    console.error("Full error:", error)
    // Don't crash the server, just log the error
    console.error("Starting server without database connection...")
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT} (NO DATABASE)`)
    )
  })
