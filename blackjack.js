/*

Notes for users:
Win percentages are probability of win / probability of win or lose. This ignores ties.

TODO
Current issues
0) Make OOP - Decks, Hands, Game - functions should include: shuffle, reset deck, draw? Hand?
1) When deck resets, there is no indication.
2) Card counting includes face down dealer card right now - need to exclude until revealed
    Solution: In deal function, add facedown card back into count. In stay function, subtract it.
3) Change game so dealer hits on soft 17 (more common?)
4) Can bet negative, fix that

Develop
Add deviations for count
Single game win rates?
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

/*Classes*/
class Game { //all visual updates should be handled by this object
    bankroll; //# means private?
    balance;
    numDecks;
    currentDeck;
    currentBet;
    dealerHand;
    playerHand;
    dealerOutcomeProbs;
    playerOutcomeProbsOnHit; 
    trueWinIfStay; 
    trueWinIfHit; 

    constructor(bankroll, numDecks) {
        this.bankroll = bankroll;
        this.balance = bankroll;
        this.numDecks = numDecks;
        this.currentDeck = new Deck(numDecks);
        this.currentBet = 0;
        this.dealerHand = new Hand(true);
        this.playerHand = new Hand(false);
        document.getElementById("deal").disabled = false;
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

        setTimeout(() => {document.getElementById("hit").disabled = false}, 2005);
        setTimeout(() => {document.getElementById("stay").disabled = false}, 2005);
        
        setTimeout(() => {this.checkBlackjack()}, 2050);
        
        setTimeout(() => {this.dealerProbs()}, 2100);
        setTimeout(() => {this.playerProbs()}, 2110);
        setTimeout(() => {this.winProbs()}, 2120);
        setTimeout(() => {this.updateProbs()}, 2130);
    }

    checkBlackjack() { //needed in order to chekc blackjack on delay
        if (this.playerHand.scoreHand() === 21)
        { // endRound will result in Push if dealer also has blackjack, otherwise, player wins automatically.
            this.dealerHand.reveal();
            this.endRound();
            return true;
        }
        return false;
    }

    hit(){
        let score = this.playerHand.hit(this.currentDeck);
        this.updateDisplay();
        if (score > 21)
        {
            this.dealerHand.reveal();
            this.endRound();
        }
    }

