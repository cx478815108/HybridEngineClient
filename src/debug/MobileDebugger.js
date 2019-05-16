const fs     = require('fs');
const os     = require('os');
const net    = require('net');

class SocketMessage{
    constructor(){
        this.type  = 1;
        this.title = '';
        this.data  = null;
    }

    fillData(data,length){
        if(data.length < length){
          let r = Buffer.concat([data], data.length);
          const f = Buffer.from('|');
          for(let i = data.length; i < length;i ++){
            r = Buffer.concat([r,f],r.length + 1);
          }
          return r;
        }
        return data;
    }
      
    getBuff(){
        // 数据包 2进制编码 ，前8个字节固定
        // | 内容：总长度 | 内容：包类型 | 内容：标题长度 | 内容：标题 | 内容：数据 |
        const bodyBuff = this.data;
        const n3 = Buffer.from(this.title); // message
        const totalLength = 5 + 1 + 2 + n3.length + bodyBuff.length;
        // 包的总数据长度buff 且不足2字节补充'|'
        const n1 = this.fillData(Buffer.from('' + totalLength) ,5);
        // 标题的长度buff 且不足2字节补充'|'
        const n2 = this.fillData(Buffer.from('' + n3.length) ,2);
        // 数据包类型buff
        const typeBuff = Buffer.from(""+this.type);
        let r = Buffer.concat([n1, typeBuff, n2, n3, bodyBuff],totalLength);
        return r;
    }

    static makeNormalTypeMessage(title, body){
        const msg = new SocketMessage();
        msg.type  = 1;
        msg.title = title || '';
        let json;
        try {
            json = JSON.parse(JSON.stringify(body || {}));
        } catch (error) {
            json = {};
        }
        msg.data = Buffer.from(JSON.stringify(json));
        return msg.getBuff();
    }

    static makeBionaryTypeMessage(title, data){
        const msg = new SocketMessage();
        msg.type  = 0;
        msg.title = title || '';
        msg.data  = data || Buffer.from('0');
        return msg.getBuff();
    }
}

class MobileDebugger{
    constructor(){
        this.mobilePort      = 8012;
        this.address         = '127.0.0.1';
        this.ipAddress       = null;
        this.server          = null;
        this.config          = {};
    }

    getIPAdress(){
        if (!this.ipAddress) {
            const interfaces = os.networkInterfaces();
            for (let devName in interfaces) {
                const iface = interfaces[devName];
                for (let i = 0; i < iface.length; i++) {
                    let alias = iface[i];
                    if (alias.family === 'IPv4' &&
                        alias.address !== '127.0.0.1' &&
                        !alias.internal) {
                        this.ipAddress = alias.address;
                        return this.ipAddress;
                    }
                }
            }
        }
        return this.ipAddress;
    }

    handleMobileMessage(buffData){
        try {
            const data = JSON.parse(buffData.toString());
            if(data.identify === 'iOS'){
                if(typeof this.config.onConnected === 'function'){
                    this.config.onConnected();
                }
            }
        } catch (error) {}
    }

    startServer(config){
        this.config = config || {};

        if(!this.getIPAdress() && typeof this.config.onStart === 'function'){
            return this.config.onError('未发现IP，可能未连接到WiFi');
        }

        const self = this;
        const server = net.createServer(function(socket){
            self.mobileSocket = socket;
      
            //接收到数据
            socket.on('data',function(data){
                self.handleMobileMessage(data);
            });
        
            //数据错误事件
            socket.on('error',function(exception){
                socket.end();
                if(typeof self.config.onError === 'function'){
                    self.config.onError(exception);
                }
            });
          
            //客户端关闭事件
            socket.on('close',function(data){
                if(typeof self.config.onClose === 'function'){
                    self.config.onClose();
                }
            });
        });

        server.listen(this.mobilePort, self.getIPAdress(), function(){
            if(typeof self.config.onStart === 'function'){
                self.config.onStart(self.getIPAdress());
            }
        });

        // 服务器错误事件
        server.on("error",function(exception){
            server.close();
            if(typeof self.config.onError === 'function'){
                self.config.onError(exception);
            }
        });

        this.server = server;
    }

    closeServer(){
        this.ipAddress = null;
        if(this.server){
            this.server.close();
        }
    }

    transportMessage(){
        if(!this.mobileSocket) return ;
        // const msg = SocketMessage.makeNormalTypeMessage('这是标题', {
        //     code: 123,
        //     parameters:{
        //         name:'cx'
        //     }
        // });
        // this.mobileSocket.write(msg);
        const path = '/Users/feelings/FrontEnd/Token小程序/helloworld/production/production.zip';
        this.transportFile(path, (msg)=>{
            console.log(msg);
        });
    }

    transportFile(transportPath, process){
        if(!this.mobileSocket) return ;

        if(process){
            process("开始传输文件\n" + transportPath);
        }

        const rs = fs.createReadStream(transportPath, {highWaterMark: 65528});
        const self = this;

        rs.on('data', function (chunk) {
            const message = SocketMessage.makeBionaryTypeMessage('data', chunk);
            self.mobileSocket.write(message);
        });
    
        rs.on('end', function (chunk) {
            self.mobileSocket.write(SocketMessage.makeNormalTypeMessage('传输结果',{
                code:1,
                msg:"传输完成"
            }));
            if(process){
                process("传送完毕\n");
            }
        });
    
        // 监听错误
        rs.on('error', function (err) {
            self.mobileSocket.write(SocketMessage.makeNormalTypeMessage('传输结果',{
                code:0,
                msg:"文件加载错误"
            }));
            if(process){
                process("传送发生错误");
            }
        });
    }

    static sharedDebugger(){
        if(!this._sharedDebugger){
            this._sharedDebugger = new MobileDebugger();
        }
        return this._sharedDebugger;
    }
}

export default MobileDebugger.sharedDebugger();