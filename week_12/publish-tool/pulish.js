const http = require('http');
const https = require('https')
const archiver = require('archiver');
const child_process = require('child_process');

const querystring = require('querystring');

//  1.打开https://github.com/login/oauth/authorize
child_process.exec(`start https://github.com/login/oauth/authorize?client_id=Iv1.da55fe852f182fdb`);

// 3. 创建server, 接受token, 点击发布
http.createServer(function (req, res) {
    let query = querystring.parse(req.url.match(/^\/\?([\s\S]+)$/)[1]);
    console.log(query)
    publish(query.token);
}).listen(8001)


function publish(token) {
    let request = http.request({
        hostname: "localhost",
        // port: 8882,
        port: 8000,
        method: 'POST',
        path: '/publish?token=' + token,
        headers: {
            "content-type": "application/octet-stream"
        }
    }, response => {
        console.log(response);
    });

    const archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
    });

    archive.directory('./package/', false);

    archive.finalize();
    archive.pipe(request);
}
