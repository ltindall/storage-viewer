
function Comparator(a,b){
if (a[1] < b[1]) return -1;
if (a[1] > b[1]) return 1;
return 0;
}
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
            var factKeys = Object.keys(group.facts); 
            //console.log(factKeys); 
            var zfsList = []; 
            var zfsListPretty = []; 
            var zfsListReport = [];
            var poolValues = [];   
	          for( var i = 0; i < factKeys.length; ++i){
              if(factKeys[i].substring(0,9) == "zfs_space"){
                zfsList.push(factKeys[i]);
                zfsListPretty.push(factKeys[i].substring(10)); 
                //TODO: insert logic here to format size (gb, mb, kb) before adding to string 

                var searchString = "zfs_space_"; 
                var poolName = factKeys[i].substring(factKeys[i].indexOf(searchString)+searchString.length); 
                zfsListReport.push(poolName+": "+group.facts[factKeys[i]]+"\n"); 

                poolValues.push(poolName+","+group.facts[factKeys[i]].split(',')); 
              }
	          }
            //console.log("rpool"<"rpool/root"); 
            poolValues.sort(Comparator); 
            poolValues.reverse(); 
	    //console.log(poolValues[0]); 
            //console.log("pool values : "+poolValues);

 
            zfsListReport.sort();
            zfsListReport.reverse(); 
            var totalSpace = zfsListReport[0].substring(zfsListReport[0].indexOf(":")+2).split(',')[1];
            var usedSpace = 0;  
            console.log("totalSpace ="+totalSpace); 
	/*
            for( var i = 0; i < zfsListReport.length; ++i){
              
            }
	*/

	    /*
              TODO: 
              Grep the zfs report for filesystems without a slash in the name. These will be the different datapools. 
              The used + available from that first line should sum to the total for that datapool. There shouldn't be 
              a need to go through and sum all the used values since its a tree. 
            */ 

            zfsListFormatted = ""; 
            for(var i = 0; i < zfsListReport.length; ++i) {
              var zfsName = zfsListReport[i].substring(0,zfsListReport[i].indexOf(":")); 
              var zfsLine = zfsListReport[i].substring(zfsListReport[i].indexOf(":")+2).split(','); 
              usedSpace += Number(zfsLine[0]);
              var zfsLineFormatted = "";  
              for(var j = 0; j < zfsLine.length; ++j){
                zfsLineFormatted += zfsLine[j]/1000 + " G"; 
                if(j != zfsLine.length-1){
                  zfsLineFormatted += ", "; 
                }
              }
              zfsListFormatted += zfsName+": "+zfsLineFormatted+"\n"; 
            } 
            console.log("used space = "+usedSpace); 
	    //console.log("zfslistformatted "+ zfsListFormatted);
            //console.log("zfslistreport "+zfsListReport);
		  
	    return '<tr><td>' + group.facts.fqdn + '</td><td>'
              + group.facts.operatingsystem + '</td><td>'
              + group.facts.operatingsystemrelease + '</td><td>'
              + group.facts.kernelversion + '</td><td>'
              + group.facts.last_run + '</td><td>'
              + group.facts.ipaddress + '</td><td>'
              + group.facts.productname + '</td><td>'
              + group.facts.serialnumber + '</td><td>'
              +'<div class="progress"><div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100" style="width:'+100*(usedSpace/totalSpace) +'%"><span class="sr-only">45% Complete</span></div></div>'+ '<pre>'+"used space: "+usedSpace/1000+" G  total space: "+totalSpace/1000+" G\n"+zfsListFormatted + '</pre></td>'
               
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
