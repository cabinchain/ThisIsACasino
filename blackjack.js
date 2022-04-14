/*

Notes for users:
Win percentages are probability of win / probability of win or lose. This ignores ties.


TODO
Current issues
1) Deck can run out, no warnings or reshuffles implemented yet
2) Card counting includes face down dealer card right now - need to exclude until revealed
    Solution: In deal function, add facedown card back into count. In stay function, subtract it.
3) Change game so dealer hits on soft 17 (more common?)
4) Can bet negative, fix that

Develop
Calculate expected value by action for:
    No counting
    Point counting
    full counting

Blackjack pays 3-2 (does dealer continue drawing?)
Blackjack for dealer
Double Down
Split
Surrender
Change options (blackjack payout, # of decks, H17 or S17)
If player hits 21, should I automatically stay?
Add Delay to dealer drawing cards in stay function

*/

/*Global variables*/
const bankroll = 1000;
var balance = bankroll;

const fullDeck = ["A","A","A","A","2","2","2","2","3","3","3","3",
                "4","4","4","4","5","5","5","5","6","6","6","6","7","7","7","7",
                "8","8","8","8","9","9","9","9","10","10","10","10",
                "J","J","J","J","Q","Q","Q","Q","K","K","K","K"];
const cardList = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
                
const fullCount = {"A":4,"2":4,"3":4,"4":4,"5":4,"6":4,"7":4,
                  "8":4,"9":4,"10":4,"J":4,"Q":4,"K":4};

const value10 = new Set(["10", "J", "Q", "K"]);
const plus = new Set(["2", "3", "4", "5", "6"]);
const minus = new Set(["10", "J", "Q", "K", "A"]);

var currentDeck = [];
var currentCount = {};
var runningCount = 0;
var trueCount = 0;
var hiddenCard = "";

var dealerHand = [];
var playerHand = [];

var revealDealer = false;
var currentBet = 0;

var dealerOutcomes = {"bust":0, 21:0, 20:0, 19:0, 18:0, 17:0};
var playerOutcomes = {"bust":0, 21:0, 20:0, 19:0, 18:0, 17:0, 16:0, 15:0, 14:0, 13:0, 12:0, 11:0, 10:0, 9:0, 8:0, 7:0, 6:0};

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
    setTimeout(() => {calcProbs()}, 2010);
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
    var dealerTotal = scoreHand(dealerHand, !revealDealer);
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
        revealDealer = true;
        updateDisplay();
        document.getElementById("playerTotal").innerHTML = score + " BUST";
        document.getElementById("deal").disabled = false;
        document.getElementById("hit").disabled = true;
        document.getElementById("stay").disabled = true;
        document.getElementById("bet").disabled = false;
    }
    calcProbs();
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

// Calculate expected value of each action
function calcProbs() {
    
    //Inefficient method uses all cards in available decks
    //Better method uses "card list" (13 total cards) and checks currentCount for available cards

    //Dealer probability
    //Dictionary of all outcomes from 17 to bust (Dealer will recursively hit until in range or bust)
    dealerOutcomes = {"bust":0, 21:0, 20:0, 19:0, 18:0, 17:0};
    dealerNext(dealerHand, cardList, dealerOutcomes, currentCount);
    console.log(dealerOutcomes);
    
    //Player outcomes
    playerOutcomes = {"bust":0, 21:0, 20:0, 19:0, 18:0, 17:0, 16:0, 15:0, 14:0, 13:0, 12:0, 11:0, 10:0, 9:0, 8:0, 7:0, 6:0};
    playerNext(playerHand, cardList, playerOutcomes, currentCount);
    console.log(playerOutcomes);

    //Recommended Decision
    winIfStay = 1;
    playerScore = scoreHand(playerHand);
    for (let i = Math.max(17,playerScore); i <= 21; i++)
        winIfStay -= dealerOutcomes[i]; //Subtract outcomes where dealer has higher value
    //True WinIfStay probability needs to ignore the chance of tying.
    if (playerScore >= 17)
        trueWinIfStay = winIfStay/(1 - dealerOutcomes[playerScore]);
    else trueWinIfStay = winIfStay;

    winIfHit = 0;
    loseIfHit = 0;
    for (let i = 17; i <= 21; i++)
    {
        for (let j = 6; j <= 21; j++)
        {
            if (j > i)
                winIfHit += playerOutcomes[j] * dealerOutcomes[i];
            if (i > j)
                loseIfHit += playerOutcomes[j] * dealerOutcomes[i];
        }
    }
    winIfHit += (1 - playerOutcomes["bust"]) * dealerOutcomes["bust"];
    loseIfHit += playerOutcomes["bust"];
    trueWinIfHit = winIfHit/(winIfHit + loseIfHit);
    console.log(trueWinIfStay);
    console.log(trueWinIfHit);
}

