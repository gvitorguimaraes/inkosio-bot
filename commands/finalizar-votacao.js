const { SlashCommandBuilder } = require("discord.js");
const googleApiConnection = require('../googleapi/googleApiConnection.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("finalizar-votacao")
        .setDescription("Finaliza a votação e caso seja aprovada, registra o resultado na planilha."),

        async execute(interaction)
        {
            try
            {
                const mensagemVotacaoObj = await googleApiConnection.recuperarObjetoUltimaVotacaoNaoEncerrada();

                if (mensagemVotacaoObj != null)
                {
                    const mensagemVotacao = await interaction.channel.messages.fetch(mensagemVotacaoObj.pollId);

                    mensagemVotacao.poll.end();

                    //
                    // recuperar resultado
                    const resultados = mensagemVotacao.poll.answers
                    const votosSim = resultados.get(1).voteCount;
                    const votosNao = resultados.get(2).voteCount;

                    //
                    // se tiver mais de 3 votos e a quantidade for maior que de votos negativos
                    //if (votosSim > votosNao)
                    if (votosSim >= 3 && votosSim > votosNao)
                    {
                        await googleApiConnection.encerrarVotacao(mensagemVotacaoObj.pollId, true);

                        interaction.reply("Votação foi APROVADA!");
                    }
                    else
                    {
                        await googleApiConnection.encerrarVotacao(mensagemVotacaoObj.pollId, false);

                        interaction.reply("Votação foi NEGADA! (É necessário maioria de votos, sendo necessário no mínimo 3 votos positivos)");
                    }
                }
                else
                {
                    await interaction.reply("Nenhuma votação aberta foi encontrada.");
                }
            }
            catch (error)
            {
                await interaction.reply("Erro ao finalizar a votação, anote o resultado da votação e informe ao ADM (biel) para que seja feita a manutenção.");
                console.error("Erro ao tratar a resposta")
                console.error(error);
            }
        }
}