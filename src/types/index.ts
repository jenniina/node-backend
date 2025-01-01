import { Document } from 'mongoose'

export interface IUser extends Document {
  _id?: string
  name: string
  username: string
  password: string
  language: ELanguages
  role: number
  verified?: boolean
  token?: string
  resetToken?: string
  confirmToken?: string
  createdAt?: string
  updatedAt?: string
  blacklistedJokes?: IBlacklistedJoke[]
}

export interface IBlacklistedJoke {
  jokeId: IJoke['jokeId']
  language: ELanguages
  value: string
}

export enum ECategory {
  all = 'All',
  misc = 'Misc',
  programming = 'Programming',
  dark = 'Dark',
  pun = 'Pun',
  spooky = 'Spooky',
  christmas = 'Christmas',
  chucknorris = 'ChuckNorris',
  dadjokes = 'DadJokes',
}
export enum EJokeType {
  single = 'single',
  twopart = 'twopart',
}
export enum ELanguages {
  English = 'en',
  Spanish = 'es',
  French = 'fr',
  German = 'de',
  Portuguese = 'pt',
  Czech = 'cs',
  Suomi = 'fi',
}

export interface IJokeCommonFields {
  _id?: string
  jokeId: string
  type: EJokeType
  category: ECategory
  subCategories: string[]
  language: string
  safe: boolean
  flags: {
    nsfw?: boolean
    religious?: boolean
    political?: boolean
    racist?: boolean
  }
  user: IUser['_id'][]
  private?: boolean
  verified?: boolean
  anonymous?: boolean
  author?: string
  createdAt?: string
  updatedAt?: string
}

export interface IJokeSingle extends IJokeCommonFields {
  type: EJokeType.single
  joke: string
}

export interface IJokeTwoPart extends IJokeCommonFields {
  type: EJokeType.twopart
  setup: string
  delivery: string
}

export type IJoke = IJokeSingle | IJokeTwoPart

export interface ITokenPayload {
  userId: string | undefined
  iat?: number
  exp?: number
}
export interface IToken {
  token: string | undefined
  createdAt: Date
}

export interface ImageHit {
  id: number
  previewURL: string
  webformatURL: string
  largeImageURL: string
  pageURL: string
  tags: string
  user: string
}

export interface ImagesResponse {
  success: boolean
  message: string
  hits: ImageHit[]
}

export enum EQuizType {
  easy = 'easy',
  medium = 'medium',
  hard = 'hard',
}

export interface IQuiz extends Document {
  highscores: {
    easy: number
    medium: number
    hard: number
  }
  user: IUser['_id']
  createdAt?: string
  updatedAt?: string
}
export interface IQuestion extends Document {
  questionId: number
  question: string
  options: string[]
  correctAnswer: boolean
  incorrectAnswers: boolean[]
  createdAt?: string
  updatedAt?: string
}
export interface IQuizQuestion extends Document {
  quiz: IQuiz['_id']
  question: IQuestion['_id']
  createdAt?: string
  updatedAt?: string
}

export type TPriority = 'all' | 'low' | 'medium' | 'high'

export type TCategory = 'all' | 'work' | 'personal' | 'shopping' | 'other'

export type TSortOptions = 'none' | 'text' | 'priority' | 'deadline' | 'category'

export interface ITodo extends Document {
  key: string
  name: string
  order: number
  complete: boolean
  priority?: TPriority
  deadline?: string
  category?: TCategory
  createdAt?: string
  updatedAt?: string
}

export interface ITodos extends Document {
  user: IUser['_id']
  todos: ITodo[]
  createdAt?: string
  updatedAt?: string
}

export enum ELanguage {
  en = 'en',
  es = 'es',
  fr = 'fr',
  de = 'de',
  pt = 'pt',
  cs = 'cs',
  fi = 'fi',
}
export enum EError {
  en = 'An error occurred',
  es = 'Ha ocurrido un error',
  fr = 'Une erreur est survenue',
  de = 'Ein Fehler ist aufgetreten',
  pt = 'Ocorreu um erro',
  cs = 'Došlo k chybě',
  fi = 'Tapahtui virhe',
}

