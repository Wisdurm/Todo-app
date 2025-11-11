var noteCounter = 0;
var mouseX = 0;
var mouseY = 0;
/**
 * Creates a note and adds it to the document
 * @constructor
 */
function createNote(jsonBase) {
	let noteDiv = document.createElement("div");
	if (jsonBase) {
		noteDiv.id = jsonBase.id;
		if (jsonBase.id.replace(/^\D+/g, '') >= noteCounter) {
			noteCounter = Number(jsonBase.id.replace(/^\D+/g, '')) + 1; // Not the cleanest solution but it works
		}
	}
	else {
		noteDiv.id = `note${noteCounter}`;
		noteCounter += 1;
	}
	noteDiv.classList.add("note");
	if (jsonBase)
		noteDiv.innerHTML = jsonBase.text.replaceAll("\n","<br>");
	else
		noteDiv.innerHTML = "Click to edit content";
	// Moving
	noteDiv.style.position = "absolute";
	if (jsonBase) {
		noteDiv.style.left = jsonBase.x;
		noteDiv.style.top = jsonBase.y;
	}
	else {
		noteDiv.style.top = "100px";
		noteDiv.style.left = "100px";
	}
	// Mouse position when started
	noteDiv.offsetX = 0;
	noteDiv.offsetY = 0;
	// Is being edited
	noteDiv.editing = false;
	noteDiv.addEventListener("click", () => {
		if (!noteDiv.editing) {
			noteDiv.editing = true;
			noteDiv.innerHTML = `
				<textarea onkeyup="textAreaAdjust(this)">${noteDiv.innerHTML.replaceAll("<br>","\n")}</textarea>
			`;
			textAreaAdjust(noteDiv.children[0]);
		}
	});
	storeNote(noteDiv);
	$("body").append(noteDiv);
}

// Source - https://stackoverflow.com/a
// Posted by Alsciende, modified by community. See post 'Timeline' for change history
// Retrieved 2025-11-11, License - CC BY-SA 4.0
function textAreaAdjust(element) {
  element.style.width = "1px";
  element.style.width = (25+element.scrollWidth)+"px";
  element.style.height = "1px";
  element.style.height = (element.scrollHeight)+"px";
}

function storeNote(noteElem) {
	// Storing with id as the key because its so easy and fast to implement
	const noteJson = {
		text: noteElem.editing ? noteElem.children[0].value : noteElem.innerHTML,
		x: noteElem.style.left,
		y: noteElem.style.top
	};
	localStorage.setItem(noteElem.id, JSON.stringify(noteJson));
}

function deleteNote(noteElem) {
	localStorage.removeItem(noteElem.id);
}

$(document).ready(function(){
	$("#addNote").click(function(){
		createNote();
	});
	// Mouse pos
	$(document).mousemove(function(event) {
        mouseX = event.pageX;
        mouseY = event.pageY;
    });
	// If you click somewhere on the screen, stop editing notes
	$(window).click(function(e){
		$(".note").each(function(index){
			if (!$(this)[0].contains(e.target) && $(this)[0].editing) { 
				storeNote($(this)[0]);
				$(this)[0].editing = false;
				$(this)[0].innerHTML = $(this)[0].children[0].value.replaceAll("\n","<br>");
				$(this)[0].style.width = null;
				$(this)[0].style.height = null;
			}
		});
	});
	// Moving the notes
	var trashing = false; // Is trashcan opened
	var timeoutId = 0;
	var selectedElem = null;
	$("body").on("mousedown", ".note", function() {
		// Set selectedElem
		selectedElem = $(this);
		// Set initial offset values
		$(this)[0].offsetX = mouseX - parseInt($(this).css("left"));
		$(this)[0].offsetY = mouseY - parseInt($(this).css("top"));
		// Move loop
		timeoutId = setInterval(() => {
			$(this).css("left", mouseX - $(this)[0].offsetX);
			$(this).css("top", mouseY - $(this)[0].offsetY);
			storeNote($(this)[0]);
		}, 10);
	}).on("mouseup ", function() {
		clearTimeout(timeoutId);
		if (trashing) { // Delete item
			deleteNote(selectedElem[0]);
			selectedElem.remove();
		}
		selectedElem = null;
	});
	// Trash
	$("#trash").hover(function() {
		if (selectedElem != null) {
			selectedElem.css("background-color", "red");
		}
		trashing = true;
	}).on("mouseleave", function() {
		if (selectedElem != null) {
			selectedElem.css("background-color", "yellow");
		}
		trashing = false;
	});

	// Get notes from localStorage
	for (var i in Object.keys(localStorage)) {
		const key = Object.keys(localStorage)[i];
		const noteJson = JSON.parse(localStorage.getItem(key));
		noteJson.id = Object.keys(localStorage)[i];
		createNote(noteJson);
	}
}); 
