/* Copyright (C) 2024 DragWx <https://github.com/DragWx> */

// A location where a stack of cards can be formed.
class cardStack {
    constructor (x, y, width, height) {
        this.cards = [];    // Card objects in the stack.
        this.x = x;         // Left edge of stack.bottom
        this.y = y;         // Right edge of stack bottom
        this.width = width;     // Width of stack bottom
        this.height = height;   // Height of stack bottom
        // Rectangular region where the next card must be dropped to add it to
        // the stack.
        this.dropRegion = {
            x: undefined,
            y: undefined,
            width: undefined,
            height: undefined
        };
        // Maximum amount of cards allowed on stack. Use `undefined` for unlimited.
        this.limit = undefined;
        // Direction the stack grows visually.
        // 0-Down, 1-Right, 2-Up, 3-Left, 4-No Offset
        this.stackDirection = 0;
        // A string with the name of the logic that will be used in determining
        // which cards are allowed to be dropped onto this stack.
        this.dropLogic = undefined;
    }
}

window.onload = init;
var deck = {
    valuesPerSuit: 13,
    numSuits: 4,
    cards: []
}
var board = {
    numStacks: 7,
    stacks: {},
    cardLocations: [],
}

// For each card value, this defines where to put all of the symbols on the card.
const mosaicLayouts = [
    [   // 2
        ["rowB",         1],
        ["rowB reverse", 1]
    ],[ // 3
        ["rowB",         1],
        ["rowB",         1],
        ["rowB reverse", 1]
    ],[ // 4
        ["rowA",         2],
        ["rowA reverse", 2],
    ],[ // 5
        ["rowA",         2],
        ["rowB",         1],
        ["rowA reverse", 2],
    ],[ // 6
        ["rowA",         2],
        ["rowA",         2],
        ["rowA reverse", 2],
    ],[ // 7
        ["rowA",         2],
        ["rowB",         1],
        ["rowA",         2],
        ["rowB reverse", 0],
        ["rowA reverse", 2],
    ],[ // 8
        ["rowA",         2],
        ["rowB",         1],
        ["rowA",         2],
        ["rowB reverse", 1],
        ["rowA reverse", 2],
    ],[ // 9
        ["rowA",         2],
        ["rowB",         0],
        ["rowA",         2],
        ["rowB",         1],
        ["rowA reverse", 2],
        ["rowB reverse", 0],
        ["rowA reverse", 2],
    ],[ // 10
        ["rowA",         2],
        ["rowB",         1],
        ["rowA",         2],
        ["rowB",         0],
        ["rowA reverse", 2],
        ["rowB reverse", 1],
        ["rowA reverse", 2],
    ],[ // 11 -- The rest of this is just made up for fun.
        ["rowA",         2],
        ["rowB",         1],
        ["rowA",         2],
        ["rowB",         1],
        ["rowA reverse", 2],
        ["rowB reverse", 1],
        ["rowA reverse", 2],
    ],[ // 12
        ["rowA",         2],
        ["rowB",         1],
        ["rowA",         2],
        ["rowB",         0],
        ["rowA",         2],
        ["rowB reverse", 0],
        ["rowA reverse", 2],
        ["rowB reverse", 1],
        ["rowA reverse", 2],
    ],[ // 13
        ["rowA",         2],
        ["rowB",         1],
        ["rowA",         2],
        ["rowB",         1],
        ["rowA",         2],
        ["rowB reverse", 0],
        ["rowA reverse", 2],
        ["rowB reverse", 1],
        ["rowA reverse", 2],
    ],[ // 14
        ["rowA",         2],
        ["rowB",         1],
        ["rowA",         2],
        ["rowB",         1],
        ["rowA",         2],
        ["rowB reverse", 1],
        ["rowA reverse", 2],
        ["rowB reverse", 1],
        ["rowA reverse", 2],
    ],[ // 15
        ["rowA",         2],
        ["rowB",         1],
        ["rowA",         2],
        ["rowB",         0],
        ["rowA",         2],
        ["rowB",         1],
        ["rowA reverse", 2],
        ["rowB reverse", 0],
        ["rowA reverse", 2],
        ["rowB reverse", 1],
        ["rowA reverse", 2],
    ],[ // 16
        ["rowA",         2],
        ["rowB",         1],
        ["rowA",         2],
        ["rowB",         1],
        ["rowA",         2],
        ["rowB",         0],
        ["rowA reverse", 2],
        ["rowB reverse", 1],
        ["rowA reverse", 2],
        ["rowB reverse", 1],
        ["rowA reverse", 2],
    ],[ // 17
        ["rowB",         1],
        ["rowA",         2],
        ["rowB",         1],
        ["rowA",         2],
        ["rowB",         0],
        ["rowA",         2],
        ["rowB",         1],
        ["rowA reverse", 2],
        ["rowB reverse", 0],
        ["rowA reverse", 2],
        ["rowB reverse", 1],
        ["rowA reverse", 2],
        ["rowB reverse", 1],
    ],[ // 18
        ["rowB",         1],
        ["rowA",         2],
        ["rowB",         1],
        ["rowA",         2],
        ["rowB",         1],
        ["rowA",         2],
        ["rowB",         0],
        ["rowA reverse", 2],
        ["rowB reverse", 1],
        ["rowA reverse", 2],
        ["rowB reverse", 1],
        ["rowA reverse", 2],
        ["rowB reverse", 1],
    ],[ // 19
        ["rowB",         1],
        ["rowA",         2],
        ["rowB",         1],
        ["rowA",         2],
        ["rowB",         1],
        ["rowA",         2],
        ["rowB",         1],
        ["rowA reverse", 2],
        ["rowB reverse", 1],
        ["rowA reverse", 2],
        ["rowB reverse", 1],
        ["rowA reverse", 2],
        ["rowB reverse", 1],
    ],[ // 20
        ["rowA",         2],
        ["rowB",         1],
        ["rowA",         2],
        ["rowB",         1],
        ["rowA",         2],
        ["rowB",         1],
        ["rowA",         2],
        ["rowB reverse", 1],
        ["rowA reverse", 2],
        ["rowB reverse", 1],
        ["rowA reverse", 2],
        ["rowB reverse", 1],
        ["rowA reverse", 2],
    ]
]

