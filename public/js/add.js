$("#create_user").click(function() {
		createUser();
	});

var createUser = function(){
	var name = $("#user").val();
	var yun = $("#yun").val();

	var data = {
		person: name,
		yun_addr: yun
	};
	$.ajax({
		url: '/presence/',
		data: data,
		type: post,
	});
}