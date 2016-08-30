;(function() {

	var cells = [];
	var boardEle = $("#board");
	var playerFlag = 1;
	var classes = [
		null,
		'white',
		'black'
	];
	var flips;
	var isFlipped;
	var pieceCounter = {
		white: 2,
		black: 2
	};

	var render = function() {
		var whiteCount = 0;
		var blackCount = 0;
		for (var x = 0; x <= 7; x++) {
			for (var y = 0; y <= 7; y++) {
				var index = cells[x][y];
				switch(classes[index]) {
					case null: 
						boardEle.append('<div data-x='+x+' data-y='+y+' class="cell"></div>');
						break;
					case 'white': 
						whiteCount++;
						boardEle.append('<div data-x='+x+' data-y='+y+' class="cell white"></div>');
						break;
					case 'black': 
						blackCount++;
						boardEle.append('<div data-x='+x+' data-y='+y+' class="cell black"></div>');
						break;
				}
			}
		}
		pieceCounter.white = whiteCount;
		pieceCounter.black = blackCount;
		$("#player").text(playerFlag == 1 ? "白" : "黒");
		$("#whiteCount").text(pieceCounter.white);
		$("#blackCount").text(pieceCounter.black);
	};

	var init = function() {
		for (var x = 0; x <= 7; x++) {
			cells[x] = [];
			for (var y = 0; y <= 7; y++) {
				cells[x][y] = 0;
			}
		}
		cells[3][3] = 1;
		cells[3][4] = 2;
		cells[4][3] = 2;
		cells[4][4] = 1;
		render();
	};

	var flipCheck = function(x, y) {
		isFlipped = false;
		for (var i = -1; i <= 1; i++) {
			for (var k = -1; k <= 1; k++) {
				var checkX = x + i;
				var checkY = y + k;

				if( checkX < 0 || checkX > 7 ) continue;
				if( checkY < 0 || checkY > 7 ) continue;

				if( (playerFlag != cells[checkX][checkY]) && (0 != cells[checkX][checkY]) ) {
					flips = [{x: checkX, y: checkY}];
					while(true) {
						checkX += i;
						checkY += k;
						if( checkX < 0 || checkX > 7 ) break;
						if( checkY < 0 || checkY > 7 ) break;

						if( cells[checkX][checkY] == 0 ) {
							break;
						} else if( cells[checkX][checkY] == playerFlag ) {
							for (var flipIndex = 0; flipIndex < flips.length; flipIndex++) {
								isFlipped = true;
								var flipX = flips[flipIndex]['x'];
								var flipY = flips[flipIndex]['y'];
								cells[flipX][flipY] = playerFlag;
							}
							break;
						} else {
							flips.push({x: checkX, y: checkY});
						}
					}
				}
			}
		}
		return isFlipped;
	};

	$(document).on("click", ".cell", function() {
		var x = $(this).data('x');
		var y = $(this).data('y');

		if( cells[x][y] !== 0 ) {
			return;
		}

		cells[x][y] = playerFlag;
		if(! flipCheck(x, y) ) {
			cells[x][y] = 0;
			return;
		}
		boardEle.children().remove();
		render();

		playerFlag = playerFlag == 1 ? 2 : 1;
	});

	// 開始
	init();

})();		
