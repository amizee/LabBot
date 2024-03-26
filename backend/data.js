import dotenv from 'dotenv'
import mongoose, { trusted } from 'mongoose'

dotenv.config()
const { Schema } = mongoose
const uri = `mongodb+srv://Scientists:${process.env.MONGO_PWD}@cluster0.qivnnso.mongodb.net/results?retryWrites=true&w=majority`
mongoose.connect(uri)

class DatabaseHandler {
  static playerSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    gamesPlayed: {
      type: Number,
      default: 0
    },
    gamesWon: {
      type: Number,
      default: 0
    },
    winRate: {
      type: Number,
      default: 0
    }
  })

  static outingSchema = new mongoose.Schema({
    people: {
      type: [String],
      required: true
    },
    placesWent: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      min: '2024-01-20'
    },
    games: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Game'
      }
    ]
  })

  static gameSchema = new mongoose.Schema({
    game: {
      type: String,
      required: true
    },
    players: {
      type: [String],
      required: true
    },
    winners: {
      type: [String],
      required: true
    }
  })

  constructor () {
    this.Player = mongoose.model('Player', DatabaseHandler.playerSchema)
    this.Outing = mongoose.model('Outing', DatabaseHandler.outingSchema)
    this.Game = mongoose.model('Game', DatabaseHandler.gameSchema)
  }
}

// const game1 = await Game.create({
//     game: "pool",
//     result: [result, result2]
// });
// const game2 = await Game.create({
//     game: "cards",
//     result: [result, result2]
// });

// const results = await Game.find({}).
//     populate('result').
//     exec();

// const outing1 = await Outing.findOne({}).
//     populate('games').
//     exec();
// console.log(outing1.games[0].result);

const databaseHandler = new DatabaseHandler()

// const outing = await databaseHandler.Outing.create({
//   people: ["Kevin", "William"],
//   placesWent: "We went to some places",
//   date: "2024-01-23",
//   games: ["65af3ed19862e629edfba09e", "65af3ed19862e629edfba0a3"],
// });

// const player = await databaseHandler.Player.create({
//   name: "amizee"
// })
// console.log(player);

export default databaseHandler
