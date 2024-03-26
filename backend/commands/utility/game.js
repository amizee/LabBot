import { SlashCommandBuilder, ActionRowBuilder, UserSelectMenuBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js'
import databaseHandler from '../../data.js'

const gameCommand = {
  data: new SlashCommandBuilder()
    .setName('game')
    .setDescription('store a game result (the outing should be stored first)')
    .addStringOption(option =>
      option.setName('game')
        .setDescription('game played')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('date')
        .setDescription('YYYY-MM-DD')
        .setRequired(true)),

  async execute (interaction) {
    const userSelectPlay = new UserSelectMenuBuilder()
      .setCustomId('players')
      .setPlaceholder('Select people that played.')
      .setMinValues(1)
      .setMaxValues(10)

    const userSelectWin = new UserSelectMenuBuilder()
      .setCustomId('winners')
      .setPlaceholder('Select people that won.')
      .setMinValues(1)
      .setMaxValues(10)

    const confirm = new ButtonBuilder()
      .setCustomId('confirm')
      .setLabel('Confirm selection')
      .setStyle(ButtonStyle.Success)

    const cancel = new ButtonBuilder()
      .setCustomId('cancel')
      .setLabel('Cancel')
      .setStyle(ButtonStyle.Secondary)

    const row1 = new ActionRowBuilder()
      .addComponents(userSelectPlay)
    const row2 = new ActionRowBuilder()
      .addComponents(userSelectWin)
    const row3 = new ActionRowBuilder()
      .addComponents(confirm, cancel)

    const response = await interaction.reply({
      content: '',
      components: [row1, row2, row3]
    })

    // Collect all interactions with select menus
    const selMenuCollector = response.createMessageComponentCollector({ componentType: ComponentType.UserSelect, time: 30_000 })
    selMenuCollector.on('collect', i => {
      i.reply({ content: 'Selected.', ephemeral: true })
    })

    selMenuCollector.on('end', async collected => {
      if (collected.size == 0) {
        return
      }

      let finalPlayers // the last selection made for both select menus
      let finalWinners
      collected.forEach(function (value, key) {
        if (value.customId === 'players') {
          finalPlayers = value.users
        } else if (value.customId === 'winners') {
          finalWinners = value.users
        }
      })

      const channelId = '1125640748457541632'
      const channel = interaction.client.channels.cache.get(channelId)
      if (!finalPlayers) {
        channel.send('Select at least 1 player.')
        return
      }
      if (!finalWinners) {
        channel.send('Select at least 1 winner.')
        return
      }

      const players = []
      finalPlayers.forEach(function (value, key) {
        players.push(value.username)
      })

      const winners = []
      finalWinners.forEach(function (value, key) {
        winners.push(value.username)
      })

      const gameStr = interaction.options.get('game')
      const game = await databaseHandler.Game.create({
        game: gameStr.value.toLowerCase(),
        players,
        winners
      })

      // Add game to outing
      const objectId = game._id
      const date = new Date(interaction.options.get('date').value)
      const query = { date }
      await databaseHandler.Outing.findOneAndUpdate(query, { $push: { games: objectId } }, { new: true, upsert: false })

      // Update player scores
      for (var i = 0; i < players.length; i++) {
        await databaseHandler.Player.findOneAndUpdate({ name: players[i] }, { $inc: { gamesPlayed: 1 } })
      }

      for (var i = 0; i < winners.length; i++) {
        await databaseHandler.Player.findOneAndUpdate({ name: winners[i] }, { $inc: { gamesWon: 1 } })
      }
    })

    // Collect a confirm/cancel interaction and stop both collectors at this point
    const buttonCollector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 30_000 })
    buttonCollector.on('collect', i => {
      if (i.user.id === interaction.user.id) {
        if (i.customId === 'confirm') {
          i.reply({ content: 'Confirmed.', ephemeral: true })
        } else if (i.customId === 'cancel') {
          i.reply({ content: 'Cancelled.', ephemeral: true })
        }
      } else {
        i.reply({ content: 'This button isn\'t for you :(', ephemeral: true })
      }

      buttonCollector.stop()
    })

    buttonCollector.on('end', (collected, reason) => {
      if (reason === 'time') {
        interaction.editReply({ content: 'Timed out.', components: [] })
      } else {
        interaction.editReply({ content: '.', components: [] })
      }
      selMenuCollector.stop()
    })
  }
}

export default gameCommand
