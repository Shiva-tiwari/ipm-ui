const msgerForm = get(".msger-inputarea");
const msgerInput = get(".msger-input");
const msgerChat = get(".msger-chat");

const BOT_MSGS = [
	"Hi, how are you?",
	"Ohh... I can't understand what you trying to say. Sorry!",
	"I like to play games... But I don't know how to play!",
	"Sorry if my answers are not relevant. :))",
	"I feel sleepy! :(",
];

// Icons made by Freepik from www.flaticon.com
// const BOT_IMG = "https://image.flaticon.com/icons/svg/327/327779.svg";
const BOT_IMG =
	"https://thumbs.dreamstime.com/z/robot-icon-bot-sign-design-chatbot-symbol-concept-voice-support-service-bot-online-support-bot-vector-stock-illustration-robot-130663632.jpg";

const PERSON_IMG = "https://image.flaticon.com/icons/svg/145/145867.svg";
const BOT_NAME = "BOT";
const PERSON_NAME = "Shiva";

// msgerForm.addEventListener("submit", event => {
//   event.preventDefault();

//   const msgText = msgerInput.value;
//   if (!msgText) return;

//   appendMessage(PERSON_NAME, PERSON_IMG, "right", msgText);
//   msgerInput.value = "";

//   botResponse();
// });

// function appendMessage(name, img, side, text) {
//   if(side=="right") {
//     console.log(text);
//     jQuery.ajax({
//       url: 'http://localhost:8080/ipm/query/' + text,
//       cache: false,
//       contentType: false,
//       method: 'GET',
//       success: function(data) {
//         alert(JSON.stringify(data));
//       }
//     });
//   }

//   const msgHTML = `
//     <div class="msg ${side}-msg">
//       <div class="msg-img" style="background-image: url(${img})"></div>

//       <div class="msg-bubble">
//         <div class="msg-info">
//           <div class="msg-info-name">${name}</div>
//           <div class="msg-info-time">${formatDate(new Date())}</div>
//         </div>

//         <div class="msg-text">${text}</div>
//       </div>
//     </div>
//   `;

//   msgerChat.insertAdjacentHTML("beforeend", msgHTML);
//   msgerChat.scrollTop += 500;
// }

// function botResponse() {
//   const r = random(0, BOT_MSGS.length - 1);
//   const msgText = BOT_MSGS[r];
//   const delay = msgText.split(" ").length * 100;

//   setTimeout(() => {
//     appendMessage(BOT_NAME, BOT_IMG, "left", msgText);
//   }, delay);
//   readOutLoud(msgText)
// }

// Utils
function get(selector, root = document) {
	return root.querySelector(selector);
}

function formatDate(date) {
	const h = "0" + date.getHours();
	const m = "0" + date.getMinutes();

	return `${h.slice(-2)}:${m.slice(-2)}`;
}

function random(min, max) {
	return Math.floor(Math.random() * (max - min) + min);
}

// Capture Audio
try {
	var SpeechRecognition =
		window.SpeechRecognition || window.webkitSpeechRecognition;
	var recognition = new SpeechRecognition();
} catch (e) {
	console.error(e);
	$(".no-browser-support").show();
	$(".app").hide();
}

var noteTextarea = $("#note-textarea");
var instructions = $("#recording-instructions");
var notesList = $("ul#notes");

var noteContent = "";

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
		appendMessage(PERSON_NAME, PERSON_IMG, "right", noteContent);
		botResponse();

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

/*-----------------------------
      App buttons and input 
------------------------------*/

$("#mic").on("click", function (e) {
	// const audio = new Audio("https://freesound.org/data/previews/501/501690_1661766-lq.mp3");
	// audio.play();
	if (noteContent.length) {
		noteContent += " ";
	}
	recognition.start();
	$("#mic")
		.fadeOut(200)
		.fadeIn(1000)
		.fadeOut(1000)
		.fadeIn(1000)
		.fadeOut(200)
		.fadeIn(1000)
		.fadeOut(1000)
		.fadeIn(1000);
});

function readOutLoud(message) {
	var speech = new SpeechSynthesisUtterance();

	// Set the text and voice attributes.
	speech.text = message;
	speech.volume = 1;
	speech.rate = 1;
	speech.pitch = 1;

	window.speechSynthesis.speak(speech);
}
