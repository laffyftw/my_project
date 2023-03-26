
function getSessionId() {
  return localStorage.getItem('x-session-id');
}

function showApp() {
  const app = document.getElementById('app');
  app.classList.remove('hidden');
}

function showMessage(message, delay = 1000) {
  const authMessage = document.createElement('p');
  authMessage.textContent = message;
  const authContainer = document.getElementById('auth');
  authContainer.innerHTML = '';
  authContainer.appendChild(authMessage);

  setTimeout(() => {
    authContainer.innerHTML = '';
  }, delay);
}

function showErrorMessage(message) {
  const authContainer = document.getElementById('auth');
  const existingErrorMessage = authContainer.querySelector('.error-message');

  if (existingErrorMessage) {
    existingErrorMessage.remove();
  }

  const errorMessage = document.createElement('p');
  errorMessage.textContent = message;
  errorMessage.classList.add('error-message');
  authContainer.appendChild(errorMessage);
}



async function register(username, password) {
  
  if (!username) {
    showErrorMessage('Username cannot be empty.');
    return;
  }

  if (password.length < 8) {
    showErrorMessage('Password must be at least 8 characters long.');
    return;
  }
  
  try {
    const response = await fetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      localStorage.setItem('loggedInUsername', username);
    }

    if (!response.ok) {
      // Handle error
      console.error('Error registering user');
      showErrorMessage('Error registering user');
      return;
    }

    const sessionId = response.headers.get('x-session-id');
    if (sessionId) {
      localStorage.setItem('x-session-id', sessionId);
    }

    // Show a message upon successful registration and hide the forms
    showMessage('Successfully registered!');
    setTimeout(showApp, 1000);

 

  } catch (error) {
    console.error('Error registering user:', error);
  }
}

async function login(username, password) {
  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      localStorage.setItem('loggedInUsername', username);
    }


if (!response.ok) {
  // Handle error
  console.error('Error logging in');
  showErrorMessage('Wrong username or password');
  return;
}

    const sessionId = response.headers.get('x-session-id');
    if (sessionId) {
      localStorage.setItem('x-session-id', sessionId);
    }

    // Show a message upon successful login, hide the forms, and fetch todos
    showMessage('Successfully logged in!');
    setTimeout(showApp, 1000);
    fetchTodos();



  } catch (error) {
    console.error('Error logging in:', error);
  }
}

async function fetchTodos() {
  const loggedInUsername = localStorage.getItem('loggedInUsername');
  if (!loggedInUsername) {
    console.warn('No logged in user, not fetching todos');
    return;
  }

  try {
    const response = await fetch(`/api/todo?username=${encodeURIComponent(document.getElementById('loggedInUsername').value)}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'x-session-id': getSessionId(),
      },  
      credentials: 'same-origin',
    });
    const todos = await response.json();
    renderTodos(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
  }
}


function renderTodos(todos) {
  const todoList = document.createElement('ul');
  todos.forEach(todo => {
    const listItem = document.createElement('li');
    listItem.textContent = todo.title; 
    todoList.appendChild(listItem);
  });
  const todoContainer = document.getElementById('todoContainer');
  todoContainer.innerHTML = ''; // Clear the previous contents
  todoContainer.appendChild(todoList);
}

window.addEventListener('DOMContentLoaded', () => {
  fetchTodos();
  document.getElementById('addTodoButton').addEventListener('click', async () => {
    const title = document.getElementById('newTodoInput').value; 
    try {
      const response = await fetch('/api/todo', {
        method: 'POST',
        headers: { 
        'Content-Type': 'application/json',
        'x-session-id': getSessionId(),
      },  
        body: JSON.stringify({
          title,
          username: document.getElementById('loggedInUsername').value,
        }),
        credentials: 'same-origin', 
      });
      const newTodo = await response.json();
      // Update the UI with the new todo
      fetchTodos(); 
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  });
// Register form submission handler
document.getElementById('registerForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = document.getElementById('registerUsername').value;
  const password = document.getElementById('registerPassword').value;
  await register(username, password);
});

// Login form submission handler
document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;
  await login(username, password);
});

});
