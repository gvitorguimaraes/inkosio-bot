const { Client, GatewayIntentBits, Events, Collection} = require("discord.js");
const config = require("./config.json");

//
// criar o cliente do bot
const client = new Client
({
    intents: 
    [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessagePolls
    ]
});


//
// ler arquivos da pasta 'commands' e registrar no cliente a lista de comandos
const fs = require("node:fs");
const path = require("node:path");

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

client.commands = new Collection();

for (const file of commandFiles)
{
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ("data" in command && "execute" in command)
    {
        client.commands.set(command.data.name, command);
    }
    else
    {
        console.log(`Erro ao carregar o comando ${filePath}`);
    }
}



//
// login bot
client.once(Events.ClientReady, c => {
    console.log('.:::. Inkosio inicializado com sucesso .:::.')
});

client.login(config.BOT_TOKEN);

//
// listener de interações 
client.on(Events.InteractionCreate, async interaction => 
{
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName)

    if (!command)
    {
        console.error("Comando não reconhecido");
        return;
    }

    try
    {
        await command.execute(interaction);
    }
    catch(error)
    {
        console.error(error)
        await interaction.reply("Erro ao executar o comando, entre em contato com o suporte (biel) :/");
    }
    
});