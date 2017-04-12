/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var Vector2 = require('vector2');
var Voice = require('ui/voice');
var Feature = require('platform/feature');
var res = Feature.resolution();
var width = Feature.resolution().x;
var Wakeup = require('wakeup');
var Vibe = require('ui/vibe');


var margin = Feature.rectangle(0, 0);
var title_width=60-margin;
var cur_data={};
var monthNames = ["янв", "фев", "мар", "апр", "май", "июн","июл", "авг", "сен", "окт", "ноя", "дек"];
var weekDay=["вc","пн","вт","ср","чт","пт","сб"];
var show_type='old';
var all_data=[];
var cur_sel=0;

var note_type='main';





function isdigit(str){
    return /^\d+$/.test(str);
}

var utro=9;
var obed=12;
var vecher=18;
var tomorow_hour=9;
var vibe_type='long';
var snooze=10;

if (localStorage.getItem('note_type')){
  note_type=localStorage.getItem('note_type');
}
if (localStorage.getItem('vibe_type')){
  vibe_type=localStorage.getItem('vibe_type');
}

if (localStorage.getItem('tomorow')){ tomorow_hour=localStorage.getItem('tomorow');}
if (localStorage.getItem('utro')){ utro=localStorage.getItem('utro');}
if (localStorage.getItem('obed')){ obed=localStorage.getItem('obed');}
if (localStorage.getItem('vecher')){ vecher=localStorage.getItem('vecher');}
if (localStorage.getItem('snooze')){ snooze=localStorage.getItem('snooze');}


function	in_list(w,lst){
		var l=lst.split(' ');
		var o=false;
		for (var i = 0; i < l.length; i++){
			if (w==l[i]){o=true;}
		}
		return o;
	}

function	parse(text){
    var st=text.toLowerCase();
		var words=st.split(' ');
		var dt=new Date();
		var rem=true;
		var r_text=[];
	    var is_after=false;
	    var last_number=0;
	    var is_first_digit=true;
	    var is_hour_set=false;
	    
	    if (in_list(words[0],'запомни запиши заметка'))
	    	{
	    		return {date:0,text:words.slice(1,words.length).join(' '),type:'note'};
	    	}
		for (var i = 0; i < words.length; i++){
			var word=words[i];
			if (in_list(word,'напомни напомнить джарвис')){
				rem=true;
			}
			else if (in_list(word,'завтра'))
			  {
			  	dt.setDate(dt.getDate() + 1);
				if (!is_hour_set){
			  	dt.setMinutes(0);
			    dt.setSeconds(0);
			  	dt.setHours(tomorow_hour);
				}
			  }
			else if (in_list(word,'утром')){
				dt.setMinutes(0);
	            dt.setSeconds(0);
				dt.setHours(utro);
			}
			else if (in_list(word,'днем днём')){
				dt.setMinutes(0);
	            dt.setSeconds(0);
				dt.setHours(obed);
			}	
			else if  (in_list(word,'вечером')){
				dt.setMinutes(0);
	            dt.setSeconds(0);
				dt.setHours(vecher);
			}
			else if (in_list(word,'через')){
				is_after=true;
			}
			else if (isdigit(word) ){
				last_number=parseInt(word);
				if (!is_after && is_first_digit){
					dt.setHours(last_number);
					dt.setMinutes(0);
				    dt.setSeconds(0);
					is_first_digit=false;
					is_hour_set=true;
				}
				else if (!is_after && !is_first_digit){
					dt.setMinutes(last_number);
				}
			}
			else if (in_list(word,'утра') && last_number>0 && !is_after)
			{
				dt.setHours(last_number);
				dt.setMinutes(0);
				dt.setSeconds(0);				
			}
			else if (in_list(word,'вечера') && last_number>0 && !is_after)
			{
				dt.setHours(last_number+12);
				dt.setMinutes(0);
				dt.setSeconds(0);				
			}			
			else if (in_list(word,'час часа') && is_after ){
				if (last_number>0){
					dt.setHours(dt.getHours()+last_number);
				}
				else {dt.setHours(dt.getHours()+1);}
			}
			else if (in_list(word,'минут минуты') && is_after ){
				if (last_number>0){
					dt.setMinutes(dt.getMinutes()+last_number);
				}
			}
			else if (in_list(word,'дней дня день') && is_after ){
				if (last_number>0){
					dt.setDate(dt.getDate() + last_number);
					is_after=false;
				}
			}
			else if (in_list(word,'вторник')){
				dt.setDate(dt.getDate() + (2 + 7 - dt.getDay()) % 7);
			}
			else if (in_list(word,'понедельник')){
				dt.setDate(dt.getDate() + (1 + 7 - dt.getDay()) % 7);
			}	
			else if (in_list(word,'среду')){
				dt.setDate(dt.getDate() + (3 + 7 - dt.getDay()) % 7);
			}	
			else if (in_list(word,'четверг')){
				dt.setDate(dt.getDate() + (4 + 7 - dt.getDay()) % 7);
			}
			else if (in_list(word,'пятницу')){
				dt.setDate(dt.getDate() + (5 + 7 - dt.getDay()) % 7);
			}
			else if (in_list(word,'субботу')){
				dt.setDate(dt.getDate() + (6 + 7 - dt.getDay()) % 7);
			}
			else if (in_list(word,'воскресенье')){
				dt.setDate(dt.getDate() + (7 + 7 - dt.getDay()) % 7);
			}
			else {r_text.push(word);}
		}
		var out=[];
		for (var b = 0; b < r_text.length; b++){
			if (!in_list(r_text[b],'часа часов минут в во'))
			{out.push(r_text[b]);}
		}
		var c=new Date();
		if (dt.valueOf()<=c.valueOf())
		{ dt.setDate(dt.getDate() + 1);}
		
		return {date:dt,text:out.join(' '),type:'reminder'};
	}
	




