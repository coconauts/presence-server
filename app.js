//dependencies
var express = require("express"),
    app = express(),
    fs = require("fs"),
    sqlite3 = require("sqlite3").verbose(),
    http = require('http');
    
    
//config
var config = require('./config.json'),
    database = config.db,
    db = new sqlite3.Database("/tmp/presence.sql");
//     utils = require('./utils.js');

// db.serialize(function() {
//   //var exists = path.existsSync(database); //if you are using an old node version, you should replace fs.existsSync with path.existsSync
//   var exists = fs.existsSync(database);
//   if(!exists) {
//       db.run("CREATE TABLE people (id TEXT, yun_addr TEXT, last_seen INTEGER, last_away INTEGER);")
//   }
// });

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

app.get('/presence/:person', function(req, res){
    var person_id = req.param('person');
    res.json({id: peson_id, name: 'bla', present: null,last_seen: null, last_away: null});
});

app.get('/status', function(req, res){
    res.json({status: [
        {id: 'bla', name: 'Bla', present: null,last_seen: null, last_away: null},
        {id: 'foo', name: 'Foo', present: null, last_seen: null, last_away: null}
    ], 
    count: 0 ,
    time: 0}
    );
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
/*
var updatePresence = function(pin, callback){
    db.all('SELECT * FROM people', [], function(err, result){
        if (err) console.err('Error reading people '+err);
        else arduino(url, pin, function(json){
            //db.run("UPDATE stats SET "+tag+" = 0 WHERE name = ? and platform = ?)
        });
    });
}*/

app.listen(config.port);
console.log("Server started in http://localhost:"+config.port);