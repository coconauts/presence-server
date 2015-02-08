$( document ).ready(function() {
    $("#create_user").click(function() {
		createUser();
	});
});

var createUser = function(){
	var name = $("#user").val();
	var yun = $("#yun").val();
	var pin = $("#pin").val();

    console.log("Saving user " + name);
	$.ajax({
		url: '/add_person?name='+name+'&yun='+yun+'&pin='+pin,
	});
}