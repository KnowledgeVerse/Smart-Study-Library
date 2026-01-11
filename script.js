/* DOM Elements */
const boardSelect   = document.getElementById('boardSelect');
const classSelector = document.getElementById('classSelector');
const subjectFilter = document.getElementById('subjectFilter');
const bookGrid      = document.getElementById('bookGrid');
const toggleSidebar = document.getElementById('toggleSidebar');
const sidebar       = document.getElementById('sidebar');
const searchIconBtn = document.getElementById('searchIconBtn');
const searchBoxContainer = document.getElementById('searchBoxContainer');
const closeSearch = document.getElementById('closeSearch');
const bookSearch = document.getElementById('bookSearch');

let selectedClass   = 'preschool';
let selectedBoard   = 'NCERT';
let selectedSubject = 'all';

/* SUBJECTS BY CLASS */
const subjectsMap = {
  preschool:['Alphabet','Numbers','Rhymes','Picture Stories'],
  1:['Maths','English','Hindi','EVS'],
  2:['Maths','English','Hindi','EVS'],
  3:['Maths','English','Hindi','EVS','Science'],
  4:['Maths','English','Hindi','EVS','Science'],
  5:['Maths','English','Hindi','EVS','Science'],
  6:['Maths','English','Hindi','Science','Social Science','Computer'],
  7:['Maths','English','Hindi','Science','Social Science','Computer'],
  8:['Maths','English','Hindi','Science','Social Science','Computer'],
  9:['Maths','English','Hindi','Science','Social Science','Computer'],
  10:['Maths','English','Hindi','Science','Social Science','Computer'],
  11:['Maths','English','Physics','Chemistry','Biology','Computer'],
  12:['Maths','English','Physics','Chemistry','Biology','Computer']
};

/* SCIENTIFIC BACKGROUNDS MAPPING */
const scientificBackgrounds = {
  'preschool': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022',
  '1': 'https://images.unsplash.com/photo-1454165833767-027eeaf196ce?q=80&w=2070',
  '6': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2070',
  '10': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070',
  '12': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072',
  'default': 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2190'
};

/* SIDEBAR TOGGLE */
if (toggleSidebar) {
  toggleSidebar.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    const icon = toggleSidebar.querySelector('i');
    icon.className = sidebar.classList.contains('collapsed') ? 'bx bx-chevron-right' : 'bx bx-chevron-left';
  });
}

/* INITIAL LOAD */
window.addEventListener('DOMContentLoaded', () => {
  buildSubjectFilter();
  loadBooks();
});

/* CLASS SELECTION */
classSelector.addEventListener('click', e => {
  if (e.target.tagName !== 'BUTTON') return;
  selectedClass = e.target.dataset.class;
  document.querySelectorAll('.class-selector button').forEach(b => b.classList.remove('active'));
  e.target.classList.add('active');
  selectedSubject = 'all';
  buildSubjectFilter();
  loadBooks();
});

/* BOARD SELECTION */
boardSelect.addEventListener('change', e => {
  selectedBoard = e.target.value;
  loadBooks();
});

/* SUBJECT FILTER */
subjectFilter.addEventListener('click', e => {
  if (e.target.tagName !== 'BUTTON') return;
  selectedSubject = e.target.dataset.sub;
  document.querySelectorAll('.subject-filter button').forEach(b => b.classList.remove('active'));
  e.target.classList.add('active');
  loadBooks();
});

/* BUILD SUBJECT BUTTONS */
function buildSubjectFilter() {
  subjectFilter.innerHTML = '<button data-sub="all" class="active">All</button>';
  const subjects = subjectsMap[selectedClass] || [];
  subjects.forEach(sub => {
    const btn = document.createElement('button');
    btn.dataset.sub = sub;
    btn.textContent = sub;
    subjectFilter.appendChild(btn);
  });
}

