/*global variables*/

var funds = 100;
var randPocket = "00";
/* betList represents with 0, then 00, then 1-36 */
var betList = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

/*functions*/

function bet(clickedCellEvent) {

    /*find what cell was clicked*/
    const clickedCell = clickedCellEvent.target;

    /*change cell to bet*/
    if(clickedCell.className === "cell") {
        clickedCell.setAttribute('class', 'bet');
        funds -= 1;
        document.getElementById("funds").innerHTML= "Funds: "+funds;
    }
    else {
        clickedCell.setAttribute('class', 'cell');
        funds += 1;
        document.getElementById("funds").innerHTML= "Funds: "+funds;
    }
}

/*Spin the wheel*/
function spinWheel() {

    var randNum = Math.floor(Math.random()*(37));
    if (randNum === 37){
        randPocket = "00";
    }
    else{
        randPocket = randNum.toString();
    }
    document.getElementById("pocket").innerHTML= randPocket;
}

 function payout() {
    var allBets = document.getElementsByClassName("bet");
    var totalBets = allBets.length;
    for (var i = 0; i < totalBets; i++) {
        let bet = allBets[0];
        let betNum = bet.getAttribute('id');
         /*Bet is the bet class element passed by payout. This will payout the winnings*/
        if (randPocket === betNum) {
            funds += 35;
            document.getElementById("funds").innerHTML= "Funds: "+funds;
        }
        /*return cell to blank */
        let cell = document.getElementById(betNum);
        cell.setAttribute('class', 'cell');
    }



 }



/*Listeners*/ 

/*betting */
document.querySelectorAll('.cell').forEach(cell => cell.addEventListener('click',bet));


/*wheel*/
document.querySelector('.roulette-wheel').addEventListener('click', spinWheel);
document.querySelector('.roulette-wheel').addEventListener('click', payout);

