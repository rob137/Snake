const gridContainer = document.getElementsByClassName('grid-container')[0];
let gridArr = [];
let maxX, maxY;
let refreshIntervalId;
let timeout = 200;

const head = {
  name: 'head',
  x: 1,
  y: 2,
  bodyLength: 3,
  direction: "left",
  proposedDirection: "left",
  checkDirectionShouldChange: function() {
    return this.direction !== this.proposedDirection
      && !(this.direction === 'up' && this.proposedDirection === 'down')
      && !(this.direction === 'down' && this.proposedDirection === 'up')
      && !(this.direction === 'left' && this.proposedDirection === 'right') 
      && !(this.direction === 'right' && this.proposedDirection === 'left');
  },
  // prevents 'doubling back' hack
  setDirection: function() {
    if (this.checkDirectionShouldChange()) {
      this.direction = this.proposedDirection;
    }
  },
  handleCollision: function(nextHeadLocation) {
    const nextElement = document.getElementsByClassName(nextHeadLocation.elementName)[0];
    if (nextElement.className.search('food') > -1) {
      food.reassign();
      this.grow();
    } else {
      // Need to reset game here
      clearInterval(refreshIntervalId);
      console.log('stopped!');
    }
  },
  
  // reassigns the 'head' html class
  reassign: function() {
    const nextHeadLocation = lookupGridElement(head.x, head.y);
    const currentHeadLocation = document.getElementsByClassName(`head`)[0];
    // Only false at start of game
    if (currentHeadLocation) {
      currentHeadLocation.className = currentHeadLocation.className.replace('head', '');
    }
    if (!nextHeadLocation.empty) {
      this.handleCollision(nextHeadLocation);
    }
    document.getElementsByClassName(nextHeadLocation.elementName)[0].classList.add(head.name);
    
    nextHeadLocation.empty = false;
  },
  
  move: function() {
    this.setDirection();

    // Adjust coords depending on direction
    if (this.direction === 'up') {
      this.y -= 1;
    } else if (this.direction === 'down') {
      this.y += 1;lookupGridElement
    } else if (this.direction === 'left') {
      this.x -= 1;
    } else if (this.direction === 'right') {
      this.x += 1;
    }

    // Make snake appear on opposite side of screen when it reaches the border
    if (this.x === 0) {
      this.x = maxX;
    } else if (this.y === 0) {
      this.y = maxY;
    } else if (this.x === maxX+1) {head
      this.x = 1;
    } else if (this.y === maxY+1) {
      this.y = 1;
    }
    this.reassign();
    this.cleanUp();
    document.getElementsByClassName(lookupGridElement(head.x, head.y).elementName)[0].classList.add('1');
  },
  grow: function() {
    this.bodyLength += 1
  },

  // removes body/head from squares as snake moves
  cleanUp: function() {
    // remove last snake square
    let target = document.getElementsByClassName(`${1}`)[0];
    if (target) {
      target.className = target.className.replace(`${1}`, ``);
    }
  }
}

const food = {
  name: 'food',
  x: 2,
  y: 3,
  reassign: function() {
    let currentFoodLocation = lookupGridElement(food.x, food.y);
    const foodElement = document.getElementsByClassName(`food`)[0];
    // Only false at start of game
    if (foodElement) {
      foodElement.className = foodElement.className.replace('food', '');
    }
    // place on a random empty square
    const newFoodCoords = pickRandomCoords();
    currentFoodLocation.empty = true;
    this.x = newFoodCoords.x;
    this.y = newFoodCoords.y;
    const nextFoodLocation = lookupGridElement(this.x, this.y);
    nextFoodLocation.empty = false;
    document.getElementsByClassName(nextFoodLocation.elementName)[0].classList.add(food.name);
  }
}

function prepareGrid(size) {
  let elementNum = 0
  const grid = [];
  for (let i = 1; i <= size; i++) {
    for (let j = 1; j <= size; j++) {
      grid.push({
        y: i,
        x: j, 
        empty: true,
        elementName: `grid-square-${elementNum}`
      });
      elementNum += 1;
    }
  }
  return grid;
}

function createGrid() {
  const max = gridArr.length;
  for (let i = 0; i < max; i++) {
    gridContainer.innerHTML += `<div class="grid-square grid-square-${i}"></div>`;
  }
}

function handleKeyPress(keyPressed) {
  if (keyPressed === 'ArrowUp') {
    head.proposedDirection = 'up';
  } else if (keyPressed === "ArrowDown") {
    head.proposedDirection = 'down';
  } else if (keyPressed === "ArrowLeft" ) {
    head.proposedDirection = 'left';
  } else if (keyPressed === "ArrowRight") {
    head.proposedDirection = 'right';
  }
}

function lookupGridElement(x, y) {
  return gridArr.find(i => i.x === x && i.y === y);
}

function pickRandomCoords() {
  const x = Math.floor(Math.random()*maxX);
  const y = Math.floor(Math.random()*maxY);
  const gridElement = lookupGridElement(x, y);

  // ensure coords are for empty square
  if (!gridElement.empty) {
    let {x, y} = pickRandomCoords();
  }
  return {x, y};
}

function setInitialCoords(entity) {
  let initialCoords = pickRandomCoords();
  entity.x = initialCoords.x, 
  entity.y = initialCoords.y
}

function listenForInput() {
  window.addEventListener('keydown', (e) => handleKeyPress(e.key));
}

function placeEntities() {
  head.reassign();
  food.reassign();
}

function startMovingSnake(miliseconds) {
  refreshIntervalId = setInterval(() => head.move(), miliseconds);
}

// for starting/resetting
function startGame(miliseconds) {
  head.length = 1;
  placeEntities();
  startMovingSnake(miliseconds);
  listenForInput();
}

// preps the grid, starts initial game
function setUp(size, miliseconds) {
  gridArr = prepareGrid(size);
  maxX = gridArr[gridArr.length-1].x;
  maxY = gridArr[gridArr.length-1].y;
  createGrid();
  setInitialCoords(head); 
  startGame(miliseconds);
}

setUp(50, timeout);