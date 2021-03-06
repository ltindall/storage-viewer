
function Comparator(a,b){
if (a[1] < b[1]) return -1;
if (a[1] > b[1]) return 1;
return 0;
}

var storageGroups = []; 
var maxSpaceMB = 0; 
function loadIndividual(host){ 

  document.getElementById("individualHost").style.display = "initial"; 
  document.getElementById("storage").style.display = "none"; 
  

  var indHost = '<table class="table table-hover" id="indHostTable"><thead><tr><th>Fact</th><th>Value</th></tr></thead><tbody>'; 
  var foundHost = false; 
  for( i = 0; i < storageGroups.length; ++i ){
    if(storageGroups[i].certname === host && foundHost == false){
      foundHost = true;   
      var factKeys = Object.keys(storageGroups[i].facts);
      factKeys.sort(); 
      console.log(factKeys);  
      console.log(factKeys[0]); 
      for( j = 0; j < factKeys.length; ++j){
        indHost += "<tr><td>"+factKeys[j]+"</td><td>"+storageGroups[i].facts[factKeys[j]] + "</td></tr>"; 
      }
      indHost += "</tbody></table>" ; 


    }
  }

  document.getElementById("individualHost").innerHTML = '<h1>'+host+'</h1>'; 
  document.getElementById("individualHost").innerHTML += '<button class="btn btn-primary" type="button" onclick="viewAll()" href="#"> View All </button>'; 
  document.getElementById("individualHost").innerHTML += indHost; 
  console.log(storageGroups);     
}    

function viewAll(){

  document.getElementById("storage").style.display = "initial"; 
  document.getElementById("individualHost").style.display = "none"; 
}


