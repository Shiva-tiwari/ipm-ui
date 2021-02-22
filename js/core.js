var sound = false;
var decisionArrays = [];
var globalResponseObject = {};
let CONSTANT = {
	USER_REQUEST: {
		TYPE: "GET",
		URL: "http://localhost:8080/ipm/query",
	},
	FORM_SUBMISSION: {
		TYPE: "POST",
		URL: "http://localhost:8080/ipm/query/submit",
	},
};

$(".msger-send-btn").click(function (event) {
	event.preventDefault();
	var userQuery = $("#userInput").val();
	$("#userInput").val("");
	userMessage(PERSON_NAME, PERSON_IMG, "right", userQuery);
	console.log("Calling ajax");
	//var request = { query: userQuery };
	callToAjaxForQuery(userQuery);
});

// For Sound
try {
	var SpeechRecognition =
		window.SpeechRecognition || window.webkitSpeechRecognition;
	var recognition = new SpeechRecognition();
} catch (e) {
	console.error(e);
	$(".no-browser-support").show();
	$(".app").hide();
}

callToAjaxForQuery = (data) => {
	var q = data;
	$.ajax({
		url: CONSTANT.USER_REQUEST.URL + "/" + data,
		type: CONSTANT.USER_REQUEST.TYPE,
		success: function (response) {
			console.log("response", response);
			globalResponseObject = response;
			if (response.args) {
        getBotResponse(response.args);
        return;
      }
			if (q.toString().includes("last")) {
        // Get list of moms
				var meetingList = response;
				var htmlResponse = `<div class='bot-response-form' style = 'width: 100%; margin-top:20px '> `;
				for (let i = 0; i < meetingList.length; i++) {
					let element = meetingList[i]["summary"];
					const time = meetingList[i]["dateCreated"];
          if (!element) {
            element = 'No record for that day';
          }
					htmlResponse += `<div>${element}<span style="color: blue;float: right">${time.substring(
						0,
						10
					)} </span></div><br/><br/>`;
				}
				htmlResponse += `</div>`;

				const msgHTML = `
            <div class="msg left-msg">
              <div class="msg-img" style="background-image: url(${BOT_IMG})"></div>
        
              <div class="msg-bubble">
                <div class="msg-info">
                  <div class="msg-info-name">${BOT_NAME}</div>
                  <div class="msg-info-time">${formatDate(new Date())}</div>
                </div>
                <div class="msg-text">${htmlResponse}</div> 
              </div>
            </div>
          `;

				msgerChat.insertAdjacentHTML("beforeend", msgHTML);

				msgerChat.scrollTop += 500;
        return;
			} else {
        // query type is mom
				var data = response.response;
				var htmlResponse = `<div class='bot-response-form' style = 'width: 100%; margin-top:20px '> `;
				for (let i = 0; i < data.length; i++) {
					const text = data[i]["sentence"];
					const percentage = data[i]["confidence"];
          if(parseFloat(percentage) > 50.00) {
            htmlResponse += `<div>${text}<span style="color: blue;float: right">${percentage} %</span></div><br/><br/>`;

          }

				}

				htmlResponse += `</div>`;

				const msgHTML = `
          <div class="msg left-msg">
            <div class="msg-img" style="background-image: url(${BOT_IMG})"></div>
      
            <div class="msg-bubble">
              <div class="msg-info">
                <div class="msg-info-name">${BOT_NAME}</div>
                <div class="msg-info-time">${formatDate(new Date())}</div>
              </div>
              <div class="msg-text">${htmlResponse}</div> 
            </div>
          </div>
        `;

				msgerChat.insertAdjacentHTML("beforeend", msgHTML);

				msgerChat.scrollTop += 500;
        return;
			}
		},
		error: function (response) {
			console.log(response);
			getBotResponse(response.responseJSON.message);
		},
	});
};

