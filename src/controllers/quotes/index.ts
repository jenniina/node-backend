import { request as httpRequest, RequestOptions } from 'https'
import { Request, Response } from 'express'
import { EError, ELanguages } from '../../types'

const API_URL = 'https://api.api-ninjas.com/v1/quotes'
const API_KEY = process.env.API_NINJAS_API_KEY

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
  const category = req.params.category
  const url = new URL(API_URL)
  url.searchParams.append('category', category)

  const options: RequestOptions = {
    headers: {
      'X-Api-Key': API_KEY,
    },
  }

  const request = httpRequest(url, options, (response) => {
    let data = ''

    response.on('data', (chunk) => {
      data += chunk
    })

    response.on('end', () => {
      if (response.statusCode === 200) {
        const quotes = JSON.parse(data)
        res.json({
          success: true,
          message: ESuccessfullyFetchedQuote[language],
          quote: quotes,
        })
      } else {
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
      message: `${EError[language]}: ${error.message}`,
      quote: null,
      error,
    })
  })

  request.end()
}
