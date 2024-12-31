const {REST, Routes} = require("discord.js");
const config = require("./config.json");

//
// ler arquivos da pasta 'commands' e registrar no cliente a lista de comandos
const fs = require("node:fs");
const path = require("node:path");

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

const commands = [];

for (const file of commandFiles)
{
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    commands.push(command.data.toJSON());
}

const rest = new REST({version: "10"}).setToken(config.BOT_TOKEN);

(async () => {
    try
    {
        console.log(`Resetando ${commands.length} comandos...`);

        const data = await rest.put(
            Routes.applicationCommands(config.CLIENT_ID),
            {body: commands}
        )

        console.log("Commandos registrados!");
    }
    catch (error)
    {
        console.error(error);
    }
})();