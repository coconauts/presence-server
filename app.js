//dependencies
var express = require("express"),
    app = express(),
    fs = require("fs"),
    sqlite3 = require("sqlite3").verbose(),
    bodyParser = require('body-parser'),
    http = require('http');
    
    
//config
var config = require('./config.json'),
    database = config.db,
    db = new sqlite3.Database("/tmp/presence.sql");
//     utils = require('./utils.js');

db.serialize(function() {
  //var exists = path.existsSync(database); //if you are using an old node version, you should replace fs.existsSync with path.existsSync
  var exists = fs.existsSync(database);
  if(!exists) {
      db.run("CREATE TABLE IF NOT EXISTS people (id TEXT, yun_addr TEXT, present INTEGER, yun_pin INTEGER, last_seen INTEGER, last_away INTEGER);")
  }
});

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
    res.json({id: peson_id, present: null,last_seen: null, last_away: null});
});

app.get('/add_person', function(req, res){
    var person_id = req.query.name;
    var yun_addr = req.query.yun;
    var yun_pin = req.query.pin;
    console.log("Saving person " + person_id);
    db.run("INSERT INTO people (id, yun_addr, yun_pin) VALUES (?,?,?)",
           [person_id, yun_addr, yun_pin]);
    res.json({id: person_id, present: null,last_seen: null, last_away: null});
});

app.get('/status', function(req, res){
    db.all('SELECT * FROM people', [], function(err, result){
        if (err) console.err('Error reading people '+err);
        res.json({status: result, 
                    count: 0 ,
                    time: 0});
    });
});


var arduino = function(uri, pin, callback){
    var startTime = Date.now(),
        path = encodeURI("/data/get/"+pin),
        data = "",
        options = {
            host: uri,
            port: 80,
            path: path,
            agent : false
        };
        
        console.log("Yun request: " +uri+path);
    http.get(options, function( resp){
        resp.on('data', function(chunk){
            data += chunk;
        });
        resp.on('end', function(){
            try {
                console.log("Request "+uri+" ended in "+(Date.now() - startTime )+" ms" );
                console.log("Data " + data);
                var json = JSON.parse(data);   
                console.log(json);
                callback(json);
            } catch(err) {
                console.log("Unable to parse json " + data);
            }
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

var updatePresence = function(pin, callback){
    db.all('SELECT * FROM people', [], function(err, result){
        if (err) console.err('Error reading people '+err);
        else for (var i= 0 ; i < result.length; i++){
            var person = result[i];
            
            arduino(person.yun_addr, person.yun_pin, function(json){
                 console.log(json);
                var present = json.value == "1";
                var time = new Date().getTime()   ;
                var updateTime = "";
                if (present)  updateTime = "last_seen";
                else updateTime = "last_away"; 
                    
                console.log("Person " + person.id + " present: " + present);
                db.run("UPDATE people SET present = ?, "+updateTime+" = ? WHERE id = ?",[present, time, person.id]);
            });
        }
    });
}

updatePresence();
setInterval(function(){ updatePresence() } , 10000);
app.listen(config.port);
console.log("Server started in http://localhost:"+config.port);