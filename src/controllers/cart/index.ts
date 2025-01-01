import { Response, Request, NextFunction } from 'express'
import {
  EEmail,
  EEmailSent,
  EErrorSendingMail,
  EPleaseProvideAValidEmailAddress,
  sendMail,
} from '../email'
import { EError, ELanguages } from '../../types'
import { ICartItem, Cart, IInfo, ICart } from '../../models/cart'
import { validationResult } from 'express-validator'

export enum EThankYouForYourOrder {
  en = 'Thank you for your order!',
  es = '¡Gracias por tu pedido!',
  fr = 'Merci pour votre commande!',
  de = 'Danke für Ihre Bestellung!',
  pt = 'Obrigado pela sua encomenda!',
  cs = 'Děkujeme za vaši objednávku!',
  fi = 'Kiitos tilauksestasi!',
}
export enum EConfirmationEmailMayTakeAWhile {
  en = 'The confirmation email may take a little while to arrive',
  es = 'El correo electrónico de confirmación puede tardar un poco en llegar',
  fr = "L'email de confirmation peut mettre un peu de temps à arriver",
  de = 'Die Bestätigungs-E-Mail kann eine Weile dauern, bis sie eintrifft',
  pt = 'O email de confirmação pode demorar um pouco para chegar',
  cs = 'Potvrzovací e-mail může chvíli trvat, než dorazí',
  fi = 'Vahvistussähköpostin saapuminen voi kestää hetken',
}
export enum EYourOrderHasBeenReceived {
  en = 'Your order has been received!',
  es = '¡Tu pedido ha sido recibido!',
  fr = 'Votre commande a été reçue!',
  de = 'Ihre Bestellung ist eingegangen!',
  pt = 'A sua encomenda foi recebida!',
  cs = 'Vaše objednávka byla přijata!',
  fi = 'Tilauksesi on vastaanotettu!',
}
export enum EOrderDetails {
  en = 'Order details',
  es = 'Detalles del pedido',
  fr = 'Détails de la commande',
  de = 'Bestelldetails',
  pt = 'Detalhes do pedido',
  cs = 'Podrobnosti objednávky',
  fi = 'Tilauksen tiedot',
}
export enum ETotal {
  en = 'Total',
  es = 'Total',
  fr = 'Total',
  de = 'Total',
  pt = 'Total',
  cs = 'Celkem',
  fi = 'Yhteensä',
}
export enum ENewOrderFrom {
  en = 'New order from ',
  es = 'Nuevo pedido de ',
  fr = 'Nouvelle commande de ',
  de = 'Neue Bestellung von ',
  pt = 'Nova encomenda de ',
  cs = 'Nová objednávka od ',
  fi = 'Uusi tilaus ',
}

export enum ECartUpdated {
  en = 'Cart updated',
  es = 'Carro actualizado',
  fr = 'Panier mis à jour',
  de = 'Warenkorb aktualisiert',
  pt = 'Carrinho atualizado',
  cs = 'Košík aktualizován',
  fi = 'Kori päivitetty',
}
export enum EOrderId {
  en = 'Order id ',
  es = 'ID de pedido ',
  fr = 'Identifiant de commande ',
  de = 'Bestellnummer ',
  pt = 'ID do pedido ',
  cs = 'Identifikátor objednávky ',
  fi = 'Tilausnumero ',
}
export enum EUser {
  en = 'User',
  es = 'Usuario',
  fr = 'Utilisateur',
  de = 'Benutzer',
  pt = 'Utilizador',
  cs = 'Uživatel',
  fi = 'Käyttäjä',
}
export enum EGuest {
  en = 'Guest',
  es = 'Invitado',
  fr = 'Invité',
  de = 'Gast',
  pt = 'Convidado',
  cs = 'Host',
  fi = 'Vierailija',
}
export enum EIllSoonBeInTouch {
  en = "I'll soon be in touch",
  es = 'Pronto me pondré en contacto',
  fr = 'Je serai bientôt en contact',
  de = 'Ich werde mich bald melden',
  pt = 'Em breve entrarei em contato',
  cs = 'Brzy se ozvu',
  fi = 'Otan pian yhteyttä',
}
export enum EBestRegards {
  en = 'Best regards, ',
  es = 'Saludos cordiales, ',
  fr = 'Meilleures salutations, ',
  de = 'Mit freundlichen Grüßen, ',
  pt = 'Melhores cumprimentos, ',
  cs = 'S pozdravem, ',
  fi = 'Ystävällisin terveisin, ',
}

