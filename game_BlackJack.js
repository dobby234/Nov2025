/* BLACKJACK GAME
Ace: Player can choose Ace value (1 or 11), Computer always uses 1 
2-10 : Face Value
Jack, Queen, King : 10*/

// DOM elements
const startGameBtn = document.getElementById('startGameBtn');
const cardBtn = document.getElementById('cardBtn');
const stopBtn = document.getElementById('stopBtn');
const newGameBtn = document.getElementById('newGameBtn');
const currentDiv = document.getElementById('CurrentCard');
const playerCardsDiv = document.getElementById('playerCards');
const playerScoreDiv = document.getElementById('playerScore');
const computerCardsDiv = document.getElementById('computerCards');
const computerScoreDiv = document.getElementById('computerScore');
const computerSection = document.getElementById('computerSection');
const resultDiv = document.getElementById('result');


//GLOBAL VARIABLES
const suits = ["Hearts", "Diamonds", "Clubs", "Spades"];
const ranks = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King"];
const targetScore = 21;

//CREATE A CARD AS AN OBJECT
function createCard(rank, suit) {
  return { rank: rank, suit: suit };
}

//FORMAT CARD AS A STRING
function cardToString(card) {
   return card.rank.toLowerCase() + '_of_' + card.suit.toLowerCase();
}

//FUNCTION TO GET IMAGE PATH
function getImagePath(card){
  let path = 'images//' + cardToString(card) + '.png';
  return path;
}

//CREATE A DECK OF 52 CARDS
function createDeck() {
   const deck = [];
   for (let i = 0; i < suits.length; i++) {
	for (let j = 0; j < ranks.length; j++) {
	   deck.push(createCard(ranks[j], suits[i]));
	}
   }
  return deck;
}

//SHUFFLE THE DECK
function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

//DEAL CARDS FROM DECK
function dealCard(deck, drawnCards, count = 1) { //parameter-count is used to deal multiple cards, by default set to 1
  
  for (let i = 0; i < count; i++) {
    if (deck.length > 0) {
       let card = deck.shift();
       drawnCards.push(card);
    }
  }
}

//COLLECT AND SHUFFLE PLAYED CARDS BACK TO THE DECK
function collectCards(deck, playerCards, computerCards) {
  let playedCards = playerCards.concat(computerCards); // combines both arrays
  shuffleDeck(playedCards); // shuffles the combined cards 
  
  // Add the shuffled cards back to the deck
  for (let i = 0; i < playedCards.length; i++) {
    //Remove any stored chosenValue for Ace before returning to deck 
    delete playedCards[i].chosenValue;
    deck.push(playedCards[i]);
  }
}

//CALCULATE CARD VALUE
function getCardValue(card, chosenValue) {
    switch (card.rank) {
      case 'Ace':
        return chosenValue || 1; 
      case 'Jack':
      case 'Queen':
      case 'King':
        return 10;
      default:
        return parseInt(card.rank);
    }
}

//CALCULATE SCORE
function calculateScore(cards) {
  let score = 0;
  for (let i = 0; i < cards.length; i++) {
      if (cards[i].chosenValue !== undefined) {
        score += cards[i].chosenValue;
    } else {
      score += getCardValue(cards[i]);
    }
  }
  return score;
}

//CHECK IF BUST - returns a Boolean True if bust
function isBust(score) {
  return score > targetScore;
}


// ACE HANDLING
//Ask Ace Value to the player
function askAceValue() {
  let choice = parseInt(prompt('You drew an Ace! Choose its value:\n1 or 11'));
  while (isNaN(choice) || (choice !== 1 && choice !== 11)) {
    choice = parseInt(prompt('Invalid choice! Please enter 1 or 11:'));
  }
  return choice;
}

//Processes Ace values for player and computer
function processAce(cards, isComputer = false) {
 for (let i = 0; i < cards.length; i++) {
  if (cards[i].rank === 'Ace' && cards[i].chosenValue === undefined) {
    cards[i].chosenValue = isComputer ? 1 : askAceValue();
  }
}
}


//BUTTON CONTROL FUNCTIONS
function disableGameButtons() {
  cardBtn.disabled = true;
  stopBtn.disabled = true;
}

function enableGameButtons() {
  cardBtn.disabled = false;
  stopBtn.disabled = false;
}

//DEAL PLAYER 2 INITIAL CARDS
function startPlayerInitialCards() {
  dealCard(deck, playerCards, 2);
  processAce(playerCards, false);
  gameActive = true;

  const score = calculateScore(playerCards);
  displayCards(playerCards, playerCardsDiv);
  playerScoreDiv.textContent = `Score: ${score}`;

  const lastCardOnly = [playerCards[playerCards.length - 1]];
  displayCards(lastCardOnly, currentDiv);

  if (isBust(score)) {
    gameActive = false;
    disableGameButtons();
    showResult(`You are BUST with ${score}! Computer wins!`, false);
    newGameBtn.classList.remove('hidden');
  }
}

