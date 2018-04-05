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

function setSquare (gridNum, className) {
  document.getElementsByClassName(`grid-square-${gridNum}`)[0].classList.add(`${className}`);
}

function setInitialConditions() {
  let {initialHeadNum, initialFoodNum} = setNums();
  let {headNum, foodNum} = ensureNumsAreUnique(initialHeadNum, initialFoodNum);
  setSquare(headNum, 'snake-head');
  setSquare(foodNum, 'food');
}

function advanceSnake() {
  console.log(document.getElementsByClassName(`snake-head`)[0].className);
}

function startMovingSnake() {
  setInterval(() => advanceSnake(), 500)
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