var splash = new UI.Window({
  backgroundColor:'#599d6a',
  action: {
    down: 'images/more.png',
    select: 'images/mic.png'
  }

});






var splash_img = new UI.Image({
  position: new Vector2(0, res.y-100),
  size: new Vector2(100, 100),
  
  image:"images/splash.png"
});

splash.add(splash_img);

var splash_img2 = new UI.Image({
  position: new Vector2(-100, res.y-75),
  size: new Vector2(89, 75),
  
  image:"images/medved.png"
});

splash.add(splash_img2);


splash.on('show',function(){
  splash_img2.position(new Vector2(-100, res.y-75));
  splash_img2.animate({'position': new Vector2(0, res.y-75)} , 500); 
  
});


var det_wind=new UI.Window({
  backgroundColor:'white',
  action: {
    down: 'images/delete.png',
    select: 'images/apply.png'
  }
});

 
var red_rect = new UI.Rect({
  position: new Vector2(0, 0),
  size: new Vector2(width,title_width),
  backgroundColor:'green'
});
  
det_wind.add(red_rect);

var det_icon = new UI.Image({
  position: new Vector2(0, 3),
  size: new Vector2(width-Feature.rectangle(30, 0), 32),
  image: 'images/mic.png'
  });
det_wind.add(det_icon);

var text_title = new UI.Text({
  position: new Vector2(0, title_width-22),
  size: new Vector2(width-Feature.rectangle(30, 0), 15),
  color:'white',
  font: 'gothic-18',
  textAlign:'center',
  textOverflow:'fill',
  text:''
  }); 
det_wind.add(text_title);

var text_main = new UI.Text({
  position: new Vector2(Feature.rectangle(4, 15), title_width),
  size: new Vector2(width-35-Feature.rectangle(0, 25), 120),
  color:'black',
  font: 'gothic-24',
  textAlign:'left',
  textOverflow:'fill',
  text:''
  });

det_wind.add(text_main);


det_wind.on('click', 'select', function() {
  if (show_type=='open'){det_wind.hide();}
  if (show_type=='new'){add_new();}
  if (show_type=='many'){remove_item();}  
});
det_wind.on('click','up',function(){
  if (show_type=='open'){   
    cur_data.date.setTime(cur_data.date.getTime() + (snooze*60*1000)); 
    add_new();
    return;
      
      }
  if (show_type!='many'){return;}
  if (cur_sel===0){return;}
  cur_sel-=1;
  cur_data=all_data[cur_sel];
  
  prepare_one();
  
});

det_wind.on('click','down',function(){
  
  if (show_type!='many'){return;}
  if (cur_sel==all_data.length-1){return;}
  cur_sel+=1;
  cur_data=all_data[cur_sel];
  
  prepare_one();
  
});

