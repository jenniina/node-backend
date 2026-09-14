import { Request, Response } from 'express'
import { generateToken } from '../users'
import { ELanguage, IUser } from '../../types'
export type FormData = {
  firstName: string
  lastName: string
  encouragement: string
  color: string
  dark: string
  light: string
  email: string
  message: string
  gdpr: string
  select: string
  selectmulti: string
  clarification: string
}
export type SelectData = {
  issues: string
  favoriteHero: string
  clarification: string
}
export enum EEmail {
  en = 'Email',
  es = 'Correo electrónico',
  fr = 'Email',
  de = 'E-Mail',
  pt = 'Email',
  cs = 'E-mail',
  fi = 'Sähköposti',
}
export enum EEmailSent {
  en = 'Email sent',
  es = 'Correo electrónico enviado',
  fr = 'Email envoyé',
  de = 'E-Mail gesendet',
  pt = 'Email enviado',
  cs = 'E-mail odeslán',
  fi = 'Sähköposti lähetetty',
}
export enum EErrorSendingMail {
  en = 'Error sending email',
  es = 'Error al enviar el correo electrónico',
  fr = "Erreur lors de l'envoi du courriel",
  de = 'Fehler beim Senden der E-Mail',
  pt = 'Erro ao enviar e-mail',
  cs = 'Chyba při odesílání e-mailu',
  fi = 'Virhe sähköpostin lähetyksessä',
}
export enum EPleaseProvideAValidEmailAddress {
  en = 'Please provide a valid email address',
  es = 'Proporcione una dirección de correo electrónico válida',
  fr = 'Veuillez fournir une adresse e-mail valide',
  de = 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
  pt = 'Por favor, forneça um endereço de e-mail válido',
  cs = 'Zadejte platnou e-mailovou adresu',
  fi = 'Anna kelvollinen sähköpostiosoite',
}

const { validationResult } = require('express-validator')
const sanitizeHtml = require('sanitize-html')

type MailErrorShape = {
  code?: string
  command?: string
  response?: string
  responseCode?: number
}

const extractMailErrorDetail = (error: unknown): string => {
  if (error instanceof Error) {
    const mailError = error as Error & MailErrorShape
    const details = [
      mailError.message,
      mailError.code ? `code=${mailError.code}` : '',
      mailError.command ? `command=${mailError.command}` : '',
      mailError.responseCode ? `smtpStatus=${mailError.responseCode}` : '',
      mailError.response ? `smtpResponse=${mailError.response}` : '',
    ].filter(Boolean)

    return details.join(' | ')
  }

  return 'Unknown email error'
}

const BREVO_API_KEY = process.env.BREVO_API_KEY || ''
const BREVO_SENDER_EMAIL =
  process.env.BREVO_SENDER_EMAIL || process.env.NODEMAILER_USER || ''
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || 'Jenniina Laine'

type BrevoRecipient = {
  email: string
  name?: string
}

type BrevoEmailPayload = {
  sender: {
    name: string
    email: string
  }
  to: BrevoRecipient[]
  subject: string
  textContent: string
}

const getMissingMailConfig = (): string[] => {
  const missing: string[] = []
  if (!BREVO_API_KEY) missing.push('BREVO_API_KEY')
  if (!BREVO_SENDER_EMAIL) missing.push('BREVO_SENDER_EMAIL or NODEMAILER_USER')
  return missing
}

const sendBrevoEmail = async (payload: BrevoEmailPayload) => {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': BREVO_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const responseText = await response.text()
    throw new Error(
      `Brevo API responded with status ${response.status} ${response.statusText} | response=${responseText}`
    )
  }

  return response.json()
}

export const sendMail = (
  subject: string,
  message: string,
  username: IUser['username'] | undefined,
  link: string
) => {
  const missingMailConfig = getMissingMailConfig()
  if (missingMailConfig.length > 0) {
    return Promise.reject(
      new Error(
        `Email service is not configured. Missing: ${missingMailConfig.join(', ')}`
      )
    )
  }

  return sendBrevoEmail({
    sender: {
      name: BREVO_SENDER_NAME,
      email: BREVO_SENDER_EMAIL,
    },
    to: [{ email: String(username || '') }],
    subject,
    textContent: `${message}\n\n${link}`,
  })
}

