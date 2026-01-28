import { Request, Response } from "express"
import { Memory } from "../../models/memory"
import { EError, ELanguages } from "../../types"
import { sendMail } from "../email"

enum EHighScoreAddedSuccessfully {
  en = "High score added successfully",
  es = "Puntuación alta añadida con éxito",
  fr = "Score élevé ajouté avec succès",
  de = "Highscore erfolgreich hinzugefügt",
  pt = "Pontuação alta adicionada com sucesso",
  cs = "High score úspěšně přidán",
  fi = "Tulos lisätty onnistuneesti",
}
enum EErrorAddingHighScore {
  en = "Error adding high score",
  es = "Error al agregar puntuación alta",
  fr = "Erreur lors de l'ajout du score élevé",
  de = "Fehler beim Hinzufügen des Highscores",
  pt = "Erro ao adicionar pontuação alta",
  cs = "Chyba při přidávání vysokého skóre",
  fi = "Virhe tuloksen lisäämisessä",
}

enum EErrorRetrievingHighScores {
  en = "Error retrieving high scores",
  es = "Error al recuperar las puntuaciones más altas",
  fr = "Erreur lors de la récupération des scores élevés",
  de = "Fehler beim Abrufen der Highscores",
  pt = "Erro ao recuperar pontuações altas",
  cs = "Chyba při získávání vysokých skóre",
  fi = "Virhe pisteiden noutamisessa",
}
enum EHighScoreNotFound {
  en = "High score not found",
  es = "Puntuación alta no encontrada",
  fr = "Score élevé non trouvé",
  de = "Highscore nicht gefunden",
  pt = "Pontuação alta não encontrada",
  cs = "Vysoké skóre nebylo nalezeno",
  fi = "Tulosta ei löytynyt",
}
enum EHighScoreDeletedSuccessfully {
  en = "High score deleted successfully",
  es = "Puntuación alta eliminada con éxito",
  fr = "Score élevé supprimé avec succès",
  de = "Highscore erfolgreich gelöscht",
  pt = "Pontuação alta excluída com sucesso",
  cs = "Vysoké skóre bylo úspěšně smazáno",
  fi = "Tulos poistettu onnistuneesti",
}
enum EErrorDeletingHighScore {
  en = "Error deleting high score",
  es = "Error al eliminar la puntuación alta",
  fr = "Erreur lors de la suppression du score élevé",
  de = "Fehler beim Löschen des Highscores",
  pt = "Erro ao excluir pontuação alta",
  cs = "Chyba při mazání vysokého skóre",
  fi = "Virhe tuloksen poistamisessa",
}
enum EHighScoreUpdatedSuccessfully {
  en = "High score updated successfully",
  es = "Puntuación alta actualizada con éxito",
  fr = "Score élevé mis à jour avec succès",
  de = "Highscore erfolgreich aktualisiert",
  pt = "Pontuação alta atualizada com sucesso",
  cs = "Vysoké skóre úspěšně aktualizováno",
  fi = "Tulos päivitetty onnistuneesti",
}
enum EErrorUpdatingHighScore {
  en = "Error updating high score",
  es = "Error al actualizar la puntuación alta",
  fr = "Erreur lors de la mise à jour du score élevé",
  de = "Fehler beim Aktualisieren des Highscores",
  pt = "Erro ao atualizar pontuação alta",
  cs = "Chyba při aktualizaci vysokého skóre",
  fi = "Virhe tuloksen päivittämisessä",
}

enum EPlayerNameUpdatedSuccessfully {
  en = "Player name updated successfully in all games",
  es = "Nombre de jugador actualizado con éxito en todos los juegos",
  fr = "Nom du joueur mis à jour avec succès dans tous les jeux",
  de = "Spielername erfolgreich in allen Spielen aktualisiert",
  pt = "Nome do jogador atualizado com sucesso em todos os jogos",
  cs = "Jméno hráče úspěšně aktualizováno ve všech hrách",
  fi = "Pelaajan nimi päivitetty onnistuneesti kaikissa peleissä",
}

