var noteCounter = 0;
var mouseX = 0;
var mouseY = 0;
/**
 * Creates a note and adds it to the document
 * @constructor
 */
function createNote() {
	let noteDiv = document.createElement("div");
	noteDiv.id = `note${noteCounter}`;
	noteCounter += 1;
	noteDiv.classList.add("note");
	noteDiv.innerHTML = "Click to edit content";
	// Moving
	noteDiv.style.position = "absolute";
	noteDiv.style.top = "0px";
	noteDiv.style.left = "0px";
	// Mouse position when started
	noteDiv.offsetX = 0;
	noteDiv.offsetY = 0;
	// Is being edited
	noteDiv.editing = false;
	noteDiv.addEventListener("click", () => {
		if (!noteDiv.editing) {
			noteDiv.editing = true;
			noteDiv.innerHTML = `
				<input type="text" value="${noteDiv.innerHTML}">
			`;
		}
	});
	$("body").append(noteDiv);
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
				$(this)[0].editing = false;
				$(this)[0].innerHTML = $(this)[0].children[0].value;
			}
		});
	});
	// Moving the notes
	var timeoutId = 0;
	$("body").on("mousedown", ".note", function() {
		// Set initial offset values
		$(this)[0].offsetX = mouseX - parseInt($(this).css("left"));
		$(this)[0].offsetY = mouseY - parseInt($(this).css("top"));
		// Move loop
		timeoutId = setInterval(() => {
			$(this).css("left", mouseX - $(this)[0].offsetX);
			$(this).css("top", mouseY - $(this)[0].offsetY);
		}, 10);
	}).on("mouseup ", function() {
		clearTimeout(timeoutId);
	});
}); 
