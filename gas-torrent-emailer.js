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
 * Get content from eztv.it and parses it
 *
 * @param {String} str
 * @return {Array}
 */
var getData = function(strtorrent){
  var response = UrlFetchApp.fetch("http://eztv.it/search/",{    
    'payload' : {
        'SearchString1': strtorrent
      },
      'headers' : {
        'contentType' : 'text/html; charset=utf-8',
      },
      'method' : 'post',
      'muteHttpExceptions' : true
  });  

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
        for(var k=0,y=torrents.length;k<y;k++){
          aux = torrents[k].split("href=\"");
          if(aux.length>1 && aux[1].indexOf("magnet")==-1){
            link.push(aux[1].slice(0,aux[1].indexOf('"')));
            break;
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
    r = getData(chapter);
    if(r.length==0){
      r = getData(reformatEpisode(chapter));
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
  }
  if(body.length>0){  
    MailApp.sendEmail(Session.getUser().getEmail(), "[Google Apps Torrent Email] - TV Shows ","", {htmlBody: body.join("")});  
  }
} 