function getBotResponse(data) {
	if (data == "Sorry, I' m not able to understand that") {
		const msgHTML = `
          <div class="msg left-msg">
            <div class="msg-img" style="background-image: url(${BOT_IMG})"></div>
      
            <div class="msg-bubble">
              <div class="msg-info">
                <div class="msg-info-name">${BOT_NAME}</div>
                <div class="msg-info-time">${formatDate(new Date())}</div>
              </div>
              <div class="msg-text">${data}</div> 
            </div>
          </div>
        `;

		msgerChat.insertAdjacentHTML("beforeend", msgHTML);

		msgerChat.scrollTop += 500;
	} else {
		const msgText = "Please enter details";
    if (sound == true) {
      debugger;
      readOutLoud(msgText);
    }

		createBotResponse(BOT_NAME, BOT_IMG, "left", msgText, data);
	}
}

function createBotResponse(name, img, side, text, decisionArr) {
	console.log("decisionArr", decisionArr.length);
	decisionArrays = decisionArr;
	var htmlForm = botGeneratedDynamicForm(decisionArr);
	const msgHTML = `
          <div class="msg ${side}-msg">
            <div class="msg-img" style="background-image: url(${img})"></div>
      
            <div class="msg-bubble">
              <div class="msg-info">
                <div class="msg-info-name">${name}</div>
                <div class="msg-info-time">${formatDate(new Date())}</div>
              </div>
              <div class="msg-text">${text}
              ${htmlForm}</div> 
            </div>
          </div>
        `;

	msgerChat.insertAdjacentHTML("beforeend", msgHTML);

	msgerChat.scrollTop += 500;
}

botGeneratedDynamicForm = (decisionArr) => {
	var htmlForm = `<div class='bot-response-form' style = 'width: 100%; margin-top:20px '> `;
	for (var i = 0; i < decisionArr.length; i++) {
		if (decisionArr[i]["type"] == "text field") {
			htmlForm += `<textarea class=${decisionArr[i]["name"]} name=${decisionArr[i]["name"]} placeholder='${decisionArr[i]["label"]}' style= 'width: 100%;
        padding: 5px 8px;
        margin: 4px 0;
        box-sizing: border-box'></textarea>`;
		} else {
			htmlForm += `<input class=${decisionArr[i]["name"]} type=${decisionArr[i]["type"]} placeholder='${decisionArr[i]["label"]}' name=${decisionArr[i]["name"]} style= 'width: 100%;
      padding: 5px 8px;
      margin: 4px 0;
      box-sizing: border-box'/>`;
		}
	}
	htmlForm += ` <button class="submit-request-bot" type="submit"  onclick="botGeneratedDynamicFormSubmission()" style = 'width: 25%; margin-top:5px; float:right; background-color: #4CAF50;
    border: none;
    color: white;
    padding: 5px 10px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    cursor: pointer;
    font-size: 12px;'> Submit </button>`;
	htmlForm += `</div>`;
	return htmlForm;
};

botGeneratedDynamicFormSubmission = () => {
	console.log("bot submit started...");
	event.preventDefault();
	var requestArr = [];
	for (var i = 0; i < decisionArrays.length; i++) {
		let keyName = decisionArrays[i]["name"];
		let value = $("." + keyName)
			.last()
			.val();
		console.log("KeyName- " + keyName);
		console.log("value- " + value);

		var obj = {
			[keyName]: value,
		};
		requestArr.push(obj);
	}

	console.log(requestArr);

	globalResponseObject["args"] = requestArr;

	console.log("values", requestArr);
	console.log("values", globalResponseObject);

	callToAjaxFormSub(globalResponseObject);
	globalResponseObject = {};
	decisionArrays = [];

	$("input").prop("disabled", true);
	$("textarea").prop("disabled", true);
	$("#userInput").prop("disabled", false);
	$(".submit-request-bot").prop("disabled", true);
};

callToAjaxFormSub = (data) => {
	$.ajax({
		url: CONSTANT.FORM_SUBMISSION.URL,
		type: CONSTANT.FORM_SUBMISSION.TYPE,
		contentType: "application/json",
		data: JSON.stringify(data),
		success: function (response) {
			console.log("ye h response", response);
			botResponseAfterFormSubmission(
				BOT_NAME,
				BOT_IMG,
				"left",
				response.message
			);
			//readOutLoud(response.message);
		},
	});
};

