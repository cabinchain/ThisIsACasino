/**
 * @jest-environment jsdom
 */

import {Game, Deck, Hand} from '../js/blackjack';

//Tests for Hand
let hand1 = new Hand(false);
test("Add Ace to empty hand, returns 11", () =>{
    expect(hand1.add("A")).toBe(11);
});
test("Add J to hand with Ace, returns 21", () =>{
    expect(hand1.add("J")).toBe(21);
});
test("Check if A,J is soft hand", () =>{
    expect(hand1.softHand()).toBe(true);
});
test("Add A to hand with A,J, returns 12", () =>{
    expect(hand1.add("A")).toBe(12);
});

let hand2 = new Hand(true);
hand2.cardList = [6,7];
test("Check if 6,7 is soft hand", () =>{
    expect(hand2.softHand()).toBe(false);
});
test("Check if 6,7 is soft hand", () =>{
    expect(hand2.softHand()).toBe(false);
});
test("Score hidden hand should be 7", () =>{
    expect(hand2.scoreHand()).toBe(7);
});
test("Check hidden card", () =>{
    expect(hand2.hiddenCard()).toBe(6);
});
test("Check value of hidden hand", () =>{
    expect(hand2.peak()).toBe(13);
});
test("Reveal Card", () =>{
    expect(hand2.reveal()).toBe(13);
});


//Tests for Deck

const cards = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

let deck1 = new Deck(2);
test("Two decks has 100 cards", () =>{
    expect((deck1.currentDeck.length)).toBe(104);
});
test("Hide A and count", () =>{
    deck1.hideCard("A");
    expect(deck1.hiloCount).toBe(1);
});
test("reveal card to be A", () =>{
    expect(deck1.revealCard()).toBe("A");
});
test("count after reveal", () =>{ //if prior test failed, this can also fail
    expect(deck1.hiloCount).toBe(0);
});
 test("Draw gets a valid card", () =>{
     expect(new Set(cards)).toContain(deck1.draw());
 });

 //tests for dealer distribution calcs
deck1.currentCount = {"A":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0,
"8":0,"9":0,"10":0,"J":0,"Q":0,"K":1};
let outcomes0 = {"bust":0, "21":0, "20":0, "19":0, "18":0, "17":0};
let deckhand1 = new Hand(true);
deckhand1.cardList = ["2","A","J"]; //calcDealer always ignores 1st card
let outcomes1 = deck1.calcDealer(deckhand1, outcomes0);
test("Result can only be 21", () =>{
    expect(outcomes1["21"]).toBe(1);
});

let deck2 = new Deck();
deck2.currentCount = {"A":3,"2":3,"3":3,"4":3,"5":3,"6":3,"7":3,
"8":3,"9":3,"10":3,"J":3,"Q":3,"K":3};
outcomes0 = {"bust":0, "21":0, "20":0, "19":0, "18":0, "17":0};
let deckhand2 = new Hand(true);
deckhand2.cardList = ["2","3"];
let outcomes2 = deck2.calcDealer(deckhand2, outcomes0);
let total = 0;
for (const [k, v] of Object.entries(outcomes2)){
    total += v;
}
test("results add up to 1", () =>{
    expect(Math.round(total)).toBe(1);
});

//test for player distribution calcs
let deck3 = new Deck();
deck3.currentCount = {"A":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0,
"8":0,"9":0,"10":0,"J":0,"Q":0,"K":1};
outcomes0 = {"bust":0, "21":0, "20":0, "19":0, "18":0, "17":0};
let deckhand3 = new Hand(false);
deckhand3.cardList = ["5","5"];
let outcomes3 = deck3.calcPlayer(deckhand3, outcomes0);
test("Result can only be 20", () =>{
    expect(outcomes3["20"]).toBe(1);
});

let deck4 = new Deck();
deck4.currentCount = {"A":3,"2":3,"3":3,"4":3,"5":3,"6":3,"7":3,
"8":3,"9":3,"10":3,"J":3,"Q":3,"K":3};
outcomes0 = {"bust":0, "21":0, "20":0, "19":0, "18":0, "17":0, "16":0, "15":0, "14":0, "13":0, "12":0, "11":0, "10":0, "9":0, "8":0, "7":0, "6":0};
let deckhand4 = new Hand(true);
deckhand4.cardList = ["J","3"];
let outcomes4 = deck4.calcDealer(deckhand4, outcomes0);
let total2 = 0;
for (const [k, v] of Object.entries(outcomes4)){
    total2 += v;
}
test("results add up to 1", () =>{
    expect(Math.round(total2)).toBe(1);
});
let total4 = 0;
for (let i = 6; i < 14; i++){
    total4 += outcomes4[i.toString()];
}
test("Everything below 14 is 0", () =>{
    expect(Math.round(total4)).toBe(0);
});

//Tests for Game
/*
let game1 = new Game(1000,2);
game1.dealerHand.cardList = ["2", "3"];
game1.playerHand.cardList = ["A", "K"];
test("Game object test function checkBlackjack", () =>{
    expect(game1.checkBlackjack()).toBe(true);
});
*/

let game2 = new Game(1000,2);
game2.playerHand.cardList = ["9", "K"];
let dealerOutcomes2 = {"bust":0.19, "21":0.165, "20":0.145, "19":0.2, "18":0.2, "17":0.1};
test("0.3/0.8 chance of winning based on probability dealer has 17 or 18, excludes prob of 19", () =>{
    expect(Math.round(game2.calcWinIfStay(dealerOutcomes2) * 1000)/1000).toBe(0.375);
});

let game3 = new Game(1000,2);
let dealerOutcomes3 = {"bust":0.5, "21":0, "20":0.5, "19":0, "18":0, "17":0};
let playerOutcomes3 = {"bust":0, "21":0.5, "20":0, "19":0.5, "18":0, "17":0, "16":0, "15":0, "14":0, "13":0, "12":0, "11":0, "10":0, "9":0, "8":0, "7":0, "6":0};
test("75% chance of winning", () =>{
    expect(Math.round(game3.calcWinIfHit(dealerOutcomes3, playerOutcomes3) * 1000)/1000).toBe(0.75);
});

