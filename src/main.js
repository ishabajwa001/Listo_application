import './style.css'

// State Management
let todos = JSON.parse(localStorage.getItem('listo-todos')) || [];
let currentFilter = 'all';

// DOM Elements
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const itemsLeft = document.getElementById('items-left');
const filterBtns = document.querySelectorAll('.filter-btn');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const currentDateDisplay = document.getElementById('current-date');
const clearCompletedBtn = document.getElementById('clear-completed');

// Initialize
function init() {
  updateDate();
  renderTodos();
  setupEventListeners();
  setInterval(updateDate, 60000);
}

function updateDate() {
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  const today = new Date();
  currentDateDisplay.textContent = today.toLocaleDateString('en-US', options);
}

function setupEventListeners() {
  // Add Todo
  todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (text) {
      addTodo(text);
      todoInput.value = '';
    }
  });

  // Filter Buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderTodos();
    });
  });

  // Clear Completed
  clearCompletedBtn.addEventListener('click', clearCompleted);
}

function addTodo(text) {
  const newTodo = {
    id: Date.now(),
    text,
    completed: false,
    createdAt: new Date().toISOString()
  };
  todos.unshift(newTodo);
  saveAndRender();
}

function toggleTodo(id) {
  todos = todos.map(todo =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  saveAndRender();
}

function deleteTodo(id) {
  todos = todos.filter(todo => todo.id !== id);
  saveAndRender();
}

function updateTodo(id, newText) {
  todos = todos.map(todo =>
    todo.id === id ? { ...todo, text: newText } : todo
  );
  saveAndRender();
}

function clearCompleted() {
  todos = todos.filter(todo => !todo.completed);
  saveAndRender();
}

function saveAndRender() {
  localStorage.setItem('listo-todos', JSON.stringify(todos));
  renderTodos();
}

function renderTodos() {
  let filteredTodos = todos;
  if (currentFilter === 'active') {
    filteredTodos = todos.filter(t => !t.completed);
  } else if (currentFilter === 'completed') {
    filteredTodos = todos.filter(t => t.completed);
  }

  todoList.innerHTML = '';

  if (filteredTodos.length === 0) {
    renderEmptyState();
  } else {
    filteredTodos.forEach(todo => {
      const li = document.createElement('li');
      li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
      li.style.animationDelay = `${filteredTodos.indexOf(todo) * 0.05}s`;

      li.innerHTML = `
        <div class="checkbox-wrapper">
          <input type="checkbox" class="custom-checkbox" ${todo.completed ? 'checked' : ''}>
        </div>
        <span contenteditable="${!todo.completed}">${escapeHtml(todo.text)}</span>
        <button class="delete-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </button>
      `;

      // Event Listeners for Item
      const checkbox = li.querySelector('.custom-checkbox');
      checkbox.addEventListener('change', () => toggleTodo(todo.id));

      const span = li.querySelector('span');
      span.addEventListener('blur', () => {
        const newText = span.textContent.trim();
        if (newText && newText !== todo.text) {
          updateTodo(todo.id, newText);
        } else {
          span.textContent = todo.text; // Revert if empty
        }
      });

      span.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          span.blur();
        }
      });

      const deleteBtn = li.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

      todoList.appendChild(li);
    });
  }

  updateStats();
  updateProgress();
}

function renderEmptyState() {
  let message = 'Your list is empty. Time to fly!';
  if (currentFilter === 'active') message = 'No active tasks found.';
  if (currentFilter === 'completed') message = 'No completed tasks yet.';

  todoList.innerHTML = `
    <div class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="12" y1="18" x2="12" y2="12"></line>
        <line x1="9" y1="15" x2="15" y2="15"></line>
      </svg>
      <p>${message}</p>
    </div>
  `;
}

function updateStats() {
  const activeCount = todos.filter(t => !t.completed).length;
  itemsLeft.textContent = `${activeCount} ${activeCount === 1 ? 'task' : 'tasks'} remaining`;
}

function updateProgress() {
  const total = todos.length;
  if (total === 0) {
    progressBar.style.width = '0%';
    progressText.textContent = 'Ready to Start';
    return;
  }

  const completed = todos.filter(t => t.completed).length;
  const percentage = Math.round((completed / total) * 100);

  progressBar.style.width = `${percentage}%`;
  progressText.textContent = percentage === 100 ? 'All Tasks Done!' : `${percentage}% Complete`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

init();
