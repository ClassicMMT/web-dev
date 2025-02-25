const wordsDisplay = document.getElementById("wordsDisplay");
const inputDisplay = document.getElementById("wordsInput");

let index = 0; // word index
let timerStarted = false;
let timeToComplete = 60; // seconds
let startTime; // time the timer was started
let timeRemaining; // seconds
let timerInterval; // reference to the interval counter
let numberWordsCorrect = 0;
let capitaliseProbability = 0;

inputDisplay.addEventListener("keydown", (event) => {
  // disable enter and arrow keys
  if (
    ["Enter", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
      event.key,
    )
  ) {
    event.preventDefault();
    return;
  }

  const wordToType = document.getElementById(index);
  let typedInput = inputDisplay.value;
  // adding event.key is necessary since we're using the keydown event, and typedInput does not contain the event key yet
  if (event.key != " " && event.key != "Backspace") {
    typedInput += event.key;
  } else if (event.key === "Backspace") {
    typedInput = typedInput.slice(0, -1);
  }
  const doesMatch = evaluateInput(wordToType.innerText, typedInput);

  // start the timer if it hasn't started
  if (timerInterval === undefined) startTimer();

  // if the key is space, we commit the word, otherwise we check if the typed input is valid
  if (event.key === " ") {
    // prevent space from being added to the input
    event.preventDefault();
    // clear display
    inputDisplay.value = "";
    // check if word was correct
    if (doesMatch && wordToType.innerText.length === typedInput.length) {
      wordToType.classList.add("correct");
      wordToType.classList.remove("highlight-incorrect");
      numberWordsCorrect++;
    } else {
      wordToType.classList.add("incorrect");
      // any incorrect highlights need to be removed
      wordToType.classList.remove("highlight-incorrect");
    }
    // increase index by one since the word has been committed
    index++;
    // change highlighting
    highlight();
    // check if we've moved onto the next row and, if so, remove it
    if (movedRow()) removeRow();
  } else {
    if (!doesMatch) {
      // if the keypress is wrong
      wordToType.classList.remove("highlight");
      wordToType.classList.add("highlight-incorrect");
    } else {
      wordToType.classList.add("highlight");
      wordToType.classList.remove("highlight-incorrect");
    }
  }
});

// BACKEND
function evaluateInput(wordToType, typedInput) {
  // sometimes the " " key will be passed since we're using keydown events
  typedInput = typedInput.trimEnd();
  console.log(wordToType, typedInput);
  // Case 1: typedInput is longer, thus incorrect
  if (typedInput.length > wordToType.length) {
    return false;
  }

  // make both strings the same size for easy comparison
  const minLength = Math.min(wordToType.length, typedInput.length);
  wordToType = wordToType.substring(0, minLength);
  typedInput = typedInput.substring(0, minLength);

  // Case 2: typedInput is shorter or equal to target and correct
  if (wordToType === typedInput) {
    return true;
  }

  // Case 3: typedInput is shorter or equal to target and incorrect
  return false;
}

async function loadWords() {
  try {
    // fetch the words file
    const response = await fetch("words.txt");
    if (!response.ok) throw new Error("File Not Found.");
    // convert to text
    const text = await response.text();
    // split by spaces
    const wordsArray = text.split(" ");
    return wordsArray;
  } catch (error) {
    console.error("Error loading words:", error);
  }
}

async function chooseRandomWords() {
  // load the words
  const wordsArray = await loadWords();
  // sort using a random comparator
  const shuffledWords = wordsArray.sort(() => 0.5 - Math.random());
  // take the first 400
  const words = shuffledWords.slice(0, 400);
  return words;
}

function movedRow() {
  // function which checks if the next word is in the same row as the previous word
  const nextWord = document.getElementById(index);
  const previousWord = document.getElementById(index - 1);

  // if the tops of the spans don't match, we've moved to another row
  if (
    nextWord.getBoundingClientRect().top !=
    previousWord.getBoundingClientRect().top
  ) {
    return true;
  }
  return false;
}