function remove_item(){
  var cur=all_data[cur_sel];
  if (cur.id){Wakeup.cancel(cur.id);}
  if (cur.pin){
    push_pin(cur_data,'delete');
    
  }
  all_data.splice(cur_sel, 1);
  localStorage.setItem('data',JSON.stringify(all_data));
  det_wind.hide();
  Vibe.vibrate('double');
  
  
  
}

function add_new(){

  if (cur_data.type=='reminder')
  {
    if (note_type=='timeline'){
      push_pin(cur_data,'new');
      cur_data.pin= 'sh'+cur_data.date.getTime();
      all_data.push(cur_data);
      localStorage.setItem('data',JSON.stringify(all_data));
      det_wind.hide();
      Vibe.vibrate('short');     
      
    }
    else{
    
    Wakeup.schedule(
  {
    time: cur_data.date.getTime()/1000,
    data: cur_data
  },
  function(e) {
    if (e.failed) {  
      console.log('ERROR!!! '+e.error);
      if (e.error=='range'){
        
        cur_data.date.setMinutes(cur_data.date.getMinutes()+1);
        add_new();
        return;
        
      }
      if (e.error=='outOfResources'){

          for (var i=0;i<all_data.length;i++){
            if (all_data[i].type=='reminder'){
              Wakeup.cancel(all_data[i].id);
              all_data.splice(i, 1);
              console.log('cancel id'+all_data[i].id);
              break;        
            }          
          }
         add_new();
         return;
      }
    } else {
      cur_data.id= e.id;
      all_data.push(cur_data);
      localStorage.setItem('data',JSON.stringify(all_data));
      det_wind.hide();
      Vibe.vibrate('short');
    }
  }
);
  }
  }
  else {
    all_data.push(cur_data);
    localStorage.setItem('data',JSON.stringify(all_data));
    det_wind.hide();
    Vibe.vibrate('short');
    
    
  }
  

  
}

function zfill(number, size) {
    number = number.toString();
    while (number.length < size) number = "0" + number;
    return number;
  }


function prepare_one(){
  det_wind.action('select', '');    
  det_wind.action('up', '');    
  det_wind.action('down', '');    
  
  if (show_type=='new'){
    det_wind.action('select', 'images/apply.png');
  }
  else {
    det_wind.action('select', '');    
  }
  if (show_type=='many'){
    det_wind.action('select', 'images/delete.png');
    if (cur_sel>0){det_wind.action('up', 'images/up.png');}
    if (cur_sel<all_data.length-1){det_wind.action('down', 'images/down.png');}
    
  }
  if (show_type=='open'){
    det_wind.action('select', 'images/apply.png');
    det_wind.action('up', 'images/later.png');}
  
  if (cur_data.type=='reminder'){
    red_rect.backgroundColor('DarkCandyAppleRed');
    det_icon.image('images/reminder.png');
    var cd=cur_data.date;
    var s=weekDay[cd.getDay()]+', '+cd.getDate()+' '+monthNames[cd.getMonth()]+' '+cd.getHours()+':'+zfill(cd.getMinutes(),2);
    text_title.text(s);
    text_main.text(cur_data.text);
    
  }
  if (cur_data.type=='note'){
    red_rect.backgroundColor('DarkGreen');
    det_icon.image('images/note.png');

    text_title.text('заметка');
    text_main.text(cur_data.text);
    
  }
  
  
  if (show_type!='many'){det_wind.show();}
}

function parse_voice(text){
  var a=parse(text);
  console.log(a.date);
  console.log(a.type);
  console.log(a.text);
  cur_data=a;
  show_type='new';
  
  prepare_one();
  Vibe.vibrate('short');
  
  
}

function start_voice(){
  
  if (false){
  parse_voice('напомни через 1 минут call misha');

  }
  else{
  
  Voice.dictate('start', false, function(e) {
  if (e.err) {
    console.log('Error: ' + e.err);
    return;
  }
  parse_voice(e.transcription);
  
}); 
    
  }
  
  
}




function show_list(){
  if (all_data.length===0){return;}

  cur_sel=0;
  show_type='many';
  cur_data=all_data[cur_sel];
  
  prepare_one();
  
  det_wind.show();
  

  
}

splash.on('click', 'select', function() {start_voice();});
splash.on('click', 'down', function() {show_list();});

function v(){Vibe.vibrate('long');}