/* CHECK PDF EXISTS */
async function checkPdfExists(pdfPath) {
  try {
    const response = await fetch(pdfPath, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/* UPDATE BACKGROUND */
function updateBackground(cls) {
  const bgUrl = scientificBackgrounds[cls] || scientificBackgrounds['default'];
  document.body.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('${bgUrl}')`;
}

/* RENDER BOOKS */
async function renderBooks(list) {
  bookGrid.innerHTML = '';
  updateBackground(selectedClass);

  for (const b of list) {
    const pdfExists = await checkPdfExists(b.pdf);
    const card = document.createElement('div');
    card.className = 'book-card';
    
    const coverHtml = (b.cover && b.cover !== "" && b.cover !== "none") 
      ? `<img src="${b.cover}" alt="${b.name}" onerror="this.src='https://via.placeholder.com/220x280/cccccc/000?text=No+Cover'">`
      : `<div class="book-cover-placeholder">
           <div class="placeholder-board">${b.board}</div>
           <div class="placeholder-class">CLASS ${b.class}</div>
           <div class="placeholder-subject">${b.subject}</div>
           <div style="font-size:0.7rem; margin-top:10px; opacity:0.6;">${b.name}</div>
         </div>`;

    card.innerHTML = `
      ${coverHtml}
      <div class="info">
        <h4>${b.name}</h4>
        <div class="meta">${b.subject} • ${b.board}</div>
        <div class="actions">
          <button class="download" onclick="downloadBook('${b.pdf}')" ${!pdfExists ? 'disabled style="opacity:0.5;"' : ''}>
            ${pdfExists ? 'Download' : 'Not Available'}
          </button>
          <button class="read" onclick="readBook('${b.pdf}')" ${!pdfExists ? 'disabled style="opacity:0.5;"' : ''}>
            ${pdfExists ? 'Read' : 'Not Available'}
          </button>
        </div>
      </div>
    `;
    bookGrid.appendChild(card);
  }
}

/* LOAD BOOKS - SINGLE FUNCTION */
async function loadBooks() {
  try {
    const res = await fetch('data/books.json');
    if (!res.ok) throw new Error("JSON file not found");
    
    const data = await res.json();
    const localData = JSON.parse(localStorage.getItem('myCustomBooks')) || [];
    const allBooks = [...data.books, ...localData];

    const searchTerm = bookSearch.value.toLowerCase();

    let list = allBooks.filter(b => {
      const isAllMode = (selectedClass === 'all');
      const matchesClass = isAllMode || b.class === selectedClass;
      const matchesBoard = isAllMode || b.board === selectedBoard;
      const matchesSubject = (selectedSubject === 'all' || b.subject === selectedSubject);
      const matchesSearch = b.name.toLowerCase().includes(searchTerm);

      return matchesClass && matchesBoard && matchesSubject && matchesSearch;
    });
    
    renderBooks(list);
  } catch (error) {
    console.error("❌ Error loading books:", error);
    bookGrid.innerHTML = '<p style="color:red;">Error loading books: ' + error.message + '</p>';
  }
}

/* BOOK ACTIONS */
function downloadBook(url) {
  const a = document.createElement('a');
  a.href = url;
  a.download = url.split('/').pop();
  a.click();
}

function readBook(pdfPath) {
  window.open(pdfPath, '_blank');
}

/* SEARCH FUNCTIONALITY */
const searchPrompts = ["Maths Grade 10...", "Physics NCERT...", "Science Spark...", "English Reader..."];
let promptIndex = 0;
let charIndex = 0;
let typingInterval;

function typePlaceholder() {
  const currentPrompt = searchPrompts[promptIndex];
  if (charIndex < currentPrompt.length) {
    bookSearch.placeholder += currentPrompt.charAt(charIndex);
    charIndex++;
    typingInterval = setTimeout(typePlaceholder, 100);
  } else {
    setTimeout(() => {
      charIndex = currentPrompt.length;
      erasePlaceholder();
    }, 2000);
  }
}

function erasePlaceholder() {
  if (charIndex > 0) {
    bookSearch.placeholder = bookSearch.placeholder.slice(0, -1);
    charIndex--;
    typingInterval = setTimeout(erasePlaceholder, 50);
  } else {
    promptIndex = (promptIndex + 1) % searchPrompts.length;
    typePlaceholder();
  }
}

/* SEARCH EVENTS */
searchIconBtn.addEventListener('click', () => {
  searchBoxContainer.classList.add('active');
  bookSearch.focus();
  bookSearch.placeholder = "";
  charIndex = 0;
  clearTimeout(typingInterval);
  typePlaceholder();
});

closeSearch.addEventListener('click', () => {
  searchBoxContainer.classList.remove('active');
  clearTimeout(typingInterval);
  bookSearch.value = '';
  loadBooks();
});

bookSearch.addEventListener('input', loadBooks);

/* ADD NEW BOOK */
function addNewBook(newBook) {
  let localBooks = JSON.parse(localStorage.getItem('myCustomBooks')) || [];
  localBooks.push(newBook);
  localStorage.setItem('myCustomBooks', JSON.stringify(localBooks));
  loadBooks();
}