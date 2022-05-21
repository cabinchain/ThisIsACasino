/*

Notes for users:
Win percentages are probability of win / probability of win or lose. This ignores ties.

TODO
Current issues
1) When deck resets, there is no indication.
4) Can bet negative, fix that
5) Full count recommendation only considers 1 hit, not overall strategy
6) If dealer shows A or 10, dealer predictor should not consider 21 possible
7) For unit testing, want to have a parameter to select hands and such. Is there a way to make "hand this.dealerHand" as a parameter
8) Change game so dealer hits on soft 17 (more common?)

Develop
Add deviations for count
Single game win rates?
Calculate expected value by action for:
    No counting
    hilo counting
    full counting

display deck count?
Split (This requires updating to multiple players)
Change options (blackjack payout, # of decks, H17 or S17)
Add Delay to dealer drawing cards in stay function

Unit Testing:
blackjack
Test on a push (betting money outcomes and display)
basic strategy outcomes

*/

/*Classes*/
class Game { //all visual updates should be handled by this object
    bankroll; //# means private?
    balance;
    numDecks;
    currentDeck;
    currentBet;
    dealerHand;
    playerHand;

    constructor(bankroll, numDecks) {
        this.bankroll = bankroll;
        this.balance = bankroll;
        this.numDecks = numDecks;
        this.currentDeck = new Deck(numDecks);
        this.currentBet = 0;
        this.dealerHand = new Hand(true);
        this.playerHand = new Hand(false);
        //document.getElementById("deal").disabled = false;
    }

    resetDecks(){
        this.numDecks = document.getElementById("decks").value;
        this.currentDeck = new Deck(this.numDecks);
        this.dealerHand.clearHand();
        this.playerHand.clearHand();
        this.currentBet = 0;

        document.getElementById("deal").disabled = false; //can we put these elsewhere?
        document.getElementById("set_decks").innerHTML = "Reset";
    }

    deal(){ //draw cards twice to each hand
        this.dealerHand.clearHand(); //This will change hideFirst to true.
        this.playerHand.clearHand();
        this.updateDisplay();
        this.currentBet = document.getElementById("bet").value;
        this.balance -= this.currentBet;
        document.getElementById("bet").setAttribute("disabled", "true");
        document.getElementById("balance").innerHTML = this.balance;
        document.getElementById("decks").disabled = true;
        document.getElementById("set_decks").disabled = true;
        document.getElementById("clear").disabled = true;
        document.getElementById("deal").disabled = true;
        
        setTimeout(() => {this.playerHand.hit(this.currentDeck)}, 500);
        setTimeout(() => {this.updateDisplay()}, 501);
        setTimeout(() => {this.dealerHand.hit(this.currentDeck)}, 1000);
        setTimeout(() => {this.updateDisplay()}, 1001);
        setTimeout(() => {this.playerHand.hit(this.currentDeck)}, 1500);
        setTimeout(() => {this.updateDisplay()}, 1501);
        setTimeout(() => {this.dealerHand.hit(this.currentDeck)}, 2000);
        setTimeout(() => {this.updateDisplay()}, 2001);

        setTimeout(() => {document.getElementById("hit").disabled = false}, 2002);
        setTimeout(() => {document.getElementById("stay").disabled = false}, 2002);
        setTimeout(() => {document.getElementById("double").disabled = false}, 2002);
        setTimeout(() => {document.getElementById("surrender").disabled = false}, 2002);
        
        setTimeout(() => {this.checkBlackjack()}, 2003);
        setTimeout(() => {this.checkPair()}, 2003);
        
        setTimeout(() => {this.updateProbs()}, 2005);
    }

    checkBlackjack() { //needed in order to check blackjack on delay
        if (this.playerHand.scoreHand() === 21)
        { // endRound will result in Push if dealer also has blackjack, otherwise, player wins automatically.
            this.dealerHand.reveal();
            this.endRound();
            return true;
        }
        if (this.dealerHand.peak() === 21)
        {
            this.dealerHand.reveal();
            this.endRound();
        }
        return false;
    }

    checkPair() {
        if (this.playerHand.isPair())
        {
            document.getElementById("split").disabled = false;
            return true;
        }
        return false;
    }

