const tello_address = '192.168.10.1';
const command_port = 8889;
const dgram = require('dgram');
const command_socket = dgram.createSocket('udp4');

const noble = require('@abandonware/noble');

const ACCELEROMETERSERVICE_SERVICE_UUID = 'e95d0753251d470aa062fa1922dfa9a8';
const ACCELEROMETERDATA_CHARACTERISTIC_UUID = 'e95dca4b251d470aa062fa1922dfa9a8';
const ACCELEROMETERPERIOD_CHARACTERISTIC_UUID = 'e95dfb24251d470aa062fa1922dfa9a8';



class Tello{

        constructor(){
                this.initCommandSocket();
        }

        initCommandSocket(){
         command_socket.on('message', (msg, rinfo) => {
                   console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
         });

         command_socket.on('error', (err) => {
                        if (err){
                                console.log(err);
                                command_socket.close();
                        }
         });

         command_socket.bind(command_port);
        }

        sendCommand(message){
         var command = new Buffer.from(message);
         command_socket.send(command,command_port,tello_address, (err, bytes) => {
                if (err)
                console.log(err);
         });
        }

        startCLI(){
                this.sendCommand('command');

                const readline = require('readline');
                const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
                });
               
                let that= this;
                rl.on('line',(line) => {
                 if (line === 'close'){
                        rl.close();
                 }

                 that.sendCommand(line);
                }).on('close', () => {
                        that.command_socket.close();
                        process_exit(0);
                })
        }
}

noble.on('stateChange', (state) => {
  console.log(`State changed: ${state}`);
  if (state === 'poweredOn') {
    noble.startScanning();
  }
});




noble.on('discover', peripheral => {
  console.log(
    `Found device, name: ${peripheral.advertisement.localName}, uuid: ${peripheral.uuid}`
  );

  if (peripheral.uuid === 'eb9ddad7861f') {
    console.log('yes');
    noble.stopScanning();
    peripheral.on('connect', () => console.log('Device connected'));
    peripheral.on('disconnect', () => console.log('Device disconnected'));



    peripheral.connect(error => {
        console.log("ENTRO");
        var serviceUUIDs = [ACCELEROMETERSERVICE_SERVICE_UUID];
        
        peripheral.discoverServices(serviceUUIDs, (error, services) =>{
        console.log(`Found service name: ${services[0].uuid}`); 
        const service =services[0];

        service.discoverCharacteristics(ACCELEROMETERDATA_CHARACTERISTIC_UUID, (error, characteristics)=>{
                const datos=characteristics[0];
                datos.on('data', (data)=>{
                        datos.read((err,readData) =>{
                                const buffer = readData;
                                const x =  buffer.readInt16LE(0);
                                const y = buffer.readInt16LE(2);
                                const z = buffer.readInt16LE(4);
                                console.log(" x: "+x+ " y: "+y+" z:"+z);
                        });
                });
                datos.subscribe(() =>{
                        console.log("SUSCRITO A LA CARACTERISTICA");
                });
        });
    }) //peripheral.connect
  } //peripheral.uuid
}) //noble.on discover



let drone = new Tello();
drone.startCLI();
