var btnMonitorShowHide = document.querySelector('#btnMonitorShowHide');
var divMonitor = $('#monitor');
var btnButton = document.querySelector('#btnButton');
var btnToggle = document.querySelector('#btnToggleButton');
var btnText = document.querySelector('#btnText');
var btnConnect = document.querySelector('#btnConnect');
var btnSlider = document.querySelector('#btnSlider');
var table = document.querySelector('#eventsButtonList');
var btnSButton = document.querySelector('.btnSalvarButton');
var btnSToggle = document.querySelector('.btnSalvarToggleButton');
var btnSText = document.querySelector('.btnSalvarText');
var btnSSlider = document.querySelector('.btnSalvarSlider');
var btnSend = document.querySelector('#sendCmd');
var message = document.querySelector('#textMessageSend');
var portPicker = document.querySelector('#ports');
var connected = false;
var DEVICE_PATH = '/dev/ttyACM0';
var connectionId2 = 0;
var stringReceived = '';

$(document).ready(function(){
	
	setInterval(getDevice, 1000);
	
    $("#mascara").click( function(){
        $(this).hide();
        $(".window").hide();
    });
 
    $('.btnFechar').click(function(ev){
        ev.preventDefault();
		$("#mascara").hide();
		$(".window").hide();
    });
});

function getDevice() {
	chrome.serial.getDevices(getDevices);
}