    stay() { //iterates dealer until >= 17
        this.dealerHand.hideFirst = false;
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
        if (playerScore === 21 && this.playerHand.cardList.length === 2)
        {
            dealerStatus = "";
            playerStatus = "BLACKJACK";
            this.balance += Math.floor(this.currentBet * 2.5);
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
        else if (dealerScore === playerScore)
        {
            dealerStatus = "";
            playerStatus = "PUSH";
            this.balance += this.currentBet;
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
 
    dealerProbs(){
        let outcomes = {"bust":0, "21":0, "20":0, "19":0, "18":0, "17":0};
        this.dealerOutcomeProbs = this.currentDeck.calcDealer(this.dealerHand, outcomes);
        console.log(this.dealerOutcomeProbs);
    }

    playerProbs(){
        let outcomes = {"bust":0, "21":0, "20":0, "19":0, "18":0, "17":0, "16":0, "15":0, "14":0, "13":0, "12":0, "11":0, "10":0, "9":0, "8":0, "7":0, "6":0};
        this.playerOutcomeProbsOnHit = this.currentDeck.calcPlayer(this.playerHand, outcomes);
        console.log(this.playerOutcomeProbsOnHit);
    }

    winProbs() {
        let winIfStay = 1;
        let playerScore = this.playerHand.scoreHand();
        for (let i = Math.max(17,playerScore); i <= 21; i++)
            winIfStay -= this.dealerOutcomeProbs[i.toString()]; //Subtract outcomes where dealer has higher value
        //True WinIfStay probability needs to ignore the chance of tying.
        if (playerScore > 21)
            this.trueWinIfStay = 0;
        else if (playerScore >= 17) //tie is possible, only consider probability of win / probability of not tying
            this.trueWinIfStay = winIfStay/(1 - this.dealerOutcomeProbs[playerScore]);
        else this.trueWinIfStay = winIfStay; //This should only be probability that dealer busts since player will have less than 17
    
        let winIfHit = 0;
        let loseIfHit = 0;
        for (let i = 17; i <= 21; i++)
        {
            for (let j = 6; j <= 21; j++)
            {
                if (j > i)
                    winIfHit += this.playerOutcomeProbsOnHit[j] * this.dealerOutcomeProbs[i];
                if (i > j)
                    loseIfHit += this.playerOutcomeProbsOnHit[j] * this.dealerOutcomeProbs[i];
            }
        }
        winIfHit += (1 - this.playerOutcomeProbsOnHit["bust"]) * this.dealerOutcomeProbs["bust"];
        loseIfHit += this.playerOutcomeProbsOnHit["bust"];
        this.trueWinIfHit = winIfHit/(winIfHit + loseIfHit);

        console.log(this.trueWinIfStay + " " + this.trueWinIfHit);
    }

    updateProbs(){ //build probability tables
        let p = '<tr><th>Outcomes</th>';
        for (let i = 6; i <=21; i++)
            p += '<th>' + i + '</th>';
        p += '<th>bust</th></tr>';
    
        p += '<tr> <th>Dealer</th>';
        for (let i = 6; i <=16; i++)
            p += '<td></td>';
        for(let i = 17; i <= 21; i++) //Dealer Distribution
            p += '<th>' + Math.round(this.dealerOutcomeProbs[i] * 1000) / 10 + '%</th>'; //add method create this percent calc
        p += '<th>' + Math.round(this.dealerOutcomeProbs['bust'] * 1000) / 10 + '%</th></tr>';
    
        p += '<tr><th>Player</th>'
        for(let i = 6; i <= 21; i++) //Player Distribution
            p += '<th>' + Math.round(this.playerOutcomeProbsOnHit[i] * 1000) / 10 + '%</th>';
        p += '<th>' + Math.round(this.playerOutcomeProbsOnHit['bust'] * 1000) / 10 + '%</th></tr>';
    
        let w = '<tr><th>Action</th><th>Win Rate</th></tr>';
        w += '<tr><th>Stay</th><th>' + Math.round(this.trueWinIfStay * 1000) / 10 + '%</th></tr>';
        w += '<tr><th>Hit</th><th>' + Math.round(this.trueWinIfHit * 1000) / 10 + '%</th></tr>';
    
        let r = '<tr><th>Method</th><th>Single Game Win Rate</th><th>Recommended Action</th></tr>';
        r += '<tr><th>Basic Strategy</th><th></th><th style="font-weight:bold">' + '???' + '</th></tr>';
        r += '<tr><th>Hi-Lo</th><th></th><th style="font-weight:bold">' + '???' + '</th></tr>';
        r += '<tr><th>Full Count</th><th></th><th style="font-weight:bold">' + (this.trueWinIfStay > this.trueWinIfHit ? 'stay' : 'hit') + '</th></tr>';
    
        document.getElementById('probabilities').innerHTML = p;
        document.getElementById('winRates').innerHTML = w;
        document.getElementById('recommend').innerHTML = r;    
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

    hit(deck){ //returns new hand value after hit
        let card = deck.draw();
        if(this.cardList.length === 0 && this.hideFirst)
        {
            deck.hideCard(card);
        }
        this.cardList.push(card);
        this.value = this.scoreHand();
        
        return this.value;
    }

    add(card){
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

    clearHand() {
        this.cardList = [];
        this.value = 0;
        if (this.dealer)
        {
            this.hideFirst = true;
        }
    }

}


/*Create Game */

currentGame = new Game(1000,1);

/*old Functions*/
/* function deal() {
    clearHands();
    currentBet = document.getElementById("bet").value;
    balance -= currentBet;
    document.getElementById("bet").setAttribute("disabled", "true");
    document.getElementById("balance").innerHTML = balance;
    document.getElementById("decks").disabled = true;
    document.getElementById("set_decks").disabled = true;
    document.getElementById("clear").disabled = true;
    revealDealer = false;
    setTimeout(() => {draw(playerHand, currentDeck)}, 500);
    setTimeout(() => {draw(dealerHand, currentDeck)}, 1000);
    setTimeout(() => {draw(playerHand, currentDeck)}, 1500);
    setTimeout(() => {draw(dealerHand, currentDeck)}, 2000);

    //check for blackjack
    
    document.getElementById("deal").disabled = true;
    setTimeout(() => {document.getElementById("hit").disabled = false}, 2000);
    setTimeout(() => {document.getElementById("stay").disabled = false}, 2000);


    setTimeout(() => {updateProbs()}, 2010);

}

function draw(hand, deck) {
    let card = deck.pop();
    

    currentCount[card]--;

    if(minus.has(card))
        runningCount--;
    if (plus.has(card))
        runningCount++;
    trueCount = runningCount/(deck.length/52);

    hand.push(card);
    updateDisplay(); //do separately
}

function updateDisplay() { //make separate function to do "p"+i
    //player
    for(let i = 0; i < playerHand.length; i++)
    {
        var card = playerHand[i];
        var currCard = document.getElementById("p"+i); //change currCard to cardElement
        if(currCard === null) //make separate method to use for both player and dealer
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
    var playerTotal = scoreHand(playerHand); //"playerScore"
    if (playerTotal > 21)
        playerTotal += " BUST"; //don't change int into string
    document.getElementById("playerTotal").innerHTML = playerTotal;
    //dealer
    for(i = 0; i < dealerHand.length; i++)
    {
        if (!revealDealer && i === 0) //change to ternary operator: var card = (!revealDealer && i === 0) ? "?" : dealerHand[i];
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
    document.getElementById("deckCount").innerHTML = currentDeck.length;
    document.getElementById("runningCount").innerHTML = runningCount;
    document.getElementById("trueCount").innerHTML = Math.round(trueCount * 10) / 10;

}

function updateProbs() { //Create Templating system for HTML?
    calcProbs(); //make calcProbs return dealerOutcomes, playerOutcomes, trueWins etc.

    //build probability tables
    let p = '<tr><th>Outcomes</th>';
    for (let i = 6; i <=21; i++)
        p += '<th>' + i + '</th>';
    p += '<th>bust</th></tr>';

    p += '<tr> <th>Dealer</th>';
    for (let i = 6; i <=16; i++)
        p += '<td></td>';
    for(let i = 17; i <= 21; i++) //Dealer Distribution
        p += '<th>' + Math.round(dealerOutcomes[i] * 1000) / 10 + '%</th>'; //add method create this percent calc
    p += '<th>' + Math.round(dealerOutcomes['bust'] * 1000) / 10 + '%</th></tr>';

    p += '<tr><th>Player</th>'
    for(let i = 6; i <= 21; i++) //Player Distribution
        p += '<th>' + Math.round(playerOutcomes[i] * 1000) / 10 + '%</th>';
    p += '<th>' + Math.round(playerOutcomes['bust'] * 1000) / 10 + '%</th></tr>';

    let w = '<tr><th>Action</th><th>Win Rate</th></tr>';
    w += '<tr><th>Stay</th><th>' + Math.round(trueWinIfStay * 1000) / 10 + '%</th></tr>';
    w += '<tr><th>Hit</th><th>' + Math.round(trueWinIfHit * 1000) / 10 + '%</th></tr>';

    let r = '<tr><th>Method</th><th>Single Game Win Rate</th><th>Recommended Action</th></tr>';
    r += '<tr><th>Basic Strategy</th><th></th><th style="font-weight:bold">' + '???' + '</th></tr>';
    r += '<tr><th>Hi-Lo</th><th></th><th style="font-weight:bold">' + '???' + '</th></tr>';
    r += '<tr><th>Full Count</th><th></th><th style="font-weight:bold">' + (trueWinIfStay > trueWinIfHit ? 'stay' : 'hit') + '</th></tr>';

    document.getElementById('probabilities').innerHTML = p;
    document.getElementById('winRates').innerHTML = w;
    document.getElementById('recommend').innerHTML = r;


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
        endRound();
    }
    updateProbs();
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
            trueWinIfStay = 0;
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
    {
        trueWinIfStay = 0;
        document.getElementById("playerTotal").innerHTML = playerScore + " PUSH";
    }

    endRound();
}

function endRound() {
    document.getElementById("deal").disabled = false;
    document.getElementById("hit").disabled = true;
    document.getElementById("stay").disabled = true;
    document.getElementById("clear").disabled = false;
    document.getElementById("bet").disabled = false;

    checkDeckSize();
    document.getElementById("decks").disabled = false;
    document.getElementById("set_decks").disabled = false;
}

function checkDeckSize() { //do this inline
    if (currentDeck.length < numDecks * 13)
        resetDecks();
}

function calcProbs() { //make more variables local, not global and return outputs to update probs.
    
    //Inefficient method uses all cards in available decks
    //Better method uses "card list" (13 total cards) and checks currentCount for available cards

    //Dealer probability
    //Dictionary of all outcomes from 17 to bust (Dealer will recursively hit until in range or bust)
    dealerOutcomes = {"bust":0, 21:0, 20:0, 19:0, 18:0, 17:0}; //make this local not global
    dealerNext(dealerHand, cardList, dealerOutcomes, currentCount);
    
    //Player outcomes
    playerOutcomes = {"bust":0, 21:0, 20:0, 19:0, 18:0, 17:0, 16:0, 15:0, 14:0, 13:0, 12:0, 11:0, 10:0, 9:0, 8:0, 7:0, 6:0};
    playerNext(playerHand, cardList, playerOutcomes, currentCount);

    //Recommended Decision
    winIfStay = 1;
    playerScore = scoreHand(playerHand);
    for (let i = Math.max(17,playerScore); i <= 21; i++)
        winIfStay -= dealerOutcomes[i]; //Subtract outcomes where dealer has higher value
    //True WinIfStay probability needs to ignore the chance of tying.
    if (playerScore > 21)
        trueWinIfStay = 0;
    else if (playerScore >= 17) //tie is possible, only consider probability of win / probability of not tying
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
}

function dealerNext(hand, deck, outcomes, count, prob = 1) { // don't return?
    //Calculate probability of each new potential hand
    let totalCards = 0;
    for (let c in count)
        totalCards += count[c];
    let currentProb = prob/totalCards;

    //Create theoretical hands for "next" deck draw
    for(let i = 0; i < deck.length; i++)
    {
        let tempHand = [];
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
        let tempHand = [];
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
    let i = 0; //CHANGE to ternary
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
}

function resetDecks() {
    numDecks = document.getElementById("decks").value;
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
    document.getElementById("set_decks").innerHTML = "Reset";

}
*/



/*Listeners*/
document.querySelector("#set_decks").addEventListener('click', currentGame.resetDecks.bind(currentGame));
document.querySelector("#deal").addEventListener('click', currentGame.deal.bind(currentGame));
document.querySelector("#hit").addEventListener('click', currentGame.hit.bind(currentGame));
document.querySelector("#stay").addEventListener('click', currentGame.stay.bind(currentGame));
// document.querySelector("#double").addEventListener('click', double);
// document.querySelector("#split").addEventListener('click', split);
// document.querySelector("#surrender").addEventListener('click', surrender);
//document.querySelector("#clear").addEventListener('click', clearHands);