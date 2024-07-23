const BroadlinkJS = require('broadlinkjs-rm');
const fs = require('fs');
const broadlink = new BroadlinkJS();

async function sendCommand(command) {
    try {
        const response = await fetch(`http://localhost:3000/sendCommand?command=${command}`);
        const result = await response.text();
        alert(result);
    } catch (error) {
        
    }   
    
}

broadlink.on('deviceReady', (device) => {
    console.log(`Dispositivo encontrado: ${device.host.address}, Tipo: ${device.type}`);

    if (device.type === 'RM2' || device.type === 'RM4' || device.type === 10039) {
        console.log('Dispositivo pronto para aprender comandos.');
        
        device.enterLearning();
        
        setTimeout(() => {
            console.log('Verificando dados aprendidos...');
            device.checkData();
        }, 10000);

        device.on('rawData', (data) => {
            const hexCode = data.toString('hex');
            console.log('Código IR/RF capturado:', hexCode);

            // Salvar o código em um arquivo JSON
            const codes = {
                command: hexCode
            };

            fs.writeFileSync('codes.json', JSON.stringify(codes, null, 2));
            console.log('Código salvo em codes.json');
            process.exit();
        });
    } else {
        console.log(`Tipo de dispositivo não suportado para aprendizado de comandos IR/RF. Tipo encontrado: ${device.type}`);
    }
});

console.log('Iniciando descoberta de dispositivos Broadlink...');
broadlink.discover();

setTimeout(() => {
    console.log('Se nenhum dispositivo foi encontrado até agora, pode haver um problema com a descoberta de dispositivos.');
}, 20000);