    hit(){
        let score = this.playerHand.hit(this.currentDeck);
        this.updateDisplay();
        this.updateProbs();
        document.getElementById("double").disabled = true; // Cannot double down after hitting once already
        if (score > 21)
        {
            this.dealerHand.reveal();
            this.endRound();
        }
    }

    stay() { //iterates dealer until >= 17
        this.dealerHand.reveal();
        this.updateDisplay();

        //deal dealer (will not deal if over 16 already)
        //let time = 250;
        let score = this.dealerHand.scoreHand();
        while(score < 17)
        {
            score = this.dealerHand.hit(this.currentDeck);
            this.updateDisplay();
            // Below is not working
            // setTimeout(() => {this.dealerHand.hit(this.currentDeck)}, time);
            // setTimeout(() => {this.updateDisplay()}, time);
            //time += 250;
        }
        this.endRound();
    }

    double() {
        // Double bet amount
        this.balance = parseInt(this.balance) + parseInt(this.currentBet); //this shouldn't be necessary but the numbers act like strings otherwise
        this.currentBet *= 2;
        this.hit();
        this.stay();
    }

    surrender() { //give up half your bet to quit hand
        this.playerHand.clearHand();
        this.dealerHand.reveal();
        this.endRound();
    }

    endRound(){ //Updates the winner, payouts, and buttons
        this.currentDeck.revealCard();
        this.updateDisplay();
        let dealerScore = this.dealerHand.scoreHand();
        let playerScore = this.playerHand.scoreHand();
        let dealerStatus = "";
        let playerStatus = "";
        //score winner (player wins on blackjack)
        //Pay bet (include blackjack payout)
        //update HTML incl buttons
        if (dealerScore === playerScore)
        {
            dealerStatus = "";
            playerStatus = "PUSH";
            this.balance += parseInt(this.currentBet);
        }
        else if (playerScore === 21 && this.playerHand.cardList.length === 2)
        {
            dealerStatus = "";
            playerStatus = "BLACKJACK";
            this.balance += Math.floor(this.currentBet * 2.5);
        }
        else if (dealerScore === 21 && this.playerHand.cardList.length === 2)
        {
            dealerStatus = "BLACKJACK";
            playerStatus = "";
            // No Payout
        }
        else if (playerScore > 21)
        {
            dealerStatus = "";
            playerStatus = "BUST";
        }
        else if (dealerScore > 21)
        { //player did not bust because of prior else if
            dealerStatus = "BUST";
            playerStatus = "WIN";
            this.balance += this.currentBet * 2;
        }
        else if (playerScore == 0)
        { //Surrendered
            dealerStatus = "";
            playerStatus = "SURRENDER";
            this.balance += Math.floor(this.currentBet / 2);
        }
        else if (dealerScore > playerScore)
        {
            dealerStatus = "";
            playerStatus = "LOSE";
            // No Payout
        }
        else if (dealerScore < playerScore)
        {
            dealerStatus = "";
            playerStatus = "WIN";
            this.balance += this.currentBet * 2;
        }
        
        document.getElementById("dealerTotal").innerHTML = dealerScore + " " + dealerStatus;
        document.getElementById("playerTotal").innerHTML = playerScore + " " + playerStatus;
        document.getElementById("balance").innerHTML = this.balance;
        
        //Update buttons
        document.getElementById("deal").disabled = false;
        document.getElementById("hit").disabled = true;
        document.getElementById("stay").disabled = true;
        document.getElementById("double").disabled = true;
        document.getElementById("split").disabled = true;
        document.getElementById("surrender").disabled = true;
        document.getElementById("clear").disabled = false;
        document.getElementById("bet").disabled = false;
    
        if (this.currentDeck.currentDeck.length < this.numDecks * 13) 
        {
            this.resetDecks();
        }
        document.getElementById("decks").disabled = false;
        document.getElementById("set_decks").disabled = false;
    }