function dealerNext(hand, deck, outcomes, count, prob = 1) {
    //Calculate probability of each new potential hand
    let totalCards = 0;
    for (let c in count)
        totalCards += count[c];
    let currentProb = prob/totalCards;

    //Create theoretical hands for "next" deck draw
    for(let i = 0; i < deck.length; i++)
    {
        let tempHand = []; //use let here because recursion may override this
        let tempCount = {};
        Object.assign(tempHand, hand);
        Object.assign(tempCount, count);
        let card = deck[i];
        tempHand.push(card);
        let newScore = scoreHand(tempHand, true);

        if (newScore > 21)
            outcomes["bust"] += currentProb * tempCount[card];
        else if (newScore >= 17)
            outcomes[newScore] += currentProb * tempCount[card];
        else
            outcomes = dealerNext(tempHand, deck, outcomes, tempCount, currentProb * tempCount[card]);
    }
    return outcomes; //don't need?
}

function playerNext(hand, deck, outcomes, count, prob = 1) {
    //Calculate probability of each new potential hand
    let totalCards = 0;
    for (let c in count)
        totalCards += count[c];
    let currentProb = prob/totalCards;

    //Create theoretical hands for "next" deck draw
    for(let i = 0; i < deck.length; i++)
    {
        let tempHand = []; //use let here because recursion may override this
        let tempCount = {};
        Object.assign(tempHand, hand);
        Object.assign(tempCount, count);
        let card = deck[i];
        tempHand.push(card);
        let newScore = scoreHand(tempHand, false);

        if (newScore > 21)
            outcomes["bust"] += currentProb * tempCount[card];
        else
            outcomes[newScore] += currentProb * tempCount[card];
    }
    return outcomes;//don't need?
}

function scoreHand(hand, hideFirst = false) {
    let totalScore = 0;
    let totalAce = 0;
    let i = 0;
    if(hideFirst) //Don't count 1st card
        i = 1;
    while(i < hand.length) {
        let card = hand[i];
        if (card === "A") {
            totalScore += 11;
            totalAce += 1;
        }
        else if(value10.has(card))
            totalScore +=10;
        else
            totalScore += parseInt(card);
        i++;
    }
    while(totalScore > 21 && totalAce > 0) {
        totalScore -= 10;
        totalAce -= 1;
    }
    return totalScore;
}

function clearHands() {
    children = document.querySelectorAll('.card');
    for(let i = 0; i < children.length; i++)
        children[i].remove();
    dealerHand = [];
    playerHand = [];
    updateDisplay;
}

function resetDecks() {
    let numDecks = document.getElementById("decks").value;
    currentDeck = [];
    for(decks = 0; decks < numDecks; decks++)
        for(let i = 0; i < fullDeck.length; i++)
            currentDeck.push(fullDeck[i]);
    shuffle(currentDeck);

    currentCount = {};
    Object.assign(currentCount, fullCount);
    for (var card in fullCount)
        currentCount[card] = fullCount[card] * numDecks;
    
    runningCount = 0;
    trueCount = 0;

    document.getElementById("deal").disabled = false;
}

function shuffle(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }
}


/*Listeners*/
document.querySelector("#set_decks").addEventListener('click', resetDecks);
document.querySelector("#deal").addEventListener('click', deal);
document.querySelector("#hit").addEventListener('click', hit);
document.querySelector("#stay").addEventListener('click', stay);
// document.querySelector("#double").addEventListener('click', double);
// document.querySelector("#split").addEventListener('click', split);
// document.querySelector("#surrender").addEventListener('click', surrender);