var gamescreen;
var gamescreenRect;
var cardsZ = [];

function init() {
    gamescreen = document.getElementById("gamescreen");
    
    gamescreen.innerHTML = "";

    gamescreenRect = gamescreen.getBoundingClientRect();

    var numCards = deck.valuesPerSuit * deck.numSuits;

    // Create every single card.
    for (let i = 0; i < numCards; i++) {
        let card = makeCard(i);
        deck.cards.push(card);
        cardsZ.push(i);

        // The function for when you pointer-down on a card.
        let grabMe = function(ev) {
            // Only grab cards which are the top of a stack.
            let containingStack = board.stacks[board.cardLocations[i]];
            if ((containingStack === undefined) || (containingStack.cards.indexOf(i) != containingStack.cards.length - 1)) {
                return;
            }

            let sourceCoords = {
                top: card.style.top,
                left: card.style.left,
                z: card.style.zIndex
            };

            // Bring this card to the front.
            //let myIndex = cardsZ.indexOf(i);
            //cardsZ.splice(myIndex, 1);
            //cardsZ.push(i);
            //updateCardZs();
            card.style.zIndex = 1000;

            // Now grab the card.
            grabObject.bind(card, function(ev) {
                // On dropping the card
                // Figure out which drop region the card was dropped onto, if any.
                /*let target = Object.keys(board.stacks).find(x => 
                    (ev.pageX >= board.stacks[x]?.dropRegion?.x)
                    && (ev.pageX < board.stacks[x]?.dropRegion?.x + board.stacks[x]?.dropRegion?.width)
                    && (ev.pageY >= board.stacks[x]?.dropRegion?.y)
                    && (ev.pageY < board.stacks[x]?.dropRegion?.y + board.stacks[x]?.dropRegion?.height));*/

                // Use the center point of the grabbed card.
                let currCardRect = card.getBoundingClientRect();
                let targetX = currCardRect.left + (currCardRect.width / 2);
                let targetY = currCardRect.top + (currCardRect.height / 2);
                // Check if the center point is over a drop region.
                let target = Object.keys(board.stacks).find(x => 
                    (targetX >= board.stacks[x]?.dropRegion?.x)
                    && (targetX < board.stacks[x]?.dropRegion?.x + board.stacks[x]?.dropRegion?.width)
                    && (targetY >= board.stacks[x]?.dropRegion?.y)
                    && (targetY < board.stacks[x]?.dropRegion?.y + board.stacks[x]?.dropRegion?.height));
    
                let canPlaceCard = false;
                if ((target !== undefined)
                    && ((board.stacks[target].limit === undefined) || (board.stacks[target].cards.length < board.stacks[target].limit))) {
                    let stack = board.stacks[target];
                    let currCardSuit = i / deck.valuesPerSuit | 0;
                    let currCardColor = ((currCardSuit == 1) || (currCardSuit == 2)) ? 1 : 0;
                    let currCardValue = i % deck.valuesPerSuit;
                    if (stack.cards.length == 0) {
                        // Logic for when the stack is empty.
                        switch (stack.dropLogic) {
                            case "goal":
                                canPlaceCard = (currCardValue == 0);
                                break;
                            default:
                                canPlaceCard = true;
                        }
                    } else {
                        // Logic for when the stack isn't empty.
                        let prevCard = stack.cards[stack.cards.length-1];
                        let prevCardSuit = prevCard / deck.valuesPerSuit | 0;
                        let prevCardColor = ((prevCardSuit == 1) || (prevCardSuit == 2)) ? 1 : 0;
                        let prevCardValue = prevCard % deck.valuesPerSuit;
                        switch (stack.dropLogic) {
                            case "free":
                                canPlaceCard = true;
                                break;
                            case "goal":
                                canPlaceCard = ((currCardSuit == prevCardSuit) && (currCardValue == prevCardValue + 1));
                                break;
                            case "descending-alternating":
                                canPlaceCard = ((currCardColor != prevCardColor) && (currCardValue == prevCardValue - 1));
                                break;
                        }

                    }
                }
                if (canPlaceCard) {
                    moveCardToStack(i, target);
                    updateCardZs();
                } else {
                    // Reset card back to where it was grabbed from.
                    card.style.left = sourceCoords.left;
                    card.style.top = sourceCoords.top;
                    card.style.zIndex = sourceCoords.z;
                }
            })(ev);
        }
        card.addEventListener("pointerdown", grabMe);
        
        gamescreen.appendChild(card);

        // Just for fun, the cards initialize to being randomly scattered
        // all over the table.
        let rect = card.getBoundingClientRect();
        card.style.position = "absolute";
        card.style.top = ((Math.random() * (gamescreenRect.height - rect.height)) | 0) + "px";
        card.style.left = ((Math.random() * (gamescreenRect.width - rect.width)) | 0) + "px";
        card.style.zIndex = i;
    }

    // All the cards are the same size, so we'll just grab a representative
    // card and capture its size.
    var cardSize = deck.cards[0].getBoundingClientRect();
    board.cardLocations = Array(numCards);

    // Shuffle the cards.
    var unshuffled = Array(numCards);
    var shuffled = Array(numCards);
    for (let i = 0; i < numCards; i++) {
        //[0, 1, 2, 3, ...]
        unshuffled[i] = i;
    }
    for (let i = 0; i < numCards; i++) {
        let card = unshuffled.splice(Math.random() * unshuffled.length | 0, 1)[0];
        shuffled[i] = card;
    }
    /*
    // Klondike
    for (let i = 0; i < board.numStacks; i++) {
        for (let x = i; x < board.numStacks; x++) {
            let stackName = `stack${x}`;
            // Make sure all stacks are initialized.
            if (board.stacks[stackName] === undefined) {
                board.stacks[stackName] = {
                    cards: [],
                    x: x * (cardSize.width + 8),
                    y: cardSize.height + 8,
                    width: cardSize.width,
                    height: cardSize.height
                };
            }
            if (shuffled.length > 0) {
                let cardNum = shuffled.pop();
                moveCardToStack(cardNum, stackName);
            }
        }
        if (shuffled[i].length == 0) {
            break;
        }
    }
    // Arrange the deal stack.
    for (let i = 0; i < shuffled.length; i++) {
        let card = deck.cards[shuffled[i]];
        board.cardLocations[shuffled[i]] = "dealStack";
        card.style.top = "0px";
        if (i > 0) {
            let rect = deck.cards[shuffled[i-1]].getElementsByClassName("leftMargin")[0]?.getBoundingClientRect();
            card.style.left = (rect.right - gamescreenRect.left) + "px";
        } else {
            card.style.left = "0px";
        }
    }*/

    // Free cells
    for (let i = 0; i < 4; i++) {
        let stackName = `freecell${i}`;
        board.stacks[stackName] = new cardStack (i * (cardSize.width + 8), 0, cardSize.width, cardSize.height);
        board.stacks[stackName].limit = 1;
        board.stacks[stackName].dropLogic = "free";
        updateDropRegion(stackName);
    }
    // Goal spaces
    for (let i = 0; i < deck.numSuits; i++) {
        let stackName = `goal${i}`;
        board.stacks[stackName] = new cardStack ((i + 4) * (cardSize.width + 8), 0, cardSize.width, cardSize.height);
        board.stacks[stackName].stackDirection = 4;
        board.stacks[stackName].dropLogic = "goal";
        updateDropRegion(stackName);
    }
    // Stacks
    for (let i = 0; i < 8; i++) {
        let stackName = `stack${i}`;
        board.stacks[stackName] = new cardStack (i * (cardSize.width + 8), cardSize.height + 8, cardSize.width, cardSize.height);
        board.stacks[stackName].dropLogic = "descending-alternating";
        updateDropRegion(stackName);
    }
    for (let i = 0; i < deck.cards.length; i++) {
        let stackName = `stack${i % 8}`;
        let cardNum = shuffled.pop();
        moveCardToStack(cardNum, stackName);
    }

    // Fix the Z-ordering.
    /*var zOrdering = [...shuffled];
    for (let stackName in board.stacks) {
        zOrdering.push([...board.stacks[stackName].cards]);
    }
    cardsZ = zOrdering.flat();
    updateCardZs();*/

    // Set up drop regions.
    /*for (let stackName in board.stacks) {
        let topCardRect = deck.cards[board.stacks[stackName].cards[board.stacks[stackName].cards.length-1]].getBoundingClientRect();
        board.stacks[stackName].dropRegion = {
            x: topCardRect.left - gamescreenRect.left,
            y: topCardRect.top - gamescreenRect.top,
            width: topCardRect.width,
            height: topCardRect.height
        };
    }*/

    board.stacks["dealStack"] = {};
    board.stacks["dealStack"]["cards"] = shuffled;

    updateCardZs();
}

