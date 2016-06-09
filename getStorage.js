
function Comparator(a,b){
if (a[1] < b[1]) return -1;
if (a[1] > b[1]) return 1;
return 0;
}
$(document).ready(function(){

  var restService = 'https://rowlf.crbs.ucsd.edu:1994/api/'; 

  // GET LIST OF ALL STORAGE NODES
  // use facts-environment = solaris since it will take the environment from 
  // the last received fact set, this should fix problems that occur when old
  // nodes have been left behind
  var storageServers = []
  $.ajax(
  {
    async: false,  
    type: "GET",
    url: restService + "nodes?"+ encodeURI('query=["=", "facts-environment", "solaris"]'),     
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function (storageServersJson) {
	     
      for (var i = 0; i <storageServersJson.length; i++){
        storageServers.push(storageServersJson[i].certname); 
      }
                                            
    },
    error: function (msg) {
      alert(msg.responseText);
                                        }
  });

  // if storage servers found 
  if(storageServers.length > 0){

    // prepare big query for querying the Factsets endpoint 
    // this will create a big or clause with all of the storage server
    // certnames 
    var query = 'query=["or",'; 
    query += $.map(storageServers, function(serverName, index){
        return '["=", "certname", "'+serverName+'"]'; 
      }).join() + ']'; 
    
    //console.log(query); 
    
    var encodedQuery = encodeURI(query); 
    $.ajax(
    {
      async: false, 
      type: "GET",
      url: restService + 'factsets?'+encodedQuery,
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function (storageData) {
      
        // if Factsets query returned successful 
        $('#storage').append('<tbody>'); 
        $('#storage').append(

          // for each storage node in the returned set 
          $.map(storageData, function(group, index){
	    console.log(group); 
            // json keys for this node 
            var factKeys = Object.keys(group.facts); 
            //console.log(factKeys); 
            
            // zfs file systems array with zfs_space at the front (keeps track
            // of the keys) 
            //var zfsList = [];

            // zfs file systems array (pretty version without zfs_space in
            // front) 
            //var zfsListPretty = []; 

            // array to contain the entire line for each zfs file system
            var zfsListReport = [];


            //var poolValues = [];   


            for( var i = 0; i < factKeys.length; ++i){
              // if the json key contains "zfs_space"
              if(factKeys[i].indexOf("zfs_space") != -1){

                // push to zfs file system array 
                //zfsList.push(factKeys[i]);
                
                var searchString = "zfs_space_"; 
                var zfsName = factKeys[i].substring(factKeys[i].indexOf(searchString)+searchString.length); 
                // push to zfs file system pretty array 
                //zfsListPretty.push(zfsName); 

                // push entire line to zfs report array 
                zfsListReport.push(zfsName+": "+group.facts[factKeys[i]]+"\n"); 

                //poolValues.push(zfsName+","+group.facts[factKeys[i]].split(',')); 
              }
            }


            //console.log("rpool"<"rpool/root"); 
            //poolValues.sort(Comparator); 
            //poolValues.reverse(); 
	          //console.log(poolValues[0]); 
            //console.log("pool values : "+poolValues);

            // if the zfs report is not empty 
            if(zfsListReport.length > 0){
   
              // sort the zfs report 
              zfsListReport.sort();

              // revserse the order 
              zfsListReport.reverse();

              // TODO: need to find total space from each pool not just the first
              // one 
              /*
              var availableSpace =  zfsListReport[0].substring(zfsListReport[0].indexOf(":")+2).split(',')[1];
              var usedSpace = zfsListReport[0].substring(zfsListReport[0].indexOf(":")+2).split(',')[0];
              var totalSpace = Number(usedSpace) + Number(availableSpace);  
              console.log("available = "+availableSpace); 
              console.log("usedSpace = ",usedSpace); 
              console.log("totalSpace ="+totalSpace); 
              */
              /*
                TODO: 
                Grep the zfs report for filesystems without a slash in the name. These will be the different datapools. 
                The used + available from that first line should sum to the total for that datapool. There shouldn't be 
                a need to go through and sum all the used values since its a tree. 
              */ 

              // Take the sorted zfs lines and convert them into a big string to
              // display in html 
              var zfsListFormatted = ""; 
              var zfsPoolName = ""
              var newPoolFound = false; 
              var availableSpace = 0; 
              var usedSpace = 0; 
              var totalSpace = 0; 
              for(var i = 0; i < zfsListReport.length; ++i) {
                // parse zfs file system name from zfs report line 
                var zfsName = zfsListReport[i].substring(0,zfsListReport[i].indexOf(":")); 
                
                //var tempZfsPoolName = zfsName.substring(0,zfsName.indexOf(":")); 

                if(zfsName.indexOf("/") == -1){
                  if(zfsPoolName.length != 0){
                    zfsListFormatted += "\n\n"; 
                  }
                  zfsPoolName = zfsName;
                  newPoolFound = true;  
                  availableSpace = zfsListReport[i].substring(zfsListReport[i].indexOf(":")+2).split(',')[1];
                  usedSpace = zfsListReport[0].substring(zfsListReport[0].indexOf(":")+2).split(',')[0];
                  totalSpace = Number(usedSpace) + Number(availableSpace);  

                }
                else{
                  newPoolFound = false; 
                } 

                // parse the rest of the line into an array 
                var zfsLine = zfsListReport[i].substring(zfsListReport[i].indexOf(":")+2).split(','); 
                
                //usedSpace += Number(zfsLine[0]);

                var zfsLineFormatted = "";  
                for(var j = 0; j < zfsLine.length; ++j){
                  zfsLineFormatted += Math.round(zfsLine[j]/1024 * 100)/100 + " G"; 
                  //zfsLineFormatted += zfsLine[j]/1024 + " G"; 
                  if(j != zfsLine.length-1){
                    zfsLineFormatted += ", "; 
                  }
                }

                if(newPoolFound){
                  zfsListFormatted += "Summary for "+zfsPoolName+"-- Used Space: "+usedSpace/1024+" G  Total Space: "+totalSpace/1024+" G  Available Space: "+Number((totalSpace/1024) - (usedSpace/1024))+" G \n"+'<div class="progress"><div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100" style="width:'+100*(usedSpace/totalSpace) +'%"><span class="sr-only">'+100*(usedSpace/totalSpace)+'% Full</span>'+Math.round(100*(usedSpace/totalSpace))+'% Full </div></div>'; 
                }
                zfsListFormatted += zfsName+": "+zfsLineFormatted+"\n"; 
              } 
              //console.log("used space = "+usedSpace); 
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
                + '<pre>'+zfsListFormatted + '</pre></td>'
                /*
                +'<div class="progress"><div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100" style="width:'+100*(usedSpace/totalSpace) +'%"><span class="sr-only">45% Complete</span></div></div>'+ '<pre>'+"used space: "+usedSpace/1024+" G  total space: "+totalSpace/1024+" G\n"+zfsListFormatted + '</pre></td>'
                 */
                +'</tr>';
            } 
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
