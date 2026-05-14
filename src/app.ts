import express, { Express, Request, Response } from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import bodyParser from 'body-parser'
import fs from 'fs'
import * as path from 'path'
import routes from './routes'
import { rateLimit } from './middleware/rateLimit'
import { mongoSanitize } from './middleware/mongoSanitize'

require('dotenv').config()

const packageJsonPathCandidates = [
  path.join(__dirname, '..', 'package.json'),
  path.join(__dirname, 'package.json'),
  path.join(process.cwd(), 'package.json'),
]
const packageJsonPath = packageJsonPathCandidates.find((candidate) =>
  fs.existsSync(candidate)
)
const appVersion = packageJsonPath
  ? ((
      JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as {
        version?: string
      }
    ).version ?? 'unknown')
  : 'unknown'

const app: Express = express()
app.set('etag', false)

// Needed when running behind a reverse proxy (typical in production hosting)
// so req.ip reflects the real client IP via X-Forwarded-For.
app.set('trust proxy', 1)

const PORT: string | number = process.env.PORT || 4000
const mongoDbName = process.env.MONGO_DB ?? 'unset'
const mongoConfig = {
  user: process.env.MONGO_USER,
  password: process.env.MONGO_PASSWORD,
  cluster: process.env.MONGO_CLUSTER,
  db: process.env.MONGO_DB,
}
const hasMongoConfig = Boolean(
  mongoConfig.user &&
  mongoConfig.password &&
  mongoConfig.cluster &&
  mongoConfig.db
)
const frontendClientDirCandidates = [
  path.join(__dirname, 'frontend', 'client'),
  path.join(process.cwd(), 'dist', 'frontend', 'client'),
  path.join(__dirname, '..', 'frontend', 'client'),
  path.join(process.cwd(), 'frontend', 'client'),
]
const frontendClientDir =
  frontendClientDirCandidates.find((dir) =>
    fs.existsSync(path.join(dir, 'index.html'))
  ) ?? frontendClientDirCandidates[0]

const allowedOrigin = process.env.CORS_ORIGIN ?? 'https://react.jenniina.fi'

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
    methods: ['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'x-api-key',
    ],
  })
)
app.use(express.json())
app.use(bodyParser.json())
// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }))

// Basic NoSQL-injection hardening: strips $-operators and dotted keys.
app.use(mongoSanitize())

app.use('/api', (req: Request, res: Response, next) => {
  delete req.headers['if-none-match']
  delete req.headers['if-modified-since']
  res.setHeader('X-App-Version', appVersion)
  res.setHeader('X-App-Mongo-Db', mongoDbName)
  res.setHeader('X-App-Mongo-State', String(mongoose.connection.readyState))
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
  )
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  res.setHeader('Surrogate-Control', 'no-store')
  res.removeHeader('ETag')
  res.removeHeader('Last-Modified')
  next()
})

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    version: appVersion,
    mongoDb: mongoDbName,
    mongoState: mongoose.connection.readyState,
    mongoConfigured: hasMongoConfig,
  })
})

// API routes first
const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 300,
})

app.use('/api', apiLimiter, routes)

// Serve static files from the React frontend with explicit options
app.use(
  express.static(frontendClientDir, {
    maxAge: '1d',
    setHeaders: (res, path) => {
      if (path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript')
      } else if (path.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css')
      }
    },
  })
)

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    version: appVersion,
    mongoDb: mongoDbName,
    mongoState: mongoose.connection.readyState,
    mongoConfigured: hasMongoConfig,
  })
})

// Catch-all handler: send back React's index.html file for client-side routing
// This should only catch routes that don't exist as files
app.use((req: Request, res: Response, next) => {
  // Skip if it's an API route
  if (req.path.startsWith('/api/')) {
    return next()
  }

  // Skip if it looks like a file (has extension)
  if (req.path.includes('.') && !req.path.endsWith('/')) {
    return res.status(404).send('File not found')
  }

  // Serve index.html for SPA routes
  res.sendFile(path.join(frontendClientDir, 'index.html'))
})

const startServer = () => {
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  )
}

// Mongoose-side hardening for filters.
mongoose.set('strictQuery', true)
mongoose.set('sanitizeFilter', true)

if (!hasMongoConfig) {
  console.warn(
    'MongoDB environment variables are incomplete; starting without database connection.'
  )
  console.warn(
    'Missing one or more of: MONGO_USER, MONGO_PASSWORD, MONGO_CLUSTER, MONGO_DB'
  )
  startServer()
} else {
  const uri: string = `mongodb+srv://${encodeURIComponent(
    mongoConfig.user || ''
  )}:${encodeURIComponent(mongoConfig.password || '')}@${
    mongoConfig.cluster
  }.zzpvtsc.mongodb.net/${mongoConfig.db}?retryWrites=true&w=majority`

  // // Debug the MongoDB URI (commented in production)
  // console.log("MongoDB URI (masked):", uri.replace(/:([^:@]+)@/, ":***@"))
  // console.log("Raw password length:", process.env.MONGO_PASSWORD?.length || 0)
  // console.log(
  //   "Encoded password length:",
  //   encodeURIComponent(process.env.MONGO_PASSWORD || "").length
  // )

  mongoose
    .connect(uri)
    .then(() => {
      console.log('MongoDB connected successfully')
      startServer()
    })
    .catch((error) => {
      console.error('MongoDB connection error:', error.message)
      console.error('Full error:', error)
      // Don't crash the server, just log the error
      console.error('Starting server without database connection...')
      console.log('Mongo DB:', process.env.MONGO_DB)
      startServer()
    })
}