export const sendEmailForm = async (req: Request, res: Response) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.error(errors)
    return res.status(400).json({ errors: errors.array() })
  }

  const missingMailConfig = getMissingMailConfig()
  if (missingMailConfig.length > 0) {
    console.error(
      `Cannot send form email. Missing mail config: ${missingMailConfig.join(', ')}`
    )
    return res.status(500).json({ error: 'Email service is not configured' })
  }

  const sanitizedMessage = sanitizeHtml(String(req.body.message || ''))
  const sanitizedEncouragement = sanitizeHtml(
    String(req.body.encouragement || '')
  )
  const sanitizedClarification = sanitizeHtml(
    String(req.body.clarification || '')
  )
  const { firstName, lastName, email } = req.body

  const mailOptions = {
    subject: `Message from ${firstName} ${lastName}`,
    textContent: `
    Subject: ${req.body.select}
    Message: ${sanitizedMessage}
    Encouragement: ${sanitizedEncouragement}
    Color: ${req.body.color}
    Preference: ${req.body.dark}${req.body.light}
    Select Multi: ${req.body.selectmulti}
    Clarification: ${sanitizedClarification}
    From: ${email}
  `,
  }

  try {
    await sendBrevoEmail({
      sender: {
        name: BREVO_SENDER_NAME,
        email: BREVO_SENDER_EMAIL,
      },
      to: [{ email: BREVO_SENDER_EMAIL }],
      subject: mailOptions.subject,
      textContent: mailOptions.textContent,
    })
    res.status(200).send('Email sent')
  } catch (error) {
    console.error(error)
    const errorMessage = extractMailErrorDetail(error)
    res.status(500).json({ error: 'Error sending email', detail: errorMessage })
  }
}

export const sendEmailSelect = async (req: Request, res: Response) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.error(errors)
    return res.status(400).json({ errors: errors.array() })
  }

  const missingMailConfig = getMissingMailConfig()
  if (missingMailConfig.length > 0) {
    console.error(
      `Cannot send select email. Missing mail config: ${missingMailConfig.join(', ')}`
    )
    return res.status(500).json({ error: 'Email service is not configured' })
  }

  const sanitizedMessage = sanitizeHtml(String(req.body.clarification || ''))
  const sanitizedEmail = sanitizeHtml(String(req.body.email || ''))
  const { favoriteHero, issues } = req.body

  const mailOptions = {
    subject: `Message from React Custom Select Page`,
    textContent: `
        Issues: ${issues}
        Favorite Hero Section: ${favoriteHero}
        Clarification: ${sanitizedMessage} 
        Email: ${sanitizedEmail}
    `,
  }

  try {
    await sendBrevoEmail({
      sender: {
        name: BREVO_SENDER_NAME,
        email: BREVO_SENDER_EMAIL,
      },
      to: [{ email: BREVO_SENDER_EMAIL }],
      subject: mailOptions.subject,
      textContent: mailOptions.textContent,
    })
    res.status(200).send('Email sent')
  } catch (error) {
    console.error(error)
    const errorMessage = extractMailErrorDetail(error)
    res.status(500).json({ error: 'Error sending email', detail: errorMessage })
  }
}

export const sendVerificationLink = async (req: Request, res: Response) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.error(errors)
    return res.status(400).json({ errors: errors.array() })
  }

  const missingMailConfig = getMissingMailConfig()
  if (missingMailConfig.length > 0) {
    console.error(
      `Cannot send verification email. Missing mail config: ${missingMailConfig.join(', ')}`
    )
    return res.status(500).json({ error: 'Email service is not configured' })
  }

  const { email } = req.body
  const token = generateToken(email)

  const mailOptions = {
    subject: `Verify your email address for jenniina.fi`,
    textContent: `
            Click the link below to verify your email address.
            ${process.env.BASE_URI}/verify/${token}
        `,
  }

  try {
    await sendBrevoEmail({
      sender: {
        name: BREVO_SENDER_NAME,
        email: BREVO_SENDER_EMAIL,
      },
      to: [{ email }],
      subject: mailOptions.subject,
      textContent: mailOptions.textContent,
    })
    res.status(200).send('Email sent')
  } catch (error) {
    console.error(error)
    const errorMessage = extractMailErrorDetail(error)
    res.status(500).json({ error: 'Error sending email', detail: errorMessage })
  }
}
