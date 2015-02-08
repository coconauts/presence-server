$("#create_user").click(function() {
		createUser();
	});

var createUser = function(){
	var name = $("#user").val();
	var yun = $("#yun").val();
	var pin = $("#pin").val();

	$.ajax({
		url: '/add_user?name='+name+'&yun='+yun_addr+'&pin='+pin,
		data: data,
		type: post,
	});
}