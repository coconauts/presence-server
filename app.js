//dependencies
var express = require("express"),
    app = express(),
    fs = require("fs"),
    http = require('http');
    
    
    

    
//config
var config = require('./config.json');

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  fs.readFile('./index.html',function (err, data){
        res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
        res.write(data);
        res.end(); 
    });
}); 

app.get('/yun', function(req, res){
  var pin = req.query.p;
      
      arduino(pin, function(json){ res.json(json)});
       
}); 


var arduino = function(pin, callback){
    var startTime = Date.now(),
        path = encodeURI("/data/get/D"+pin),
        uri = 'arduinoyuntwo.local', //only needed for logs
        data = "",
        options = {
            host: uri,
            port: 80,
            path: path,
            agent : false
        };
        
        console.log("Yun request: " +uri+path);
    http.get(options, function(resp){
        resp.on('data', function(chunk){
            data += chunk;
        });
        resp.on('end', function(){
            console.log("Request "+uri+" ended in "+(Date.now() - startTime )+" ms" );
            var json = JSON.parse(data);   
            console.log(json);
            callback(json);
        });
    }).on("error", function(e){
        console.log("Request "+uri+" returned an error: "+e);

        callback({
          status:"error",
          msg: "Request "+uri+" returned an error: "+e,
          time:  (Date.now() - startTime )
        });
    });   
};

app.listen(config.port);
console.log("Server started in http://localhost:"+config.port);