// Makes both the DOM element and the JS object for a card.
function makeCard(cardNum) {
    var suit = ((cardNum / deck.valuesPerSuit) | 0) + 1;
    var value = cardNum % deck.valuesPerSuit + 1;
    var card = document.createElement("div");
    card.classList.add("card", `s${suit}`);
    card.dataset["cardValue"] = cardNum;

    var verticalMargins = [];
    for (let i = 0; i < 2; i++) {
        // Top and bottom margins of card, contain value and (extra) suit.
        let currMargin = document.createElement("div");
        currMargin.classList.add("numsuit");

        // Card value.
        let el = document.createElement("div");
        if (value > deck.valuesPerSuit - 3) {
            el.innerHTML = ["J","Q","K"][value - (deck.valuesPerSuit - 2)];
        } else {
            // Values above 9 will be "squished" so two numbers fit in the same
            // space as one number.
            if (value > 9) { el.classList.add("squish"); }
            if (value == 1) {
                el.innerHTML = "A";
            } else {
                el.innerHTML = value;
            }
        }
        currMargin.appendChild(el);
        
        // Card suit. (This is extra, not usually on actual cards)
        el = document.createElement("div");
        el.classList.add("suit");
        currMargin.appendChild(el);
        
        verticalMargins.push(currMargin);
    }
    verticalMargins[0].classList.add("topMargin");
    verticalMargins[1].classList.add("reverse", "bottomMargin");

    var horizontalMargins = [];
    for (let i = 0; i < 2; i++) {
        // Left and right margins of card, contains suit, which will go
        // underneath the value.
        let currMargin = document.createElement("div");
        currMargin.classList.add("margin");
        
        let el = document.createElement("div");
        el.classList.add("suit");

        currMargin.appendChild(el);

        horizontalMargins.push(currMargin);
    }
    horizontalMargins[0].classList.add("leftMargin");
    horizontalMargins[1].classList.add("reverse", "rightMargin");

    var cardMiddle = document.createElement("div");
    if (value > (deck.valuesPerSuit - 3)) {
        // Face card
        cardMiddle.classList.add("royal");

        let faceName = ["jack","queen","king"][value - (deck.valuesPerSuit - 2)];

        let currRow = document.createElement("div");
        currRow.classList.add("rowB");
        let el = document.createElement("div");
        el.classList.add(faceName);
        currRow.appendChild(el);
        cardMiddle.appendChild(currRow);

        currRow = document.createElement("div");
        currRow.classList.add("rowB");
        el = document.createElement("div");
        el.classList.add("suit"+faceName);
        currRow.appendChild(el);
        cardMiddle.appendChild(currRow);
    } else if (value < 2) {
        // Ace
        cardMiddle.classList.add("royal");

        let currRow = document.createElement("div");
        currRow.classList.add("rowB");
        let el = document.createElement("div");
        if (value == 1) { el.classList.add("suit"); }
        currRow.appendChild(el);
        cardMiddle.appendChild(currRow);
    } else {
        // Number card
        cardMiddle.classList.add("mosaic");
        let layout = mosaicLayouts[value - 2];
        for (let r of layout) {
            let currRow = document.createElement("div");
            currRow.className = r[0];
            for (let i = 0; i < r[1]; i++) {
                let el = document.createElement("div");
                el.classList.add("suit");
                currRow.appendChild(el);
            }
            cardMiddle.appendChild(currRow);
        }
    }

    var decoration = document.createElement("div");
    decoration.classList.add("decoration");

    decoration.appendChild(horizontalMargins[0]);
    decoration.appendChild(cardMiddle);
    decoration.appendChild(horizontalMargins[1]);    

    card.appendChild(verticalMargins[0]);
    card.appendChild(decoration);
    card.appendChild(verticalMargins[1]);
    
    return card;
}

