/*
TODO

Current errors
Deck can run out, no warnings or reshuffles implemented yet
Card counting includes face down dealer card right now - need to exclude until revealed
Change game so dealer hits on soft 17 (more common)

Develop
Betting X!
Double Down
Split
Surrender
Change number of decks

*/
/*Global variables*/
const bankroll = 1000;
var balance = bankroll;

const fullDeck = ["A","A","A","A","2","2","2","2","3","3","3","3",
                "4","4","4","4","5","5","5","5","6","6","6","6","7","7","7","7",
                "8","8","8","8","9","9","9","9","10","10","10","10",
                "J","J","J","J","Q","Q","Q","Q","K","K","K","K"];
const fullCount = {"A":4,"2":4,"3":4,"4":4,"5":4,"6":4,"7":4,
                  "8":4,"9":4,"10":4,"J":4,"Q":4,"K":4};

const value10 = new Set(["10", "J", "Q", "K"]);
const plus = new Set(["2", "3", "4", "5", "6"]);
const minus = new Set(["10", "J", "Q", "K", "A"]);

const hardChart = [];

var currentDeck = [];
var currentCount = {};
var runningCount = 0;
var trueCount = 0;

var dealerHand = [];
var playerHand = [];

var revealDealer = false;
var currentBet = 0;

resetDecks();

/*Functions*/
function deal() {
    clearHands();
    currentBet = document.getElementById("bet").value;
    balance -= currentBet;
    document.getElementById("bet").setAttribute("disabled", "true");
    document.getElementById("balance").innerHTML = balance;
    revealDealer = false;
    setTimeout(() => {draw(playerHand, currentDeck)}, 500);
    setTimeout(() => {draw(dealerHand, currentDeck)}, 1000);
    setTimeout(() => {draw(playerHand, currentDeck)}, 1500);
    setTimeout(() => {draw(dealerHand, currentDeck)}, 2000);
    //check for blackjack
    document.getElementById("deal").disabled = true;
    setTimeout(() => {document.getElementById("hit").disabled = false}, 2000);
    setTimeout(() => {document.getElementById("stay").disabled = false}, 2000);
    
}

function draw(hand, deck) {
    card = deck.pop();
    
    /*updating counters */
    currentCount[card]--;
    if(minus.has(card))
        runningCount--;
    if (plus.has(card))
        runningCount++;
    trueCount = runningCount/(deck.length/52);

    hand.push(card);
    updateDisplay();
}

function updateDisplay() {
    //player
    for(i = 0; i < playerHand.length; i++)
    {
        var card = playerHand[i];
        var currCard = document.getElementById("p"+i);
        if(currCard === null)
        {
            var handHTML = document.getElementById("playerHand");
            var tag = document.createElement("div");
            tag.setAttribute("class", "card");
            tag.setAttribute("id", "p"+i);
            handHTML.appendChild(tag);
            var currCard = document.getElementById("p"+i);
        }
        currCard.innerHTML = card;
    }
    var playerTotal = scoreHand(playerHand);
    document.getElementById("playerTotal").innerHTML = playerTotal;
    //dealer
    for(i = 0; i < dealerHand.length; i++)
    {
        if (!revealDealer && i === 0)
            var card = "?";
        else
        var card = dealerHand[i];
        var currCard = document.getElementById("d"+i);
        if(currCard === null)
        {
            var handHTML = document.getElementById("dealerHand");
            var tag = document.createElement("div");
            tag.setAttribute("class", "card");
            tag.setAttribute("id", "d"+i);
            handHTML.appendChild(tag);
            var currCard = document.getElementById("d"+i);
        }
        currCard.innerHTML = card;
    }
    var dealerTotal = scoreHand(dealerHand);
    if(!revealDealer)
        dealerTotal -= scoreHand(dealerHand[0]);
    document.getElementById("dealerTotal").innerHTML = dealerTotal;
    //counts
    document.getElementById("runningCount").innerHTML = runningCount;
    document.getElementById("trueCount").innerHTML = Math.round(trueCount * 10) / 10;
}

function hit() {
    draw(playerHand, currentDeck);
    //Check for bust
    let score = scoreHand(playerHand);
    if(score > 21)
    {
        document.getElementById("playerTotal").innerHTML = score + " BUST";
        document.getElementById("deal").disabled = false;
        document.getElementById("hit").disabled = true;
        document.getElementById("stay").disabled = true;
        document.getElementById("bet").disabled = false;
    }
}

function stay() {
    revealDealer = true;
    updateDisplay();
    //deal dealer (will not deal if over 16 already)
    while(scoreHand(dealerHand) < 17)
    {
        draw(dealerHand, currentDeck);
        updateDisplay();
    }
    //score winner
    let dealerScore = scoreHand(dealerHand);
    let playerScore = scoreHand(playerHand);
    if(dealerScore > 21)
        {
            document.getElementById("dealerTotal").innerHTML = dealerScore + " BUST";
            balance += currentBet * 2;
            document.getElementById("balance").innerHTML = balance;
        }

    else if(dealerScore > playerScore)
        document.getElementById("playerTotal").innerHTML = playerScore + " LOSE";
    else if(dealerScore < playerScore)
        {
            document.getElementById("playerTotal").innerHTML = playerScore + " WIN";
            balance += currentBet * 2;
            document.getElementById("balance").innerHTML = balance;
        }
    else
        document.getElementById("playerTotal").innerHTML = playerScore + " PUSH";

    document.getElementById("deal").disabled = false;
    document.getElementById("hit").disabled = true;
    document.getElementById("stay").disabled = true;
    document.getElementById("bet").disabled = false;
}

function recommend() {

}

function scoreHand(hand) {
    totalScore = 0;
    totalAce = 0;
    for(i = 0; i < hand.length; i++) {
        var card = hand[i];
        if (card === "A") {
            totalScore += 11;
            totalAce += 1;
        }
        else if(value10.has(card))
            totalScore +=10;
        else
            totalScore += parseInt(card);
    }
    while(totalScore > 21 && totalAce > 0) {
        totalScore -= 10;
        totalAce -= 1;
    }
    return totalScore;
}

function clearHands() {
    children = document.querySelectorAll('.card');
    for(i = 0; i < children.length; i++)
        children[i].remove();
    dealerHand = [];
    playerHand = [];
    updateDisplay;
}

function resetDecks() {
    currentDeck = [];
    Object.assign(currentDeck, fullDeck);
    shuffle(currentDeck);
    
    currentCount = {};
    Object.assign(currentCount, fullCount);
    runningCount = 0;
    trueCount = 0;

}

function shuffle(deck) {
    for (var i = deck.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }
}


/*Listeners*/
document.querySelector("#deal").addEventListener('click', deal);
document.querySelector("#hit").addEventListener('click', hit);
document.querySelector("#stay").addEventListener('click', stay);