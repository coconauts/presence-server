var DAY =  60*60*24,
    HOUR = 60*60,
    MINUTE = 60;


$( document ).ready(function() {

	console.log("Load JS");
	getStatus();

	
});

setInterval(function(){getStatus()},5000);

var getStatus = function(){

	console.log("Getting status");
	$.ajax({
		url: '/status',
		success: function(json){
			$("#main").empty();
			for (var i=0; i < json.status.length; i++){
				var person= json.status[i];
				drawDesk(person);
			}
		}

	});
}

var drawDesk = function(person){
    var now = new Date().getTime();
console.log("now " +  now + " last seen " + person.last_seen ) 

	var divTemplate = "<div class='presence status"+person.present+"'>"+
		"<p>"+person.id+"</p>"+
		"<p>Last seen: "+timeAgo((now - person.last_seen)/1000)+"</p>"+
		"<p>Last away: "+timeAgo((now - person.last_away)/1000)+"</p>"+
	"</div>";

        
   
	$("#main").append(divTemplate);
}


var timeAgo = function(diff){

  if (diff > 16400) return "never";
  if (diff > DAY) return round(diff / DAY,2) + " days";
  if (diff > HOUR ) return round(diff / HOUR,2) + " hours";
  if (diff > MINUTE ) return round(diff / MINUTE,2) + " minutes";
  else return diff + " seconds";
}
var round = function(value,dec){
  return Math.round(value*10*dec)/(10*dec);
}
 setTimeout(function(){ getStatus() }, 1000);