enum EErrorUpdatingPlayerName {
  en = "Error updating player name",
  es = "Error al actualizar el nombre del jugador",
  fr = "Erreur lors de la mise à jour du nom du joueur",
  de = "Fehler beim Aktualisieren des Spielernamens",
  pt = "Erro ao atualizar o nome do jogador",
  cs = "Chyba při aktualizaci jména hráče",
  fi = "Virhe pelaajan nimen päivittämisessä",
}
enum EHighScoreDoesntQualifyForTopFive {
  en = "High score doesn't qualify for top five",
  es = "La puntuación alta no califica para los cinco primeros",
  fr = "Le score élevé ne se qualifie pas pour les cinq premiers",
  de = "Highscore qualifiziert sich nicht für die Top Fünf",
  pt = "Pontuação alta não se qualifica para os cinco primeiros",
  cs = "Vysoké skóre se nekvalifikuje do první pětky",
  fi = "Tulos ei kelpaa viiden parhaan joukkoon",
}
export const cleanUpHighScores = async (req: Request, res: Response) => {
  try {
    const { levelKey, language } = req.params as {
      levelKey: string
      language: ELanguages
    }

    // Find all high scores for the given level
    const highScores = await Memory.find({ levelKey }).sort({
      time: 1,
      createdAt: 1,
    })

    const singlePlayerScores = highScores.filter(
      (score) => score.players.length === 1
    )
    const twoPlayerScores = highScores.filter(
      (score) => score.players.length === 2
    )

    const getScoresToKeepAndDelete = (scores: typeof highScores) => {
      return {
        keep: scores.slice(0, 5),
        delete: scores.slice(5),
      }
    }

    const singlePlayer = getScoresToKeepAndDelete(singlePlayerScores)
    const twoPlayer = getScoresToKeepAndDelete(twoPlayerScores)

    const scoresToDelete = [...singlePlayer.delete, ...twoPlayer.delete]

    const deletePromises = scoresToDelete.map((score) =>
      Memory.findByIdAndDelete(score._id)
    )
    await Promise.all(deletePromises)

    console.log("Cleaning OK")
  } catch (error) {
    console.log("Cleaning error", error)
    const language = req.params.language as ELanguages
    res.status(500).json({
      success: false,
      message: EError[language],
      error: (error as Error).message,
    })
  }
}

export const getAllHighScores = async (req: Request, res: Response) => {
  try {
    const highScores = await Memory.find()
    res.status(200).json(highScores)
  } catch (error) {
    const language = req.params.language as ELanguages
    res.status(500).json({
      success: false,
      message: EErrorRetrievingHighScores[language],
      error: (error as Error).message,
    })
  }
}
export const getHighScoresByLevel = async (req: Request, res: Response) => {
  try {
    const { levelKey } = req.params
    const highScores = await Memory.find({ levelKey })
    res.status(200).json(highScores)
  } catch (error) {
    const language = req.params.language as ELanguages
    res.status(500).json({
      success: false,
      message: EErrorRetrievingHighScores[language],
      error: (error as Error).message,
    })
  }
}
export const addHighScore = async (req: Request, res: Response) => {
  try {
    const language = req.params.language as ELanguages
    const { levelKey, time, size, type, players } = req.body
    const currentHighScores = await Memory.find({ levelKey }).sort({
      time: 1,
      createdAt: 1,
    })

    const isSinglePlayer = players.length === 1
    const categoryScores = isSinglePlayer
      ? currentHighScores.filter((score) => score.players.length === 1)
      : currentHighScores.filter((score) => score.players.length === 2)

    if (categoryScores.length < 5 || time < categoryScores[4].time) {
      const newHighScore = new Memory({
        levelKey,
        time,
        size,
        type,
        players,
      })
      const savedHighScore = await newHighScore.save()

      await cleanUpHighScores(req, res)

      // Send notification email about the new high score to check for possible profanity
      await sendMail(
        `Memory Game New High Score Added - Level: ${levelKey}`,
        `A new high score has been added.\n\nLevel Key: ${levelKey}\nTime: ${time}\nSize: ${size}\nType: ${type}\nPlayers: ${players
          .map((p: { name: string; score: number }) => `${p.name} (${p.score})`)
          .join(", ")}`,
        process.env.NODEMAILER_USER || "",
        "https://react.jenniina.fi/portfolio/memory"
      )

      res.status(201).json({
        success: true,
        message: EHighScoreAddedSuccessfully[language],
        highScore: savedHighScore,
      })
    } else {
      res.status(200).json({
        success: false,
        message: EHighScoreDoesntQualifyForTopFive[language],
      })
    }
  } catch (error) {
    const language = req.params.language as ELanguages
    res.status(500).json({
      success: false,
      message: EErrorAddingHighScore[language],
      error: (error as Error).message,
    })
  }
}
export const deleteHighScore = async (req: Request, res: Response) => {
  try {
    const { id, language } = req.params
    const deletedHighScore = await Memory.findByIdAndDelete(id)
    if (!deletedHighScore) {
      return res.status(404).json({
        success: false,
        message: EHighScoreNotFound[language as ELanguages],
      })
    }
    res.status(200).json({
      success: true,
      message: EHighScoreDeletedSuccessfully[language as ELanguages],
    })
  } catch (error) {
    const language = req.params.language as ELanguages
    res.status(500).json({
      success: false,
      message: EErrorDeletingHighScore[language],
      error: (error as Error).message,
    })
  }
}