export enum EAnErrorOccurredAddingTheJoke {
  en = 'An error occurred adding the joke',
  es = 'Ha ocurrido un error al agregar la broma',
  fr = "Une erreur s'est produite lors de l'ajout de la blague",
  de = 'Beim Hinzufügen des Witzes ist ein Fehler aufgetreten',
  pt = 'Ocorreu um erro ao adicionar a piada',
  cs = 'Při přidávání vtipu došlo k chybě',
  fi = 'Vitsin lisäämisessä tapahtui virhe',
}
// Email sent to administrator, please wait for approval
export enum EEmailSentToAdministratorPleaseWaitForApproval {
  en = 'Email sent to administrator, please wait for approval',
  es = 'Correo electrónico enviado al administrador, espere la aprobación',
  fr = 'Email envoyé à l administrateur, veuillez attendre l approbation',
  de = 'E-Mail an Administrator gesendet, bitte warten Sie auf Genehmigung',
  pt = 'E-mail enviado ao administrador, aguarde a aprovação',
  cs = 'E-mail odeslán správci, počkejte na schválení',
  fi = 'Sähköposti lähetetty ylläpitäjälle, odota hyväksyntää',
}
export enum EJokeUpdated {
  en = 'Joke updated',
  es = 'Broma actualizada',
  fr = 'Blague mise à jour',
  de = 'Witz aktualisiert',
  pt = 'Piada atualizada',
  cs = 'Vtip aktualizován',
  fi = 'Vitsi päivitetty',
}
// 'User deleted from joke'
export enum EUserDeletedFromJoke {
  en = 'User deleted from joke',
  es = 'Usuario eliminado de la broma',
  fr = 'Utilisateur supprimé de la blague',
  de = 'Benutzer aus Witz gelöscht',
  pt = 'Usuário excluído da piada',
  cs = 'Uživatel smazán z vtipu',
  fi = 'Käyttäjä poistettu vitsistä',
}
export enum EPleaseChooseAnotherName {
  en = 'Please choose another name',
  es = 'Por favor elija otro nombre',
  fr = 'Veuillez choisir un autre nom',
  de = 'Bitte wählen Sie einen anderen Namen',
  pt = 'Por favor, escolha outro nome',
  cs = 'Vyberte prosím jiné jméno',
  fi = 'Pyydän valitsemaan toisen nimen',
}
export enum EThisNameIsNotAvailable {
  en = 'This name is not available',
  es = 'Este nombre no está disponible',
  fr = 'Ce nom n est pas disponible',
  de = 'Dieser Name ist nicht verfügbar',
  pt = 'Este nome não está disponível',
  cs = 'Toto jméno není k dispozici',
  fi = 'Tämä nimimerkki on jo käytössä',
}
export enum EJokeHidden {
  en = 'Joke hidden',
  es = 'Broma oculta',
  fr = 'Blague cachée',
  de = 'Witz versteckt',
  pt = 'Piada escondida',
  cs = 'Vtip skryt',
  fi = 'Vitsi piilotettu',
}
export enum EJokeRestored {
  en = 'Joke restored',
  es = 'Broma restaurada',
  fr = 'Blague restaurée',
  de = 'Witz wiederhergestellt',
  pt = 'Piada restaurada',
  cs = 'Vtip obnoven',
  fi = 'Vitsi palautettu',
}

export enum EPleaseProvideAValidEmailAddressOrLeaveTheFieldEmpty {
  en = 'Please provide a valid email address or leave the field empty.',
  es = 'Proporcione una dirección de correo electrónico válida o deje el campo vacío.',
  fr = 'Veuillez fournir une adresse e-mail valide ou laisser le champ vide.',
  de = 'Bitte geben Sie eine gültige E-Mail-Adresse an oder lassen Sie das Feld leer.',
  pt = 'Forneça um endereço de e-mail válido ou deixe o campo vazio.',
  cs = 'Zadejte platnou e-mailovou adresu nebo pole ponechte prázdné.',
  fi = 'Anna kelvollinen sähköpostiosoite tai jätä kenttä tyhjäksi.',
}
export enum EBlobsSavedSuccessfully {
  en = 'Blobs saved successfully',
  es = 'Blobs guardados con éxito',
  fr = 'Blobs enregistrés avec succès',
  de = 'Blobs erfolgreich gespeichert',
  pt = 'Blobs salvos com sucesso',
  cs = 'Blobs byly úspěšně uloženy',
  fi = 'Mollukat tallennettu onnistuneesti',
}
export enum EErrorSavingData {
  en = 'Error saving data',
  es = 'Error al guardar los datos',
  fr = 'Erreur lors de l enregistrement des données',
  de = 'Fehler beim Speichern der Daten',
  pt = 'Erro ao salvar dados',
  cs = 'Chyba při ukládání dat',
  fi = 'Virhe tallennettaessa tietoja',
}
export enum ECouldNotFindDataWithThisName {
  en = 'Could not find data with this name',
  es = 'No se pudo encontrar datos con este nombre',
  fr = 'Impossible de trouver des données avec ce nom',
  de = 'Daten mit diesem Namen konnten nicht gefunden werden',
  pt = 'Não foi possível encontrar dados com este nome',
  cs = 'Nepodařilo se najít data s tímto názvem',
  fi = 'Tietoja ei löytynyt tällä nimellä',
}

export enum EThisVersionNameAlreadyExists {
  en = 'This version name already exists',
  es = 'Este nombre de versión ya existe',
  fr = 'Ce nom de version existe déjà',
  de = 'Dieser Versionsname existiert bereits',
  pt = 'Este nome de versão já existe',
  cs = 'Tento název verze již existuje',
  fi = 'Tämän niminen teos on jo olemassa',
}
export enum EErrorCapturingScreenshot {
  en = 'Error capturing screenshot',
  es = 'Error al capturar la captura de pantalla',
  fr = "Erreur lors de la capture de l'écran",
  de = 'Fehler beim Erstellen eines Screenshots',
  pt = 'Erro ao capturar a captura de tela',
  cs = 'Chyba při pořizování snímku obrazovky',
  fi = 'Virhe kuvakaappausta otettaessa',
}
