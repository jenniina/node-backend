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
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: process.env.NODEMAILER_HOST,
  port: process.env.NODEMAILER_PORT,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASSWORD,
  },
})
export const sendMail = (
  subject: string,
  message: string,
  username: IUser['username'] | undefined,
  link: string
) => {
  return new Promise((resolve, reject) => {
    transporter.sendMail(
      {
        from: process.env.NODEMAILER_USER,
        to: username,
        subject: subject,
        text: `${message}\n\n ${link}`,
      },
      (error: Error, info: { response: unknown }) => {
        if (error) {
          console.error(error)
          reject(error)
          return error
        } else {
          // console.log('Email sent: ' + info.response)
          resolve(info.response)
          return info.response
        }
      }
    )
  })
}

export const sendEmailForm = async (req: Request, res: Response) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.error(errors)
    return res.status(400).json({ errors: errors.array() })
  }

  const sanitizedMessage = sanitizeHtml(req.body.message)
  const sanitizedEncouragement = sanitizeHtml(req.body.encouragement)
  const sanitizedClarification = sanitizeHtml(req.body.clarification)
  const { firstName, lastName, email } = req.body

  let transporter = nodemailer.createTransport({
    host: process.env.NODEMAILER_HOST,
    port: process.env.NODEMAILER_PORT,
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  })

  let mailOptions = {
    from: process.env.NODEMAILER_USER,
    to: process.env.NODEMAILER_USER,
    subject: `Message from ${firstName} ${lastName}`,
    text: `
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
    await transporter.sendMail(mailOptions)
    res.status(200).send('Email sent')
  } catch (error) {
    console.error(error)
    res.status(500).send('Error sending email')
  }
}

export const sendEmailSelect = async (req: Request, res: Response) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.error(errors)
    return res.status(400).json({ errors: errors.array() })
  }

  const sanitizedMessage = sanitizeHtml(req.body.clarification)
  const sanitizedEmail = sanitizeHtml(req.body.email)
  const { favoriteHero, issues } = req.body

  let transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  })

  let mailOptions = {
    from: process.env.NODEMAILER_USER,
    to: process.env.NODEMAILER_USER,
    subject: `Message from React Custom Select Page`,
    text: `
        Issues: ${issues}
        Favorite Hero Section: ${favoriteHero}
        Clarification: ${sanitizedMessage} 
        Email: ${sanitizedEmail}
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    res.status(200).send('Email sent')
  } catch (error) {
    console.error(error)
    res.status(500).send('Error sending email')
  }
}

export const sendVerificationLink = async (req: Request, res: Response) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.error(errors)
    return res.status(400).json({ errors: errors.array() })
  }
  const { email } = req.body
  const token = generateToken(email)

  let transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  })

  let mailOptions = {
    from: process.env.NODEMAILER_USER,
    to: email,
    subject: `Verify your email address for jenniina.fi`,
    text: `
            Click the link below to verify your email address.
            ${process.env.BASE_URI}/verify/${token}
        `,
  }

  try {
    await transporter.sendMail(mailOptions)
    res.status(200).send('Email sent')
  } catch (error) {
    console.error(error)
    res.status(500).send('Error sending email')
  }
}
