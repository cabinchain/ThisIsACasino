/**
 * @jest-environment jsdom
 */

import {Hand} from '../blackjack';

const hand1 = new Hand(false);
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

const hand2 = new Hand(true);
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