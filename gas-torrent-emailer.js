/*
* onOpen event
*/
function onOpen() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if(ss){
    var menuEntries = [ 
      {name: "Get", functionName: "main"}
    ];
    ss.addMenu("Torrents", menuEntries);
  }
}

/**
 * Do replacements to clean text
 *
 * @param {String} str
 * @return {String}
 */
var replaces = function(str){
  return str.replace(/<[^>]*>/g," ")
            .replace(/[\t\r\n]/g,"")
            .replace(/\[.*\]/g,"")
            .replace(/^\s+|\s+$/g,"")
            .replace(/\./g," ")
         ;
}  

/**
 * Get content between ">" and next closing "tag" (</tag)
 *
 * @param {String} str
 * @param {Boolean} isInitTagClosed
 *        if the split has been for a full tag "<tag>" or init "<tag"        
 * @param {String} tag
 *        tag to search
 * @return {String}
 */
var getTagContent = function(str,isInitTagClosed,tag){
  return str.slice((isInitTagClosed?0:str.indexOf(">")+1),str.indexOf("</"+tag));      
}  

/**
 * Searches for torrent content
 *
 * @param {String} str
 * @param {Array} services
 * @return {Array}
 */
var getData = function(strtorrent, services){
  var torrents = [];
  var dataServices = {
    "eztv" : "eztvData",
    "pb" : "pirateBayData"
  };
  var self = this;

  for(var i=0,z=services.length;i<z;i++){
    if(torrents.length==0 && dataServices[services[i]]){
      torrents = self[dataServices[services[i]]](strtorrent);
    }
  }
  return torrents;
}

/**
 * Http muted request 
 *
 * @param {String} url
 * @param {Object} options
 * @return {String} html
 */
var httpMutedRequest = function(url,options){
  var res=null;
  if(typeof options!=="object"){
    options = {};
  }
  options["muteHttpExceptions"]=true;
  try{
    res = UrlFetchApp.fetch(url,options);
  }catch(e){
    Logger.log("http error " + url);
  } 
  return res;
} 

/**
 * Adapter for eztv.it 
 *
 * @param {String} str
 * @return {Array}
 */
var eztvData = function(strtorrent){
  var response = httpMutedRequest("http://eztv.it/search/",{    
     'payload' : {
        'SearchString1': strtorrent
      },
      'headers' : {
        'contentType' : 'text/html; charset=utf-8',
      },
      'method' : 'post',
  });  
  
  if(response===null) return [];
  
  var data = response.getContentText();
  
  data = data.split("forum_header_border");
  
  if(data.length>0){

    var cols,title,link,aux;
    var oks = [];
    for(var i=7,z=data.length;i<z;i++){
      cols = data[i].split("<td");
      title = replaces(getTagContent(cols[2],false,"td"));
      //title matching
      if(title.toLowerCase().indexOf(strtorrent)>-1){
        //torrent file
        link = ""; 
        torrents = getTagContent(cols[3],false,"td");
        torrents = torrents.split("<a");
        link = [];
        if(torrents.length>=3){
          aux = torrents[3].split("href=\"");
          if(aux.length>1 && aux[1].indexOf("magnet")==-1){
            link.push((aux[1].indexOf("http://")===-1?"http:":"")+aux[1].slice(0,aux[1].indexOf('"')));
          }
        }
        if(title!="" && link.length>0){
          oks.push([title,link]);
        }
      }
    }
    return oks;
  }
}  

/**
 * Get the current DNS for piratebay and set its in Public Cache (if it was shared...) 
 *
 */
var getPirateBayDNS = function(){
  var dns = ["org","sx","se","pe"];
  for(var d=0,r=dns.length;d<r;d++){
    response = httpMutedRequest("http://thepiratebay."+dns[d]);
    if(response!==null){
      CacheService.getPublicCache().put("piratebaydns", "thepiratebay."+dns[d]);
      return;
    }
  }
}

/**
 * Adapter for PirateBay 
 *
 * @param {String} str
 * @return {Array}
 */
