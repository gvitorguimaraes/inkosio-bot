const {google} = require('googleapis');
const config = require("../config.json");
const fs = require('fs');

class GoogleApiConnection
{
    static async getAuth()
    {
        const auth = new google.auth.GoogleAuth( 
            {
                keyFile: "./secrets.json",
                scopes: ['https://www.googleapis.com/auth/spreadsheets']
            }
        );

        return auth;
    }

    static async getSheetConnection()
    {
        const auth = await GoogleApiConnection.getAuth();

        const client = await auth.getClient();

        const sheets = google.sheets(
            { 
                version: "v4", 
                auth: client 
            }
        );

        return sheets;
    }


    static async recuperarSocioPorId(idSocio)
    {
        const listaSocios = await this.recuperarListaSocios();

        if (listaSocios.length < idSocio)
        {
            throw new Error('O id do sócio informado está errado!');
        }

        return listaSocios[idSocio-1];
    }


    static async recuperarListaSocios()
    {
        const auth = await GoogleApiConnection.getAuth();
        const spreadsheetId = config.SHEET_ID;
        const sheetConnection = await GoogleApiConnection.getSheetConnection();

        const textoCelula = await sheetConnection.spreadsheets.values.get(
            {
                auth,
                spreadsheetId,
                range: "pontuacao-inkosio!C3:Z3"
            }
        )

        const resposta = textoCelula.data.values[0];

        const listaSocios = [];

        for (const item of resposta) {
            if (item.startsWith(':')) {
                listaSocios.push(item.replace(':', ''));
            }
        }

        return listaSocios;
    }

    // recupera um map com o sócio como chave e a pontuação
    static async  recuperarPontuacaoGeral()
    {
        const auth = await GoogleApiConnection.getAuth();
        const spreadsheetId = config.SHEET_ID;
        const sheetConnection = await GoogleApiConnection.getSheetConnection();

        //
        // recuperar socios
        const artefatoRecuperadoSocios = await sheetConnection.spreadsheets.values.get(
            {
                auth,
                spreadsheetId,
                range: "pontuacao-inkosio!C3:Z3"
            }
        )

        //
        // recuperar pontos
        const artefatoRecuperadoPontos = await sheetConnection.spreadsheets.values.get(
            {
                auth,
                spreadsheetId,
                range: "pontuacao-inkosio!C30:Z30"
            }
        )

        //
        // montar map de socios e pontos
        let map = new Map();
        let listaPontos = artefatoRecuperadoPontos.data.values[0];
        let i = 0;

        for (let socio of artefatoRecuperadoSocios.data.values[0]) 
        {
            if (socio.startsWith(':')) 
            {
                map.set(socio.replace(':', ''), listaPontos[i]);
            }
            i++;
        }
        
        return map;
    }


    static async gravarResultadoVotacaoPlanilha(objetoVotacao)
    {
        const auth = await GoogleApiConnection.getAuth();
        const spreadsheetId = config.SHEET_ID;
        const sheetConnection = await GoogleApiConnection.getSheetConnection();

        let range;

        if (objetoVotacao.socioId === 1)
        {
            range = "pontuacao-inkosio!C:D";
        }
        else if (objetoVotacao.socioId === 2)
        {
            range = "pontuacao-inkosio!E:F";
        }
        else if (objetoVotacao.socioId === 3)
        {
            range = "pontuacao-inkosio!G:H";
        }
        else if (objetoVotacao.socioId === 4)
        {
            range = "pontuacao-inkosio!I:J";
        }
        else if (objetoVotacao.socioId === 5)
        {
            range = "pontuacao-inkosio!K:L";
        }
        else if (objetoVotacao.socioId === 6)
        {
            range = "pontuacao-inkosio!M:N";
        }
        else if (objetoVotacao.socioId === 7)
        {
            range = "pontuacao-inkosio!O:P";
        }
        else if (objetoVotacao.socioId === 8)
        {
            range = "pontuacao-inkosio!Q:R";
        }
        else if (objetoVotacao.socioId === 9)
        {
            range = "pontuacao-inkosio!S:T";
        }
        else if (objetoVotacao.socioId === 10)
        {
            range = "pontuacao-inkosio!U:V";
        }
        else if (objetoVotacao.socioId === 11)
        {
            range = "pontuacao-inkosio!W:X";
        }

        await sheetConnection.spreadsheets.values.append(
            {
                auth,
                spreadsheetId,
                range: range,
                valueInputOption: "USER_ENTERED",
                resource: 
                {
                    values: [[objetoVotacao.pontos, objetoVotacao.motivo]],
                },
            }
        );
    }


    static async teste()
    {
        const auth = await GoogleApiConnection.getAuth();
        const spreadsheetId = config.SHEET_ID;
        const sheetConnection = await GoogleApiConnection.getSheetConnection();

        const textoCelula = await sheetConnection.spreadsheets.values.get(
            {
                auth,
                spreadsheetId,
                range: "pontuacao-inkosio!A:A"
            }
        )

        return textoCelula.data;
    }





    //
    // Métodos Utilitários
    //



