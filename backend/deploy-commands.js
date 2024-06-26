import { REST, Routes } from 'discord.js'
import dotenv from 'dotenv'
import fs from 'fs'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

dotenv.config()
const commands = []

const __dirname = dirname(fileURLToPath(import.meta.url))
const foldersPath = path.join(__dirname, 'commands')
const commandFolders = fs.readdirSync(foldersPath)

const importPromises = []

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder)
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

  for (const file of commandFiles) {
    const filePath = new URL(`file://${path.join(commandsPath, file)}`)
    const importPromise = import(filePath).then(module => {
      const command = module.default
      if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON())
      } else {
        console.log(`[WARNING] the command at ${filePath} is missing a required "data" or "execute" property`)
      }
    })

    importPromises.push(importPromise)
  }
}

Promise.all(importPromises).then(async () => {
  const rest = new REST().setToken(process.env.BOT_TOKEN)

  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`)

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    )

    console.log(`Successfully reloaded ${data.length} application (/) commands.`)
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error)
  }
})
