const { SlashCommandBuilder } = require("discord.js");
const googleApiConnection = require('../googleapi/googleApiConnection.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("inkpontos")
        .setDescription("Exibe a pontuação atual dos sócios."),

        async execute(interaction)
        {
            try
            {
                let respostaMap = await googleApiConnection.recuperarPontuacaoGeral();
    
                let respostaTexto = "Pontuações: \n";

                respostaMap.forEach((valor, chave) => {
                    respostaTexto += `\n ${chave}: ${valor}`;
                });
                
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