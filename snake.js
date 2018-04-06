const gridContainer = document.getElementsByClassName('grid-container')[0];
let gridArr = [];
let finalElement;

const head = {
  name: 'head',
  x: 1,
  y: 2,
  direction: "left",
  proposedDirection: "left",
  checkDirectionShouldChange: function() {
    return this.direction !== this.proposedDirection
      && !(this.direction === 'up' && this.proposedDirection === 'down')
      && !(this.direction === 'down' && this.proposedDirection === 'up')
      && !(this.direction === 'left' && this.proposedDirection === 'right') 
      && !(this.direction === 'right' && this.proposedDirection === 'left');
  },
  // prevents a 'doubling back' hack
  setDirection: function() {
    if (this.checkDirectionShouldChange()) {
      this.direction = this.proposedDirection;
    }
  },

  reassign: function() {
    const nextHeadLocation = gridArr.find((i) => {
      return i.x === head.x && i.y === head.y;
    });
    const currentHeadLocation = document.getElementsByClassName(`head`)[0];
    if (currentHeadLocation) {
      currentHeadLocation.className = currentHeadLocation.className.replace('head', '');
    }
    document.getElementsByClassName(nextHeadLocation.elementName)[0].classList.add(head.name);
  },
  move: function() {
    this.setDirection();
    if (this.direction === 'up') {
      this.y -= 1;
    } else if (this.direction === 'down') {
      this.y += 1;
    } else if (this.direction === 'left') {
      this.x -= 1;
    } else if (this.direction === 'right') {
      this.x += 1;
    }

    if (this.x === 0) {
      this.x = finalElement.x;
    } else if (this.y === 0) {
      this.y = finalElement.y;
    } else if (this.x === finalElement.x+1) {
      this.x = 1;
    } else if (this.y === finalElement.y+1) {
      this.y = 1;
    }
    this.reassign()
  },
}

const food = {
  name: 'food',
  x: 2,
  y: 3,
  reassign: function() {
    // place on a random ---empty--- square
    const newFoodCoords = pickRandomCoords();
    this.x = newFoodCoords.x;
    this.y = newFoodCoords.y;
    const nextFoodLocation = gridArr.find((i) => {
      return i.x === this.x && i.y === this.y;
    });
    document.getElementsByClassName(nextFoodLocation.elementName)[0].classList.add(food.name);
  }
}

function prepareCoords(size) {
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

function pickRandomCoords() {
  const maxSize = finalElement.x;
  const x = Math.floor(Math.random()*maxSize);
  const y = Math.floor(Math.random()*maxSize);
  return {x, y};
}

function setInitialCoords(entity) {
  let initialCoords = pickRandomCoords();
  entity.x = initialCoords.x, 
  entity.y = initialCoords.y
  //let {headNum, foodNum} = ensureCoordsAreUnique(initialHeadNum, initialFoodNum);
}

function listenForInput() {
  window.addEventListener('keydown', (e) => handleKeyPress(e.key));
}

function placeEntities() {
  head.reassign();
  food.reassign();
}

function startMovingSnake(miliseconds) {
  setInterval(() => head.move(), miliseconds);
}

function setUp(size, miliseconds) {
  gridArr = prepareCoords(size);
  finalElement = gridArr[gridArr.length-1];
  createGrid();
  setInitialCoords(head); 
  placeEntities();
  startMovingSnake(miliseconds);
}

setUp(50, 250);
listenForInput();