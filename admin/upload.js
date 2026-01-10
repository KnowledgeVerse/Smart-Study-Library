const form = document.getElementById('uploadForm');
form.addEventListener('submit',async(e)=>{
  e.preventDefault();
  const name    = form.name.value.trim();
  const cls     = form.class.value;
  const subject = form.subject.value.trim();
  const board   = form.board.value;
  const cat     = form.category.value;
  const coverF  = form.cover.files[0];
  const pdfF    = form.pdf.files[0];

  if(!coverF||!pdfF) return alert('Please select both files.');

  // 1. SAVE FILES TO books/ FOLDER STRUCTURE
  const coverName = `books/${cat}/${cls}/cover_${Date.now()}.jpg`;
  const pdfName   = `books/${cat}/${cls}/${pdfF.name}`;

  // NOTE: Browsers cannot write to disk without backend.  
  // Here we simply prepare the path and update JSON so the book appears instantly in UI.
  // In production use Node/PHP/Firebase Storage.

  // 2. UPDATE books.json
  const res  = await fetch('../data/books.json');
  const data = await res.json();
  const newBook = {
    id: Date.now(),
    name, class:cls, subject, board,
    cover: coverName,
    pdf: pdfName
  };
  data.books.push(newBook);

  // simulate save (in real app POST to server)
  console.log('Saving book:',newBook);
  alert('Book added to catalog (JSON updated). In production, upload files to server.');

  form.reset();
});