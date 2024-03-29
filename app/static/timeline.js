$(document).ready(function() {
    var paused = true;
    var interval;
    var currentTime = 0;
    var duration = 2 * 60 * 24;
    var pButton = document.getElementById('pButton'); // play button
    var playhead = document.getElementById('playhead'); // playhead
    var timeline = document.getElementById('timeline'); // timeline



    var hours = 00;
    var minutes = 00;
    var seconds = 00;
    $("#clock").html(
        $("<div>").append($("<h3>").text("Time: 00:00"))
    );

    updateStatus = function() {
	var text = "Ok";
	var color = "green";
	paused = true;
	if (overflow_status == 1) {
	    paused = false;
	    text = "Error";
	    color = "red";
	    $('#btn1').addClass('pActive');
	    var metadata = $("<div>").append($("<h1 style = 'margin-top: 60px;'>").text("Batterien verwenden"));

	    var info = $("<div>").append($("<h3>").text("Die Batterien des Solarparks Gondelsheim werden zugestaltet, um die Leitung Bruchsal-Gondelsheim zu entlasten. Gleichzeitig wird die Windkraftanlage Eppingen gedrosselt."));
	    var cost = $("<div>").append($("<h3>").text("Kosten: 150000€"));
	    var avail = $("<div>").append($("<h4>").text("Verfügbarkeit: 4:00h"));
	    var content = $("<div>")
		.append(metadata)
		.append(info).append(cost).append(avail);
	    $(".data").html(content);

	}
	else {
	    $(".data").html("");
	}
	play();
	$("#status").html($("<div>").append($("<h3>").text("Status: " + text)).css("color", color));

    };
    // overflow_status = 1;
    updateStatus();

    // timeline width adjusted for playhead
    var timelineWidth = 200;

    // play button event listenter
    pButton.addEventListener("click", play);


    // makes timeline clickable
    timeline.addEventListener("click", function(event) {
	moveplayhead(event);
    }, false);

    // returns click as decimal (.77) of the total timelineWidth
    function clickPercent(event) {
	return (event.clientX - getPosition(timeline)) / timelineWidth;
    }

    // makes playhead draggable
    playhead.addEventListener('mousedown', mouseDown, false);
    window.addEventListener('mouseup', mouseUp, false);

    // Boolean value so that audio position is updated only when the playhead is released
    var onplayhead = false;

    // mouseDown EventListener
    function mouseDown() {
	onplayhead = true;
	window.addEventListener('mousemove', moveplayhead, true);
    }

    // mouseUp EventListener
    // getting input from all mouse clicks
    function mouseUp(event) {
	if (onplayhead == true) {
	    moveplayhead(event);
	    window.removeEventListener('mousemove', moveplayhead, true);
	    // change current time
	}
	onplayhead = false;
    }
    // mousemove EventListener
    // Moves playhead as user drags
    function moveplayhead(event) {
	var newMargLeft = event.clientX - getPosition(timeline);

	if (newMargLeft >= 0 && newMargLeft <= timelineWidth) {
	    playhead.style.marginLeft = newMargLeft + "px";
	    currentTime = (timelineWidth * (newMargLeft / duration));
	}
	if (newMargLeft < 0) {
	    playhead.style.marginLeft = "0px";
	    currentTime = 0;
	}
	if (newMargLeft > timelineWidth) {
	    playhead.style.marginLeft = timelineWidth + "px";
	    currentTime = duration;
	}
    }

    // timeUpdate
    // Synchronizes playhead position with current point in audio
    function timeUpdate() {
        var playPercent = timelineWidth * (currentTime / duration);
        playhead.style.marginLeft = playPercent + "px";
        var timeString = "Time: ";
        if (minutes < 10) {
            timeString += "0" + minutes + ":";
        } else {
            timeString += minutes + ":";
        }
        if (seconds < 10) {
            timeString += "0" + seconds;
        } else {
            timeString += seconds;
        }
	var time = $("<div>").append($("<h3>").text(timeString));
	var playPercent = timelineWidth * (currentTime / duration);
	playhead.style.marginLeft = playPercent + "px";
	$("#clock").html(time);
	playhead.style.marginLeft = playPercent + "px";
	$.post( "/ticktock", {
	    javascript_data: currentTime,
	    success: function() {
		$.ajax({
		    url: "/eval_network",
		    dataType: 'json',
		    contentType: 'application/json',
		    mimeType: 'application/json',
		    success: function(data) {
			isMax = false;
			source.getFeatures().forEach(function(f) {
			    for (var i = 0; i < data[1].length; i++) {
				if (data[1][i].id == f.O.id) {
				    f.flow = data[1][i].flow;
				    if (f.flow > 75000) {
					isMax = true;
				    }
				}
			    }
			});
			if (isMax) {
			    overflow_status = 1;
			    updateStatus();
			}
			layer.getSource().changed();
		    }
		});
	    }
	});
    }

    //Play and Pause
    function play() {
	if (paused) {
	    paused = false;
	    // remove play, add pause
	    pButton.className = "";
	    pButton.className = "pause";
	    interval = setInterval(function() {
		currentTime += 5;
		seconds += 30;
		if (seconds == 60) {
		    seconds = 00;
		    minutes += 1;
		}
		if (minutes == 60) {
		    minutes = 00;
		    hours += 1;
		}
		if (hours == 24) {
		    hours = 0;
		    currentTime = 0;
		}
		timeUpdate();
	    }, 2000);

	} else {
	    paused = true;
	    pButton.className = "";
	    pButton.className = "play";
	    clearInterval(interval);
	    interval = 0;
	}
    }

    // Returns elements left position relative to top-left of viewport
    function getPosition(el) {
	return el.getBoundingClientRect().left;
    }
});