export enum EOrderNotFound {
  en = 'Order not found',
  es = 'Pedido no encontrado',
  fr = 'Commande non trouvée',
  de = 'Bestellung nicht gefunden',
  pt = 'Encomenda não encontrada',
  cs = 'Objednávka nenalezena',
  fi = 'Tilausta ei löytynyt',
}
export enum EYouCanViewYourOrderHere {
  en = 'You can view your order here',
  es = 'Puede ver su pedido aquí',
  fr = 'Vous pouvez voir votre commande ici',
  de = 'Sie können Ihre Bestellung hier einsehen',
  pt = 'Você pode ver seu pedido aqui',
  cs = 'Své objednávky můžete zobrazit zde',
  fi = 'Voit tarkastella tilaustasi täällä',
}

export enum EName {
  en = 'Name',
  es = 'Nombre',
  fr = 'Nom',
  de = 'Name',
  pt = 'Nome',
  cs = 'Jméno',
  fi = 'Nimi',
}
export enum EBusinessID {
  en = 'Business ID',
  es = 'NIF',
  fr = 'Numéro de TVA',
  de = 'USt-IdNr.',
  pt = 'NIF',
  cs = 'DIČ',
  fi = 'Y-tunnus',
}
export enum ECompanyName {
  en = 'Company name',
  es = 'Nombre de la empresa',
  fr = "Nom de l'entreprise",
  de = 'Firmenname',
  pt = 'Nome da empresa',
  cs = 'Název společnosti',
  fi = 'Yrityksen nimi',
}
export enum EPostalCode {
  en = 'Postal code',
  es = 'Código postal',
  fr = 'Code postal',
  de = 'Postleitzahl',
  pt = 'Código postal',
  cs = 'PSČ',
  fi = 'Postinumero',
}
export enum ECity {
  en = 'City',
  es = 'Ciudad',
  fr = 'Ville',
  de = 'Stadt',
  pt = 'Cidade',
  cs = 'Město',
  fi = 'Kaupunki',
}
export enum ECountry {
  en = 'Country',
  es = 'País',
  fr = 'Pays',
  de = 'Land',
  pt = 'País',
  cs = 'Země',
  fi = 'Maa',
}
export enum EPhone {
  en = 'Phone',
  es = 'Teléfono',
  fr = 'Téléphone',
  de = 'Telefon',
  pt = 'Telefone',
  cs = 'Telefon',
  fi = 'Puhelin',
}
export enum EBillingAddress {
  en = 'Billing address',
  es = 'Dirección de facturación',
  fr = 'Adresse de facturation',
  de = 'Rechnungsadresse',
  pt = 'Endereço de faturação',
  cs = 'Fakturační adresa',
  fi = 'Laskutusosoite',
}

const getFinnishTime = (): Date => {
  const local = new Date()
  let off = local.getTimezoneOffset() * 60 * 1000
  const timeStamp = local.getTime() + off
  off += 1000 * 60 * 60 * 2
  let nd = new Date()
  nd.setTime(timeStamp)
  return nd
}

const infoTranslations = (key: keyof IInfo, language: ELanguages): string => {
  switch (key) {
    case 'name':
      return EName[language]
    case 'email':
      return EEmail[language]
    case 'phone':
      return EPhone[language]
    case 'address':
      return EBillingAddress[language]
    case 'city':
      return ECity[language]
    case 'zip':
      return EPostalCode[language]
    case 'country':
      return ECountry[language]
    case 'companyName':
      return ECompanyName[language]
    case 'businessID':
      return EBusinessID[language]
    default:
      return key
  }
}

export const newOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { info, items, total, extra, orderID } = req.body as ICart
    const createdAt = getFinnishTime()
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
      })
    }

    const cart = new Cart({
      orderID,
      info,
      items,
      total,
      extra,
      createdAt,
    })
    await cart.save()
    next()
  } catch (error) {
    const language = req.params.language
    console.error(error)
    res.status(500).json({
      success: false,
      message: `${EError[(language as ELanguages) ?? 'en']}: ${(error as Error).message}`,
    })
  }
}