botResponseAfterFormSubmission = (name, img, side, text) => {
	var response = text.toString();
	if (text.toString().includes("null")) {
		response = text.toString().replaceAll("null", " not present ");
	}
	const msgHTML = `
    <div class="msg ${side}-msg">
      <div class="msg-img" style="background-image: url(${img})"></div>

      <div class="msg-bubble">
        <div class="msg-info">
          <div class="msg-info-name">${name}</div>
          <div class="msg-info-time">${formatDate(new Date())}</div>
        </div>
        <div class="msg-text">${response}
        </div> 
      </div>
    </div>
  `;

	msgerChat.insertAdjacentHTML("beforeend", msgHTML);

	msgerChat.scrollTop += 500;
  if (sound) {
    readOutLoud(response);
  }
};

function userMessage(name, img, side, text) {
	const msgHTML = `
    <div class="msg ${side}-msg">
      <div class="msg-img" style="background-image: url(${img})"></div>

      <div class="msg-bubble">
        <div class="msg-info">
          <div class="msg-info-name">${name}</div>
          <div class="msg-info-time">${formatDate(new Date())}</div>
        </div>

        <div class="msg-text">${text}</div>
      </div>
    </div>
  `;

	msgerChat.insertAdjacentHTML("beforeend", msgHTML);
	msgerChat.scrollTop += 500;
}

/*-----------------------------
      Voice Recognition 
------------------------------*/

// If false, the recording will stop after a few seconds of silence.
// When true, the silence period is longer (about 15 seconds),
// allowing us to keep recording even when the user pauses.
recognition.continuous = false;

// This block is called every time the Speech APi captures a line.
recognition.onresult = function (event) {
	// event is a SpeechRecognitionEvent object.
	// It holds all the lines we have captured so far.
	// We only need the current one.
	var current = event.resultIndex;

	// Get a transcript of what was said.
	var transcript = event.results[current][0].transcript;

	// Add the current transcript to the contents of our Note.
	// There is a weird bug on mobile, where everything is repeated twice.
	// There is no official solution so far so we have to handle an edge case.
	var mobileRepeatBug =
		current == 1 && transcript == event.results[0][0].transcript;

	if (!mobileRepeatBug) {
		noteContent += transcript;
		console.log(noteContent);

		userMessage(PERSON_NAME, PERSON_IMG, "right", noteContent);
		console.log("Calling ajax");
		//var request = { query: userQuery };
		callToAjaxForQuery(noteContent);

		// Reset variables and update UI.
		noteContent = "";
		//renderNotes(getAllNotes());
		noteTextarea.val("");
		instructions.text("Meeting saved successfully.");
		// noteTextarea.val(noteContent);
	}
};

recognition.onstart = function () {
	instructions.text(
		"Voice recognition activated. Try speaking into the microphone."
	);
};

recognition.onspeechend = function () {
	instructions.text(
		"You were quiet for a while so voice recognition turned itself off."
	);
};

recognition.onerror = function (event) {
	if (event.error == "no-speech") {
		instructions.text("No speech was detected. Try again.");
	}
};

function readOutLoud(message) {
	console.log(message);
	var speech = new SpeechSynthesisUtterance();

	// Set the text and voice attributes.
	speech.text = message;
	speech.volume = 1;
	speech.rate = 1;
	speech.pitch = 1;

	window.speechSynthesis.speak(speech);
}

$("#mic").on("click", function (e) {
	// const audio = new Audio("https://freesound.org/data/previews/501/501690_1661766-lq.mp3");
	// audio.play();
	if (noteContent.length) {
		noteContent += " ";
	}
	recognition.start();
});

$('#sound-off').on('click', function(e) {
  $('#sound-off').hide()
  $('#sound-on').show();
  sound = true;
  console.log(sound);
});

$('#sound-on').on('click', function(e) {
  $('#sound-on').hide()
  $('#sound-off').show();
  sound = false;
  console.log(sound);
});