/*********** FUNÇÕES DO chrome.serial ************/
// Convert string to ArrayBuffer
var str2ab = function(str) {
  var buf = new ArrayBuffer(str.length);
  var bufView = new Uint8Array(buf);
  for (var i = 0; i < str.length; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
};

var ab2str = function(buf) {
  var bufView = new Uint8Array(buf);
  return String.fromCharCode.apply(null, bufView);
};

function log(msg) {
	var buffer = document.querySelector('#monitorResult');
	buffer.innerHTML += '> ' + msg + '<br/>';
	buffer.scrollTop = buffer.scrollHeight;
	if(msg.indexOf(";") > -1 && msg.indexOf("txt" > -1)) {
		var str = msg.split(";");
		//console.log(str);
		for(var i = 0; i < table.rows.length; i++) {
			//console.log(table.rows[i].cells[2].innerHTML);
			if(table.rows[i].cells[2].innerHTML.indexOf(str[1]) > -1) {
				console.log(str[2]);
				document.querySelector('#ovtext' + i).innerHTML = str[2];
			}
		}
	}
}

var onDisconnect = function(result) {
	if (result) {
		conectado(false);
	}
};

var onSend = function(sendInfo) {
};

var sendMessage = function(event) {
	if(event.keyCode == 13) {
		if(message.value == "clear")
			clearScreen();
		else if(message.value == "help") {
			log("\n------------------ Comandos ------------------");
			log("oi - Verificar a conexao");
			log("y - Para acender o LED");
			log("n - Para apagar o LED");
			log("blink - Para ligar e desligar o blink.");
			log("clear - Limpar tela");
			log("------------------ Comandos ------------------\n");
		} else {
			var buffer = str2ab(message.value);
			chrome.serial.send(connectionId2, buffer, onSend);
		}
		message.value = "";
		message.focus();
	}
};

btnSend.onclick = function() {
  if(message.value == "clear")
      clearScreen();
    else if(message.value == "help") {
      log("\n------------------ Comandos ------------------");
      log("oi - Verificar a conexao");
      log("y - Para acender o LED");
      log("n - Para apagar o LED");
      log("blink - Para ligar e desligar o blink.");
      log("clear - Limpar tela");
      log("------------------ Comandos ------------------\n");
    } else {
      var buffer = str2ab(message.value);
      chrome.serial.send(connectionId2, buffer, onSend);
    }
    message.value = "";
    message.focus();
};

message.addEventListener("keypress", sendMessage);

var onReceiveCallback = function(info) {
  
  if (info.connectionId == connectionId2 && info.data) {
    var str = ab2str(info.data);
    if (str.charAt(str.length-1) === '\n') {
      stringReceived += str.substring(0, str.length-1);
      log(stringReceived);
      stringReceived = '';
    } else {
      stringReceived += str;
    }
  }
};

var clearScreen = function() {
  document.querySelector('#monitorResult').innerHTML="";
};

var onSerialConnect = function(connectionInfo) {
	if(!connectionInfo) {
		return;
	}
	clearScreen();
	conectado(true);
	connectionId2 = connectionInfo.connectionId;
	chrome.serial.onReceive.addListener(onReceiveCallback);
};

var cancelButton = document.getElementById('cancel');

cancelButton.addEventListener('click', function() {
	document.getElementById('favDialog').close();
});

btnConnect.onclick = function() {
	if(!connected) {
		if(portPicker.value == -1) {
			document.getElementById('favDialog').showModal();
			return;
		}
    	DEVICE_PATH = portPicker.value;
    	chrome.serial.connect(DEVICE_PATH, {bitrate: 9600}, onSerialConnect);
	} else {
		chrome.serial.disconnect(connectionId2, onDisconnect);
	}
};

var conectado = function(conn) {
	$("#eventsButtons").children().prop('disabled',!conn);
	$("#sendBox").children().prop('disabled', !conn);
	$("#eventsButtonList").children().prop('disabled',!conn);
	btnConnect.innerHTML = conn ? "Disconectar" : "Conectar";
	connected = conn;
	stringReceived = '';
	document.querySelector('#monitorResult').innerHTML = "";
};

var getDevices = function(ports) {
  portPicker.innerHTML = "";
	if(ports.length == 0) {
		var portOption = document.createElement('option');
		portOption.text = "Nenhuma porta encontrada";
		portOption.value = "-1";
		portPicker.appendChild(portOption);
		conectado(false);
	}
	ports.forEach(function (port) {
		var portOption = document.createElement('option');
		portOption.text = port.path;
		portOption.value = port.path;
		portPicker.appendChild(portOption);
	});
};

chrome.runtime.onSuspend.addListener(function() {
  chrome.serial.disconnect(connectionId2, onDisconnect);
});

portPicker.onchange = function () {
  //log(portPicker.value);
  DEVICE_PATH = portPicker.value;
};
/*********** OUTRAS FUNÇÕES ****************/

function isSelected(e) {
	return $('#' + e).hasClass('toggle-button toggle-button-selected');
}

$(document).on('click', '.button-send', function(e) {
	var buffer = str2ab($('#v' + e.target.id).html());
	chrome.serial.send(connectionId2, buffer, onSend);
});

$(document).on('click', '.image', function(e) {
	var buffer = $('#d' + e.target.id).html();
	for(var i = 0; i < table.rows.length; i++) {
		var row = table.rows[i];
		if(row.cells[3].innerHTML == "<img id=\"" + e.target.id + "\" class=\"image\" src=\"assets\\delete.png\">") {
			table.deleteRow(i);
		}
	}
});

$(document).on('click', '.toggle-button', function(e){
	$('#' + e.target.id).toggleClass('toggle-button-selected');
	//console.log(isSelected(e.target.id).toString());
	var values = $('#v' + e.target.id).html().split("/");
	var msg = (isSelected(e.target.id) ? values[0] : values[1]);
	//console.log(msg);
	var buffer = str2ab(msg);
  	chrome.serial.send(connectionId2, buffer, onSend);
});

$(document).on('change', '.position-input', function(e){
	$('#v' + e.target.id).html(this.value);
	var v = "sld:" + $('#vo' + e.target.id).html() + ":" + this.value;
	chrome.serial.send(connectionId2, str2ab(v), onSend);
});

function Mudarestado() {
   	var display = $('#monitor').css("display");
	if(display != "none") {
		$('#monitor').hide();
		$('#divEventsButton').css('right', '10px');
		var tela = chrome.app.window.current();
		tela.outerBounds.setMinimumSize(500, 600);
		tela.outerBounds.setSize(500,600);
	} else { 
		$('#monitor').show(200);
		$('#divEventsButton').css('right', '510px');
		var tela = chrome.app.window.current();
		tela.outerBounds.setMinimumSize(1000, 600);
		tela.outerBounds.setSize(1000, 600);
	}
}

function janelaModal(tipo) {
	if(tipo=="button") {
		var id = $("#janelaButton");
	} else if(tipo == "toggle") {
		var id = $("#janelaToggle");
	} else if(tipo == "slider") {
		var id = $("#janelaSlider");
	} else if(tipo == "text") {
		var id = $("#janelaText");
	}
 
	var alturaTela = $(document).height();
	var larguraTela = $(window).width();
     
	//colocando o fundo preto
	$('#mascara').css({'width':larguraTela,'height':alturaTela});
	$('#mascara').fadeIn(1000); 
	$('#mascara').fadeTo("slow",0.8);
 
	var left = ($(window).width() /2) - ( $(id).width() / 2 );
	var top = ($(window).height() / 2) - ( $(id).height() / 2 );
     
	$(id).css({'top':top,'left':left});
	$(id).show(); 
}

btnMonitorShowHide.onclick = function(){
	Mudarestado();
};

var addNewEventButton = function(type) {
	// Captura a quantidade de linhas já existentes na tabela
	var numOfRows = table.rows.length;
	// Captura a quantidade de colunas da última linha da tabela
	var numOfCols = table.rows[numOfRows-1].cells.length;

	// Insere uma linha no fim da tabela.
	var newRow = table.insertRow(numOfRows);
	if(type == "btn") {
		newCell = newRow.insertCell(0);
		newCell.innerHTML = "<button class=\"button-send\" id=\"btn" + numOfRows + "\" style=\"width: 90%;\" class=\"button\">Button</button>";
		newCell = newRow.insertCell(1);
		newCell.innerHTML = "<div id=\"vbtn" + numOfRows + "\">" + document.querySelector('#valor').value + "</div>";
		newCell = newRow.insertCell(2);
		newCell.innerHTML = "";
		//newCell = newRow.insertCell(3);
		//newCell.innerHTML = "<img id=\"dbtn" + numOfRows + "\" class=\"image\" src=\"assets\\delete.png\">";
		document.querySelector('#valor').value = '';
	} else if(type == "toggle") {
		newCell = newRow.insertCell(0);
		newCell.innerHTML = "<div class=\"toggle-button\" id=\"tg" + numOfRows + "\"><button></button></div>";
		newCell = newRow.insertCell(1);
		newCell.innerHTML = "<div id=\"vtg" + numOfRows + "\">" + document.querySelector('#trueToggle').value + "/" + document.querySelector('#falseToggle').value + "</div>";
		newCell = newRow.insertCell(2);
		newCell.innerHTML = "";
		document.querySelector('#trueToggle').value = '';
		document.querySelector('#falseToggle').value = '';
		//newCell = newRow.insertCell(3);
		//newCell.innerHTML = "<img id=\"dtg" + numOfRows + "\" class=\"image\" src=\"assets\\delete.png\">";
	} else if(type == "slider") {
		newCell = newRow.insertCell(0);
		newCell.innerHTML = "<input class=\"position-input\" id=\"slider" + numOfRows + "\" value=\"3\" type=\"range\" min=" + document.querySelector('#vMin').value + " max=" + document.querySelector('#vMax').value + ">";
		newCell = newRow.insertCell(1);
		newCell.innerHTML = "<div id=\"vslider" + numOfRows + "\">" + document.querySelector('#vMin').value + "</div>";
		newCell = newRow.insertCell(2);
		newCell.innerHTML = "<div id=\"voslider" + numOfRows + "\">" + document.querySelector('#vPin').value + "</div>";
		document.querySelector('#vMin').value = '';
		document.querySelector('#vMax').value = '';
		document.querySelector('#vPin').value = '';
		//newCell = newRow.insertCell(3);
		//newCell.innerHTML = "<img id=\"dslider" + numOfRows + "\" class=\"image\" src=\"assets\\delete.png\">";
	} else if(type == "text") {
		newCell = newRow.insertCell(0);
		newCell.innerHTML = "Text";
		newCell = newRow.insertCell(1);
		newCell.innerHTML = "<div id=\"ovtext" + numOfRows + "\"></div>";
		newCell = newRow.insertCell(2);
		newCell.innerHTML = "<div id=\"vtext" + numOfRows + "\">" + document.querySelector('#txtValue').value + "</div>";
		document.querySelector('#txtValue').value = '';
		//newCell = newRow.insertCell(3);
		//newCell.innerHTML = "<img id=\"dtext" + numOfRows + "\" class=\"image\" src=\"assets\\delete.png\">";
	}
    
    $("#mascara").hide();
    $(".window").hide();
};

btnSButton.onclick = function() {
	addNewEventButton("btn");
};

btnSToggle.onclick = function() {
	addNewEventButton("toggle");
};

btnSSlider.onclick = function() {
	addNewEventButton("slider");
};

btnSText.onclick = function() {
	addNewEventButton("text");
};

btnButton.onclick = function(ev) {
	ev.preventDefault();
	janelaModal("button");
};

btnToggle.onclick = function(ev) {
	ev.preventDefault();
	janelaModal("toggle");
};

btnSlider.onclick = function(ev) {
	ev.preventDefault();
	janelaModal("slider");
};

btnText.onclick = function(ev) {
	ev.preventDefault();
	janelaModal("text");
};

chrome.app.window.current().outerBounds.setSize(500, 600);
conectado(false);
