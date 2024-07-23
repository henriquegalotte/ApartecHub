const BroadlinkJS = require('broadlinkjs-rm');
const broadlink = new BroadlinkJS();

broadlink.on('deviceReady', (device) => {
    console.log(`Dispositivo encontrado: ${device.host.address}, Tipo: ${device.type}`);

    // Adicionando suporte explícito para o tipo 10039 (RM Mini 3)
    if (device.type === 'RM2' || device.type === 'RM4' || device.type === 10039) {
        console.log('Dispositivo pronto para aprender comandos.');
        
        device.enterLearning();
        
        setTimeout(() => {
            console.log('Verificando dados aprendidos...');
            device.checkData();
        }, 10000); // Aumente o tempo de espera para 10 segundos

        device.on('rawData', (data) => {
            console.log('Código IR/RF capturado:', data.toString('hex'));
            process.exit(); // Encerra o script após capturar os dados
        });
    } else {
        console.log(`Tipo de dispositivo não suportado para aprendizado de comandos IR/RF. Tipo encontrado: ${device.type}`);
    }
});

console.log('Iniciando descoberta de dispositivos Broadlink...');
broadlink.discover();

setTimeout(() => {
    console.log('Se nenhum dispositivo foi encontrado até agora, pode haver um problema com a descoberta de dispositivos.');
}, 20000);  // Aumentar o tempo de espera para 20 segundos
