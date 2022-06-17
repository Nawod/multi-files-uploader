const express = require('express');
const http = require('http');
const path = require('path');;
const app = express();
const port = process.env.port || 4200;
const compression = require('compression')
const options = {
};
app.use(compression());
app.use(express.static(__dirname + '/dist/multi-files-uploader'));
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/multi-files-uploader/index.html'));
});
const server = http.createServer(app);
// server.listen(port, () => console.log('Running'));

http.createServer(options, app).listen(4200);