export const orderConfirmation = async (req: Request, res: Response) => {
  try {
    const { language } = req.params
    const { items, orderID, extra } = req.body as ICart
    const subject = `${
      EThankYouForYourOrder[(language as ELanguages) ?? 'en']
    } (React.Jenniina.fi)`
    const link = `https://react.jenniina.fi/orders?orderID=${orderID}`
    const information: IInfo = req.body.info
    const message = `
      ${EYourOrderHasBeenReceived[(language as ELanguages) ?? 'en']} \n
      ${EOrderId[(language as ELanguages) ?? 'en']}: ${orderID} \n\n
      ${EOrderDetails[(language as ELanguages) ?? 'en']}: \n
      ${items
        .map((item: ICartItem) => {
          if (item.quantity === 1)
            return `${item.name}: ${item.price} €; \n 
        ${item.details && item.details.trim() !== '' ? item.details : null}`
          else
            return `${item.name} x ${item.quantity}: ${item.price * item.quantity} €; \n 
        ${item.details && item.details.trim() !== '' ? item.details : null}`
        })
        .join('\n\n')}. 
      \n
      ${ETotal[(language as ELanguages) ?? 'en']}: ${items.reduce(
      (acc: number, item: ICartItem) => acc + item.price * item.quantity,
      0
    )} €. \n
    ${extra && extra.trim() !== '' ? `Info: ${extra} \n ` : ''}
    
    ${Object.keys(information)
      .filter(
        (key) =>
          information[key as keyof IInfo] &&
          information[key as keyof IInfo]?.trim() !== ''
      )
      .map(
        (key) =>
          `${infoTranslations(key as keyof IInfo, language as ELanguages)}: ${
            information[key as keyof IInfo]
          }`
      )
      .join('\n')} \n
      ${EIllSoonBeInTouch[(language as ELanguages) ?? 'en']}. \n
      ${EBestRegards[(language as ELanguages) ?? 'en']} \n
      Jenniina
      \n
      ${EYouCanViewYourOrderHere[(language as ELanguages) ?? 'en']}:
    `
    await sendMail(subject, message, information.email, link)
    const admin = process.env.NODEMAILER_USER
    const adminSubject = `${ENewOrderFrom[(language as ELanguages) ?? 'en']} ${
      information.name
    }`
    const adminMessage = `
        ${ENewOrderFrom[(language as ELanguages) ?? 'en']} ${information.email}, ${
      information.name
    }. \n 
        ${EOrderId[(language as ELanguages) ?? 'en']} ${orderID}. \n 
        ${EOrderDetails[(language as ELanguages) ?? 'en']} \n
        ${items
          .map((item: ICartItem) => {
            if (item.quantity === 1)
              return `${item.name}: ${item.price} €; \n 
        ${item.details && item.details.trim() !== '' ? item.details : null}`
            else
              return `${item.name} x ${item.quantity}: ${
                item.price * item.quantity
              } €; \n 
        ${item.details && item.details.trim() !== '' ? item.details : null}`
          })
          .join('\n\n')}. \n
      ${ETotal[(language as ELanguages) ?? 'en']}: ${items.reduce(
      (acc: number, item: ICartItem) => acc + item.price * item.quantity,
      0
    )} €. \n
    ${extra && extra.trim() !== '' ? `Info: ${extra} \n ` : ''}

    ${Object.keys(information)
      .filter(
        (key) =>
          information[key as keyof IInfo] &&
          information[key as keyof IInfo]?.trim() !== ''
      )
      .map(
        (key) =>
          `${infoTranslations(key as keyof IInfo, language as ELanguages)}: ${
            information[key as keyof IInfo]
          }`
      )
      .join('\n')} 
    `
    await sendMail(adminSubject, adminMessage, admin, link)
    res.status(200).json({
      success: true,
      message: `${EThankYouForYourOrder[(language as ELanguages) ?? 'en']}${
        EConfirmationEmailMayTakeAWhile[(language as ELanguages) ?? 'en']
      }`,
    })
  } catch (error) {
    const language = req.params.language
    console.error(error)
    res.status(500).json({
      message: `${EErrorSendingMail[(language as ELanguages) ?? 'en']}, ${
        (error as Error).message
      }`,
    })
  }
}

