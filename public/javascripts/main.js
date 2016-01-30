var handler;

function updateScroll(){
    var element = document.getElementById("console");
    element.scrollTop = element.scrollHeight + 1000;
}

$(function() {
    // Creating the console.
    var header =    'Welcome to the Java Card online simulator!\n' +
                    'Adam Noakes - University of Southampton\n' +
                    'Tip: Ensure window width is above 992px to view documentation.\n';
                    
    window.jqconsole = $('#console').jqconsole(header, 'Java Card> ');

    // Abort prompt on Ctrl+Z.
    jqconsole.RegisterShortcut('Z', function() {
      jqconsole.AbortPrompt();
      handler();
    });
    // Move to line start Ctrl+A.
    jqconsole.RegisterShortcut('A', function() {
      jqconsole.MoveToStart();
      handler();
    });
    // Move to line end Ctrl+E.
    jqconsole.RegisterShortcut('E', function() {
      jqconsole.MoveToEnd();
      handler();
    });
    jqconsole.RegisterMatching('{', '}', 'brace');
    jqconsole.RegisterMatching('(', ')', 'paran');
    jqconsole.RegisterMatching('[', ']', 'bracket');
    // Handle a command.
    handler = function(command) {
      if (command) {
        console.log(command);
        try {
          sendCommand(command, handler);
        } catch (e) {
          jqconsole.Write('ERROR: ' + e.message + '\n');
        }
      } else {
        jqconsole.Prompt(true, handler);
      }
    };
    // Initiate the first prompt.
    handler();
});

function executeButton(command)
{
    jqconsole.Write("Java Card> " + command, "jqconsole-old-prompt");
    jqconsole.Write('\n'); 
    handler(command);
}

function sendCommand(input, handler){
    
    var words = input.split(" ");
    switch(words[0]){
        case "cards":
            getCards(handler);
            break;            
        case "load":
            loadCard(handler, words[1]);
            break;
        case "newcard":
            newCard(handler,  words[1]);
            break;
        default:
            var lines = input.split(";");
            for(i=0; i<lines.length; i++){
                lines[i] = lines[i].split(" ");
            }
            sendAPDU(lines, handler);
            break;
    };
}

function getCards(handler){
    $.ajax({
        type: "GET",
        url: "/simulator/smartcards",
        success: function(cards){
            $.each(cards, function(i, card) {
                jqconsole.Write(card.cardName + " ", "response-ok");
            });
            jqconsole.Write('\n'); 
            jqconsole.Prompt(true, handler);
        }
    });
}

function newCard(handler, cardName){
    $.ajax({
        type: "POST",
        data: {'cardName' : cardName},
        url: "/simulator/smartcards" ,
        success: function(data){
            console.log(data);
            if(data.result){
                jqconsole.Write("Successfully created virtual smart card: " + data.cardName, "response-ok");
            } else {
                jqconsole.Write(data.message, "response-error");
            }
            jqconsole.Write('\n');
            jqconsole.Prompt(true, handler);
        }
    });
}

function loadCard(handler, cardName){
    $.ajax({
        type: "GET",
        url: "/simulator/smartcards/" + cardName,
        success: function(data){
            console.log(data);
            if(data.result){
                jqconsole.Write("Successfully loaded: " + data.cardName, "response-ok");
            } else {
                jqconsole.Write(data.message, "response-error");
            }
            jqconsole.Write('\n'); 
            jqconsole.Prompt(true, handler);
        }
    });
}

function sendAPDU(APDU, handler){
    for(i=0; i<APDU.length; i++){
        for(j=0; j<APDU[i].length; j++){
            APDU[i][j] = parseInt(APDU[i][j], 16);
        }
    }
    $.ajax({
        type: "POST",
        url: "/simulator/apdu",
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({"APDU": APDU}),
        success: function(data) { 
            jqconsole.Write("==> " + data.APDU, "response-ok"); 
            jqconsole.Write('\n'); 
            jqconsole.Prompt(true, handler);
        },
        error: function(xhr, error){
                jqconsole.Write(error);
                jqconsole.Write(xhr);
                console.debug(xhr);
                jqconsole.Write('\n'); 
                jqconsole.Prompt(true, handler);
        }
    });
}