
const inputAutor = document.getElementById('autor');
const inputTitulo = document.getElementById('titulo');
const inputIsbn = document.getElementById('isbn');
const searchForm = document.getElementById('searchForm');


const btnClear = document.getElementById('btnClear');
const btnCancel = document.getElementById('btnCancel');
const backButtons = document.querySelectorAll('.btn-back');

const screens = {
  form: document.getElementById('screenForm'),
  error: document.getElementById('screenError'),
  loading: document.getElementById('screenLoading'),
  success: document.getElementById('screenSuccess'),
  notFound: document.getElementById('screenNotFound')
};

let currentAbortController = null; 


function showScreen(screenKey) {
  Object.values(screens).forEach(screen => screen.classList.remove('active'));
  screens[screenKey].classList.add('active');
}


inputAutor.addEventListener('click', () => {
  if (!inputAutor.value.trim()) {
    inputAutor.value = 'Machado de Assis';
  }
});


searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const autorVal = inputAutor.value.trim();
  const tituloVal = inputTitulo.value.trim();
  const isbnVal = inputIsbn.value.trim();

 
  if (!autorVal && !tituloVal && !isbnVal) {
    showScreen('error');
    return;
  }
  
  showScreen('loading');


  let apiUrl = 'https://openlibrary.org/search.json?';
  const params = [];
  if (tituloVal) params.push(`title=${encodeURIComponent(tituloVal)}`);
  if (autorVal) params.push(`author=${encodeURIComponent(autorVal)}`);
  if (isbnVal) params.push(`isbn=${encodeURIComponent(isbnVal)}`);
  apiUrl += params.join('&');

 
  currentAbortController = new AbortController();

  try {
    const response = await fetch(apiUrl, { signal: currentAbortController.signal });
    const data = await response.json();

   
    if (data && data.docs && data.docs.length > 0) {
      const book = data.docs[0]; 
      
      const bookTitle = book.title || 'Título não informado';
      const bookAuthor = book.author_name ? book.author_name.join(', ') : 'Autor desconhecido';
      const bookIsbn = book.isbn ? book.isbn[0] : 'ISBN não disponível';

   
      document.getElementById('resultTitle').textContent = bookTitle;
      document.getElementById('resultAuthor').textContent = `Autor: ${bookAuthor}`;
      document.getElementById('resultIsbn').textContent = `ISBN: ${bookIsbn}`;

      showScreen('success');
    } else {
      
      showScreen('notFound');
    }
  } catch (error) {
    
    if (error.name === 'AbortError') {
      console.log('Busca cancelada pelo usuário.');
      return;
    }
    
    console.error('Erro ao consultar a Open Library API:', error);
    showScreen('notFound');
  }
});


btnCancel.addEventListener('click', () => {
  if (currentAbortController) {
    currentAbortController.abort(); 
  }
  showScreen('form');
});


btnClear.addEventListener('click', () => {
  inputAutor.value = '';
  inputTitulo.value = '';
  inputIsbn.value = '';
});


backButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    showScreen('form');
  });
});
