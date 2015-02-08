$( document ).ready(function() {

	console.log("Load JS");
	getStatus();

	
});

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
	var divTemplate = "<div class='presence "+person.present+"'>"+
		"<p>"+person.id+"</p>"+
		"<p>"+person.last_seen+"</p>"+
		"<p>"+person.last_away+"</p>"+
	"</div>";

	$("#main").append(divTemplate);
}


 setTimeout(function(){ getStatus() }, 5000);