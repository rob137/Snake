let gridState = [];
let maxX, maxY;
let refreshIntervalId;
const timeout = 100;

// Main snake object.  Contains methods that govern snake's behaviour.
const snake = {
  name: 'snake',
  // coords of head
  x: 1,
  y: 2,
  snakeLength: 10,
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
  handleCollision: function(nextSnakeLocation) {
    // For collision with food
    if (confirmLocationClass(nextSnakeLocation, 'food')) {
      food.reassign();
      this.grow();
      // for collision with body
    } else {
      restartGame();
    }
  },
  moveHead: function() {
    const currentPosition = gridState.filter(i => i.contains === 'head')[0]
    // Update snake head's current location (about to be former location) in gridState and DOM
    if (currentPosition) {
      // update state
      currentPosition.contains = 'body';  
      // update DOM
      currentPosition.element.className = currentPosition.element.className.replace('head', '');
    }
    
    const nextSnakeLocation = lookupGridStateItem(this.x, this.y);
    if (confirmLocationClass(nextSnakeLocation, 'body') || confirmLocationClass(nextSnakeLocation, 'food')) {
      this.handleCollision(nextSnakeLocation);
    } 
    // Update next location in DOM and gridState;
    nextSnakeLocation.element.classList.add('head');
    nextSnakeLocation.contains = 'head';
  },
  setBodySegment: function() {
    // in state
    gridState.find(i => i.x === this.x && i.y === this.y).bodySegment = 1;
    // in DOM
    lookupGridStateItem(this.x, this.y).element.classList.add('1');
  },
  grow: function() {
    this.snakeLength += 1;
  },
  // increment remaining body squares
  moveBody: function() {
    for (let i = this.snakeLength; i > 0; i--) {
      const targetInState = gridState.find(gridSquare => gridSquare.bodySegment === i);
      if (targetInState) {
        // update state
        targetInState.bodySegment += 1; 
        targetInState.contains = 'body';
        // update DOM
        targetInState.element.className = targetInState.element.className
          .replace('body', '') // prevents duplicate body classes in html element
          .replace(` ${targetInState.bodySegment-1}`, ` ${targetInState.bodySegment} body`);
      }
    }
  },
  // remove trailing body block - eg if snakeLength is 11, then remove square 12
  cleanUp: function() {
    const finalBodySegment = gridState.find(i => i.bodySegment === this.snakeLength+1);
    // Conditonal because the end of the body won't be assigned for initial frame(s) of of game
    if (finalBodySegment) {
      finalBodySegment.element.className = finalBodySegment.element.className
        .replace(` ${this.snakeLength+1} body`, ``);
      finalBodySegment.contains = 'empty';
      finalBodySegment.bodySegment = null;
   } 
  },
  findBodySegment: function(element) {
    return Number(element.className.match(/ [0-9]+ /)[0]);
  },

  move: function() {
    this.setDirection();
    this.adjustCoords();
    this.accountForEdgeOfScreen();
    this.moveHead();
    this.moveBody();
    this.cleanUp();
    this.setBodySegment();
  }
};

const food = {
  name: 'food',
  x: 2,
  y: 3,
  reassign: function() {
    let currentFoodLocation = lookupGridStateItem(food.x, food.y);
    
    const foodGrid = gridState.find(i => i.contains === 'food');
    // Wipe food from className of current food element.  The conditional yields false only at start of game.
    if (foodGrid) {
      foodGrid.element.className = foodGrid.element.className.replace('food', '');
    }
    // place on a random empty square
    this.placeOnRandomEmptySquare(currentFoodLocation);
  },
  placeOnRandomEmptySquare: function(currentFoodLocation) {
    const newFoodCoords = pickRandomCoords();
    currentFoodLocation.contains = 'empty';
    this.x = newFoodCoords.x;
    this.y = newFoodCoords.y;
    const nextFoodLocation = lookupGridStateItem(this.x, this.y);
    nextFoodLocation.contains = 'food';
    nextFoodLocation.element.classList.add(food.name);
  }
};

// Checks if a given grid square has a class
const confirmLocationClass = (location, searchTerm) => {
  return location.element.className.search(`${searchTerm}`) > -1;
}

// creates gridState, which is used to render grid in DOM
const prepareGrid = (size) => {
  let elementNum = 0;
  const output = [];
  for (let i = 1; i <= size; i++) {
    for (let j = 1; j <= size; j++) {
      output.push({
        y: i,
        x: j, 
        contains: 'empty',
        bodySegment: null,
        elementNum: elementNum
      });
      elementNum += 1;
    }
  }
  return output;
};

const renderGrid = () => {
  gridState.forEach((cell, i) => {
    const element = document.createElement('div');
    const gridContainer = document.getElementsByClassName('grid-container')[0];
    element.classList.add('grid-square', `grid-square-${i}`);
    gridContainer.appendChild(element);
    cell.element = element;
  });
};

// Feeds in user direction to snake.  snake then validates/executes with its own methods.
const handleKeyPress = (keyPressed) => {
  if (keyPressed === 'ArrowUp') {
    snake.proposedDirection = 'up';
  } else if (keyPressed === "ArrowDown") {
    snake.proposedDirection = 'down';
  } else if (keyPressed === "ArrowLeft" ) {
    snake.proposedDirection = 'left';
  } else if (keyPressed === "ArrowRight") {
    snake.proposedDirection = 'right';
  }
};

const lookupGridStateItem = (x, y) => gridState.find(grid => grid.x === x && grid.y === y);

const pickRandomCoords = () => {
  const x = Math.ceil(Math.random()*maxX);
  const y = Math.ceil(Math.random()*maxY);
  const gridElement = lookupGridStateItem(x, y);
  // ensure coords point to an empty square
  if (!gridElement || gridElement.contains !== 'empty') {
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
  snake.moveHead();
  food.reassign();
};

const startMovingSnake = (miliseconds) => refreshIntervalId = setInterval(() => {
  snake.move();
}, miliseconds);

const restartGame = () => {
  const gridContainer = document.getElementsByClassName('grid-container')[0];
  gridContainer.innerHTML = '';
  gridState = [];
  clearInterval(refreshIntervalId);
  setUp(50, timeout);
};

// for starting/restarting
const startGame = (miliseconds) => {
  snake.snakeLength = 10;
  placeEntities();
  startMovingSnake(miliseconds);  
};

const listenForInput = () => window.addEventListener('keydown', (e) => handleKeyPress(e.key));

// preps the grid, starts initial game
const setUp = (size, miliseconds) => {
  gridState = prepareGrid(size);
  maxX = gridState[gridState.length-1].x;
  maxY = gridState[gridState.length-1].y;
  renderGrid();
  setInitialCoords(snake); 
  startGame(miliseconds);
  listenForInput();
};

setUp(50, timeout);