export const getOrderByOrderID = async (req: Request, res: Response) => {
  try {
    const { orderID } = req.params
    const order = await Cart.findOne({ orderID })
    if (!order) {
      res.status(404).json({
        success: false,
        message: EOrderNotFound[(req.params.language as ELanguages) ?? 'en'],
      })
      return
    }
    res.status(200).json(order)
  } catch (error) {
    const language = req.params.language
    console.error(error)
    res.status(500).json({
      success: false,
      message: `${EError[language as ELanguages]}: ${(error as Error).message}`,
    })
  }
}

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Cart.find()
    res.status(200).json(orders)
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    })
  }
}
export enum EOrderDeleted {
  en = 'Order deleted',
  es = 'Pedido eliminado',
  fr = 'Commande supprimée',
  de = 'Bestellung gelöscht',
  pt = 'Encomenda apagada',
  cs = 'Objednávka smazána',
  fi = 'Tilaus poistettu',
}
export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { orderID, language } = req.params
    const order = await Cart.findOneAndDelete({ orderID })
    if (!order) {
      res.status(404).json({
        success: false,
        message: EOrderNotFound[(language as ELanguages) ?? 'en'],
      })
      return
    }
    res.status(200).json({
      success: true,
      message: `${EOrderDeleted[language as ELanguages]}: ${orderID}`,
    })
  } catch (error) {
    const language = req.params.language
    console.error(error)
    res.status(500).json({
      success: false,
      message: `${EError[language as ELanguages]}: ${(error as Error).message}`,
    })
  }
}
export const updateOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderID, language } = req.params
    const { info, items, total, extra, status, paid } = req.body as ICart
    const order = await Cart.findOneAndUpdate(
      { orderID },
      { info, items, total, extra, status, paid, updatedAt: getFinnishTime() },
      { new: true }
    )
    if (!order) {
      res.status(404).json({
        success: false,
        message: EOrderNotFound[(language as ELanguages) ?? 'en'],
      })
      return
    }
    //next() //Temporarily disabled
    res.status(200).json({
      success: true,
      message: ECartUpdated[(language as ELanguages) ?? 'en'],
      order,
    })
  } catch (error) {
    const language = req.params.language
    console.error(error)
    res.status(500).json({
      success: false,
      message: `${EError[language as ELanguages]}: ${(error as Error).message}`,
    })
  }
}

export const orderChangeConfirmation = async (req: Request, res: Response) => {
  try {
    const { language } = req.params
    const { items, orderID, extra } = req.body as ICart
    const link = `https://react.jenniina.fi/orders?orderID=${orderID}`
    const information: IInfo = req.body.info
    const message = `
      ${ECartUpdated[(language as ELanguages) ?? 'en']} \n
      ${EOrderId[(language as ELanguages) ?? 'en']} ${orderID}.  \n 
      ${EOrderDetails[(language as ELanguages) ?? 'en']} \n
      ${items
        .map((item: ICartItem) => {
          if (item.quantity === 1)
            return `${item.name}: ${item.price} €; \n 
        ${item.details && item.details.trim() !== '' ? item.details : null}`
          else
            return `${item.name} x ${item.quantity}: ${item.price * item.quantity} €; \n 
        ${item.details && item.details.trim() !== '' ? item.details : null}`
        })
        .join('\n\n')}.  \n     
      ${ETotal[(language as ELanguages) ?? 'en']}: ${items.reduce(
      (acc: number, item: ICartItem) => acc + item.price * item.quantity,
      0
    )} €. \n
    ${extra && extra.trim() !== '' ? `Info: ${extra} \n ` : ''}

    ${Object.keys(information)
      .filter(
        (key) =>
          information[key as keyof IInfo] &&
          information[key as keyof IInfo]?.trim() !== ''
      )
      .map((key) => `${key}: ${information[key as keyof IInfo]}`)
      .join('\n')} \n
      ${EIllSoonBeInTouch[(language as ELanguages) ?? 'en']}. \n

      ${EBestRegards[(language as ELanguages) ?? 'en']} \n
      Jenniina
      \n
    `
    const admin = process.env.NODEMAILER_USER
    const subject = `${ECartUpdated[(language as ELanguages) ?? 'en']} ${
      information.name
    }`
    await sendMail(subject, message, admin, link)
    res.status(200).json({
      success: true,
      message: ECartUpdated[(language as ELanguages) ?? 'en'],
    })
  } catch (error) {
    const language = req.params.language
    console.error(error)
    res.status(500).json({
      message: `${EErrorSendingMail[(language as ELanguages) ?? 'en']}, ${
        (error as Error).message
      }`,
    })
  }
}
