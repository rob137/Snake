const gridContainer = document.getElementsByClassName('grid-container')[0];
let gridArr = [];
let maxX, maxY;
let refreshIntervalId;
let timeout = 150;

// Main snake object.  Contains methods governing its behaviour.
const head = {
  name: 'head',
  // coords
  x: 1,
  y: 2,
  bodyLength: 3,
  direction: "left",
  proposedDirection: "left",
  // Validates user input
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
  // With snake body or food
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

  // Needs refactor!
  // removes body/head from squares as snake moves
  cleanUp: function() {
    // remove last snake square
    let finalBodySquare = document.getElementsByClassName(`${head.bodyLength}`)[0];
    if (finalBodySquare) {                                                            
      finalBodySquare.className = finalBodySquare.className.replace(` ${head.bodyLength} body`, ``);
    }
    // increment remaining body squares
    for (var i = head.bodyLength-1; i > 0; i--) {
      let target = document.getElementsByClassName(`${i}`)[0];
      if (target) {                              // hack for now!
        target.className = target.className.replace('body', '').replace(` ${i}`, ` ${i+1} body`);
      } 
    }

    // sets the trailing empty square in gridArr to 'empty: true' (most recent square behind the snake)
    let a = document.getElementsByClassName('body')
    if (a.length > 1) {
      a = Array.prototype
        .slice
        .call(a)
        .sort((i, j) => i.className < j.className)
      let num = a[0].className.match(/\d+/)[0];
      let targetGrid = gridArr.find(i => i.elementName === `grid-square-${num}`);
      targetGrid.empty = true;
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

const prepareGrid = (size) => {
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

const createGrid = () => {
  const max = gridArr.length;
  for (let i = 0; i < max; i++) {
    gridContainer.innerHTML += `<div class="grid-square grid-square-${i}"></div>`;
  }
}

const handleKeyPress = (keyPressed) => {
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

const lookupGridElement = (x, y) => gridArr.find(i => i.x === x && i.y === y);

const pickRandomCoords = () => {
  const x = Math.floor(Math.random()*maxX);
  const y = Math.floor(Math.random()*maxY);
  const gridElement = lookupGridElement(x, y);

  // ensure coords are for empty square
  if (!gridElement.empty) {
    let {x, y} = pickRandomCoords();
  }
  return {x, y};
}

const setInitialCoords = (entity) => {
  let initialCoords = pickRandomCoords();
  entity.x = initialCoords.x, 
  entity.y = initialCoords.y
}

const listenForInput = () => window.addEventListener('keydown', (e) => handleKeyPress(e.key));

const placeEntities = () => {
  head.reassign();
  food.reassign();
}

const startMovingSnake = (miliseconds) => refreshIntervalId = setInterval(() => head.move(), miliseconds);

// for starting/resetting
const startGame =(miliseconds) => {
  head.length = 1;
  placeEntities();
  startMovingSnake(miliseconds);
  listenForInput();
}

// preps the grid, starts initial game
const setUp = (size, miliseconds) => {
  gridArr = prepareGrid(size);
  maxX = gridArr[gridArr.length-1].x;
  maxY = gridArr[gridArr.length-1].y;
  createGrid();
  setInitialCoords(head); 
  startGame(miliseconds);
}

setUp(50, timeout);