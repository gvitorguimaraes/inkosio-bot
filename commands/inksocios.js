const { SlashCommandBuilder} = require("discord.js");
const googleApiConnection = require('../googleapi/googleApiConnection.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("inksocios")
        .setDescription("Lista o nome de todos os sócios!"),

        async execute(interaction)
        {
            try
            {
                const resposta = await googleApiConnection.recuperarListaSocios();

                const respostaTexto = `Sócios: \n\n` + resposta.map((nome, indice) => `${indice + 1} - ${nome}`).join('\n');
                
                await interaction.reply(respostaTexto);
            }
            catch (error)
            {
                await interaction.reply("Erro ao recuperar os dados!");
                console.error("Erro ao tratar a resposta")
                console.error(error);
            }
        }
}