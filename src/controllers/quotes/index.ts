import { request as httpRequest, RequestOptions } from 'https'
import { Request, Response } from 'express'
import { ELanguages } from '../../types'

const API_KEY = process.env.RAPIDAPI_API_KEY

export enum EErrorFetchingQuotes {
  en = 'Error fetching quotes',
  es = 'Error al obtener citas',
  fr = 'Erreur lors de la récupération des citations',
  de = 'Fehler beim Abrufen von Zitaten',
  pt = 'Erro ao buscar citações',
  cs = 'Chyba při načítání citátů',
  fi = 'Virhe haettaessa lainauksia',
}
export enum ESuccessfullyFetchedQuote {
  en = 'Quote fetched successfully',
  es = 'Cita obtenida con éxito',
  fr = 'Citation récupérée avec succès',
  de = 'Zitat erfolgreich abgerufen',
  pt = 'Citação obtida com sucesso',
  cs = 'Citát úspěšně načten',
  fi = 'Lainaus haettu onnistuneesti',
}

export const getQuotes = async (req: Request, res: Response) => {
  const language = (req.params.language as ELanguages) || 'en'
  const path = `/quotes/random/?language_code=${language}`

  const options: RequestOptions = {
    method: 'GET',
    hostname: 'quotes15.p.rapidapi.com',
    port: 443, // HTTPS default port
    path,
    headers: {
      'x-rapidapi-key': API_KEY as string,
      'x-rapidapi-host': 'quotes15.p.rapidapi.com',
    },
  }

  const request = httpRequest(options, (response) => {
    let data = ''

    response.on('data', (chunk) => {
      data += chunk
    })

    response.on('end', () => {
      if (response.statusCode === 200) {
        try {
          const quote = JSON.parse(data)
          res.json({
            success: true,
            message: ESuccessfullyFetchedQuote[language],
            quote,
          })
        } catch (error) {
          console.error(`${EErrorFetchingQuotes[language]}: Invalid JSON response`, error)
          res.status(500).json({
            success: false,
            message: `${EErrorFetchingQuotes[language]}: Invalid JSON response`,
            quote: null,
          })
        }
      } else {
        console.log(`${EErrorFetchingQuotes[language]}: `, data)
        res.status(response.statusCode || 500).json({
          success: false,
          message: `${EErrorFetchingQuotes[language]}: ${response.statusMessage}`,
          quote: null,
        })
      }
    })
  })

  request.on('error', (error) => {
    console.error(`${EErrorFetchingQuotes[language]}: `, error)
    res.status(500).json({
      success: false,
      message: `${EErrorFetchingQuotes[language]}: ${error.message}`,
      quote: null,
      error,
    })
  })

  request.end()
}
