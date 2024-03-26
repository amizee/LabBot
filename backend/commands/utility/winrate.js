import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'
import databaseHandler from '../../data.js'

const winrateCommand = {
  data: new SlashCommandBuilder()
    .setName('winrate')
    .setDescription("Returns everyone's win rate!"),
  async execute (interaction) {
    const embed = new EmbedBuilder()
	.setColor(0x0099FF)
	.setTitle('Win rate')
	.setAuthor({ name: interaction.user.globalName, iconURL: interaction.user.displayAvatarURL() })
	.setDescription('Overall win rate across all games')
	.setThumbnail(interaction.guild.iconURL())
	.setTimestamp()
	.setFooter({ text: ' ', iconURL: interaction.user.displayAvatarURL() });

    const players = await databaseHandler.Player.find();
    for (var i = 0; i < players.length; i++) {
        let player = players[i];
        let winRate = (player.gamesWon/player.gamesPlayed) * 100;
        winRate = winRate.toFixed(2);

        embed.addFields({ name: player.name, value: winRate + "%" })
    }

    interaction.reply({ embeds: [embed] });
  }
}

export default winrateCommand