//DETERMINE WINNER and SHOW WHO WON
function determineWinner(playerScore, computerScore) {
  let message = '';
  let playerWon = false;
  if (isBust(playerScore)) {
    message = `Computer wins! (You were bust with ${playerScore})`;
    playerWon = false;
  }
  
  else if (isBust(computerScore)) {
    message = `You win! (Computer was bust with ${computerScore})`;
    playerWon = true;
  }
  
  else if (computerScore >= playerScore) {
    message = `Computer wins! (Computer: ${computerScore}, You: ${playerScore})`;
    playerWon = false;
  } else {
    message = `You win! (You: ${playerScore}, Computer: ${computerScore})`;
    playerWon = true;
  }
  showResult(message, playerWon);
  newGameBtn.classList.remove('hidden');
}

//COMPUTER'S GAME TURN
function computerTurn(playerScore) {
    dealCard(deck, computerCards, 2);
    processAce(computerCards, true);
    updateComputerDisplay();
    drawNextCard(playerScore);
}

function drawNextCard(playerScore) {
    let score = calculateScore(computerCards);
    
    if (score < playerScore && !isBust(score)) {
        setTimeout(function() {
            dealCard(deck, computerCards);
            processAce(computerCards, true);
            
            updateComputerDisplay();
            drawNextCard(playerScore);
        }, 1000);
    } else {
        determineWinner(playerScore, score);
    }
}

//INITIALIZING THE GAME
let deck = createDeck();
shuffleDeck(deck);
let playerCards = [];
let computerCards = [];
let gameActive = false;

// Show start button, hide others
startGameBtn.classList.remove('hidden');
disableGameButtons();
currentDiv.innerHTML = '<div style="color: #999;">Click Start Game to begin!</div>';

//DISPLAY CARDS as image in the webpage
function displayCards(cards, container) {
  container.innerHTML = '';
  if (cards.length === 0) {
    container.innerHTML = '<div style="color: #999;">No cards yet</div>';
    return;
  }

  for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const cardImg = document.createElement('img');
      cardImg.setAttribute('src', getImagePath(card));
      cardImg.className = `card${i}`;
      container.appendChild(cardImg);
  }
}


//DISPLAY CARDS DRAWN BY COMPUTER
function updateComputerDisplay() {
    displayCards(computerCards, computerCardsDiv);
    computerScoreDiv.textContent = `Score: ${calculateScore(computerCards)}`;
    
    let lastCardOnly = [computerCards[computerCards.length - 1]];
    displayCards(lastCardOnly, currentDiv);
}

//SHOW RESULT - WHO WON AS A SEPARATE BLOCK IN THE WEBPAGE
function showResult(message, playerWon) {
    resultDiv.textContent = message;
    resultDiv.className = 'result ' + (playerWon ? 'win' : 'lose');
    resultDiv.style.display = 'block';
    setTimeout(function() {
      resultDiv.classList.add('show');
    }, 10);
}

//PLAYER'S TURN - EVENT HANDLERS
//Start game button handler
startGameBtn.addEventListener('click', function() {
    startGameBtn.classList.add('hidden');
    enableGameButtons();
    startPlayerInitialCards();
});


//Card button handler
cardBtn.addEventListener('click', function() {
    if (!gameActive) return;
    
    dealCard(deck, playerCards);
    processAce(playerCards, false);
    
    const score = calculateScore(playerCards);
    displayCards(playerCards, playerCardsDiv);
    playerScoreDiv.textContent = `Score: ${score}`;
    
    if (isBust(score)) {
        gameActive = false;
        disableGameButtons();
        showResult(`You are BUST with ${score}! Computer wins!`, false);
        newGameBtn.classList.remove('hidden');
    }
    
    const lastCardOnly = [playerCards[playerCards.length - 1]];
    displayCards(lastCardOnly, currentDiv);
});


//Stop button handler
stopBtn.addEventListener('click', function() {
    if (!gameActive) return;
  
    gameActive = false;
    disableGameButtons();
    
    computerSection.classList.remove('hidden');
    const playerScore = calculateScore(playerCards);
    computerTurn(playerScore);
});


//New game button handler
newGameBtn.addEventListener('click', function() {
  collectCards(deck, playerCards, computerCards);
            
  playerCards = [];
  computerCards = [];
  gameActive = false;
            
  displayCards(playerCards, playerCardsDiv);
  displayCards(computerCards, computerCardsDiv);
  currentDiv.innerHTML = '<div style="color: #999;">No card drawn yet</div>';
  playerScoreDiv.textContent = 'Score: 0';
  computerScoreDiv.textContent = 'Score: 0';
  computerSection.classList.add('hidden');
  resultDiv.style.display = 'none';
  resultDiv.classList.remove('show');
 
  startGameBtn.classList.remove('hidden');
  disableGameButtons();
  newGameBtn.classList.add('hidden');
});


//Hint event listeners
const hintElement = document.querySelector('p');
if (hintElement) {
  hintElement.addEventListener('mouseover', function(event) {
    event.target.innerHTML = "<i>You can choose the value of an ace to be 1 or 11 ! The computer always chooses 1!</i>";
  });
  
  hintElement.addEventListener('mouseleave', function(event) {
    event.target.innerHTML = "<i>Show Hint again!</i>";
  });
}