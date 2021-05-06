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
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(`
        <html lang="en">
        <head>
            <title>Document</title>
            <style>
            .box{
                width: 500px;
                height: 300px;
                background-color: rgb(241, 240, 241);
                display: flex;
            }
            .box1{
                background-color: rgb(238, 30, 193);
                flex: 1;
                width: 100px;
            }
            .box2{
                background-color: rgb(55, 197, 185);
                order: 2;
                width: 100px;
            }
            .box3{
                background-color: rgb(54, 226, 19);
                width: 100px;
            }
            .box4{
                background-color: rgb(211, 24, 24);
                order: 1;
                width: 100px;
            }
        
            </style>
        </head>
        <body>
            <div class="box">
                <div class="box1"></div>
                <div class="box2"></div>
                <div class="box3"></div>
                <div class="box4"></div>
            </div>
        </body>
        </html>`)
    })
})

server.listen(port, () => {
    console.log(`服务器运行在 http://${hostname}:${port}/`)
})