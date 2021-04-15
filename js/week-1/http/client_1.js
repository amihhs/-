const net = require('net')

class Request {
    constructor(options){
        this.method = options.method || 'GET'
        this.host = options.host
        this.path = options.path || '/'
        this.port = options.port || 80
        this.headers = options.headers || {}
        this.body = options.body || {}
        if(!this.headers['Content-Type']){
            this.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        } 

        if(this.headers['Content-type'] === 'application/json'){
            this.bodyText =  JSON.stringify(this.body)
        }  
        else if(this.headers['Content-Type'] === 'application/x-www-form-urlencoded'){
            this.bodyText  = Object.keys(this.body).map(v => `${v}=${encodeURIComponent(this.body[v])}`).join('&')
        }  
        else {
            this.bodyText = ''
        }
        this.headers['Content-Length'] =  this.bodyText.length
    }
    send(connection) {
       return new Promise((resovle, reject) => {
            let parser = new responseParser;
            if(connection) connection.write(this.toString())
            else{
                connection = net.createConnection({
                    host: this.host,
                    port: this.port
                }, res => {
                    // console.log(connection)
                    connection.write(this.toString())
                })
            }
            connection.on('data', data => {
                console.log('1:'+data)
                parser.receive(data.toString())
                if(parser.isFinshed){
                    resovle(parser.response)
                    connection.end()
                }
            })
            connection.on('error', err => {
                console.log('err:'+err)
                connection.end()
            })
            
       })
    }
    toString(){
        return `${this.method} ${this.path} HTTP/1.1\r\n${Object.keys(this.headers).map(v => `${v}:${this.headers[v]}`).join('\r\n')}\r\n\r\n${this.bodyText}`
    }
}

class responseParser {
    constructor(){

    }
    receive(str){
        for(let i = 0; i<str.length; i++){
            this.receiveChar(str.charAt(i))
        }
    }
    receiveChar(char){

    }
}

void async function () {
    const req = new Request({
        host: '127.0.0.1',
        path:'/',
        method:'POST',
        port:3333,
        headers:{
            ["X-Foo2"]: 'customed'
        },
        body:{
            a:'aaa',
            c:'cc',
            d:'dd',
        }
    })
    let res = await req.send()
    console.log(res)
}()