$(document).ready(function(){

  var startTime = Date.now(); 
  var restService = 'https://rowlf.crbs.ucsd.edu:1994/api/'; 

  /*
  // GET LIST OF ALL STORAGE NODES
  // use facts-environment = solaris since it will take the environment from 
  // the last received fact set, this should fix problems that occur when old
  // nodes have been left behind
  var storageServers = []
  startFirstQuery = Date.now(); 
  $.ajax(
  {
    async: false,  
    type: "GET",
    url: restService + "nodes?"+ encodeURI('query=["=", "facts-environment", "solaris"]'),     
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function (storageServersJson) {
      endFirstQuery = Date.now(); 
      for (var i = 0; i <storageServersJson.length; i++){
        storageServers.push(storageServersJson[i].certname); 
      }
                                            
    },
    error: function (msg) {
      alert(msg.responseText);
                                        }
  });
  */

  /*
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
  */
    //var encodedQuery = encodeURI(query); 
    var encodedQuery = encodeURI('query=["=", "environment", "solaris"]'); 
    startSecondQuery = Date.now(); 
    $.ajax(
    {
      async: false, 
      type: "GET",
      //url: restService + 'environments/solaris/facts',
      //url: restService + 'factsets/environment/solaris', 
      url: restService + 'factsets?'+encodedQuery,
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function (storageData) {
     
	    console.log(storageData); 
	    endSecondQuery = Date.now(); 
        startProcessing = Date.now();  
        // if Factsets query returned successful 
        $('#storage').append('<tbody>'); 
        $('#storage').append(
          // for each storage node in the returned set 
          $.map(storageData, function(group, index){
            storageGroups.push(group); 
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
                    zfsListFormatted += '</tbody></table></div></div>'; 
                    zfsListFormatted += "<br><br><br>"; 
                  }
                  zfsPoolName = zfsName;
                  newPoolFound = true;  
                  availableSpace = zfsListReport[i].substring(zfsListReport[i].indexOf(":")+2).split(',')[1];
                  usedSpace = zfsListReport[i].substring(zfsListReport[i].indexOf(":")+2).split(',')[0];
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
                  zfsLineFormatted += '<td>'+Math.round(zfsLine[j]/1024 * 100)/100 + " G</td>"; 
                  //zfsLineFormatted += Math.round(zfsLine[j]/1024 * 100)/100 + " G"; 
                  ////zfsLineFormatted += zfsLine[j]/1024 + " G"; 
                  /*
                  if(j != zfsLine.length-1){
                    zfsLineFormatted += ", "; 
                  }
                  */
                }


                
                if(newPoolFound){
                  // progress bar calculations 
                  maxSpaceMB = 100 * 1024 * 1024; 

                  var progressBarWidth = 100*(totalSpace/maxSpaceMB); 
                  /*
                  var usedSpaceBar = 100*(usedSpace/maxSpaceMB); 
                  console.log("used space bar " + usedSpaceBar); 
                  var availableSpaceBar = 100*(totalSpace - usedSpace)/maxSpaceMB; 
                  console.log("available space bar " + availableSpaceBar); 

                  console.log("check if equal "+(100-Math.round(100*(usedSpace/totalSpace))) + " = "+ (Math.round(100*(totalSpace - usedSpace)/totalSpace))); 
                  */
                  zfsListFormatted += '<div class="summaryInfo">Summary for '+zfsPoolName
                    +" -- Used Space: "+Math.round(100*usedSpace/1024)/100 
                    +" G  Total Space: "+Math.round(100*totalSpace/1024)/100
                    +" G  Available Space: "
                    +Math.round(100*((totalSpace/1024) -(usedSpace/1024)))/100+" G </div>"
                    +'<div class="progress" style="width:'+progressBarWidth+'%">'
                    +'<div class="progress-bar progress-bar-danger progress-bar-striped " role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100" style="width:'
                    +Math.round(100*(usedSpace/totalSpace))+'%"><span class="sr-only">'+Math.round(100*(usedSpace/totalSpace))+'% Full</span>'+Math.round(100*(usedSpace/totalSpace))+'% Full </div>'
                    +'<div class="progress-bar progress-bar-info progress-bar-striped" role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100" style="width:'
                    +Number(100-Math.round(100*(usedSpace/totalSpace)))+'%"><span class="sr-only">'+Number(100-Math.round(100*(usedSpace/totalSpace)))+'% Available</span>'+Number(100-Math.round(100*(usedSpace/totalSpace)))+'% Available </div>'
                   
                    
                    +'</div>'
                    +'<button class="btn btn-primary storageCollapse" type="button" data-toggle="collapse" data-target="#collapse_'+group.facts.hostname+'_'+zfsPoolName+'" aria-expanded="false" aria-controls="collapse_'+group.facts.hostname+'_'+zfsPoolName+'">'+zfsPoolName+' -- View More</button>'
                    +'<div class="collapse" id="collapse_'+group.facts.hostname+'_'+zfsPoolName+'"><br><div class="well">' 
                    +'<table><thead><tr><th>name</th><th>used</th><th>available</th><th>reservation</th><th>quota</th></tr></thead>'
                    +'<tbody>'
                    /*
                    +'NAME | USED | AVAILABLE | RESERVATION | QUOTA \n'; 
                    */
                }
                zfsListFormatted += '<tr><td>'+zfsName+'</td>'+zfsLineFormatted+'</tr>'; 	
                if(i == zfsListReport.length-1){
                    zfsListFormatted += '</tbody></table></div></div>'; 
                    zfsListFormatted += "\n\n"; 
		}
                //zfsListFormatted += zfsName+": "+zfsLineFormatted+"\n"; 
              } 
              
              //console.log("used space = "+usedSpace); 
              //console.log("zfslistformatted "+ zfsListFormatted);
              //console.log("zfslistreport "+zfsListReport);
        
              return '<tr><td><a onclick="loadIndividual(\''+group.facts.fqdn+'\')"  href="#">' + group.facts.fqdn + '</a></td><td>'
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
	endProcessing = Date.now(); 
                                              
      },
      error: function (msg) {
        alert(msg.responseText);
                                          }
    });

  /*
  }
  */

  document.getElementById("pageLoadTime").innerHTML = "<pre>Time to load page: "+(Date.now() - startTime)/1000 + " sec \n"
  //  +"Time to finish first query: "+(endFirstQuery - startFirstQuery)/1000 + " sec \n"
    +"Time to finish first query: "+(endSecondQuery - startSecondQuery)/1000 + " sec \n"
    +"Time to process data: "+(endProcessing-startProcessing)/1000 + " sec \n"
    +"Maximum space reference: "+maxSpaceMB/(1024*1024)+" TB \n"
    +"</pre>"; 

  $('.storageCollapse').click(function(){
    $(this).text(function(i,old){
      if(old.indexOf("More") != -1){
        return old.substring(0,old.indexOf("More")) + " Less"; 
      }
      else{
        return old.substring(0,old.indexOf("Less")) + " More"; 
      } 
    }); 
  }); 


}); 