    static async verificarVotacaoExistente()
    {
        const arquivo = './storage/log-votacoes.json';

        // Verifica se o arquivo existe e se está vazio
        if (!fs.existsSync(arquivo) || fs.readFileSync(arquivo, 'utf-8').trim() === '') 
        {
            return false;            
        } 
        else 
        {
            let dados;
            try
            {
                dados = JSON.parse(fs.readFileSync(arquivo, 'utf-8'));
            }
            catch (error)
            {
                console.error('O conteudo do arquivo não é um JSON válido');
            }

            const possuiNaoEncerrada = Array.isArray(dados) 
                ? dados.some(obj => obj.encerrada === false) 
                : dados.encerrada === false;

            return possuiNaoEncerrada;
        }
    }


    //
    // registrar no JSON a nova votacao.
    static async iniciarVotacao(mapVotacao)
    {
        const filePath = './storage/log-votacoes.json';

        // registrar a hora
        const dataAtual = new Date();

        // Formatando a data para o fuso horário "America/Sao_Paulo"
        const formatador = new Intl.DateTimeFormat('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            dateStyle: 'full', // ou 'short', 'long', 'medium'
            timeStyle: 'long', // ou 'short', 'medium'
        });

        mapVotacao.set('data', formatador.format(dataAtual));

        const novaVotacaoObj = Object.fromEntries(mapVotacao);

        if (!fs.existsSync(filePath)) {
            // Cria um arquivo JSON inicial com o novo registro
            fs.writeFileSync(filePath, JSON.stringify([novaVotacaoObj], null, 2), 'utf-8');
            console.log('Arquivo criado e registro adicionado.');
            return;
        }

        // Lê o conteúdo do arquivo JSON existente
        const conteudo = fs.readFileSync(filePath, 'utf-8');

        let dadosExistentes;
        try {
            dadosExistentes = JSON.parse(conteudo);
        } catch (error) {
            throw new Error('O arquivo JSON está corrompido ou inválido.');
        }

        // Verifica se os dados existentes são um array
        if (!Array.isArray(dadosExistentes)) {
            throw new Error('O formato do arquivo JSON não é um array.');
        }

        // Adiciona o novo registro aos dados existentes
        dadosExistentes.push(novaVotacaoObj);

        // Salva os dados atualizados de volta ao arquivo JSON
        fs.writeFileSync(filePath, JSON.stringify(dadosExistentes, null, 2), 'utf-8');
        console.log('Registro adicionado ao arquivo JSON.');
    }

    //
    // encerra a votação e salva o resultado da votação na planilha
    static async encerrarVotacao(pollId, aprovada)
    {
        const caminhoArquivo = './storage/log-votacoes.json';
        //
        // atualizar JSON

        // Verifica se o arquivo existe
        if (!fs.existsSync(caminhoArquivo)) {
            throw new Error('Arquivo JSON não encontrado.');
        }
    
        // Lê o conteúdo do arquivo
        const conteudo = fs.readFileSync(caminhoArquivo, 'utf-8');
        
        let dados;
        try {
            // Analisa o conteúdo JSON
            dados = JSON.parse(conteudo);
        } catch (error) {
            throw new Error('O arquivo JSON está corrompido ou inválido.');
        }
    
        // Verifica se os dados são um array
        if (!Array.isArray(dados)) {
            throw new Error('O formato do arquivo JSON não é um array.');
        }
    
        // Localiza o objeto com o pollId especificado
        const objeto = dados.find(item => item.pollId === pollId);
    
        if (!objeto) {
            throw new Error(`Nenhuma votação encontrada com o pollId: ${pollId}`);
        }
    
        // Atualiza o campo 'encerrada' para true
        objeto.encerrada = true;
        objeto.aprovada = aprovada;
    
        // Grava os dados atualizados de volta no arquivo
        fs.writeFileSync(caminhoArquivo, JSON.stringify(dados, null, 2), 'utf-8');

        //
        // registrar na planilha
        if (aprovada)
        {
            await this.gravarResultadoVotacaoPlanilha(objeto);
        }
    }

    static async recuperarObjetoUltimaVotacaoNaoEncerrada()
    {
        const caminhoArquivo = './storage/log-votacoes.json';

        // Verifica se o arquivo existe
        if (!fs.existsSync(caminhoArquivo)) {
            throw new Error('Arquivo JSON não encontrado.');
        }

        // Lê o conteúdo do arquivo
        const conteudo = fs.readFileSync(caminhoArquivo, 'utf-8');
        
        let dados;
        try {
            // Analisa o conteúdo JSON
            dados = JSON.parse(conteudo);
        } catch (error) {
            throw new Error('O arquivo JSON está corrompido ou inválido.');
        }

        // Verifica se os dados são um array
        if (!Array.isArray(dados)) {
            throw new Error('O formato do arquivo JSON não é um array.');
        }

        // Encontra o primeiro objeto com a propriedade 'encerrada' = false
        const objetoNaoEncerrado = dados.find(item => item.encerrada === false);

        // Retorna o objeto ou null se não encontrado
        return objetoNaoEncerrado || null;
    }
}

module.exports = GoogleApiConnection;