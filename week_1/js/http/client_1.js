const net = require('net')
const parser = require('../../../week_2/js/parser.js') 

class Request {
    constructor(options) {
        this.method = options.method || 'GET'
        this.host = options.host
        this.path = options.path || '/'
        this.port = options.port || 80
        this.headers = options.headers || {}
        this.body = options.body || {}
        if (!this.headers['Content-Type']) {
            this.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        }

        if (this.headers['Content-type'] === 'application/json') {
            this.bodyText = JSON.stringify(this.body)
        }
        else if (this.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
            this.bodyText = Object.keys(this.body).map(v => `${v}=${encodeURIComponent(this.body[v])}`).join('&')
        }
        else {
            this.bodyText = ''
        }
        this.headers['Content-Length'] = this.bodyText.length
    }
    send(connection) {
        return new Promise((resovle, reject) => {
            let parser = new responseParser;
            if (connection) connection.write(this.toString())
            else {
                connection = net.createConnection({
                    host: this.host,
                    port: this.port
                }, res => {
                    // console.log(connection)
                    connection.write(this.toString())
                })
            }
            connection.on('data', data => {
                // console.log('1:'+data)
                parser.receive(data.toString())
                if (parser.isFinshed) {
                    resovle(parser.response)
                    connection.end()
                }
            })
            connection.on('error', err => {
                console.log('err:' + err)
                connection.end()
            })

        })
    }
    toString() {
        return `${this.method} ${this.path} HTTP/1.1\r\n${Object.keys(this.headers).map(v => `${v}:${this.headers[v]}`).join('\r\n')}\r\n\r\n${this.bodyText}`
    }
}

class responseParser {
    constructor() {
        this.STATUS = 0
        this.STATUS_END = 1
        this.HEADERS_KEY = 2
        this.HEADERS_SPACE = 3
        this.HEADERS_VALUE = 4
        this.HEADERS_LINE_END = 5
        this.HEADERS_BLOCK_END = 6
        this.BODY = 7

        this.current = this.STATUS
        this.statusLine = ''
        this.headers = {}
        this.headers_name = ''
        this.headers_value = ''
        this.body_parser = null

    }
    get isFinshed() {
        return this.body_parser && this.body_parser.isFinshed
    }
    get response() {
        this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/)
        return {
            statusCode: RegExp.$1,
            statusText: RegExp.$2,
            hearders: this.headers,
            body: this.body_parser.content.join('')
        }
    }
    receive(str) {
        for (let i = 0; i < str.length; i++) {
            this.receiveChar(str.charAt(i))
        }
    }
    //换行符就是另起一新行，光标在新行的开头； /n
    //回车符就是光标回到一旧行的开头；(即光标目前所在的行为旧行) /r
    receiveChar(char) {
        if (this.current === this.STATUS) {
            if (char === '\r') this.current = this.STATUS_END
            else this.statusLine += char
        } else if (this.current === this.STATUS_END) {
            if (char === '\n') this.current = this.HEADERS_KEY
        } else if (this.current === this.HEADERS_KEY) {
            if (char === ':') this.current = this.HEADERS_SPACE
            else if (char === '\r') {
                this.current = this.HEADERS_BLOCK_END
                if (this.headers['Transfer-Encoding'] === 'chunked') {
                    this.body_parser = new TrunckedBodyParser()
                }
            }
            else this.headers_name += char
        } else if (this.current === this.HEADERS_SPACE) {
            if (char === ' ') this.current = this.HEADERS_VALUE
            else this.headers_value += char
        } else if (this.current === this.HEADERS_SPACE) {
            if (char === ' ') this.current = this.HEADERS_VALUE
        } else if (this.current === this.HEADERS_VALUE) {
            if (char === '\r') {
                this.current = this.HEADERS_LINE_END
                this.headers[this.headers_name] = this.headers_value
                this.headers_name = ''
                this.headers_value = ''
            }
            else this.headers_value += char
        } else if (this.current === this.HEADERS_LINE_END) {
            if (char === '\n') this.current = this.HEADERS_KEY
        } else if (this.current === this.HEADERS_BLOCK_END) {
            if (char === '\n') this.current = this.BODY
        } else if (this.current === this.BODY) {
            this.body_parser.receiveChar(char)
        }
    }
}

class TrunckedBodyParser {
    constructor() {
        this.CHAR_LEN = 0
        this.CHAR_LEN_LINE_END = 1
        this.READING_CHUNK = 2
        this.CHAR_NEW = 3
        this.CHAR_NEW_LINE_END = 4
        this.length = 0
        this.content = []
        this.isFinshed = false
        this.current = this.CHAR_LEN
    }
    receiveChar(char) {
        if (this.current === this.CHAR_LEN) {
            if (char === '\r') {
                if (this.length === 0) {
                    this.isFinshed = true
                }
                this.current = this.CHAR_LEN_LINE_END
            } else {
                // 十六进制，高位先进
                this.length *= 16
                this.length += parseInt(char, 16)
            }
        } else if (this.current === this.CHAR_LEN_LINE_END) {
            if (char === '\n') {
                this.current = this.READING_CHUNK
            }
        } else if (this.current === this.READING_CHUNK) {
            if(this.isFinshed === true){
                return false
            } else{
                this.content.push(char)
                this.length--
                if (this.length === 0) {
                    this.current = this.CHAR_NEW
                }
            }
        } else if (this.current === this.CHAR_NEW) {
            if (char === '\r') {
                this.current = this.CHAR_NEW_LINE_END
            }
        } else if (this.current === this.CHAR_NEW_LINE_END) {
            if (char === '\n') {
                this.current = this.CHAR_LEN
            }
        }
    }
}

void async function () {
    const req = new Request({
        host: '127.0.0.1',
        path: '/',
        method: 'POST',
        port: 3333,
        headers: {
            ["X-Foo2"]: 'customed'
        },
        body: {
            a: 'aaa',
            c: 'cc',
            d: 'dd',
        }
    })
    let res = await req.send()
    let dom = parser.parseHTML(res.body)
}()

