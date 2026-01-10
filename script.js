const boardSelect   = document.getElementById('boardSelect');
const classSelector = document.getElementById('classSelector');
const subjectFilter = document.getElementById('subjectFilter');
const bookGrid      = document.getElementById('bookGrid');

let selectedClass   = 'preschool';
let selectedBoard   = 'NCERT';
let selectedSubject = 'all';

/* BACKGROUND IMAGES */
const backgrounds = {
  preschool:'images/preschool-bg.jpg',
  1:'images/class1-bg.jpg',
  6:'images/class6-bg.jpg',
  10:'images/class10-bg.jpg',
  12:'images/class12-bg.jpg'
};
function setBackground(cls){
  const url = backgrounds[cls] || backgrounds[12];
  document.body.style.backgroundImage = `url(${url})`;
  document.body.style.backgroundSize = 'cover';
  document.body.style.backgroundAttachment = 'fixed';
}

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

/* INITIAL LOAD */
window.addEventListener('DOMContentLoaded',()=>{
  loadBooks();
  setBackground(selectedClass);
});

/* CLASS SELECTION */
classSelector.addEventListener('click',e=>{
  if(e.target.tagName!=='BUTTON') return;
  selectedClass = e.target.dataset.class;
  document.querySelectorAll('.class-selector button').forEach(b=>b.classList.remove('active'));
  e.target.classList.add('active');
  buildSubjectFilter();
  setBackground(selectedClass);
  loadBooks();
});

/* BOARD SELECTION */
boardSelect.addEventListener('change',e=>{
  selectedBoard = e.target.value;
  loadBooks();
});

/* SUBJECT FILTER */
subjectFilter.addEventListener('click',e=>{
  if(e.target.tagName!=='BUTTON') return;
  selectedSubject = e.target.dataset.sub;
  document.querySelectorAll('.subject-filter button').forEach(b=>b.classList.remove('active'));
  e.target.classList.add('active');
  loadBooks();
});

function buildSubjectFilter(){
  subjectFilter.innerHTML='<button data-sub="all" class="active">All</button>';
  (subjectsMap[selectedClass]||[]).forEach(sub=>{
    const btn = document.createElement('button');
    btn.dataset.sub = sub;
    btn.textContent = sub;
    subjectFilter.appendChild(btn);
  });
}
buildSubjectFilter();

/* LOAD & RENDER BOOKS */
async function loadBooks(){
  const res = await fetch('data/books.json');
  const data = await res.json();
  let list = data.books.filter(b=>{
    return b.class === selectedClass &&
           b.board === selectedBoard &&
           (selectedSubject==='all' || b.subject===selectedSubject);
  });
  renderBooks(list);
}
function renderBooks(list){
  bookGrid.innerHTML='';
  if(!list.length){
    bookGrid.innerHTML='<p>No books found for this selection.</p>';
    return;
  }
  list.forEach(b=>{
    const card = document.createElement('div');
    card.className='book-card';
    card.innerHTML=`
      <img src="${b.cover}" alt="${b.name}">
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
function downloadBook(url){
  const a=document.createElement('a');
  a.href=url;
  a.download=url.split('/').pop();
  a.click();
}
function readBook(url){
  window.open(url,'_blank');
}