export const updateHighScore = async (req: Request, res: Response) => {
  try {
    const { id, language } = req.params
    const { levelKey, time, size, type, players } = req.body
    const updatedHighScore = await Memory.findByIdAndUpdate(
      id,
      { levelKey, time, size, type, players, updatedAt: new Date() },
      { new: true }
    )
    if (!updatedHighScore) {
      return res.status(404).json({
        success: false,
        message: EHighScoreNotFound[language as ELanguages],
      })
    }
    res.status(200).json({
      success: true,
      message: EHighScoreUpdatedSuccessfully[language as ELanguages],
      highScore: updatedHighScore,
    })
  } catch (error) {
    const language = req.params.language as ELanguages
    res.status(500).json({
      success: false,
      message: EErrorUpdatingHighScore[language],
      error: (error as Error).message,
    })
  }
}

export const deleteHighScoresByPlayerName = async (
  req: Request,
  res: Response
) => {
  try {
    const { playerName, language } = req.params
    const highScores = await Memory.find({ "players.name": playerName })
    if (highScores.length === 0) {
      return res.status(404).json({
        success: false,
        message: EHighScoreNotFound[language as ELanguages],
      })
    }
    await Memory.deleteMany({ "players.name": playerName })
    res.status(200).json({
      success: true,
      message: EHighScoreDeletedSuccessfully[language as ELanguages],
    })
  } catch (error) {
    const language = req.params.language as ELanguages
    res.status(500).json({
      success: false,
      message: EErrorDeletingHighScore[language],
      error: (error as Error).message,
    })
  }
}
export const changePlayerName = async (req: Request, res: Response) => {
  try {
    const { language } = req.params as { language: ELanguages }
    const { oldName, newName } = req.body

    if (!oldName || !newName) {
      return res.status(400).json({
        success: false,
        message: "oldName and newName are required in the request body",
      })
    }

    // Update all players with the oldName to the newName
    const updateResult = await Memory.updateMany(
      { "players.name": oldName },
      { $set: { "players.$[elem].name": newName } },
      { arrayFilters: [{ "elem.name": oldName }] }
    )

    if (updateResult.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        message: EHighScoreNotFound[language],
      })
    }

    res.status(200).json({
      success: true,
      message: EPlayerNameUpdatedSuccessfully[language],
      modifiedCount: updateResult.modifiedCount,
    })
  } catch (error) {
    console.error("Error updating player name:", error)
    const language = req.params.language as ELanguages
    res.status(500).json({
      success: false,
      message: EErrorUpdatingPlayerName[language],
      error: (error as Error).message,
    })
  }
}
