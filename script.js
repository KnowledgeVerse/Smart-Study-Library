/* DOM Elements */
const boardSelect   = document.getElementById('boardSelect');
const classSelector = document.getElementById('classSelector');
const subjectFilter = document.getElementById('subjectFilter');
const bookGrid      = document.getElementById('bookGrid');
const toggleSidebar = document.getElementById('toggleSidebar'); // Side-bar toggle button
const sidebar       = document.getElementById('sidebar');

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

/* 1. SIDEBAR TOGGLE LOGIC (HIDE/UNHIDE) */
if (toggleSidebar) {
  toggleSidebar.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    
    // आइकॉन को बदलने का लॉजिक (Left to Right arrow)
    const icon = toggleSidebar.querySelector('i');
    if (sidebar.classList.contains('collapsed')) {
      icon.className = 'bx bx-chevron-right';
    } else {
      icon.className = 'bx bx-chevron-left';
    }
  });
}

/* 2. INITIAL LOAD */
window.addEventListener('DOMContentLoaded', () => {
  buildSubjectFilter();
  loadBooks();
});

/* 3. CLASS SELECTION */
classSelector.addEventListener('click', e => {
  if (e.target.tagName !== 'BUTTON') return;
  
  selectedClass = e.target.dataset.class;
  
  // Active class button update
  document.querySelectorAll('.class-selector button').forEach(b => b.classList.remove('active'));
  e.target.classList.add('active');
  
  selectedSubject = 'all'; // Reset subject when class changes
  buildSubjectFilter();
  loadBooks();
});

/* 4. BOARD SELECTION */
boardSelect.addEventListener('change', e => {
  selectedBoard = e.target.value;
  loadBooks();
});

/* 5. SUBJECT FILTER */
subjectFilter.addEventListener('click', e => {
  if (e.target.tagName !== 'BUTTON') return;
  
  selectedSubject = e.target.dataset.sub;
  
  document.querySelectorAll('.subject-filter button').forEach(b => b.classList.remove('active'));
  e.target.classList.add('active');
  
  loadBooks();
});

/* 6. BUILD SUBJECT BUTTONS */
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

/* 7. LOAD & RENDER BOOKS */
async function loadBooks() {
  try {
    const res = await fetch('data/books.json');
    const data = await res.json();
    
    let list = data.books.filter(b => {
      return b.class === selectedClass &&
             b.board === selectedBoard &&
             (selectedSubject === 'all' || b.subject === selectedSubject);
    });
    
    renderBooks(list);
  } catch (error) {
    console.error("Error loading books:", error);
    bookGrid.innerHTML = '<p>Error loading data. Please check data/books.json</p>';
  }
}

function renderBooks(list) {
  bookGrid.innerHTML = '';
  
  if (list.length === 0) {
    bookGrid.innerHTML = '<p class="no-data">No books found for this selection.</p>';
    return;
  }

  list.forEach(b => {
    const card = document.createElement('div');
    card.className = 'book-card';
    
    // कवर्स के लिए लॉजिक: अगर इमेज नहीं है तो कलरफुल ग्रेडिएंट बॉक्स दिखाएं
    const coverHtml = (b.cover && b.cover !== "" && b.cover !== "none") 
      ? `<img src="${b.cover}" alt="${b.name}">`
      : `<div class="book-cover-placeholder">
           <div class="class-label">Class ${b.class}</div>
           <div class="subject-label">${b.subject}</div>
           <div class="book-title-small">${b.name}</div>
         </div>`;

    card.innerHTML = `
      ${coverHtml}
      <div class="info">
        <h4>${b.name}</h4>
        <div class="meta">${b.subject} • ${b.board}</div>
        <div class="actions">
          <button class="download" onclick="downloadBook('${b.pdf}')">Download</button>
          <button class="read" onclick="readBook('${b.pdf}')">Read Online</button>
        </div>
      </div>
    `;
    bookGrid.appendChild(card);
  });
}

/* 8. ACTIONS */
function downloadBook(url) {
  const a = document.createElement('a');
  a.href = url;
  a.download = url.split('/').pop();
  a.click();
}

function readBook(url) {
  window.open(url, '_blank');
}

/* SCIENTIFIC BACKGROUNDS MAPPING */
const scientificBackgrounds = {
  'preschool': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022', // Playful
  '1': 'https://images.unsplash.com/photo-1454165833767-027eeaf196ce?q=80&w=2070',
  '6': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2070', // Biology/Microscope
  '10': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070', // Physics/Atom
  '12': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072', // Space/Quantum
  'default': 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2190'
};

function updateBackground(cls) {
  const bgUrl = scientificBackgrounds[cls] || scientificBackgrounds['default'];
  document.body.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('${bgUrl}')`;
}

/* Update Render Function */
function renderBooks(list) {
  bookGrid.innerHTML = '';
  updateBackground(selectedClass); // Background update on change

  list.forEach(b => {
    const card = document.createElement('div');
    card.className = 'book-card';
    
    const coverHtml = (b.cover && b.cover !== "" && b.cover !== "none") 
      ? `<img src="${b.cover}" alt="${b.name}">`
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
          <button class="download" onclick="downloadBook('${b.pdf}')">Download</button>
          <button class="read" onclick="readBook('${b.pdf}')">Read</button>
        </div>
      </div>
    `;
    bookGrid.appendChild(card);
  });
}

const searchIconBtn = document.getElementById('searchIconBtn');
const searchBoxContainer = document.getElementById('searchBoxContainer');
const closeSearch = document.getElementById('closeSearch');
const bookSearch = document.getElementById('bookSearch');

// Typing Effect Content
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
        setTimeout(erasePlaceholder, 2000);
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

// Open Search & Start Typing
searchIconBtn.addEventListener('click', () => {
    searchBoxContainer.classList.add('active');
    bookSearch.focus();
    bookSearch.placeholder = "";
    charIndex = 0;
    clearTimeout(typingInterval);
    typePlaceholder();
});

// Close Search
closeSearch.addEventListener('click', () => {
    searchBoxContainer.classList.remove('active');
    clearTimeout(typingInterval);
    bookSearch.value = '';
    loadBooks(); 
});

// All Books Search Logic
async function loadBooks() {
    const res = await fetch('data/books.json');
    const data = await res.json();
    const searchTerm = bookSearch.value.toLowerCase();

    let list = data.books.filter(b => {
        // Agar 'all' mode hai toh board aur class check nahi hogi
        const isAllMode = (selectedClass === 'all');
        const matchesClass = isAllMode || b.class === selectedClass;
        const matchesBoard = isAllMode || b.board === selectedBoard;
        const matchesSubject = (selectedSubject === 'all' || b.subject === selectedSubject);
        const matchesSearch = b.name.toLowerCase().includes(searchTerm);

        return matchesClass && matchesBoard && matchesSubject && matchesSearch;
    });
    renderBooks(list);
}

bookSearch.addEventListener('input', loadBooks);