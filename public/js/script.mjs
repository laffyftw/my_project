
function getSessionId() {
  return localStorage.getItem('x-session-id');
}

function showApp(username) {
  document.getElementById('auth').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  document.getElementById('loggedInUsername').value = username;
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
      document.getElementById('loggedInUsername').value = username;
      localStorage.setItem('username', username);
    }

    if (!response.ok) {
      // Handle error
      console.error('Error registering user');
      showErrorMessage('Error registering user');
      return;
    }

    const sessionId = response.headers.get('x-session-id');
localStorage.setItem('x-session-id', sessionId);
    if (sessionId) {
      localStorage.setItem('x-session-id', sessionId);
      console.log('Stored session ID:', sessionId);
    }

    // Show a message upon successful registration and hide the forms
    showMessage('Successfully registered!');
    setTimeout(() => {
      showApp(username);
      fetchTodos();
    }, 1000);

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
      document.getElementById('loggedInUsername').value = username;
      localStorage.setItem('username', username);

    }

    if (!response.ok) {
      // Handle error
      console.error('Error logging in');
      showErrorMessage('Wrong username or password');
      return;
    }

    const sessionId = response.headers.get('x-session-id');
    localStorage.setItem('x-session-id', sessionId);
    if (sessionId) {
      localStorage.setItem('x-session-id', sessionId);
      console.log('Stored session ID:', sessionId);
    }

    // Show a message upon successful login, hide the forms, and fetch todos
    showMessage('Successfully logged in!');
    setTimeout(() => {
      showApp(username);
      fetchTodos();
    }, 1000);

  } catch (error) {
    console.error('Error logging in:', error);
  }
}


async function fetchTodos() {
  const loggedInUsername = localStorage.getItem('username');
  if (!loggedInUsername) {
    console.warn('No logged in user, not fetching todos');
    return;
  }

  try {
    const sessionId = localStorage.getItem('x-session-id');
    const response = await fetch(`/api/todo?username=${encodeURIComponent(loggedInUsername)}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'x-session-id': sessionId,
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
  const todoContainer = document.getElementById('todoContainer');
  todoContainer.innerHTML = '';
  if (Array.isArray(todos)) {
    todos.forEach((todo) => {
      const todoElement = document.createElement('div');
      todoElement.textContent = todo.title;
      todoContainer.appendChild(todoElement);
    });
  }
}


window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('addTodoButton').addEventListener('click', async () => {
    const newTodoTitle = document.getElementById('newTodoInput').value;
    const loggedInUsername = document.getElementById('loggedInUsername').value;
  
    try {
      const response = await fetch('/api/todo', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-session-id': getSessionId(),
        },
        body: JSON.stringify({
          title: newTodoTitle,
          username: loggedInUsername,
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
