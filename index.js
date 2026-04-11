const form = document.getElementById("searchForm");
const input = document.getElementById("wordInput");
const errorMsg = document.getElementById("error");

const wordEl = document.getElementById("word");
const phoneticEl = document.getElementById("phonetic");
const definitionsEl = document.getElementById("definitions");
const synonymsEl = document.getElementById("synonyms");

const audioBtn = document.getElementById("audioBtn");
const saveBtn = document.getElementById("saveBtn");
const favList = document.getElementById("favList");

let audioSrc = "";
let currentWord = "";

form.addEventListener("submit", function(e) {
  e.preventDefault();
  fetchWord(input.value.trim());
});

// clear previous results
function clearResults() {
  wordEl.textContent = "";
  phoneticEl.textContent = "";
  definitionsEl.innerHTML = "";
  synonymsEl.innerHTML = "";

  saveBtn.classList.add("hidden"); // hide save button
  audioBtn.classList.add("hidden"); // hide audio button
}

// fetch data from API
async function fetchWord(word) {
    clearResults()
  errorMsg.classList.add("hidden");

  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);

    if (!res.ok) throw new Error("Word not found");

    const data = await res.json();
    displayData(data[0]);

  } catch (err) {
    showError("Word not found. Try another.");
  }
}

// display data on page
function displayData(data) {
  currentWord = data.word;
  wordEl.textContent = data.word;
  saveBtn.classList.remove("hidden");

  phoneticEl.textContent = data.phonetic || "";

  definitionsEl.innerHTML = "";
  synonymsEl.innerHTML = "";

  const meanings = data.meanings;

  meanings.forEach(m => {
    const def = m.definitions[0];

    definitionsEl.innerHTML += `
      <p><strong>${m.partOfSpeech}</strong>: ${def.definition}</p>
      <p><em>${def.example || ""}</em></p>
    `;

    if (m.synonyms.length > 0) {
      synonymsEl.innerHTML += `<p>Synonyms: ${m.synonyms.join(", ")}</p>`;
    }
  });
   // Audio
  const audio = data.phonetics.find(p => p.audio);
  if (audio) {
    audioSrc = audio.audio;
    audioBtn.classList.remove("hidden");
  }

  saveBtn.classList.remove("hidden");

}

// audio playback
audioBtn.addEventListener("click", () => {
  const audio = new Audio(audioSrc);
  audio.play();
});

// save favorite word
saveBtn.addEventListener("click", () => {
  let saved = JSON.parse(localStorage.getItem("words")) || [];

  if (!saved.includes(currentWord)) {
    saved.push(currentWord);
    localStorage.setItem("words", JSON.stringify(saved));
    renderFavorites();
  }
});

// render saved words
function renderFavorites() {
  favList.innerHTML = "";
  const saved = JSON.parse(localStorage.getItem("words")) || [];

  saved.forEach(word => {
    const li = document.createElement("li");
    li.textContent = word;

    li.addEventListener("click", () => fetchWord(word));

    favList.appendChild(li);
  });

  input.value = "";
}

renderFavorites();

// error handling
function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.remove("hidden");
}