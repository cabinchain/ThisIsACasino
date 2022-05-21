/*global variables*/

var funds = 100;
var randPocket = "00";
/* betList represents with 0, then 00, then 1-36 */
var betList = {"0":0, "00":0,"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0,"8":0,"9":0,
            "10":0,"11":0,"12":0,"13":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,
            "20":0,"21":0,"22":0,"23":0,"24":0,"25":0,"26":0,"27":0,"28":0,"29":0,
            "30":0,"31":0,"32":0,"33":0,"34":0,"35":0,"36":0};

var buttonList ={"black":[1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31,33,35],
                "red":[2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36],


                }

/*functions*/

function bet(clickedCellEvent) {

    /*find what cell was clicked*/
    const clickedCell = clickedCellEvent.target;
    var betNumber = clickedCell.getAttribute('innerHTML');
    /*change cell to bet*/
    if(clickedCell.className === "cell") {
        clickedCell.setAttribute('class', 'bet');
        funds -= 1;
        document.getElementById("funds").innerHTML= "Funds: "+funds;
        betList[betNumber] += 1;
    }
    else {
        clickedCell.setAttribute('class', 'cell');
        funds += 1;
        document.getElementById("funds").innerHTML= "Funds: "+funds;
        betList[betNumber] -=1
    }
}


function betMultiple(buttonID) {
    console.log(buttonID);
    currList = buttonList[buttonID];
    for(i = 0; i < 18; i++)
    {
        cellToBet = currList[i];
        cellElement = document.getElementById(cellToBet);
        cellElement.click();
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
document.querySelectorAll('input[type="button"]').forEach((button) => {button.addEventListener('click', function () {betMultiple(button.id)})});


/*wheel*/
document.querySelector('.roulette-wheel').addEventListener('click', spinWheel);
document.querySelector('.roulette-wheel').addEventListener('click', payout);