var pirateBayData = function(strtorrent){
  var response = null;
  
  if(CacheService.getPublicCache().get("piratebaydns")==="" || CacheService.getPublicCache().get("piratebaydns")===null){
    getPirateBayDNS();
  }
  
  response = httpMutedRequest("http://"+CacheService.getPublicCache().get("piratebaydns")+"/search/"+encodeURIComponent(strtorrent)+"/0/99/0");
  
  if(response===null){//maybe dns problem
    getPirateBayDNS();
    response = httpMutedRequest("http://"+CacheService.getPublicCache().get("piratebaydns")+"/search/"+encodeURIComponent(strtorrent)+"/0/99/0");
  }
  
  if(response===null) return [];

  var data = response.getContentText();
  
  data = data.split("<tr>");
  
  if(data.length>0){
    var cols,title,link,aux,torrents;
    var oks = [];
    
    for(var i=1,z=data.length;i<z;i++){
      cols = data[i].split("<td");
      title = replaces(getTagContent(cols[2],false,"a"));

      //title matching
      if(title.toLowerCase().indexOf(strtorrent)>-1){
        torrents = cols[2].split("magnet:?");
        if(torrents.length>1){
          //torrent file
          link = [];
          link.push(["magnet:?"+torrents[1].slice(0,torrents[1].indexOf('&tr=')),getTagContent(cols[3],false,"td")]); //link, seeds
          if(title!="" && link.length>0){
            oks.push([title,link]); 
          }
        }
      }
    }
    
    //gets only five first links and I need a significant number of torrents (10?) to avoid trailers, or something else than a TV Show 
    if(oks.length>=10){
      oks.sort(function(a,b){
        return b[1][0][1]-a[1][0][1];
      });
      
      //deletes repeated torrents with less seeds
      var titles = {};
      var deletes = [];
      for(var i=0,z=oks.length;i<z;i++){
        if(titles[oks[i][0].toLowerCase()]){
          deletes.push(i)
        }else{
          titles[oks[i][0].toLowerCase()] = 1
        }
      }

      for(var i=deletes.length-1;i>=0;i--){
        oks.splice(deletes[i],1)
      }

      if(oks.length>5){
        oks = oks.slice(0,5);
      }
      return oks;
    }    
  }
  return [];
}

/**
 * Updates the string prop to "tvshow s01e01" + 1
 *
 * @param {String} str
 * @param {Object} as, activesheet
 * @param {Number} i, index, if as
 * @param {String} original
 *                 string in properties, if season or episode are uppercase they will be updated to lowercase 
 */
var updateProperties = function(str,as,i,original){
  var tvshow = str.slice(0,str.lastIndexOf(" "));
  var currentEpisode = str.slice(str.lastIndexOf(" "));
  var season = currentEpisode.slice(0,currentEpisode.indexOf("e")+1);
  var episode = currentEpisode.slice(currentEpisode.indexOf("e")+1);
  episode = ""+((episode*1)+1);
  
  tvshow = tvshow + season + (episode.length==1?"0"+episode:episode);
  
  if(as){
    as.getRange("A"+i).setValue(tvshow);  
  }else{
    ScriptProperties.deleteProperty(original);
    ScriptProperties.setProperty(tvshow,"");
  }
}

/**
 * Reformats search string with the pattern "s01e12" > "1x12"
 *
 * @param {String} str
 * @return {String}
 */
var reformatEpisode = function(str){
  var tvshow = str.slice(0,str.lastIndexOf(" "));
  var currentEpisode = str.slice(str.lastIndexOf(" ")+1);
  var season = currentEpisode.slice(1,currentEpisode.indexOf("e"));
  var episode = currentEpisode.slice(currentEpisode.indexOf("e")+1);
  season = season*1;
  return tvshow + " " + season + "x" + episode;
}

/**
 * Check for the TV Shows in the User Properties and emails the torrents if it finds them. 
 * Pattern of properties has to be "tvshow sXXeXX" > "dexter s07s07"
 */
function main(){
  var body = [];
  var props = [];
  var r;
  var as = SpreadsheetApp.getActiveSheet();
  var priority = ScriptProperties.getProperty("priority");
  
  priority = priority===null?["eztv","pb"]:priority.split(",");
  
  if(as){
    var c = 1;
    do{
      r = as.getRange("A"+c).getValue();
      if(r!=""){
        props.push(r);
      }
      c++;
    }while(r!="")  
  }else{
    props = ScriptProperties.getKeys();
  }
    
  var chapter;
  for(var l=0,x=props.length;l<x;l++){
    chapter = props[l].toLowerCase();
    if(chapter==="priority"){ //priority is an option
      continue;
    }

    r = getData(chapter, priority);
    if(r.length==0){
      r = getData(reformatEpisode(chapter), priority);
    }  
    if(r.length>0){
      body.push("<ul><li><strong>",chapter.toUpperCase(),"</strong><ul>");
      for(var i=0;i<r.length;i++){
        body.push("<li>",r[i][0],"<ul>");
        for(var n=0;n<r[i][1].length;n++){
          body.push("<li><a href='",r[i][1][n],"'>",r[i][1][n],"</a></li>");
        }
        body.push("</ul></li>");
      }
      body.push("</ul></ul></li></ul>");
      updateProperties(chapter,as,l+1,props[l]);
    }
    if(body.length>0){  
      MailApp.sendEmail(Session.getUser().getEmail(), "[Google Apps Torrent Email] - " + chapter.toUpperCase(),"", {htmlBody: body.join("")});  
    }
    body=[];
  }
    
} 