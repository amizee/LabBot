import { Client, Collection, Events, IntentsBitField } from 'discord.js'
import dotenv from 'dotenv'
import fs from 'fs'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import apiHandler from './api.js'
import minigameHandler from './minigame.js'
import databaseHandler from './data.js'

dotenv.config()

const people = {
  '287695357175922688': 'Brian',
  '393600653328515073': 'Kevin',
  '435674199424499712': 'Jeremy',
  '558581174629302273': 'William',
  '420151663429681153': 'Winson'
}

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent
  ]
})

client.commands = new Collection()

const __dirname = dirname(fileURLToPath(import.meta.url))
const foldersPath = path.join(__dirname, 'commands')
const commandFolders = fs.readdirSync(foldersPath)

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder)
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))
  for (const file of commandFiles) {
    const filePath = new URL(`file://${path.join(commandsPath, file)}`)
    import(filePath).then(module => {
      const command = module.default
      if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command)
      } else {
        console.log(`[WARNING] the command at ${filePath} is missing a required "data or "execute property`)
      }
    })
  }
}

const eventsPath = path.join(__dirname, 'events')
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'))

for (const file of eventFiles) {
  const filePath = new URL(`file://${path.join(eventsPath, file)}`)
  import(filePath).then(module => {
    const event = module.default
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args))
    } else {
      client.on(event.name, (...args) => event.execute(...args))
    }
  })
}

client.on('messageCreate', msg => {
  if (msg.author.bot) return // To avoid infinite loops

  if (msg.content === '!q') {
    minigameHandler.game = null
  } else if (minigameHandler.game != null) {
    minigameHandler.play(msg.content).then(result => msg.channel.send(result))
  } else if (msg.content === 'Hello LabBot') {
    const author = people[msg.author.id]
    msg.channel.send(`Hello ${author}!`)
  } else if (msg.content === '!inspire') {
    apiHandler.getQuote().then(quote => msg.channel.send(quote))
  } else if (msg.content === '!joke') {
    apiHandler.getJoke().then(joke => msg.channel.send(joke))
      .then(sentMessage => sentMessage.react('🤣'))
  } else if (msg.content === '!weather') {
    apiHandler.getWeather().then(weather => msg.channel.send(weather))
  } else if (msg.content === '!guess') {
    minigameHandler.playGuessTheNumber().then(guess => msg.channel.send(guess))
  } else if (msg.content === '!initdb') {
    databaseHandler.initPlayerCollection()
  } else if (msg.content === '!addData') {
    databaseHandler.insertData()
  }
})

process.on('SIGINT', () => {
  console.log('Received SIGINT. Closing bot...')
  databaseHandler.closeClient() // close database client before Ctrl+C in development
  process.exit()
})

client.login(process.env.BOT_TOKEN)
