const { SlashCommandBuilder, PollLayoutType} = require("discord.js");
const googleApiConnection = require('../googleapi/googleApiConnection.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("inkvotacao")
        .setDescription("Inicia uma nova votação")
        .addIntegerOption( option => option.setName('socio').setDescription('Número do sócio').setRequired(true) )
        .addNumberOption( option => option.setName('pontos').setDescription('Quantidade de pontos (+ ou -)').setRequired(true) )
        .addStringOption( option => option.setName('motivo').setDescription('Motivo da votação').setRequired(true) ),

        async execute(interaction)
        {
            try
            {
                // receber junto com o comando os parâmetros
                
                // : idSocio = numero que representa o sócio
                const idSocio = interaction.options.getInteger('socio');
                let socio;
                try
                {
                    socio = await googleApiConnection.recuperarSocioPorId(idSocio);
                }
                catch (error)
                {
                    await interaction.reply("O ID de sócio informado não existe!");
                    
                }

                // : pontuação
                const pontos = interaction.options.getNumber('pontos');

                // : motivo da votação
                const motivo = interaction.options.getString('motivo');

                let descricao = `Sócios ${socio} | Pontos: ${pontos} | Motivo: ${motivo}`;

                const existeVotacaoNaoEncerrada = await googleApiConnection.verificarVotacaoExistente();
                if (!existeVotacaoNaoEncerrada)
                {              
                    await interaction.reply("Votação criada!");
                    
                    const pollMessage = await interaction.channel.send
                    ({
                        poll:
                        {
                            question: {text: descricao},
                            answers: 
                            [
                                { text : 'Sim', emoji: '✅'},
                                { text : 'Não', emoji: '❌'},
                            ],
                            allowMultiselect: false,
                            duration: 1,
                            layoutType: PollLayoutType.Default
                        }
                     });

                    //
                    // salvar votação criada no log de votacoes;
                    // - pollId : id
                    // - encerrada : true/false
                    // - motivo : motivo
                    // - pontos: pontuação
                    // - aprovada: true/false
                    const mapaVotacao = new Map();
                    mapaVotacao.set('pollId', pollMessage.id);
                    mapaVotacao.set('encerrada', false);
                    mapaVotacao.set('motivo', motivo);
                    mapaVotacao.set('pontos', pontos);
                    mapaVotacao.set('aprovada', false);
                    mapaVotacao.set('socio', socio);
                    mapaVotacao.set('socioId', idSocio)

                    await googleApiConnection.iniciarVotacao(mapaVotacao);
                }
                else
                {
                    await interaction.reply("Já existe uma votação em andamento! Encerre a votação anterior (/finalizar-votacao) para criar uma nova.");
                }
            }
            catch (error)
            {
                await interaction.followUp("Erro ao criar a votação!");
                console.error("Erro ao tratar a resposta")
                console.error(error);
            }
        }
}