const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// you can pass the parameter in the command line. e.g. node static_server.js 3000
const port = process.argv[2] || 3000;

http.createServer(function (req, res) {

  const parsedUrl = url.parse(req.url);
  const method = req.method.toLowerCase();
  const pathname = `.${parsedUrl.pathname}/${method}.json`;
  
  fs.exists(pathname, function (exist) {
    if(!exist) {
      res.statusCode = 404;
      res.end(`File ${pathname} not found!`);
      return;
    }
   
    fs.readFile(pathname, function(err, data){
      if(err){
        res.statusCode = 500;
        res.end(`Error getting the file: ${err}.`);
      } else {
        res.setHeader('Content-type', 'application/json' );
        res.end(data);
      }
    });
  });
}).listen(parseInt(port));
