const express = require('express');
const BroadlinkJS = require('broadlinkjs-rm');
const fs = require('fs');
const app = express();
const port = 3000;

// Mapeamento de comandos para códigos IR/RF
const commandMap = {
    power: '26008e03949414361436143614121412131214121412143614361436141114121412141114121412141114121436141214361436141214361436143614111436141214121436140005e9959414361436143614121312141214111412143614361436141214121411141214121411141214121436141114361436141214361436143614121436141214111436140005ea949414361436143614121412141114121412143614361436141213121412141114121412141213121436141214361436141214361436143614111436141214121436140005ea949414361436143614121312141214121313133614371336141214121411141214121412131214121436141114361436141313361436143614121436141213121436140005ea959413371337133713121412141213121412143614361436141213121412141213131312141214111436141214361436141214361436143614121337131214121436140005ea949414361436143614121312141214111412143614361436141214121312141214121411141214121337131214361436141214361436143614121436141213121436140005ea949414361436143614121411141214121313133713371337131214121411141214121412131214121436141114361436141313361436143614121436141213121436140005ea949414361436143614121411141214121313133614361436141214121411141214121412131214121436141114361436141214361436143614121436141214111436140005ea949414361436143614121411141214121313133713371337131214121411141214121412131214121436141114361436141214361436143614121436141213121436140005ea949414361436143614121411141214121412143614361436141114121412131214121412141114121436141213361436141313371337133714111436141214111436140005ea959314361436143614121412141114121412143614361436141114121412141114121412141114121436141214361436141214361436143614111436141214121436140005e9959314371337133713121412141114121412143614361436141213121412141114121412141213121436141214361436141214361436143614111436141214121436140005e995931436143614361412141214111412141214361436143614121312141214111412141214121312143614121436143614121436143614361411143614121412133713000d0500000000000000000000', // Substitua pelo código hexadecimal real
    volume_up: '26007602939512381238123912131115111411151115113812391139111412151014121511151138121411151114111512131215101610141238123812381238123813381138120005ec929711391238113911151115101511141314113911381337121510151213121412131238121511151014131411141016111511151039123811391238123812381238120005ec93951238133713371215111510151115101611381238123911141115111411151115113911151114111511151114111413131314103a103a11381139123911381239110005ec92961337133713381115111510141215111511381238123811161015111511140f171139111511151015111512141015111512141039123812381337123812381239110005ed919712381139113911151114111610151115113813371238121411151115111510151238111511151114111511151015121411141239113911381238123812391237110005ed929612391139113911151214111411141215113911381238121510141313111512151039121313141114111511151015111511151138133712381338113813371238120005ec93961139113911391114131410151115111511381238123911151015111412141115113912131313121411151114101611141215113911381238113a113812391138120005ec929612391139123811151115101511151115123712391138121510151115111411151139111511151015111511151015121410161139113812381239113911381238120005ec92971139113a103a1115101511151015111511381338113911151114111511141117103811151115111510151115111510161114113911391237123812391237123911000d050000', // Substitua pelo código hexadecimal real
    volume_down: '26008e03949414361436143614121412131214121412143614361436141114121412141114121412141114121436141214361436141214361436143614111436141214121436140005e9959414361436143614121312141214111412143614361436141214121411141214121411141214121436141114361436141214361436143614121436141214111436140005ea949414361436143614121412141114121412143614361436141213121412141114121412141213121436141214361436141214361436143614111436141214121436140005ea949414361436143614121312141214121313133614371336141214121411141214121412131214121436141114361436141313361436143614121436141213121436140005ea959413371337133713121412141213121412143614361436141213121412141213131312141214111436141214361436141214361436143614121337131214121436140005ea949414361436143614121312141214111412143614361436141214121312141214121411141214121337131214361436141214361436143614121436141213121436140005ea949414361436143614121411141214121313133713371337131214121411141214121412131214121436141114361436141313361436143614121436141213121436140005ea949414361436143614121411141214121313133614361436141214121411141214121412131214121436141114361436141214361436143614121436141214111436140005ea949414361436143614121411141214121313133713371337131214121411141214121412131214121436141114361436141214361436143614121436141213121436140005ea949414361436143614121411141214121412143614361436141114121412131214121412141114121436141213361436141313371337133714111436141214111436140005ea959314361436143614121412141114121412143614361436141114121412141114121412141114121436141214361436141214361436143614111436141214121436140005e9959314371337133713121412141114121412143614361436141213121412141114121412141213121436141214361436141214361436143614111436141214121436140005e995931436143614361412141214111412141214361436143614121312141214111412141214121312143614121436143614121436143614361411143614121412133713000d0500000000000000000000' // Substitua pelo código hexadecimal real
};

app.get('/sendCommand', (req, res) => {
    const command = req.query.command;
    const commandHex = commandMap[command];
    
    if (!commandHex) {
        res.status(400).send('Comando inválido.');
        return;
    }

    const broadlink = new BroadlinkJS();
    let responseSent = false;

    broadlink.on('deviceReady', (device) => {
        console.log(`Dispositivo encontrado: ${device.host.address}, Tipo: ${device.type}`);

        if (device.type === 'RM2' || device.type === 'RM4' || device.type === 10039) {
            console.log('Enviando comando IR/RF...');
            const data = Buffer.from(commandHex, 'hex');
            device.sendData(data);
            console.log('Comando enviado.');

            if (!responseSent) {
                res.send('Comando enviado com sucesso.');
                responseSent = true;
            }
        } else {
            console.log(`Tipo de dispositivo não suportado para envio de comandos IR/RF. Tipo encontrado: ${device.type}`);
            
            if (!responseSent) {
                res.send('Tipo de dispositivo não suportado.');
                responseSent = true;
            }
        }
    });

    console.log('Iniciando descoberta de dispositivos Broadlink...');
    broadlink.discover();

    setTimeout(() => {
        if (!responseSent) {
            console.log('Se nenhum dispositivo foi encontrado até agora, pode haver um problema com a descoberta de dispositivos.');
            res.send('Nenhum dispositivo encontrado.');
            responseSent = true;
        }
    }, 20000);  // Aumentar o tempo de espera para 20 segundos
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});