    updateDisplay(){//make separate function to do "p"+i. This function updates the card visuals
   //player
   document.getElementById("playerHand").innerHTML = "";
   document.getElementById("dealerHand").innerHTML = "";

   for(let i = 0; i < this.playerHand.cardList.length; i++)
    {
        let card = this.playerHand.cardList[i];
        let cardElement = document.getElementById("p"+i);
        if(cardElement === null) //make separate method to use for both player and dealer?
        {
            let handHTML = document.getElementById("playerHand");
            let tag = document.createElement("div");
            tag.setAttribute("class", "card");
            tag.setAttribute("id", "p"+i);
            handHTML.appendChild(tag);
            cardElement = document.getElementById("p"+i);
        }
        cardElement.innerHTML = card;
    }
    //dealer
    for(let i = 0; i < this.dealerHand.cardList.length; i++)
    {
        let card = (this.dealerHand.hideFirst && i === 0) ? "?" : this.dealerHand.cardList[i];
        let cardElement = document.getElementById("d"+i);
        if(cardElement === null)
        {
            let handHTML = document.getElementById("dealerHand");
            let tag = document.createElement("div");
            tag.setAttribute("class", "card");
            tag.setAttribute("id", "d"+i);
            handHTML.appendChild(tag);
            cardElement = document.getElementById("d"+i);
        }
        cardElement.innerHTML = card;
    }

    //scores
    let dealerScore = this.dealerHand.scoreHand();
    let playerScore = this.playerHand.scoreHand();
    document.getElementById("dealerTotal").innerHTML = (dealerScore == 0) ? "" : dealerScore;
    document.getElementById("playerTotal").innerHTML = (playerScore == 0) ? "" : playerScore;

    //counts
    document.getElementById("deckCount").innerHTML = this.currentDeck.currentDeck.length;
    document.getElementById("runningCount").innerHTML = this.currentDeck.hiloCount;
    document.getElementById("trueCount").innerHTML = Math.round(this.currentDeck.trueCount * 10) / 10;

    }

    calcWinIfStay(dealerOutcomeProbs) {
        let winIfStay = 1;
        let playerScore = this.playerHand.scoreHand();
        for (let i = Math.max(17,playerScore); i <= 21; i++)
            winIfStay -= dealerOutcomeProbs[i.toString()]; //Subtract outcomes where dealer has higher value
        //True WinIfStay probability needs to ignore the chance of tying.
        if (playerScore > 21)
            winIfStay = 0;
        else if (playerScore >= 17) //tie is possible, only consider probability of win / probability of not tying
            winIfStay = winIfStay/(1 - dealerOutcomeProbs[playerScore]);
        // Otherwise, this should only be probability that dealer busts since player will have less than 17
        return winIfStay;
    }

    calcWinIfHit(dealerOutcomeProbs, playerOutcomeProbsOnHit) {
        let winIfHit = 0;
        let loseIfHit = 0;
        for (let i = 17; i <= 21; i++)
        {
            for (let j = 6; j <= 21; j++)
            {
                if (j > i)
                    winIfHit += playerOutcomeProbsOnHit[j] * dealerOutcomeProbs[i];
                if (i > j)
                    loseIfHit += playerOutcomeProbsOnHit[j] * dealerOutcomeProbs[i];
            }
        }
        winIfHit += (1 - playerOutcomeProbsOnHit["bust"]) * dealerOutcomeProbs["bust"];
        loseIfHit += playerOutcomeProbsOnHit["bust"];
        return winIfHit/(winIfHit + loseIfHit);
        
    }

