import { ApplicationCommandType, SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js'

const modalCommand = {
  data: new SlashCommandBuilder()
    .setName('outing')
    .setDescription('store an outing'),
  async execute (interaction) {
    const modal = new ModalBuilder()
      .setCustomId('outingModal')
      .setTitle('Outing')

    const dateInput = new TextInputBuilder()
      .setCustomId('dateInput')
      .setLabel('Date of outing')
      .setPlaceholder('YYYY-MM-DD')
      .setMaxLength(10)
      .setStyle(TextInputStyle.Short)

    const peopleInput = new TextInputBuilder()
      .setCustomId('peopleInput')
      .setLabel('Who went?')
      .setPlaceholder('Kevin, William, ...')
      .setMaxLength(100)
      .setStyle(TextInputStyle.Short)

    const locationInput = new TextInputBuilder()
      .setCustomId('locationInput')
      .setLabel('Where we went')
      .setMaxLength(1000)
      .setStyle(TextInputStyle.Paragraph)

    // An action row only holds one text input so you need one action row per text input.
    const firstActionRow = new ActionRowBuilder().addComponents(dateInput)
    const secondActionRow = new ActionRowBuilder().addComponents(peopleInput)
    const thirdActionRow = new ActionRowBuilder().addComponents(locationInput)

    // Add inputs to the modal
    modal.addComponents(firstActionRow, secondActionRow, thirdActionRow)

    // Show the modal to the user
    await interaction.showModal(modal)
  }
}

export default modalCommand
