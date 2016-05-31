
var restService = 'https://rowlf.crbs.ucsd.edu:1994/api/'; 
$(document).ready(function(){

  // get list of all storage nodes
  var storageServers = []
  $.ajax(
  {
    type: "GET",
    url: restService + 'facts/operatingsystem/Solaris',
    data: "{}",
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    cache: false,
    success: function (storageServersJson) {
     
      for (i = 0; i <storageServersJson.length; i++){
        storageServers.push(storageServersJson[i].certname); 
      }
                                            
    },
    error: function (msg) {
      alert(msg.responseText);
                                        }
  });

  if(storageServers.length > 0){

    var query = 'query=["or"'; 
    query += $.map(storageServers, function(serverName, index){
        return ',["=", "certname", "'+serverName+'"]'; 
      }).join() + ']'; 
    
    var encodedQuery = encodeURI(query); 
    $.ajax(
    {
      type: "GET",
      url: restService + 'factsets?'+encodedQuery,
      data: "{}",
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      cache: false,
      success: function (storageData) {
      
        $('#storage').append('<tbody>'); 
        $('#storage').append(
          $.map(storageData, function(group, index){
            return '<tr><td>'+group.facts.fqdn+'</td></tr>'; 
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
