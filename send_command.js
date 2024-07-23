const BroadlinkJS = require('broadlinkjs-rm');
const fs = require('fs');
const broadlink = new BroadlinkJS();

// Carregar o código IR/RF do arquivo JSON
const codes = JSON.parse(fs.readFileSync('codes.json', 'utf8'));
const commandHex = codes.command;

broadlink.on('deviceReady', (device) => {
    console.log(`Dispositivo encontrado: ${device.host.address}, Tipo: ${device.type}`);

    if (device.type === 'RM2' || device.type === 'RM4' || device.type === 10039) {
        console.log('Enviando comando IR/RF...');
        const data = Buffer.from(commandHex, 'hex');
        device.sendData(data);
        console.log('Comando enviado.');
        process.exit();
    } else {
        console.log(`Tipo de dispositivo não suportado para envio de comandos IR/RF. Tipo encontrado: ${device.type}`);
    }
});

console.log('Iniciando descoberta de dispositivos Broadlink...');
broadlink.discover();

setTimeout(() => {
    console.log('Se nenhum dispositivo foi encontrado até agora, pode haver um problema com a descoberta de dispositivos.');
}, 20000);
