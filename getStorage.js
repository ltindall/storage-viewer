$(document).ready(function(){

	$.getJSON("https://rowlf.crbs.ucsd.edu:1994/api/facts/operatingsystem/Solaris",function(storageServersJson){
		console.log(storageServersJson);
	});  

	var storageServers = []; 
	for (i = 0; i <storageServers.length; i++){
		storageServers.push(storageServersJson[i].certname); 
	}

	$('#fetch').html('<h2> Servers with operatingsystem = Solaris</h2>'+storageServers.toString()); 

	/*
	$.getJSON("https://rowlf.crbs.ucsd.edu:1994/api/nodes/apocalypse.crbs.ucsd.edu/facts/", function(json) {
   		console.log(json);
    	$('#fetch').html('<h2>Facts for apocalypse</h2>' + JSON.stringify(json, null, 2) );
 	});
 	*/
}); 
