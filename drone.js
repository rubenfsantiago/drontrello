const tello_address = '192.168.10.1';
const command_port = 8889;
const dgram = require('dgram');
const command_socket = dgram.createSocket('udp4');

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

let drone = new Tello();
drone.startCLI();

