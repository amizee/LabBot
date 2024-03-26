import { SlashCommandBuilder } from 'discord.js'

const pollCommand = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a poll'),
  async execute (interaction) {
    
  }
}

export default pollCommand
