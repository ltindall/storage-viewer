$(document).ready(function(){

	$.getJSON("http://localhost:8080/v3/nodes/apocalypse.crbs.ucsd.edu/facts/", function(json) {
   		console.log(json);
    	$('#fetch').html('<h2>Facts for apocalypse</h2>' + JSON.stringify(json, null, 2) );
 	});
}); 