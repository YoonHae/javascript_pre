// document 가 모두 구성되면 호출됨. load() 와 같은...
$(document).ready(function() {
	var circleNumber = 0;
	var circleType =  {
		// speed: 두 점간의 이동 소요시간 (ms)
		option: ["color", "width", "border-radius", "speed"],
		small: ["black", 5, 2.5, 3000],
		medium: ["blue", 15,  7.5, 4000],
		large: ["yellow", 30, 15, 5000]
	}
	
	// 시간
	var t = 0;
	// 게임 실행여부
	var gameOn = false;
	
	//마우스 좌표
	var mouseX;
	var mouseY;
	
	$("body").mousemove(function(event) {
		mouseX = event.pageX;
		mouseY = event.pageY;
	});
	
	function timer() {
		if(gameOn) {
			
			setTimeout(function() {
				t = t+0.01;
				$(".timer").html(`
					 <h1>
						<div class="center">${t.toFixed(2)}</div>
					 </h1>`
				);
				timer();
				
			}, 100);
		}
	}
	
	
	$(".startbutton").click(function(){
		$(".startbutton").fadeToggle(500, function(){
			gameOn = true;
			timer();
			
			$(".space").mouseenter(function() {
				// screen 에서 벗어나서 space 에 진입하면 게임끝
				endGame();
			});
			
			createCircle();  // 최초의 공생성
		})
	})
	
	// 공을 생성하는 함수
	function createCircle() {
		// small medium large 셋중 하나를 랜덤하게 생성
		var r = Math.floor(3*Math.random())+1;
		
		if (r === 1) {
			var choice = "small";
		} else if (r === 2) {
			var choice = "medium";
		} else {
			var choice = "large";
		}
		
		var circleName =  "circle" + circleNumber++;
		var ccolor =  circleType[choice][0];
		var csize =  circleType[choice][1];
		var cradius =  circleType[choice][2];
		var cspeed =  circleType[choice][3];
		
		// 이동가능 거리
		var moveableWidth = $("body").width() - csize;
		var moveableHeight = $("body").height() - csize;
		
		// 초기 시작 좌표
		var positionLeft = (moveableWidth * Math.random()).toFixed();
		var positionTop = (moveableHeight * Math.random()).toFixed();
		
		var newCircle = `<div class='circle' id="${circleName}"></div>`;
		$("body").append(newCircle);
		$("#"+circleName).css({
			"background-color": ccolor,
			"width": csize +  "vmin",
			"height": csize +  "vmin",
			"border-radius": cradius + "vmin",
			"top": positionTop + "px",
			"left": positionLeft + "px"
			
		});
		
		function timeCirclePosition(circleTrackId){
			setTimeout(function() {
				var currentCirclePosition  = $(circleTrackId).position();
				
				if (currentCirclePosition === undefined)
					return;
				var calculateRadius = parseInt($(circleTrackId).css("width"))*0.5;
				
				//  마우스 - 원의 중점 사이 거리
				var distanceX = mouseX - (currentCirclePosition.left + calculateRadius);
				var distanceY = mouseY - (currentCirclePosition.top + calculateRadius);
				
				if(Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2)) < calculateRadius) {
					$(circleTrackId).removeClass('circle').addClass('redcircle');
					$(circleTrackId).css("background-color", "red");
					endGame();
				}
				
				timeCirclePosition(circleTrackId);
			}, 100);
		}
		
		timeCirclePosition("#" + circleName);
		
		animateCircle(circleName, cspeed, csize);
		
		setTimeout(function() {
			if (gameOn)
				createCircle();
			}, 3000);
		
	}
	
	function animateCircle(circleId, speed, circleSize) {
		var moveableWidth = $("body").width() - circleSize;
		var moveableHeight = $("body").height() - circleSize;	
		
		var circleMoveLeft = (moveableWidth * Math.random()).toFixed();
		var circleMoveTop = (moveableHeight * Math.random()).toFixed();
		
		$("#"+circleId).animate({
			left: circleMoveLeft,
			top: circleMoveTop
		}, speed, function() {
			animateCircle(circleId, speed, circleSize);
		});
	}
	
	function endGame() {
		if (gameOn) {
			gameOn = false;
			updateScore(t);
			$(".circle").remove();
			$(".redcircle").stop();
			console.log('end');
		}
	}
	
	
	var highScore = [0.00, 0.00, 0.00, 0.00, 0.00];
	
	function updateScore(newScore) {
		var check = false;
		var idx = 999;
		for(var i = 0; i < highScore.length; i++){
			if (!check && highScore[i] < newScore) {
				highScore.splice(4, 1); // 맨 끝에 제거
				highScore.splice(i, 0, newScore);
				idx = i;
				check = true;
			}

			$("#highscores").append(`<div class='score center' id='score${i+1}'><h2>${highScore[i].toFixed(2)}</h2></div>`)
		}

		
		
		$("#highscores").append(`<div class='resetButton center'><h2>Play Again</h2><div>`);
		$("#score" + (idx+1)).css("color", "red");
		$(".timer").html("test");
		
		$("#highscores").toggle();
		
		$(".resetButton").click(function () {
			gameReset();
		});
	}
	
	function gameReset() {
		$("#highscores").fadeToggle(100, function() {
			t = 0;
			$(".timer").html(`
					 <h1>
						<div class="center">${t.toFixed(2)}</div>
					 </h1>`
				);
			
			$(".score").remove();
			$(".redcircle").remove();
			$(".startbutton").toggle();
			$(".resetButton").remove();


			
		});
	}
	
});












