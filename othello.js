;(function() {

  var cells = [];
  var boardEl = document.getElementById("board");
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
    var cell;
    for (var x = 0; x <= 7; x++) {
      for (var y = 0; y <= 7; y++) {
        var index = cells[x][y];
        switch(classes[index]) {
          case null: 
            cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('data-x', x);
            cell.setAttribute('data-y', y);
            cell.onclick = function(e) {
              var target = (e.srcElement || e.target);
              x = Number(target.getAttribute('data-x'));
              y = Number(target.getAttribute('data-y'));
              return putPiece(x, y);
            }
            cell.onmouseover = function(e) {
              var target = (e.srcElement || e.target);
              if( target.classList.value != "cell" ) return;
              target.classList.add('hover');
            };
            cell.onmouseout = function(e) {
              var target = (e.srcElement || e.target);
              target.classList.remove('hover');
            };
            boardEl.appendChild(cell);
            break;
          case 'white': 
            cell = document.createElement('div');
            cell.classList.add('cell');
            cell.classList.add('white');
            cell.setAttribute('data-x', x);
            cell.setAttribute('data-y', y);
            boardEl.appendChild(cell);
            break;
          case 'black': 
            cell = document.createElement('div');
            cell.classList.add('cell');
            cell.classList.add('black');
            cell.setAttribute('data-x', x);
            cell.setAttribute('data-y', y);
            boardEl.appendChild(cell);
            break;
        }
      }
    }
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
                flip(flipX, flipY);
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

  var flip = function(x, y) {
    var index = getCellIndex(x, y);
    removeClassName = playerFlag == 1 ? classes[2] : classes[1];
    board.childNodes[index].classList.remove(removeClassName)
    board.childNodes[index].classList.add(classes[playerFlag]);
  }

  var getCellIndex = function(x, y) {
    return ((8 * Number(x)) + Number(y)) + 1;
  };

  var putPiece = function(x, y) {
    if( cells[x][y] !== 0 ) {
      return;
    }

    if(! flipCheck(x, y) ) {
      cells[x][y] = 0;
      return;
    } else {
      cells[x][y] = playerFlag;
      flip(x, y);
    }
    playerFlag = playerFlag == 1 ? 2 : 1;
  };

  // 開始
  init();

})();   
