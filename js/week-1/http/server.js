const http = require('http')
const port = 3333
const hostname = '127.0.0.1'

const server = http.createServer((req, res) => {
    let body = []
    req.on('error', (err) => {
        console.log(err)
    }).on('data', (data) => {
        body.push(data)
    }).on('end', () => {
        // const buffer = new ArrayBuffer(8);
        // console.log(buffer)
        // console.log(body[0])
        // console.log(body[0] instanceof Buffer)
        body = Buffer.concat(body).toString()  //Buffer.concat(list) => list <Buffer[]> | <Uint8Array[]> 要合并的 Buffer 数组或 Uint8Array 数组。
        console.log('body:' + body)
        res.writeHead(200, {'Content-Type': 'text/html'})
        res.end('HHHH')
    })
})

server.listen(port, () => {
    console.log(`服务器运行在 http://${hostname}:${port}/`)
})