function checkSpanOverflow(span) {
  // function to check if the a span is overflowing
  const containerRectangle = wordsDisplay.getBoundingClientRect();
  if (span.getBoundingClientRect().bottom > containerRectangle.bottom) {
    return true;
  }
  return false;
}

function startTimer() {
  // function to start the timer
  startTime = new Date();
  // set interval is not precise, so need to use the date method
  timerInterval = setInterval(() => {
    updateTimer();
    // if the time has ended, stop the timer and run end functions
    if (timeRemaining < 60) {
      clearInterval(timerInterval);
      hideDisplays();
      showWPM();
      showRestartButton();
      displayConfetti();
    }
  }, 1000);
}

function updateTimer() {
  // calculates the number of minutes and seconds remaining and updates the relevant elements
  const endTime = startTime / 1000 + timeToComplete;
  const currentTime = new Date() / 1000;
  // update the global variable
  timeRemaining = Math.round(endTime - currentTime);
  // calculate time remaining
  const minutesRemaining = Math.floor(timeRemaining / 60);
  const secondsRemaining = timeRemaining % 60;
  // find elements
  const minutesElement = document.getElementById("minutes");
  const secondsElement = document.getElementById("seconds");
  // set elements
  minutesElement.innerText = minutesRemaining;
  secondsElement.innerText = String(secondsRemaining).padStart(2, "0");
}

function capitaliseWord(word) {
  // capitalises a word using the predefined probability
  if (Math.random() <= capitaliseProbability) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }
  return word;
}

// FRONTEND
async function displayWords() {
  const wordsToDisplay = await chooseRandomWords();

  // clear all content
  wordsDisplay.innerHTML = "";

  wordsToDisplay.forEach((word, index) => {
    const span = document.createElement("span");
    // randomly capitalise
    word = capitaliseWord(word);
    // assign id
    span.id = index;
    // assign text
    span.innerText = word;
    // insert into html
    wordsDisplay.appendChild(span);
  });

  // hide words which are overflowing
  hideOverflowingSpans();

  // highlight the first word
  highlight();
}

function highlight() {
  // function to highlight element at the current index (and remove previous highlighting)
  const spanToHighlight = document.getElementById(index);
  spanToHighlight.classList.add("highlight");
  // remove the previous highlight
  if (index > 0)
    document.getElementById(index - 1).classList.remove("highlight");
}

function hideOverflowingSpans() {
  const spans = document.querySelectorAll("span");
  spans.forEach((span) => {
    // if the span is overflowing, we hide it
    if (checkSpanOverflow(span)) span.classList.add("hidden");
  });
}

function removeRow() {
  // goes through the spans and removes those which are in the top row
  for (let i = wordsDisplay.firstChild.id; i < index; i++) {
    wordsDisplay.removeChild(document.getElementById(i));
  }
  // after removing the row, we can now show more words
  revealHiddenSpans();
}

function revealHiddenSpans() {
  Array.from(wordsDisplay.children).forEach((span) => {
    // if the spans are not overflowing anymore, we unhide them
    if (!checkSpanOverflow(span)) {
      span.classList.remove("hidden");
    }
  });
}
function hideDisplays() {
  // hides the displays when the timer is up
  document.getElementById("inputTimerContainer").classList.add("hidden");
  wordsDisplay.classList.add("hidden");
  inputDisplay.classList.add("hidden");
}

function showRestartButton() {
  const restartButton = document.getElementById("restart");
  restartButton.classList.remove("hidden");
}

function showWPM() {
  // shows the words per minute after the timer has ran out
  const wpm = document.getElementById("wpm");
  // wpm has a hidden class by default
  wpm.classList.remove("hidden");
  // create two new spans
  const wpmTextSpan = document.createElement("span");
  const wpmResultSpan = document.createElement("span");
  // set contents
  wpmTextSpan.innerText = "WPM: ";
  wpmResultSpan.innerText = numberWordsCorrect;
  // add to document
  wpm.appendChild(wpmTextSpan);
  wpm.appendChild(wpmResultSpan);
}

function displayConfetti() {
  // function to display finishing confetti
  confetti({
    particleCount: 1000,
    spread: 500,
    origin: { y: 0.5 },
  });
}

// Executed code
displayWords();