// Grab offset relative to mouse cursor.
var grabOffset = { x: 0, y: 0 };

// Logic used while a card is being held.
function grabObject(onDrop, ev) {
    if (ev.button != 0) {
        return;
    }
    var me = this;
    //this.style.cursor = "grabbing";
    this.classList.add("grabbing");
    grabOffset.x = ev.pageX - me.offsetLeft;
    grabOffset.y = ev.pageY - me.offsetTop;

    var moveMe = moveGrabbedObject.bind(this);

    this.setPointerCapture(ev.pointerId);
    this.addEventListener("pointermove", moveMe);
    this.addEventListener("pointerup", function self(ev) {
        //me.style.cursor = "grab";
        this.classList.remove("grabbing");
        this.releasePointerCapture(ev.pointerId);
        this.removeEventListener("pointermove", moveMe);
        this.removeEventListener("pointerup", self);
        if (typeof onDrop == "function") {
            onDrop(ev);
        }
    });
}

function moveGrabbedObject(ev) {
    this.style.top = (ev.pageY - grabOffset.y) + "px";
    this.style.left = (ev.pageX - grabOffset.x) + "px";
}

function updateCardZs() {
    /*for (let i = 0; i < cardsZ.length; i++) {
        deck.cards[cardsZ[i]].style.zIndex = i;
    }*/
    for (let stackName in board.stacks) {
        let stack = board.stacks[stackName];
        for (let i = 0; i < stack.cards.length; i++) {
            deck.cards[stack.cards[i]].style.zIndex = i;
        }
    }
}

