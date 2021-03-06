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

var alertClasses = ['alert-primary', 'alert-secondary', 'alert-success', 'alert-info', 'alert-danger', 'alert-warning', 'alert-light', 'alert-dark']
var showMessage = function (message, eleClass) {
    instructions.parents(".alert").removeClass(alertClasses).addClass(eleClass).show();
    instructions.html(message);
};

/*-----------------------------
      Voice Recognition 
------------------------------*/

// If false, the recording will stop after a few seconds of silence.
// When true, the silence period is longer (about 15 seconds),
// allowing us to keep recording even when the user pauses.
recognition.continuous = true;

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
        // Save note to localStorage.
        // The key is the dateTime with seconds, the value is the content of the note.

        // Reset variables and update UI.
        //noteContent = "";
        //renderNotes(getAllNotes());
        //noteTextarea.val("");

        // instructions.text("Meeting saved successfully.");
        // noteTextarea.val(noteContent);
       // $('#final-note').append(transcript)
        console.log(noteContent);
    }
};

recognition.onstart = function () {
    showMessage("Voice recognition activated. Try speaking into the microphone.", "alert-info");

    // instructions.text(
    //     "Voice recognition activated. Try speaking into the microphone."
    // );
};

recognition.onspeechend = function () {
    showMessage("Thanks you meeting has been captured", "alert-info");


    // instructions.text(
    //     "You were quiet for a while so voice recognition turned itself off."
    // );
};

recognition.onerror = function (event) {
    if (event.error == "no-speech") {
        showMessage("No speech was detected. Try again.", "alert-danger");

        // instructions.text("No speech was detected. Try again.");
    }
};

/*-----------------------------
      App buttons and input 
------------------------------*/

$("#start-record-btn").on("click", function (e) {
    setTimeout(showRedBtn, 1500);
    if (noteContent.length) {
        noteContent += " ";
    }
    recognition.start();
    $('#start-record-btn').prop('value', 'Recording started...')
});

function showRedBtn() {
    $('#red-btn').show();

}

$("#pause-record-btn").on("click", function (e) {
    recognition.stop();
    showMessage("Voice recognition paused.", "alert-info");
    // instructions.text("Voice recognition paused.");
});

function startSaving() {
    if (!noteContent.length) {
        showMessage("Could not save empty note. Please add a message to your note.", "alert-danger");
        //
        // instructions.text(
        //     "Could not save empty note. Please add a message to your note."
        // );
    } else {
        saveNote(new Date().toLocaleString(), noteContent);
    }
}


$("#save-note-btn").on("click", function (e) {
    $('#red-btn').hide();
    recognition.stop();
    $('#start-record-btn').prop('value', 'Start Recording')


    //showMessage("Meeting saved successfully.", "alert-success");

    setTimeout(startSaving, 3000)

    

    // } else {
    // 	// Save note to localStorage.
    // 	// The key is the dateTime with seconds, the value is the content of the note.
    // 	saveNote(new Date().toLocaleString(), noteContent);

    // 	// Reset variables and update UI.
    // 	noteContent = "";
    // 	//renderNotes(getAllNotes());
    // 	noteTextarea.val("");
    // 	instructions.text("Note saved successfully.");
    // }
});

// notesList.on("click", function (e) {
//     e.preventDefault();
//     var target = $(e.target);

//     // Listen to the selected note.
//     if (target.hasClass("listen-note")) {
//         var content = target.closest(".note").find(".content").text();
//         readOutLoud(content);
//     }

//     // Delete note.
//     if (target.hasClass("delete-note")) {
//         var dateTime = target.siblings(".date").text();
//         deleteNote(dateTime);
//         target.closest(".note").remove();
//     }
// });

/*-----------------------------
      Speech Synthesis 
------------------------------*/

function readOutLoud(message) {
    var speech = new SpeechSynthesisUtterance();

    // Set the text and voice attributes.
    speech.text = message;
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
}

/*-----------------------------
      Helper Functions 
------------------------------*/

// function renderNotes(notes) {
//     var html = "";
//     if (notes.length) {
//         notes.forEach(function (note) {
//             html += `<li class="note">
//         <p class="header">
//           <span class="date">${note.date}</span>
//           <a href="#" class="listen-note" title="Listen to Note">Listen to Note</a>
//           <a href="#" class="delete-note" title="Delete">Delete</a>
//         </p>
//         <p class="content">${note.content}</p>
//       </li>`;
//         });
//     } else {
//         html = '<li><p class="content">You don\'t have any notes yet.</p></li>';
//     }
//     notesList.html(html);
// }

function saveNote(dateTime, content) {
    var title = $('#title').val();
    $('#title').val('');

    console.log(content);
    jQuery.ajax({
        url: 'http://localhost:8080/ipm/meeting/save',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({"title": title, "transcript": content}),
        cache: false,
        contentType: false,
        method: 'POST',
        success: function (data) {
            showMessage(data.message, 'alert-success')
        }
    });

    // localStorage.setItem("note-" + dateTime, content);
}

function getAllNotes() {
    var notes = [];
    var key;
    for (var i = 0; i < localStorage.length; i++) {
        key = localStorage.key(i);

        if (key.substring(0, 5) == "note-") {
            notes.push({
                date: key.replace("note-", ""),
                content: localStorage.getItem(localStorage.key(i)),
            });
        }
    }
    return notes;
}

function deleteNote(dateTime) {
    localStorage.removeItem("note-" + dateTime);
}

$('#file-upload').on('click', function (e) {
    var title = $('#audio-title').val();
    $('#audio-title').val('');

    var data = new FormData();
    jQuery.each(jQuery('#audio-file')[0].files, function (i, file) {
        data.append('file', file);
        data.append('title', title);
    });

    jQuery.ajax({
        url: 'http://localhost:8080/ipm/meeting/save/file',
        data: data,
        cache: false,
        contentType: false,
        processData: false,
        method: 'POST',
        success: function (data) {
            showMessage("File uploaded successfully.", "alert-success");
            // $('#file-success').show();
        }
    });

    document.getElementById("audio-file").value = "";


})

// Timer Code
$(document).ready(function () {

    // Timer variables
    var interval;
    var time = 0;
    var tensCount = 0;
    var secondsCount = 0;

    // Timer flags
    var wasPaused = true;
    var startButton = $('#start-record-btn');
    var resetButton = $('#save-note-btn');
    var tens = $('#tens');
    var seconds = $('#seconds');


    var startCallback = function () {
        setTimeout(test, 2000)


    };

    function test() {
        $('#display').show()
        /**
         * When the stopwatch starts, the wasPaused flag is set to false,
         * time increases. The next time the startButton is clicked, time
         * pauses, the wasPaused flag is set to true
         */
        if (wasPaused) {
            clearInterval(interval);
            interval = setInterval(startTimer, 10);
            wasPaused = false;
        } else {
            clearInterval(interval);
            wasPaused = true;
        }
    }

    startButton.on('click', startCallback);

    var resetCallback = function () {
        $('#display').hide()

        clearInterval(interval);
        wasPaused = true;
        tensCount = 0;
        secondsCount = 0;
        tens.html("00");
        seconds.html("00");
    };
    resetButton.on('click', resetCallback);


    function startTimer() {
        tensCount++;
        if (tensCount < 10) {
            tens.html('0' + tensCount);
        }
        if (tensCount > 9) {
            tens.html(tensCount);
        }
        if (tensCount > 99) {
            secondsCount++;
            seconds.html('0' + secondsCount);
            tensCount = 0;
            tens.html('0' + 0);
        }
        if (secondsCount > 9) {
            seconds.html(secondsCount);
        }
    }
});




