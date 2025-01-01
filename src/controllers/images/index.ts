import { Request, Response } from 'express'
import { request as httpRequest, RequestOptions, Agent } from 'https'

const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY

if (!PIXABAY_API_KEY) {
  throw new Error('Missing Pixabay API key in environment variables.')
}

export const searchImages = async (req: Request, res: Response) => {
  const language = req.params.language || 'en'
  const {
    q,
    image_type,
    video_type,
    orientation,
    category,
    min_width,
    min_height,
    colors,
    editors_choice,
    safesearch,
    order,
    per_page,
    page,
  } = req.query

  if (!q) {
    return res.status(400).json({
      success: false,
      message: 'Missing search query.',
      totalHits: 0,
      hits: [],
    })
  }

  const validImageTypes = ['all', 'photo', 'illustration', 'vector', 'video']
  if (image_type && !validImageTypes.includes(image_type as string)) {
    return res.status(400).json({
      success: false,
      message: `Invalid image_type. Allowed values are: ${validImageTypes.join(', ')}`,
      totalHits: 0,
      hits: [],
    })
  }

  const isVideo = image_type === 'video'
  const apiEndpoint = isVideo
    ? 'https://pixabay.com/api/videos/'
    : 'https://pixabay.com/api/'

  const params = new URLSearchParams({
    key: PIXABAY_API_KEY,
    q: q as string,
    image_type: isVideo ? '' : (image_type as string) || 'all',
    video_type: isVideo ? (video_type as string) || 'all' : '',
    orientation: (orientation as string) || 'all',
    category: (category as string) || '',
    min_width: (min_width as string) || '0',
    min_height: (min_height as string) || '0',
    colors:
      Array.isArray(colors) && colors.length > 0
        ? (colors as string[]).join(',')
        : (colors as string) || '',
    editors_choice: (editors_choice as string) || 'false',
    safesearch: (safesearch as string) || 'true',
    order: (order as string) || 'popular',
    per_page: (per_page as string) || '200',
    page: (page as string) || '1',
    lang: language,
  })

  params.forEach((value, key) => {
    if (value === undefined || value === null || value === '') {
      params.delete(key)
    }
  })

  const url = `${apiEndpoint}?${params.toString()}`

  console.log(
    `Search Images Request - Language: ${language}, Query: ${q}, Type: ${
      image_type || 'all'
    } - URL: ${url}`
  )

  const agent = new Agent({ keepAlive: true })

  const options: RequestOptions = {
    method: 'GET',
    timeout: 10000,
    agent,
  }

  const MAX_RETRIES = 3
  let attempt = 0
  let responseSent = false

  const makeRequest = () => {
    attempt++
    const request = httpRequest(url, options, (response) => {
      let data = ''

      console.log(response.headers)

      // Check for successful response
      if (
        response.statusCode &&
        (response.statusCode < 200 || response.statusCode >= 300)
      ) {
        console.error(`Pixabay API responded with status code: ${response.statusCode}`)

        const rateLimitLimit = response.headers['x-ratelimit-limit']
        const rateLimitRemaining = response.headers['x-ratelimit-remaining']
        const rateLimitReset = response.headers['x-ratelimit-reset']

        console.log('rateLimitLimit:', rateLimitLimit)
        console.log('rateLimitRemaining:', rateLimitRemaining)
        console.log('rateLimitReset:', rateLimitReset)

        let errorMessage = `Pixabay API responded with status code ${response.statusCode}.`

        if (response.statusCode === 429) {
          // 429 Too Many Requests
          if (rateLimitReset) {
            errorMessage = `Rate limit exceeded. Please try again in ${rateLimitReset} seconds.`
          } else {
            errorMessage = 'Rate limit exceeded. Please try again later.'
          }
        } else if (rateLimitRemaining === '0' && rateLimitReset) {
          errorMessage = `Rate limit reached. Please wait ${rateLimitReset} seconds before making more requests.`
        }

        if (!responseSent) {
          responseSent = true
          res.status(502).json({
            success: false,
            message: errorMessage,
            totalHits: 0,
            hits: [],
          })
        }
        request.destroy()
        return
      }

      response.on('data', (chunk) => {
        data += chunk
      })

      response.on('end', () => {
        if (responseSent) return
        try {
          const parsedData = JSON.parse(data)
          const hits = parsedData.hits
          const totalHits = Number(parsedData.totalHits)
          if (!hits || !Array.isArray(hits) || !totalHits) {
            throw new Error('Invalid response structure from Pixabay API.')
          }

          const theResponse = {
            success: true,
            message: 'Images retrieved successfully',
            totalHits,
            hits,
          }

          res.status(200).json(theResponse)
        } catch (error) {
          console.error('Error parsing response:', error)
          if (!responseSent) {
            responseSent = true
            res.status(500).json({
              success: false,
              message: 'Error parsing images.',
              error,
              totalHits: 0,
              hits: [],
            })
          }
        }
      })
    })

    request.on('timeout', () => {
      console.error('Request timed out')
      request.destroy(new Error('Request timed out'))
      if (!responseSent) {
        responseSent = true
        res.status(504).json({
          success: false,
          message: 'Request timed out.',
          totalHits: 0,
          hits: [],
        })
      }
    })

    request.on('error', (error) => {
      if ((error as any).code === 'ECONNRESET' && attempt < MAX_RETRIES) {
        console.log(`Retrying request (${attempt}/${MAX_RETRIES})...`)
        makeRequest()
      } else {
        console.error('Error fetching images:', error)
        if (!responseSent) {
          responseSent = true
          res.status(500).json({
            success: false,
            error,
            message: 'Error fetching images.',
            totalHits: 0,
            hits: [],
          })
        }
      }
    })

    request.end()
  }
  makeRequest()
}
