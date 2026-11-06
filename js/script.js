// Captura do formulário
const inputAutor = document.getElementById('autor');
const inputTitulo = document.getElementById('titulo');
const inputIsbn = document.getElementById('isbn');
const searchForm = document.getElementById('searchForm');

//botões
const btnClear = document.getElementById('btnClear');
const btnCancel = document.getElementById('btnCancel');
const backButtons = document.querySelectorAll('.btn-back');

// Registro de telas da interface
const screens = {
  form: document.getElementById('screenForm'),
  error: document.getElementById('screenError'),
  loading: document.getElementById('screenLoading'),
  success: document.getElementById('screenSuccess'),
  notFound: document.getElementById('screenNotFound')
};

let currentAbortController = null; 

// Função auxiliar de alteraçaõ
function showScreen(screenKey) {
  Object.values(screens).forEach(screen => screen.classList.remove('active'));
  screens[screenKey].classList.add('active');
}

// Clique Autor
inputAutor.addEventListener('click', () => {
  if (!inputAutor.value.trim()) {
    inputAutor.value = 'Machado de Assis';
  }
});

// consumo da Open Library API
searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const autorVal = inputAutor.value.trim();
  const tituloVal = inputTitulo.value.trim();
  const isbnVal = inputIsbn.value.trim();

  // Tela de erro
  if (!autorVal && !tituloVal && !isbnVal) {
    showScreen('error');
    return;
  }
  
  showScreen('loading');

  // Constrói a URL  da Open Library
  let apiUrl = 'https://openlibrary.org/search.json?';
  const params = [];
  if (tituloVal) params.push(`title=${encodeURIComponent(tituloVal)}`);
  if (autorVal) params.push(`author=${encodeURIComponent(autorVal)}`);
  if (isbnVal) params.push(`isbn=${encodeURIComponent(isbnVal)}`);
  apiUrl += params.join('&');

  // cancela a requisição se o usuário quiser
  currentAbortController = new AbortController();

  try {
    const response = await fetch(apiUrl, { signal: currentAbortController.signal });
    const data = await response.json();

   
    if (data && data.docs && data.docs.length > 0) {
      const book = data.docs[0]; 
      
      const bookTitle = book.title || 'Título não informado';
      const bookAuthor = book.author_name ? book.author_name.join(', ') : 'Autor desconhecido';
      const bookIsbn = book.isbn ? book.isbn[0] : 'ISBN não disponível';

      // preenche a tela com os dados reais da Open Library
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

// Cancelamento da busca
btnCancel.addEventListener('click', () => {
  if (currentAbortController) {
    currentAbortController.abort(); 
  }
  showScreen('form');
});

// Limpar o formulário
btnClear.addEventListener('click', () => {
  inputAutor.value = '';
  inputTitulo.value = '';
  inputIsbn.value = '';
});

// Voltar
backButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    showScreen('form');
  });
});