    updateProbs(){ //build probability tables
        let dealerOutcomeProbs = {"bust":0, "21":0, "20":0, "19":0, "18":0, "17":0};
        dealerOutcomeProbs = this.currentDeck.calcDealer(this.dealerHand, dealerOutcomeProbs);
        let playerOutcomeProbsOnHit = {"bust":0, "21":0, "20":0, "19":0, "18":0, "17":0, "16":0, "15":0, "14":0, "13":0, "12":0, "11":0, "10":0, "9":0, "8":0, "7":0, "6":0};
        playerOutcomeProbsOnHit = this.currentDeck.calcPlayer(this.playerHand, playerOutcomeProbsOnHit);
        let winIfStay = this.calcWinIfStay(dealerOutcomeProbs);
        let winIfHit = this.calcWinIfHit(dealerOutcomeProbs, playerOutcomeProbsOnHit);
    
        let p = '<tr><th>Outcomes</th>';
        for (let i = 6; i <=21; i++)
            p += '<th>' + i + '</th>';
        p += '<th>bust</th></tr>';
    
        p += '<tr> <th>Dealer</th>';
        for (let i = 6; i <=16; i++)
            p += '<td></td>';
        for(let i = 17; i <= 21; i++) //Dealer Distribution
            p += '<th>' + Math.round(dealerOutcomeProbs[i] * 1000) / 10 + '%</th>'; //add method create this percent calc
        p += '<th>' + Math.round(dealerOutcomeProbs['bust'] * 1000) / 10 + '%</th></tr>';
    
        p += '<tr><th>Player Hit</th>'
        for(let i = 6; i <= 21; i++) //Player Distribution
            p += '<th>' + Math.round(playerOutcomeProbsOnHit[i] * 1000) / 10 + '%</th>';
        p += '<th>' + Math.round(playerOutcomeProbsOnHit['bust'] * 1000) / 10 + '%</th></tr>';
    
        let w = '<tr><th>Action</th><th>Win Rate</th></tr>';
        w += '<tr><th>Stay</th><th>' + Math.round(winIfStay * 1000) / 10 + '%</th></tr>';
        w += '<tr><th>Hit</th><th>' + Math.round(winIfHit * 1000) / 10 + '%</th></tr>';
    
        let r = '<tr><th>Method</th><th>Single Game Win Rate</th><th>Recommended Action</th></tr>';
        r += '<tr><th>Basic Strategy</th><th></th><th style="font-weight:bold">' + this.basicStrategy() + '</th></tr>';
        r += '<tr><th>Hi-Lo</th><th></th><th style="font-weight:bold">' + '???' + '</th></tr>';
        r += '<tr><th>Full Count</th><th></th><th style="font-weight:bold">'
        r += Math.max(winIfStay,winIfHit) < 0.25 ? 'Surrender' : (winIfHit > 0.5 ? 'Double' : (winIfStay > winIfHit ? 'Stay' : 'Hit') );
        r += '</th></tr>';
    
        document.getElementById('probabilities').innerHTML = p;
        document.getElementById('winRates').innerHTML = w;
        document.getElementById('recommend').innerHTML = r;
    }

