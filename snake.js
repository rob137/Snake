const gridContainer = document.getElementsByClassName('grid-container')[0];

function createGrid () {
  for (let i = 0; i < 2000; i++) {
    gridContainer.innerHTML += `<div class="grid-square grid-square-${i}"></div>`;
  }
} 

function setNums() {
  initialHeadNum = Math.floor(Math.random()*2008);
  initialFoodNum = Math.floor(Math.random()*2008);
  return { initialHeadNum, initialFoodNum };
}

function ensureNumsAreUnique (headNum, foodNum) {
  if (headNum !== foodNum) {
    return { headNum, foodNum }; 
  } else if (headNum < 2000) {
    headNum += 1;
  } else {
    headNum -= 1;
  }
  return { headNum, foodNum }; 
}

function setSquare(gridNum, className) {
  document.getElementsByClassName(`grid-square-${gridNum}`)[0].classList.add(`${className}`);
}

function setInitialConditions() {
  let {initialHeadNum, initialFoodNum} = setNums();
  let {headNum, foodNum} = ensureNumsAreUnique(initialHeadNum, initialFoodNum);
  setSquare(headNum, 'snake-head');
  setSquare(foodNum, 'food');
}

function getHeadPosition() {
  return  document.getElementsByClassName(`snake-head`)[0];
}

function removeHead(currentPosition) {
  document.getElementsByClassName(`snake-head`)[0].className = currentPosition.className
    .slice(0, -11);;
}

function moveHead(currentPosition) {
  const currentGridNum = parseInt(currentPosition.className.replace(/[^0-9\.]/g, ''));
  const nextGridNum = currentGridNum - 1;
  setSquare(nextGridNum, 'snake-head');
}

function advanceSnake() {
  const currentPosition = getHeadPosition();
  removeHead(currentPosition);
  moveHead(currentPosition);
}

function startMovingSnake() {
  setInterval(() => advanceSnake(), 200);
}

function handleKeyPress(keyPressed) {
  if (keyPressed === 'ArrowUp') {
    console.log('Up!');
  } else if (keyPressed === "ArrowDown") {
    console.log('Down!');
  } else if (keyPressed === "ArrowLeft") {
    console.log('Left!');
  } else if (keyPressed === "ArrowRight") {
    console.log('Right!');
  }
}

function listenForInput() {
  window.addEventListener('keydown', (e) => handleKeyPress(e.key));
}

function setUp() {
  createGrid();
  setInitialConditions(); 
  startMovingSnake();
}

setUp();
listenForInput();