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
  var pieceCounter = {
    white: 2,
    black: 2
  };
  var playerRate = {
    white: 0,
    black: 0
  };
  var isCPUPlay = true;
  var CPULoadingSecounds = 1000;

  // 評価表
  const CELLS_RATING = [
    [30, -12, 0, -1, -1, 0, -12, 30],
    [-12, -15, -3, -3, -3, -3, -15, -12],
    [0, -3, 0, -1, -1, 0, -3, 0],
    [-1, -3, -1, -1, -1, -1, -3, -1],
    [-1, -3, -1, -1, -1, -1, -3, -1],
    [0, -3, 0, -1, -1, 0, -3, 0],
    [-12, -15, -3, -3, -3, -3, -15, -12],
    [30, -12, 0, -1, -1, 0, -12, 30],
  ];

  var initRender = function() {
    var whiteCount = 0;
    var blackCount = 0;
    var cell;
    for (var x = 0; x <= 7; x++) {
      for (var y = 0; y <= 7; y++) {
        var playerIndex = cells[x][y];
        switch(classes[playerIndex]) {
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

  var gameStart = function() {
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
    initRender();
    setPieceCounter();    
    setPlayerRating();
  };

  var flipCheck = function(x, y) {
    flips = getFlippedCells(x, y);
    if( flips.length === 0 ) {
      return false;
    } else {
      for (var flipIndex = 0; flipIndex <= flips.length - 1; flipIndex++) {
        var flipX = flips[flipIndex]['x'];
        var flipY = flips[flipIndex]['y'];
        cells[flipX][flipY] = playerFlag;
        flip(flipX, flipY);
      }
      return true;
    }
  };

  var flip = function(x, y) {
    var cellIndex = getCellIndex(x, y);
    var pairPlayerFlag = getPairPlayerFlag();
    removeClassName = classes[pairPlayerFlag];
    board.childNodes[cellIndex].classList.remove(removeClassName);
    board.childNodes[cellIndex].classList.add(classes[playerFlag]);
  };

  var setPieceCounter = function() {
    whiteCount = 0;
    blackCount = 0;
    for (var x = 0; x <= 7; x++) {
      for (var y = 0; y <= 7; y++) {
        var playerIndex = cells[x][y];
        switch(classes[playerIndex]) {
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
    positionTD.innerText = "縦"+ (x + 1) + " 横" + (y + 1);
    tr.appendChild(timeTD);
    tr.appendChild(playerTD);
    tr.appendChild(positionTD);
    logTableBodyEl.appendChild(tr);
  };

  var getTimeNow = function() {
    var date = new Date();
    var h, i, s;
    h = date.getHours();
    m = date.getMinutes();
    s = date.getSeconds();
    return h + "時" + m + "分" + s + "秒";
  };

  var getCellIndex = function(x, y) {
    return ((8 * x) + y);
  };

  var getPairPlayerFlag = function() {
    return playerFlag == 1 ? 2 : 1;
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
      addLog(x, y);
      setPieceCounter();
      setPlayerRating();
    }

    if( isGameEnd() ) {
      return;
    }

    playerFlag = getPairPlayerFlag();
    if( isCPUPlay && playerFlag != 1 ) {
      setTimeout(moveCPU, CPULoadingSecounds);
    }
  };

  var moveCPU = function() {
    var maxFlipingCount = 0;
    var maxCellRating = 0;
    var cpuPutCell = null;
    var possibleCells = getPossibleCells();
    for (var i = 0; i <= possibleCells.length - 1; i++) {
      if( i == 0 ) maxCellRating = possibleCells[i].cellRating;      
      if( maxCellRating <= possibleCells[i].cellRating ) {
        maxCellRating = possibleCells[i].cellRating;
        cpuPutCell = {x:possibleCells[i].x, y:possibleCells[i].y};
      }
    }

    if( cpuPutCell != null ) {
      putPiece(cpuPutCell.x, cpuPutCell.y);

      // 白の打てる場所があるか確認
      possibleCells = getPossibleCells();
      if( possibleCells.length == 0 ) {
        playerFlag = getPairPlayerFlag();
        alert(classes[playerFlag] + ' Turn');
        moveCPU();
      }
    } else {
      playerFlag = getPairPlayerFlag();
      alert(classes[playerFlag] + ' Turn');
    }
  };

  var getPossibleCells = function() {
    var possibleCells = [];
    for (var x = 0; x <= 7; x++) {
      for (var y = 0; y <= 7; y++) {
        if( cells[x][y] == 0 ) {
          var flipingCells = getFlippedCells(x, y);
          if( flipingCells.length > 0 ) {
            possibleCells.push({
              x: x,
              y: y,
              cellRating: CELLS_RATING[x][y],
              flipingCells: flipingCells
            });
          }
        } 
      }
    }
    return possibleCells;
  };

  var getFlippedCells = function(x, y) {
    flips = [];
    for (var i = -1; i <= 1; i++) {
      for (var k = -1; k <= 1; k++) {
        var checkX = x + i;
        var checkY = y + k;

        if( checkX < 0 || checkX > 7 ) continue;
        if( checkY < 0 || checkY > 7 ) continue;

        if( (playerFlag != cells[checkX][checkY]) && (0 != cells[checkX][checkY]) ) {
          var tmpFlips = [{x: checkX, y: checkY}];
          while(true) {
            checkX += i;
            checkY += k;
            if( checkX < 0 || checkX > 7 ) {
              tmpFlips = []; 
              break;
            } else if( checkY < 0 || checkY > 7 ) {
              tmpFlips = []; 
              break;
            } else if( cells[checkX][checkY] == 0 ) {
              tmpFlips = [];
              break;
            } else if( cells[checkX][checkY] == playerFlag ) {
              break;
            } else {
              tmpFlips.push({x: checkX, y: checkY});
            }
          }
          flips = flips.concat(tmpFlips);
        }
      }
    }
    return flips;
  };

  var setPlayerRating = function() {
    for (var x = 0; x <= 7; x++) {
      for (var y = 0; y <= 7; y++) {
        var rating = CELLS_RATING[x][y];
        var playerIndex = cells[x][y];
        if( playerIndex != 0 ) {
          playerRate[classes[playerIndex]] += rating;
        } 
      }
    }
  };

  var isGameEnd = function() {
    for (var x = 0; x <= 7; x++) {
      if( cells[x].indexOf(0) >= 0 ) {
        return false;
      }
    }
    if( whiteCount == blackCount ) {
      alert('Draw...');
    } else if( whiteCount > blackCount ) {
      alert('You Win');
    } else {
      alert('You Lose...');
    }
    return true;
  };

  // 開始
  gameStart();

})();   
