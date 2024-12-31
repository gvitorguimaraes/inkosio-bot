const { SlashCommandBuilder } = require("discord.js");
const googleApiConnection = require('../googleapi/googleApiConnection.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("inkping")
        .setDescription("Responde com 'Pong!'"),

        async execute(interaction)
        {
            try
            {
                await interaction.reply('Pong!');
            }
            catch (error)
            {
                console.error(error);
            }
        }
}