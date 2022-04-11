/*
TODO

Current issues
Overcounting dealer Busts in the probability calculator because all outcomes are weighted equally, so when Dealer shows 10 and simulates a 6, we look at the entire deck again and bust on most cards.
Deck can run out, no warnings or reshuffles implemented yet
Card counting includes face down dealer card right now - need to exclude until revealed
Change game so dealer hits on soft 17 (more common?)
If player hits blackjack, does the dealer finish his draw?
Can bet negative, fix that

Develop
Calculate expected value by action for:
    No counting
    Point counting
    full counting
        Put hidden dealer card back into temp deck when calculating counts
Betting (Done)
Blackjack pays 3-2 (also blackjack for dealer)
Double Down
Split
Surrender
Change options (blackjack payout, # of decks, H17 or S17)
If player hits 21, should I automatically stay?

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
    //setTimeout(() => {calcProbs()}, 2010);
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

    console.log(currentCount);
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
    
    //Dictionary of all outcomes from 17 to bust (Dealer will recursively hit until in range or bust)
    var dealerOutcomes = {"bust":0, 21:0, 20:0, 19:0, 18:0, 17:0};
    dealerNext(dealerHand, currentDeck, dealerOutcomes);
    console.log(dealerOutcomes);

    //This section may not be necessary if dealerNext always adds up outcomes to 1... Test to see if we can remove.
    let possibleOutcomes = 0;
    for(var el in dealerOutcomes) 
        possibleOutcomes += parseFloat(dealerOutcomes[el]);
    console.log(possibleOutcomes);

    var dealerProbs = {"bust":0, 21:0, 20:0, 19:0, 18:0, 17:0};
    for(el in dealerOutcomes)
        dealerProbs[el] = dealerOutcomes[el]/possibleOutcomes;
        console.log(dealerProbs);
    
    
/*calculate dealer probability first, get distribution (dictionary) of results from 17-21. Will be recursive. */

    // No counting
    // Calculate probability distribution in a list for each 
    //

}

function dealerNext(hand, deck, outcomes, prob = 1) {
    //Create theoretical hand for each deck draw 
    let currentProb = prob/deck.length;
    for(let i = 0; i < deck.length; i++)
    {
        let tempHand = []; //use let here because recursion may override this
        let tempDeck = [];
        Object.assign(tempHand, hand);
        Object.assign(tempDeck, deck);
        tempHand.push((tempDeck.splice(i, 1))[0]);
        let newScore = scoreHand(tempHand, true);

        if (newScore > 21)
            outcomes["bust"] += currentProb;
        else if (newScore >= 17)
            outcomes[newScore] += currentProb;
        else
            outcomes = dealerNext(tempHand, tempDeck, outcomes, currentProb);
    }
    return outcomes;
}

// function nextCard(hand, deck) {
//     //calculates distribution of drawing one more card
//     let score = scoreHand(hand);
//     //Dictionary of all outcomes from 4 to bust (2 and 3 not possible because if one card is Ace, will be considered 11)
//     let distribution = {"bust":0, 21:0, 20:0, 19:0, 18:0, 17:0, 16:0, 15:0, 14:0, 13:0, 12:0, 11:0, 10:0, 9:0, 8:0, 7:0, 6:0, 5:0, 4:0, 3:0, 2:0};
//     for(i = 0; i < deck.length; i++)
//     {
//         card = deck[i];
//         tempHand = [];
//         Object.assign(tempHand, hand);
//         tempHand.push(card);
        
//     }
//     return distribution;
// }

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
    for(i = 0; i < children.length; i++)
        children[i].remove();
    dealerHand = [];
    playerHand = [];
    updateDisplay;
}

function resetDecks(numDecks = 1) {
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