function timelineRequest(pin, type, topics, apiKey, callback) {
  // User or shared?
  var url = 'https://timeline-api.getpebble.com/' + 'v1/' + ((topics != null) ? 'shared/' : 'user/') + 'pins/' + pin.id;

  // Create XHR
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    console.log('timeline: response received: ' + this.responseText);
    callback(this.responseText);
  };
  xhr.open(type, url);

  // Set headers
  xhr.setRequestHeader('Content-Type', 'application/json');
  if(topics != null) {
    xhr.setRequestHeader('X-Pin-Topics', '' + topics.join(','));
    xhr.setRequestHeader('X-API-Key', '' + apiKey);
  }

  // Get token
  Pebble.getTimelineToken(function(token) {
    // Add headers
    xhr.setRequestHeader('X-User-Token', '' + token);

    // Send
    xhr.send(JSON.stringify(pin));
    console.log('timeline: request sent.');
  }, function(error) { console.log('timeline: error getting timeline token: ' + error); });
}

/**
 * Insert a pin into the timeline for this user.
 * @param pin The JSON pin to insert.
 * @param callback The callback to receive the responseText after the request has completed.
 */
function insertUserPin(pin, callback) {
  timelineRequest(pin, 'PUT', null, null, callback);
}

function deleteUserPin(pin, callback) {
  timelineRequest(pin, 'DELETE', null, null, callback);
}

function push_pin(data,act){
    // An hour ahead
  var date = data.date;
  

  // Create the pin

  
  var pin={
  "id": "sh"+date.getTime(),
  "time": date.toISOString(),
  "layout": {
    "type": "genericPin",
    "title": data.text,
    "tinyIcon": "system://images/TIMELINE_CALENDAR"
  },
    "reminders": [
    {
      "time": date.toISOString(),
      "layout": {
        "type": "genericReminder",
        "tinyIcon": "system://images/TIMELINE_CALENDAR",
        "title": data.text
      }
    }
      ]
    
  

};


  if (act=='new'){insertUserPin(pin, function(responseText) { console.log('Result: ' + responseText);}); }
  if (act=='delete'){deleteUserPin(pin, function(responseText) {console.log('Result: ' + responseText); }) ;}             
}

Wakeup.launch(function(e) {
  
  if (localStorage.getItem('data')){
    all_data=JSON.parse(localStorage.getItem('data'));
  }
  var all_copy=[];
  for (var x=0;x<all_data.length;x++){
    if (all_data[x].type=='reminder'){
      all_data[x].date=new Date(all_data[x].date);
      if (all_data[x].date>new Date()){
        all_copy.push(all_data[x]);
        
      }
    }
    else{
      all_copy.push(all_data[x]);
      
    }
  }
  all_data=all_copy;
  localStorage.setItem('data',JSON.stringify(all_data));
  
  
  if (e.wakeup) {
    
    
    cur_data=e.data;
    cur_data.date=new Date(e.data.date);
    show_type='open';
    prepare_one();
    if (vibe_type=='long'){setInterval(v,1000);}
    else{v();}
  
    
  } else {  
    splash.show();
    
    
    
    
    

    
  }
});

Pebble.addEventListener('webviewclosed', function(e) {
  console.log(e.response);

  var config = JSON.parse(decodeURIComponent(e.response));
  note_type=config.note_type;
  localStorage.setItem('note_type',note_type);
  vibe_type=config.vibe_type;
  localStorage.setItem('vibe_type',vibe_type);  
  tomorow_hour=config.tomorow;
  localStorage.setItem('tomorow',tomorow_hour);  
  utro=config.utro;
  localStorage.setItem('utro',utro);  
  obed=config.obed;
  localStorage.setItem('obed',vecher);  
  vecher=config.vecher;
  localStorage.setItem('vecher',vecher);  
  snooze=config.snooze;
  localStorage.setItem('snooze',snooze);  
});

function open_config(){
   var data={};
  
  data.note_type=note_type;
  data.vibe_type=vibe_type;
  data.tomorow=tomorow_hour;
  data.utro=utro;
  data.obed=obed;
  data.vecher=vecher;
  data.snooze=snooze;
  var url = 'https://kaist.github.io/shepot.html#'+encodeURIComponent(JSON.stringify(data));

  Pebble.openURL(url); 
}

Pebble.addEventListener('showConfiguration', function() {
  open_config();

});