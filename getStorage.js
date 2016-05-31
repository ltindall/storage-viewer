
$(document).ready(function(){

  var restService = 'https://rowlf.crbs.ucsd.edu:1994/api/'; 
  // get list of all storage nodes
  var storageServers = []
  $.ajax(
  {
    async: false,  
    type: "GET",
    url: restService + 'facts/operatingsystem/Solaris',
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function (storageServersJson) {
	     
      var i ;  
      for (i = 0; i <storageServersJson.length; i++){

        storageServers.push(storageServersJson[i].certname); 

      }
                                            
    },
    error: function (msg) {
      alert(msg.responseText);
                                        }
  });




  if(storageServers.length > 0){

    var query = 'query=["or",'; 
    query += $.map(storageServers, function(serverName, index){
        return '["=", "certname", "'+serverName+'"]'; 
      }).join() + ']'; 
    console.log(query); 
    var encodedQuery = encodeURI(query); 
    $.ajax(
    {
      async: false, 
      type: "GET",
      url: restService + 'factsets?'+encodedQuery,
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function (storageData) {
      
        $('#storage').append('<tbody>'); 
        $('#storage').append(
          $.map(storageData, function(group, index){
            return '<tr><td>' + group.facts.fqdn + '</td><td>'
              + group.facts.operatingsystem + '</td><td>'
              + group.facts.operatingsystemrelease + '</td><td>'
              + group.facts.ipaddress + '</td><td>'
              + group.facts.productname + '</td><td>'
              + group.facts.serialnumber + '</td>' 
              +'</tr>'; 
          }).join()
        ); 
        /*
        var index; 
        for (index = 0; index < storageData.length; ++i){
          $('#storage').append(
            $.map(
        }
        $('#storage').append(
          $.map(data      
        */
        $('#storage').append('</tbody>'); 
                                              
      },
      error: function (msg) {
        alert(msg.responseText);
                                          }
    });

  }

  /*
	$.getJSON("https://rowlf.crbs.ucsd.edu:1994/api/facts/operatingsystem/Solaris",function(storageServersJson){
		console.log(storageServersJson);
	});  

	var storageServers = []; 
	for (i = 0; i <storageServersJson.length; i++){
		storageServers.push(storageServersJson[i].certname); 
	}

	$('#fetch').html('<h2> Servers with operatingsystem = Solaris</h2>'+storageServers.toString()); 
  */

	/*
	$.getJSON("https://rowlf.crbs.ucsd.edu:1994/api/nodes/apocalypse.crbs.ucsd.edu/facts/", function(json) {
   		console.log(json);
    	$('#fetch').html('<h2>Facts for apocalypse</h2>' + JSON.stringify(json, null, 2) );
 	});
 	*/
}); 
