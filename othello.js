;(function() {

  var cells = [];
  var boardEl = document.getElementById("board");
  var whiteCountEl = document.getElementById("whiteCount");
  var blackCountEl = document.getElementById("blackCount");
  var logTableBodyEl = document.getElementById("logTableBody");
  var playerFlag = 1; // 白から
  var logs = [];
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
  var isCPUPlay = true;
  var CPULoadingSecounds = 1000;

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

  var start = function() {
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
    pieceCounter();    
  };

  var flipCheck = function(x, y) {
    isFlipped = false;
    flips = getFlipingCells(x, y);
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
    var pairPlayerFlag = getPairPlayerFlag();
    removeClassName = classes[pairPlayerFlag];
    board.childNodes[index].classList.remove(removeClassName);
    board.childNodes[index].classList.add(classes[playerFlag]);
  }

  var pieceCounter = function() {
    whiteCount = 0;
    blackCount = 0;
    for (var x = 0; x <= 7; x++) {
      for (var y = 0; y <= 7; y++) {
        var index = cells[x][y];
        switch(classes[index]) {
          case null: break;
          case 'white': whiteCount++; break;
          case 'black': blackCount++; break;
        }
      }
    }
    whiteCountEl.innerText = whiteCount;
    blackCountEl.innerText = blackCount;
  };

  var addLog = function(x, y) {
    logs.push({
      player: playerFlag,
      x: x,
      y: y,
      cellIndex: getCellIndex(x, y)
    });
    tr = document.createElement('tr');
    timeTD = document.createElement('td');
    timeTD.innerText = getTimeNow();
    playerTD = document.createElement('td');
    playerTD.innerText = classes[playerFlag];
    positionTD = document.createElement('td');
    positionTD.innerText = (x + 1) + "," + (y + 1);
    tr.appendChild(timeTD);
    tr.appendChild(playerTD);
    tr.appendChild(positionTD);
    logTableBodyEl.appendChild(tr);
  }

  var getTimeNow = function() {
    var date = new Date();
    var h, i, s;
    h = date.getHours();
    m = date.getMinutes();
    s = date.getSeconds();
    return h + "時" + m + "分" + s + "秒";
  }

  var getCellIndex = function(x, y) {
    return ((8 * x) + y);
  };

  var getPairPlayerFlag = function() {
    return playerFlag == 1 ? 2 : 1;
  }

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
      addLog(x, y);
      pieceCounter();
    }
    playerFlag = getPairPlayerFlag();
    if( isCPUPlay && playerFlag != 1 ) {
      setTimeout(cpu, CPULoadingSecounds);
    }
  };

  var cpu = function() {
    var maxFlipingCount = 0;
    var cpuPutCell = null;
    var possibleCells = [];
    for (var x = 0; x <= 7; x++) {
      for (var y = 0; y <= 7; y++) {
        if( cells[x][y] == 0 ) {
          possibleCells.push({
            x: x,
            y: y
          });
          var flipingCells = getFlipingCells(x, y);
          if( maxFlipingCount < flipingCells.length ) {
            maxFlipingCount = flipingCells.length;
            cpuPutCell = {x:x, y:y};
          }
        } 
      }
    }
    if( cpuPutCell != null ) {
      putPiece(cpuPutCell.x, cpuPutCell.y);
    } else {
      playerFlag = getPairPlayerFlag();
      alert(classes[playerFlag] + ' Turn');
    }
  };

  var getFlipingCells = function(x, y) {
    for (var i = -1; i <= 1; i++) {
      for (var k = -1; k <= 1; k++) {
        var checkX = x + i;
        var checkY = y + k;

        if( checkX < 0 || checkX > 7 ) return [];
        if( checkY < 0 || checkY > 7 ) return [];

        if( (playerFlag != cells[checkX][checkY]) && (0 != cells[checkX][checkY]) ) {
          flips = [{x: checkX, y: checkY}];
          while(true) {
            checkX += i;
            checkY += k;
            if( checkX < 0 || checkX > 7 ) return [];
            if( checkY < 0 || checkY > 7 ) return [];

            if( cells[checkX][checkY] == 0 ) {
              return [];
            } else if( cells[checkX][checkY] == playerFlag ) {
              return flips;
            } else {
              flips.push({x: checkX, y: checkY});
            }
          }
        }
      }
    }
    return [];
  }

  // 開始
  start();

})();   
