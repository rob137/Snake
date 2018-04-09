const gridContainer = document.getElementsByClassName('grid-container')[0];
let gridArr = [];
let maxX, maxY;
let refreshIntervalId;
let timeout = 75;

// Main snake object.  Contains methods that govern snake's behaviour.
const head = {
  name: 'head',
  // coords
  x: 1,
  y: 2,
  bodyLength: 20,
  direction: "left",
  proposedDirection: "left",
  // Validates user input
  checkDirectionShouldChange: function() {
    return this.direction !== this.proposedDirection &&
      !(this.direction === 'up' && this.proposedDirection === 'down') &&
      !(this.direction === 'down' && this.proposedDirection === 'up') &&
      !(this.direction === 'left' && this.proposedDirection === 'right') &&
      !(this.direction === 'right' && this.proposedDirection === 'left');
  },
  // prevents 'doubling back' hack
  setDirection: function() {
    if (this.checkDirectionShouldChange()) {
      this.direction = this.proposedDirection;
    }
  },
  adjustCoords: function() {
    if (this.direction === 'up') {
      this.y -= 1;
    } else if (this.direction === 'down') {
      this.y += 1;
    } else if (this.direction === 'left') {
      this.x -= 1;
    } else if (this.direction === 'right') {
      this.x += 1;
    }
  },
  // Make snake appear on opposite side of screen when it reaches the border
  accountForEdgeOfScreen: function() {
    if (this.x === 0) {
      this.x = maxX;
    } else if (this.y === 0) {
      this.y = maxY;
    } else if (this.x === maxX+1) {
      this.x = 1;
    } else if (this.y === maxY+1) {
      this.y = 1;
    }
  },
  // With snake body or food
  handleCollision: function(nextHeadLocation) {
    // For collision with food
    if (checkLocationClass(nextHeadLocation, 'food')) {
      food.reassign();
      this.grow();
      // for collision with body
    } else {
      resetGame();
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
    if (checkLocationClass(nextHeadLocation, 'body') || checkLocationClass(nextHeadLocation, 'food')) {
      this.handleCollision(nextHeadLocation);
    } 
    nextHeadLocation.element.classList.add(head.name);
    nextHeadLocation.empty = false;
  },
  // Allows snake tail to grow.
  dropBreadcrumb: function() {
    lookupGridElement(head.x, head.y).element.classList.add('1');
  },
  move: function() {
    this.setDirection();
    this.adjustCoords();
    this.accountForEdgeOfScreen();
    this.reassign();
    this.cleanUp();
    this.dropBreadcrumb();
  },
  grow: function() {
    this.bodyLength += 1;
  },
  // removes body/head from squares as snake moves
  cleanUp: function() {
    // remove last snake square
    const finalBodySquare = document.getElementsByClassName(`${head.bodyLength}`)[0];
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
    let bodyArr = document.getElementsByClassName('body');
    if (bodyArr.length > 1) {
      // Turns HTMLCollection into array 
      bodyArr = Array.prototype
        .slice
        .call(bodyArr)
        // Order arr so that end of snake body is first item
        .sort((i, j) => i.className < j.className);
      let num = bodyArr[0].className.match(/\d+/)[0];
      let targetGrid = gridArr.find(i => i.elementNum === num);
      targetGrid.empty = true;
    }
  }
};

const food = {
  name: 'food',
  x: 2,
  y: 3,
  reassign: function() {
    let currentFoodLocation = lookupGridElement(food.x, food.y);
    const foodElement = document.getElementsByClassName(`food`)[0];
    // Wipe food from className of current food element.  The conditional yields false only at start of game.
    if (foodElement) {
      foodElement.className = foodElement.className.replace('food', '');
    }
    // place on a random empty square
    this.placeOnRandomEmptySquare(currentFoodLocation);
  },
  placeOnRandomEmptySquare: function(currentFoodLocation) {
    const newFoodCoords = pickRandomCoords();
    currentFoodLocation.empty = true;
    this.x = newFoodCoords.x;
    this.y = newFoodCoords.y;
    const nextFoodLocation = lookupGridElement(this.x, this.y);
    nextFoodLocation.empty = false;
    nextFoodLocation.element.classList.add(food.name);
  }
};

// Checks if a given grid square has a class
const checkLocationClass = (location, searchTerm) => {
  return location.element.className.search(`${searchTerm}`) > -1;
}

// creates gridArr, which is used to render grid in DOM
const prepareGrid = (size) => {
  let elementNum = 0;
  const grid = [];
  for (let i = 1; i <= size; i++) {
    for (let j = 1; j <= size; j++) {
      grid.push({
        y: i,
        x: j, 
        empty: true,
        elementNum: elementNum
      });
      elementNum += 1;
    }
  }
  return grid;
};

const renderGrid = () => {
  gridArr.forEach((cell, i) => {
    const element = document.createElement('div');
    element.classList.add('grid-square', `grid-square-${i}`);
    gridContainer.appendChild(element);
    cell.element = element;
  });
};

// Feeds in user direction to Head.  Head then validates/executes with its own methods.
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
};

const lookupGridElement = (x, y) => gridArr.find(i => i.x === x && i.y === y);

const pickRandomCoords = () => {
  const x = Math.ceil(Math.random()*maxX);
  const y = Math.ceil(Math.random()*maxY);
  const gridElement = lookupGridElement(x, y);
  // ensure coords point to an empty square
  if (!gridElement || !gridElement.empty) {
    let {x, y} = pickRandomCoords();
  }
  return {x, y};
};

const setInitialCoords = (entity) => {
  let initialCoords = pickRandomCoords();
  entity.x = initialCoords.x;
  entity.y = initialCoords.y;
};


const placeEntities = () => {
  head.reassign();
  food.reassign();
};

const startMovingSnake = (miliseconds) => refreshIntervalId = setInterval(() => {
  head.move();
}, miliseconds);

const resetGame = () => {
  clearInterval(refreshIntervalId);
  gridContainer.outerHTML = '';
  gridArr = [];
  setUp(50, timeout);
};

// for starting/resetting
const startGame = (miliseconds) => {
  head.length = 1;
  placeEntities();
  startMovingSnake(miliseconds);  
};

const listenForInput = () => window.addEventListener('keydown', (e) => handleKeyPress(e.key));

// preps the grid, starts initial game
const setUp = (size, miliseconds) => {
  gridArr = prepareGrid(size);
  maxX = gridArr[gridArr.length-1].x;
  maxY = gridArr[gridArr.length-1].y;
  renderGrid();
  setInitialCoords(head); 
  startGame(miliseconds);
  listenForInput();
};

setUp(50, timeout);