    basicStrategy(){
        let playerIndex = this.playerHand.scoreHand();
        let dealerIndex = this.dealerHand.scoreHand();
        if (dealerIndex > 10)
        {
            dealerIndex -= 10;
        }
        let action = {'H':'Hit', 'D': 'Double', 'S':'Stay', 'U':'Surrender'};
        
        // if (this.playerHand.isPair())
        // {
        //     //look up pair splitting
        //     //return true if hit
        // }
        if (this.playerHand.softHand())
        {
            playerIndex = playerIndex - 11; // Minus 11 to remove ace, minus 1 to start index at 0;
            let softChart = 
            //   'A', '2', '3', '4', '5', '6', '7', '8', '9', '10' = Dealer Card
            [   ['H', 'H', 'H', 'H', 'D', 'D', 'H', 'H', 'H', 'H'], //A,A
                ['H', 'H', 'H', 'H', 'D', 'D', 'H', 'H', 'H', 'H'], //A,2
                ['H', 'H', 'H', 'H', 'D', 'D', 'H', 'H', 'H', 'H'], //A,3
                ['H', 'H', 'H', 'D', 'D', 'D', 'H', 'H', 'H', 'H'], //A,4
                ['H', 'H', 'H', 'D', 'D', 'D', 'H', 'H', 'H', 'H'], //A,5
                ['H', 'H', 'D', 'D', 'D', 'D', 'H', 'H', 'H', 'H'], //A,6
                ['H', 'D', 'D', 'D', 'D', 'D', 'S', 'S', 'H', 'H'], //A,7
                ['S', 'S', 'S', 'S', 'S', 'D', 'S', 'S', 'S', 'S'], //A,8
                ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'], //A,9
                ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'] //A,10 I don't think this will get used
            ];
            return action[softChart[playerIndex - 1][dealerIndex - 1]];
        }
        else
        {
            let hardChart = 
            //   'A', '2', '3', '4', '5', '6', '7', '8', '9', '10' = Dealer Card
            [   ['H', 'H', 'D', 'D', 'D', 'D', 'H', 'H', 'H', 'H'], //9
                ['H', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'H'], //10
                ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D'], //11
                ['H', 'H', 'H', 'S', 'S', 'S', 'H', 'H', 'H', 'H'], //12
                ['H', 'S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'H'], //13
                ['H', 'S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'H'], //14
                ['H', 'S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'U'], //15
                ['U', 'S', 'S', 'S', 'S', 'S', 'H', 'H', 'U', 'U']  //16
            ];
            if (playerIndex < 9)
            {
                return 'Hit';
            }
            if (playerIndex > 16)
            {
                return 'Stay';
            }
            return action[hardChart[playerIndex - 9][dealerIndex - 1]]; //Chart starts at 9
        }
    }

}

class Deck {

    plus = new Set(["2", "3", "4", "5", "6"]);
    minus = new Set(["10", "J", "Q", "K", "A"]);

    currentDeck;
    currentCount; //Counts all cards available in deck
    hiloCount; //Counts points for "better" or "worse" deck
    trueCount; // Used in blackjack card counting to make devations from basic strategy (is a blackjack thing). Uses hiloCount.
    hiddenCard; //remove from counting

    constructor(numDecks) {
        let fullDeck = ["A","A","A","A","2","2","2","2","3","3","3","3",
        "4","4","4","4","5","5","5","5","6","6","6","6","7","7","7","7",
        "8","8","8","8","9","9","9","9","10","10","10","10",
        "J","J","J","J","Q","Q","Q","Q","K","K","K","K"];
        this.currentCount = {"A":4,"2":4,"3":4,"4":4,"5":4,"6":4,"7":4,
        "8":4,"9":4,"10":4,"J":4,"Q":4,"K":4};
        this.currentDeck = [];
        for(let decks = 0; decks < numDecks; decks++)
            for(let i = 0; i < fullDeck.length; i++)
            this.currentDeck.push(fullDeck[i]);
        this.shuffle();
    
        for (let card in this.currentCount)
            this.currentCount[card] = this.currentCount[card] * numDecks;
        this.hiloCount = 0;
        this.trueCount = 0.0;
        this.hiddenCard = "";
    
    }

    shuffle() {
        for (let i = this.currentDeck.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            let temp = this.currentDeck[i];
            this.currentDeck[i] = this.currentDeck[j];
            this.currentDeck[j] = temp;
        }
    }

    draw() {
        let card = this.currentDeck.pop();

        /*updating counters */
        this.currentCount[card]--;
        if(this.minus.has(card))
            this.hiloCount--;
        if (this.plus.has(card))
            this.hiloCount++;
        this.trueCount = this.hiloCount/(this.currentDeck.length/52);

        return card;
    }

    hideCard(card) { //hide given card from the count. Assumes card has already been taken out of deck by draw function
        this.hiddenCard = card;
        this.currentCount[card]++;
        if(this.minus.has(card))
            this.hiloCount++;
        if (this.plus.has(card))
            this.hiloCount--;
            this.trueCount = this.hiloCount/(this.currentDeck.length/52);
    }

    revealCard() { //unhide and count the hidden card
        let card = this.hiddenCard;
        this.currentCount[card]--;
        if(this.minus.has(card))
            this.hiloCount--;
        if (this.plus.has(card))
            this.hiloCount++;
        this.trueCount = this.hiloCount/(this.currentDeck.length/52);
        this.hiddenCard = "";
        return card;
    }

    calcDealer(hand, outcomes, count = this.currentCount,prob = 1) { //previously dealernext()
        let cardList = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
        //Calculate probability of each new potential hand
        let totalCards = 0;
        for (let c in count)
            totalCards += count[c];
        let currentProb = prob/totalCards;
    
        //Create theoretical hands for "next" deck draw
        for(let i = 0; i < cardList.length; i++)
        {
            if (count[cardList[i]] > 0)
            {
                let tempHand = new Hand(true);
                let tempCount = {};
                for (let c in hand.cardList)
                {
                    tempHand.add(hand.cardList[c]);
                }
                Object.assign(tempCount, count);
                
                let card = cardList[i];
                let newScore = tempHand.add(card);
                tempCount[card]--;
        
                if (newScore > 21)
                    outcomes["bust"] += currentProb * count[card];
                else if (newScore >= 17)
                    outcomes[newScore.toString()] += currentProb * count[card];
                else
                    outcomes = this.calcDealer(tempHand, outcomes, tempCount, currentProb * count[card]);
            }
        }
        return outcomes;
    }

    calcPlayer(hand, outcomes, count = this.currentCount, prob = 1) { //previously playerNext
        let cardList = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
        //Calculate probability of each new potential hand
        let totalCards = 0;
        for (let c in count)
            totalCards += count[c];
        let currentProb = prob/totalCards;
    
        //Create theoretical hands for "next" deck draw
        for(let i = 0; i < cardList.length; i++)
        {
            if (count[cardList[i]] > 0)
            {
                let tempHand = new Hand(false);
                let tempCount = {};
                for (let c in hand.cardList)
                {
                    tempHand.add(hand.cardList[c]);
                }
                Object.assign(tempCount, count);

                let card = cardList[i];
                let newScore = tempHand.add(card);
                tempCount[card]--;

                if (newScore > 21)
                    outcomes["bust"] += currentProb * count[card];
                else
                    outcomes[newScore.toString()] += currentProb * count[card];
            }
        }
        return outcomes;
    }


}

class Hand {
    cardList;
    hideFirst;
    dealer;
    value;
    
    constructor(dealer){
        if (dealer)
        {
            this.dealer = true;
            this.hideFirst = true;
        }
        else
        {
            this.dealer = false;
            this.hideFirst = false;
        }
        this.cardList = [];
        this.value = 0;
    }

    hit(deck) { //returns new hand value after hit
        let card = deck.draw();
        if(this.cardList.length === 0 && this.hideFirst)
        {
            deck.hideCard(card);
        }
        this.cardList.push(card);
        this.value = this.scoreHand();
        
        return this.value;
    }

    add(card) { //adds card without drawing from a deck
        this.cardList.push(card);
        this.value = this.scoreHand();
        return this.value;
    }

    scoreHand() {
        let value10 = new Set(["10", "J", "Q", "K"]);
        let totalScore = 0;
        let totalAce = 0;
        let i = (this.hideFirst) ? 1 : 0; //don't count 1st card if hidden
        while(i < this.cardList.length) {
            let card = this.cardList[i];
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

    reveal() { //returns total hand value after showing hidden card
        this.hideFirst = false;
        this.value = this.scoreHand();
        return this.value;
    }

    hiddenCard() { //returns hidden card only if there is one
        if (this.cardList.length == 0)
        {
            return "";
        }
        if (this.hideFirst)
        {
            return this.cardList[0];
        }
        return "";
    }

    peak() { //returns value of full hand including face down card
        this.hideFirst = false;
        let score = this.scoreHand();
        this.hideFirst = true;
        return score;
    }

    clearHand() {
        this.cardList = [];
        this.value = 0;
        if (this.dealer)
        {
            this.hideFirst = true;
        }
    }

    softHand() { //soft hand means hand that includes A (only used with 2 cards)
        let i = (this.hideFirst) ? 1 : 0;
        return this.cardList.includes("A", i);
    }

    isPair() { //return true if first two cards are equal value
        let value10 = new Set(["10", "J", "Q", "K"]);
        let card0 = (value10.has(this.cardList[0])) ? "T" : this.cardList[0];
        let card1 = (value10.has(this.cardList[1])) ? "T" : this.cardList[1];
        if (card0 == card1)
        {
            return true;
        }
        return false;
    }

}

//import Hand from './hand.js';

/*Create Game */
let currentGame = new Game(1000,1);


/*Listeners*/
document.addEventListener('DOMContentLoaded', function () {
document.querySelector("#set_decks").addEventListener('click', currentGame.resetDecks.bind(currentGame));
document.querySelector("#deal").addEventListener('click', currentGame.deal.bind(currentGame));
document.querySelector("#hit").addEventListener('click', currentGame.hit.bind(currentGame));
document.querySelector("#stay").addEventListener('click', currentGame.stay.bind(currentGame));
document.querySelector("#double").addEventListener('click', currentGame.double.bind(currentGame));
// document.querySelector("#split").addEventListener('click', split);
document.querySelector("#surrender").addEventListener('click', currentGame.surrender.bind(currentGame));
//document.querySelector("#clear").addEventListener('click', clearHands);
});

//export {default as Game} from './Game';
//export {default as Deck} from './Deck';
//export {default as Hand} from './Hand';

export{Game, Deck, Hand};