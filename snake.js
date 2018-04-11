"use strict";
var gridState = [];
var maxX, maxY;
var refreshIntervalId;
var timeout = 60;
// Main snake object.  Contains methods that govern snake's behaviour.
var snake = {
    name: 'snake',
    // coords of head
    x: 1,
    y: 2,
    snakeLength: 10,
    direction: "left",
    proposedDirection: "left",
    // Validates user input
    checkDirectionShouldChange: function () {
        return this.direction !== this.proposedDirection &&
            !(this.direction === 'up' && this.proposedDirection === 'down') &&
            !(this.direction === 'down' && this.proposedDirection === 'up') &&
            !(this.direction === 'left' && this.proposedDirection === 'right') &&
            !(this.direction === 'right' && this.proposedDirection === 'left');
    },
    // prevents 'doubling back' hack
    setDirection: function () {
        if (this.checkDirectionShouldChange()) {
            this.direction = this.proposedDirection;
        }
    },
    adjustCoords: function () {
        if (this.direction === 'up') {
            this.y -= 1;
        }
        else if (this.direction === 'down') {
            this.y += 1;
        }
        else if (this.direction === 'left') {
            this.x -= 1;
        }
        else if (this.direction === 'right') {
            this.x += 1;
        }
    },
    // Make snake appear on opposite side of screen when it reaches the border
    accountForEdgeOfScreen: function () {
        if (this.x === 0) {
            this.x = maxX;
        }
        else if (this.y === 0) {
            this.y = maxY;
        }
        else if (this.x === maxX + 1) {
            this.x = 1;
        }
        else if (this.y === maxY + 1) {
            this.y = 1;
        }
    },
    // With snake body or food
    handleCollision: function (nextSnakeLocation) {
        // For collision with food
        if (confirmLocationClass(nextSnakeLocation, 'food')) {
            food.reassign();
            this.grow();
            // for collision with body
        }
        else {
            restartGame();
        }
    },
    moveHead: function () {
        var currentPosition = gridState.filter(function (i) { return i.contains === 'head'; })[0];
        // Update snake head's current location (about to be former location) in gridState and DOM
        if (currentPosition) {
            // update state
            currentPosition.contains = 'body';
            // update DOM
            if (!currentPosition.element)
                throw new Error('No element found');
            currentPosition.element.className = currentPosition.element.className.replace('head', '');
        }
        var nextSnakeLocation = lookupGridStateItem(this.x, this.y);
        if (!nextSnakeLocation)
            throw new Error('No location found');
        if (confirmLocationClass(nextSnakeLocation, 'body') || confirmLocationClass(nextSnakeLocation, 'food')) {
            this.handleCollision(nextSnakeLocation);
        }
        if (!nextSnakeLocation.element)
            throw new Error('No element found');
        // Update next location in DOM and gridState;
        nextSnakeLocation.element.classList.add('head');
        nextSnakeLocation.contains = 'head';
    },
    setBodySegment: function () {
        // in state
        var targetInState = lookupGridStateItem(this.x, this.y);
        if (!targetInState)
            throw new Error('No Location Found');
        targetInState.bodySegment = 1;
        if (!targetInState.element)
            throw new Error('No element found');
        // in DOM
        targetInState.element.classList.add('1');
    },
    grow: function () {
        this.snakeLength += 1;
    },
    // increment remaining body squares
    moveBody: function () {
        var _loop_1 = function (i) {
            var targetInState = gridState.find(function (gridSquare) { return gridSquare.bodySegment === i; });
            if (targetInState) {
                // update state
                targetInState.bodySegment += 1;
                targetInState.contains = 'body';
                if (!targetInState.element)
                    throw new Error('No element found');
                // update DOM
                targetInState.element.className = targetInState.element.className
                    .replace('body', '') // prevents duplicate body classes in html element
                    .replace(" " + (targetInState.bodySegment - 1), " " + targetInState.bodySegment + " body");
            }
        };
        for (var i = this.snakeLength; i > 0; i--) {
            _loop_1(i);
        }
    },
    // remove trailing body block - eg if snakeLength is 11, then remove square 12
    cleanUp: function () {
        var _this = this;
        var finalBodySegment = gridState.find(function (i) { return i.bodySegment === _this.snakeLength + 1; });
        // Conditonal because the end of the body won't be assigned for initial frame(s) of of game
        if (finalBodySegment) {
            if (!finalBodySegment.element)
                throw new Error('No element found');
            finalBodySegment.element.className = finalBodySegment.element.className
                .replace(" " + (this.snakeLength + 1) + " body", "");
            finalBodySegment.contains = 'empty';
            finalBodySegment.bodySegment = 0;
        }
    },
    move: function () {
        this.setDirection();
        this.adjustCoords();
        this.accountForEdgeOfScreen();
        this.moveHead();
        this.moveBody();
        this.cleanUp();
        this.setBodySegment();
    }
};
var food = {
    name: 'food',
    x: 2,
    y: 3,
    reassign: function () {
        var currentFoodLocation = lookupGridStateItem(food.x, food.y);
        var foodGrid = gridState.find(function (i) { return i.contains === 'food'; });
        // Wipe food from className of current food element.  The conditional yields false only at start of game.
        if (foodGrid) {
            if (!foodGrid.element)
                throw new Error('No element found');
            foodGrid.element.className = foodGrid.element.className.replace('food', '');
        }
        if (!currentFoodLocation)
            throw new Error('hurgh!');
        // place on a random empty square
        this.placeOnRandomEmptySquare(currentFoodLocation);
    },
    placeOnRandomEmptySquare: function (currentFoodLocation) {
        var newFoodCoords = pickRandomCoords();
        currentFoodLocation.contains = 'empty';
        this.x = newFoodCoords.x;
        this.y = newFoodCoords.y;
        var nextFoodLocation = lookupGridStateItem(this.x, this.y);
        if (!nextFoodLocation) {
            throw new Error('No Location Found');
        }
        nextFoodLocation.contains = 'food';
        if (!nextFoodLocation.element)
            throw new Error('No element found');
        nextFoodLocation.element.classList.add(food.name);
    }
};
// Checks if a given grid square has a class
var confirmLocationClass = function (location, searchTerm) {
    if (!location.element)
        throw new Error('No element found');
    return location.element.className.search("" + searchTerm) > -1;
};
// creates gridState, which is used to render grid in DOM
var prepareGrid = function (size) {
    var elementNum = 0;
    var output = [];
    for (var i = 1; i <= size; i++) {
        for (var j = 1; j <= size; j++) {
            output.push({
                y: i,
                x: j,
                contains: 'empty',
                bodySegment: 0,
                elementNum: elementNum,
            });
            elementNum += 1;
        }
    }
    return output;
};
var renderGrid = function () {
    gridState.forEach(function (gridSquare, i) {
        var element = document.createElement('div');
        var gridContainer = document.getElementsByClassName('grid-container')[0];
        element.classList.add('grid-square', "grid-square-" + i);
        gridContainer.appendChild(element);
        gridSquare.element = element;
    });
};
// Feeds in user direction to snake.  snake then validates/executes with its own methods.
var handleKeyPress = function (keyPressed) {
    if (keyPressed === 'ArrowUp') {
        snake.proposedDirection = 'up';
    }
    else if (keyPressed === "ArrowDown") {
        snake.proposedDirection = 'down';
    }
    else if (keyPressed === "ArrowLeft") {
        snake.proposedDirection = 'left';
    }
    else if (keyPressed === "ArrowRight") {
        snake.proposedDirection = 'right';
    }
};
var lookupGridStateItem = function (x, y) { return gridState.find(function (grid) { return grid.x === x && grid.y === y; }); };
var pickRandomCoords = function () {
    var x = Math.ceil(Math.random() * maxX);
    var y = Math.ceil(Math.random() * maxY);
    var gridElement = lookupGridStateItem(x, y);
    // ensure coords point to an empty square
    if (!gridElement || gridElement.contains !== 'empty') {
        var altGrids = pickRandomCoords();
        x = altGrids.x;
        y = altGrids.y;
    }
    return { x: x, y: y };
};
var setInitialCoords = function (entity) {
    var initialCoords = pickRandomCoords();
    entity.x = initialCoords.x;
    entity.y = initialCoords.y;
};
var placeEntities = function () {
    snake.moveHead();
    food.reassign();
};
var startMovingSnake = function (miliseconds) { return refreshIntervalId = setInterval(function () {
    snake.move();
}, miliseconds); };
var restartGame = function () {
    var gridContainer = document.getElementsByClassName('grid-container')[0];
    gridContainer.innerHTML = '';
    gridState = [];
    clearInterval(refreshIntervalId);
    setUp(50, timeout);
};
// for starting/restarting
var startGame = function (miliseconds) {
    snake.snakeLength = 10;
    placeEntities();
    startMovingSnake(miliseconds);
};
var listenForInput = function () { return window.addEventListener('keydown', function (e) { return handleKeyPress(e.key); }); };
// preps the grid, starts initial game
var setUp = function (size, miliseconds) {
    gridState = prepareGrid(size);
    maxX = gridState[gridState.length - 1].x;
    maxY = gridState[gridState.length - 1].y;
    renderGrid();
    setInitialCoords(snake);
    startGame(miliseconds);
    listenForInput();
};
setUp(50, timeout);
