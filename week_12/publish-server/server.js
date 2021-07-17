const http = require('http')
const https = require('https')
const unzipper = require('unzipper');
const querystring = require('querystring');


//2. auth路由： code , 获取token
function auth(req, res) {
    let query = querystring.parse(req.url.match(/^\/auth\?([\s\S]+)$/)[1]);
    getToken(query.code, function (info) {
        // res.write(JSON.stringify(info))
        res.write(`<a href="http://localhost:8001/?token=${info.access_token}">publish</a>`)
        res.end();
    })
}
function getToken(code, callback) {
    let request = https.request({
        hostname: "github.com",
        path: `/login/oauth/access_token?code=${code}&client_id=Iv1.da55fe852f182fdb&client_secret=a6f0d973d67e88275ba01530bfa3cf52e96e551c`,
        port: '443',
        method: "POST"
    }, function (res) {
        let body = ''
        res.on('data', chunk => {
            body += (chunk.toString())
        })
        res.on('end', chunk => {
            callback(querystring.parse(body))
        })
    });
    request.end();
}

// 4.publish路由：鉴权，接受发布
function publish(req, res) {
    let query = querystring.parse(req.url.match(/^\/publish\?([\s\S]+)$/)[1]);

    getUser(query.token, info => {
        console.log('info')
        console.log(info)
        console.log(info.login === "amihhs")
        if (info.login === "amihhs") {
            req.pipe(unzipper.Extract({ path: '../server/public/' }));
            req.on('end', function () {
                res.end('success!!!')
            })
        }
    })
}

function getUser(token, callback) {
    console.log('token')
    console.log(token)
    let request = https.request({
        hostname: "api.github.com",
        path: `/user`,
        port: '443',
        method: "GET",
        headers: {
            Authorization: `token ${token}`,
            "User-Agent": "hhs-publish"
        }
    }, function (res) {
        let body = ''
        res.on('data', chunk => {
            body += (chunk.toString())
            console.log('body')
            console.log(body)
        })
        res.on('end', chunk => {
            callback(JSON.parse(body))
        })
    });
    request.end();
}

http.createServer(function (req, res) {

    if (req.url.match(/^\/auth\?/))
        return auth(req, res);
    if (req.url.match(/^\/publish\?/)) {
        console.log('req')
        console.log(req)
        return publish(req, res);
    }


    // let outfile = fs.createReadStream("./server/public/index.html")
    // let outfile = fs.createWriteStream("../server/public/package.zip")


}).listen(8000)