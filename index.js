// Get elements
const form = document.getElementById("searchForm");
const input = document.getElementById("wordInput");
const errorMsg = document.getElementById("error");

const wordElement = document.getElementById("word");
const phoneticsElement = document.getElementById("phonetics");
const definitionsElement = document.getElementById("definitions");
const synonymsElement = document.getElementById("synonyms");

const audioBtn = document.getElementById("audioBtn");
const saveBtn = document.getElementById("saveBtn");
const favList = document.getElementById("favList");

// Variables
let audioSrc = "";
let currentWord = "";

// Form submit
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const word = input.value.trim();

  if (word !== "") {
    getWord(word);
  }
});

// Clear previous results
function clearResults() {
  wordElement.textContent = "";
  phoneticsElement.textContent = "";
  definitionsElement.innerHTML = "";
  synonymsElement.innerHTML = "";

  audioBtn.classList.add("hidden");
  saveBtn.classList.add("hidden");
  errorMsg.classList.add("hidden");
}

// Fetch word from API
async function getWord(word) {
  clearResults();

  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);

    if (!response.ok) {
      throw new Error("Word not found");
    }

    const data = await response.json();
    showWord(data[0]);

  } catch (error) {
    showError("Word not found. Try again.");
  }
}

// Display word data
function showWord(data) {
  currentWord = data.word;
  wordElement.textContent = data.word;

  // phonetics text
  phoneticsElement.textContent = data.phonetics[0] ?.text || "";

  // definitions
  data.meanings.forEach((meaning) => {
    const definition = meaning.definitions[0];

    const p = document.createElement("p");
    p.textContent = `${meaning.partOfSpeech}: ${definition.definition}`;
    definitionsElement.appendChild(p);

    if (definition.example) {
      const example = document.createElement("p");
      example.textContent = `Example: ${definition.example}`;
      definitionsElement.appendChild(example);
    }

    // synonyms
    if (meaning.synonyms && meaning.synonyms.length > 0) {
      const syn = document.createElement("p");
      syn.textContent = `Synonyms: ${meaning.synonyms.join(", ")}`;
      synonymsElement.appendChild(syn);
    }
  });

  // audio
  const audio = data.phonetics.find(p => p.audio);

  if (audio) {
    audioSrc = audio.audio;
    audioBtn.classList.remove("hidden");
  }

  saveBtn.classList.remove("hidden");
}

// Play audio
audioBtn.addEventListener("click", () => {
  if (audioSrc) {
    new Audio(audioSrc).play();
  }
});

// Save word
saveBtn.addEventListener("click", () => {
  let words = JSON.parse(localStorage.getItem("words")) || [];

  if (!words.includes(currentWord)) {
    words.push(currentWord);
    localStorage.setItem("words", JSON.stringify(words));
    displayFavorites();
  }
});

// Show saved words
function displayFavorites() {
  favList.innerHTML = "";

  let words = JSON.parse(localStorage.getItem("words")) || [];

  words.forEach((word) => {
    const li = document.createElement("li");
    li.textContent = word;

    li.addEventListener("click", () => getWord(word));

    favList.appendChild(li);
  });

  input.value = "";
}

// Show error
function showError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.remove("hidden");
}

displayFavorites();