// Called anytime the amount of the cards in the stack is changing, so that the
// drop region can be updated to match where the top card is, on the screen.
function updateDropRegion(stackName) {
    let stack = board.stacks[stackName];
    if (stack.cards.length > 0) {
        // Reposition the drop region to align with the top card.
        let topCardRect = deck.cards[stack.cards[stack.cards.length-1]].getBoundingClientRect();
        stack.dropRegion = {
            x: topCardRect.left - gamescreenRect.left,
            y: topCardRect.top - gamescreenRect.top,
            width: topCardRect.width,
            height: topCardRect.height
        };    
    } else {
        // With empty stacks, the drop region is the base of the stack.
        stack.dropRegion = {
            x: stack.x,
            y: stack.y,
            width: stack.width,
            height: stack.height
        };
    }
    // Expand the drop region a little bit, in the direction the stack goes.
    if ((stack.limit === undefined) || (stack.limit > 1)) {
        switch (stack.stackDirection) {
            case 0:     // Down
                stack.dropRegion.height += (stack.dropRegion.height / 2);
                break;
            case 1:     // Right
                stack.dropRegion.width += (stack.dropRegion.width / 2);
                break;
            case 2:     // Up
                stack.dropRegion.y -= (stack.dropRegion.height / 2);
                stack.dropRegion.height += (stack.dropRegion.height / 2);
                break;
            case 3:     // Left
                stack.dropRegion.x -= (stack.dropRegion.width / 2);
                stack.dropRegion.width += (stack.dropRegion.width / 2);
                break;           
        }
    }
}

// Remove a card from its current stack, then add it to the top of the
// destination stack.
function moveCardToStack(cardNum, stackName) {
    let sourceStack = board.stacks[board.cardLocations[cardNum]];
    let destinationStack = board.stacks[stackName];
    let card = deck.cards[cardNum];

    // Remove card from its current stack, if it's on one.
    if (sourceStack !== undefined) {
        sourceStack.cards.splice(sourceStack.cards.indexOf(cardNum));
        updateDropRegion(board.cardLocations[cardNum]);
    }

    if (destinationStack === undefined) {
        return;
    }
    // Move card to destination stack and update location.
    destinationStack.cards.push(cardNum);
    board.cardLocations[cardNum] = stackName;
    
    // Physically move the card to its new position.
    // Offset each card enough so the value and suit are visible on each.
    let marginName = ["topMargin", "leftMargin", "bottomMargin", "rightMargin", ""][destinationStack.stackDirection];
    if ((destinationStack.cards.length > 1) && marginName) {
        let prevCard = deck.cards[destinationStack.cards[destinationStack.cards.length-2]];
        let rect = prevCard.getElementsByClassName(marginName)[0]?.getBoundingClientRect();
        switch (destinationStack.stackDirection) {
            case 0: // Down
                card.style.left = destinationStack.x + "px";
                card.style.top = (rect.bottom - gamescreenRect.top) + "px";
                break;
            case 1: // Right
                card.style.left = (rect.right - gamescreenRect.left) + "px";
                card.style.top = destinationStack.y + "px";
                break;
            case 2: // Up
                // TODO
                break;
            case 3: // Left
                // TODO
                break;
        }
    } else {
        card.style.left = destinationStack.x + "px";
        card.style.top = destinationStack.y + "px";
    }
    
    // Update drop region here because it depends on the x/y position of the card.
    updateDropRegion(stackName);
    updateCardHighlights();

}

// Highlight all of the next cards that need to move to the goal stacks.
function updateCardHighlights() {
    // Unhighlight all highlighted cards.
    [...document.getElementsByClassName("card highlight")]?.forEach(x => x.classList.remove("highlight"));

    let goalStacks = Object.keys(board.stacks).filter(x => board.stacks[x]?.dropLogic == "goal");
    let suitCard = Array(deck.numSuits);
    // Initialize to the starting card for each suit.
    for (let i = 0; i < deck.numSuits; i++) {
        suitCard[i] = deck.valuesPerSuit * i;
    }
    for (let stackName of goalStacks) {
        // Find the topmost card of the goal stack.
        let stackCards = board.stacks[stackName].cards;
        if (stackCards.length == 0) { continue; }

        let cardNum = stackCards[stackCards.length - 1];
        let cardSuit = cardNum / deck.valuesPerSuit | 0;
        let cardValue = cardNum % deck.valuesPerSuit;
        if (cardValue + 1 < deck.valuesPerSuit) {
            suitCard[cardSuit] = cardNum + 1;
        } else {
            suitCard[cardSuit] = undefined;
        }
    }
    for (let cardNum of suitCard) {
        if (cardNum !== undefined) {
            deck.cards[cardNum].classList.add("highlight");
        }
    }
}
