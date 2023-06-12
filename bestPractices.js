const loadElements = () => {
  let taskArray = [];
  taskArray = retrieveData();
  taskArray
    .sort((x, y) => x.index - y.index)
    .forEach((todo) => {
      const taskElement = createDisplayElement(todo);
      appendToDOM(taskElement);
    });
};

const loadRefreshIcon = () => {
  const refreshIcon = document.getElementById('list_refresh');
  refreshIcon.src = Refresh;
  refreshIcon.alt = 'refresh';
  refreshIcon.setAttribute('class', 'header-icon');
  refreshIcon.addEventListener('click', () => {
    window.location.reload();
  });
};

const loadEnterIcon = () => {
  const enterIcon = document.getElementById('enter_newtodo');
  enterIcon.src = Enter;
  enterIcon.alt = 'enter';
  enterIcon.setAttribute('class', 'icon');
  // add eventlistner for enter key
  enterIcon.addEventListener('click', () => {
    // if todo is written or add to your list field is not empity
    if (addTodoForm.elements['add-task'].value) {
      const todosArray = retrieveData();
      const newTodo = new Todo(
        addTodoForm.elements['add-task'].value,
        false,
        todosArray.length + 1,
      );
      Todo.addTodo(newTodo);
      const todoElement = createDisplayElement(newTodo);
      appendToDOM(todoElement);
      addTodoForm.reset();
    } else if (document.getElementsByClassName('edit-todo-input')[0]) { // if add todo is empity and if someone is yousing phone and want to edit a task
      updateTodoHandler();
    }
  });
};

const createCheckbox = (status) => {
  const checkbox = document.createElement('input');
  checkbox.setAttribute('class', 'checkbox');
  checkbox.setAttribute('type', 'checkbox');
  if (status) {
    checkbox.checked = true;
  }
  checkbox.addEventListener('change', checkboxStatus);
  return checkbox;
};

const addTodoForm = document.getElementById('todo-form');

const addTodoFormHandler = (e) => {
  e.preventDefault();
  const todosArray = retrieveData();
  const newTodo = new Todo(
    addTodoForm.elements['add-task'].value,
    false,
    todosArray.length + 1,
  );
  Todo.addTodo(newTodo);
  const todoElement = desplayElement(newTodo);
  appendToDOM(todoElement);
  addTodoForm.reset();
};

const appendToDOM = (todoElement) => {
  const todoList = document.getElementById('taskList');
  todoList.appendChild(todoElement);
};

 const removeFromDOM = (todo) => {
  todo.parentElement.removeChild(todo);
};

const checkboxStatus = (e) => {
  const displayElement = e.target.parentElement.parentElement;
  const activityIndex = displayElement.getAttribute('id');
  const activity = Todo.getTodo(activityIndex);
  activity.completed = !activity.completed;
  if (activity.completed) {
    displayElement.classList.add('completed');
  } else {
    displayElement.classList.remove('completed');
  }
  Todo.updateTodo(activity);
};

const clearAllCompletedHandler = (e) => {
  e.preventDefault();
  let activities = retrieveData();
  activities.forEach((element) => {
    if (element.completed) {
      activities = activities.filter((todo) => todo.index.toString() !== element.index.toString());
    }
  });
  const IndexChengedArray = [];
  activities.sort((x, y) => x.index - y.index).forEach((element, index) => {
    IndexChengedArray.push(new Todo(element.description, element.completed, index + 1));
  });
  storeData(IndexChengedArray);
  window.location.reload();
};
const deletEventHandler = (e) => {
  const toComplete = e.target.parentElement;
  const indexTodo = toComplete.getAttribute('id');
  Todo.removeTodo(indexTodo);
  window.location.reload();
};

const editClickHandler = (e) => {
  const displayElement = e.target.parentElement;
  const indexTodo = displayElement.getAttribute('id');
  const editElement = createEditElement(indexTodo);
  editElement.addEventListener('submit', updateTodoHandler);
  const taskList = displayElement.parentElement;
  taskList.replaceChild(editElement, displayElement);
};

const createEditIcon = () => {
  const editIcon = new Image();
  editIcon.src = Edit;
  editIcon.setAttribute('class', 'icon');
  editIcon.addEventListener('click', editClickHandler);
  return editIcon;
};

const createDisplayElement = (todo) => {
  const displayElement = document.createElement('li');
  displayElement.setAttribute('id', todo.index);
  const labelElement = document.createElement('label');
  const checkboxElement = createCheckbox(todo.completed);
  if (todo.completed) {
    displayElement.classList.add('completed');
  } else {
    displayElement.classList.remove('completed');
  }
  labelElement.appendChild(checkboxElement);
  const descriptionElement = document.createElement('span');
  descriptionElement.innerText = todo.description;
  labelElement.appendChild(descriptionElement);
  displayElement.appendChild(labelElement);
  const menuElement = createEditIcon();
  displayElement.appendChild(menuElement);
  return displayElement;
};

const createTaskDescripion = (description) => {
  const activityDescription = document.createElement('input');
  activityDescription.setAttribute('type', 'text');
  activityDescription.setAttribute('name', 'edit-todo');
  activityDescription.setAttribute('class', 'edit-todo-input');
  activityDescription.setAttribute('value', description);
  return activityDescription;
};

const createDeleteElement = () => {
  const deleteElement = new Image();
  deleteElement.src = Delete;
  deleteElement.setAttribute('class', 'icon');
  deleteElement.addEventListener('click', deleteEventHandler);
  return deleteElement;
};

const createEditElement = (indexTodo) => {
  const todo = Todo.getTodo(indexTodo);
  const formElement = document.createElement('form');
  formElement.setAttribute('class', 'edit-todo-form');
  formElement.setAttribute('id', indexTodo);
  formElement.setAttribute('action', '#');
  formElement.setAttribute('method', 'patch');
  formElement.setAttribute('type', 'submit');
  const label = document.createElement('label');
  label.setAttribute('for', 'edit-todo');
  label.setAttribute('id', 'edit-todo-label');
  const checkbox = createCheckbox(todo.completed);
  if (todo.completed) {
    formElement.classList.add('completed');
  } else {
    formElement.classList.remove('completed');
  }
  label.appendChild(checkbox);
  const description = createTaskDescripion(todo.description);
  label.appendChild(description);
  const deleteElement = createDeleteElement();
  formElement.appendChild(label);
  formElement.appendChild(deleteElement);
  return formElement;
};

const storageAvailable = (type) => {
  let storage;
  try {
    storage = window[type];
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException && (e.code === 22 || e.code === 1014 || e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') && storage && storage.length !== 0);
  }
};
let availableStorage;
let todos = [];
if (storageAvailable('localStorage')) {
  availableStorage = window.localStorage;
} else {
  availableStorage = null;
}
 const retrieveData = () => {
  if (availableStorage.getItem('todos')) {
    const todosData = availableStorage.getItem('todos');
    todos = JSON.parse(todosData);
  }
  return todos;
};
 const storeData = (todosArray) => {
  if (availableStorage) {
    const jsonData = JSON.stringify(todosArray);
    availableStorage.setItem('todos', jsonData);
  }
};

let newListArray = [];

 class Todo {
  constructor(description, completed, index) {
    this.description = description;
    this.completed = completed;
    this.index = index;
  }

  static getTodo = (index) => {
    newListArray = retrieveData();
    const todo = newListArray.find((x) => x.index.toString() === index.toString());
    return todo;
  }

  static addTodo = (todo) => {
    const newTodo = new Todo(
      todo.description,
      todo.completed,
      todo.index,
    );
    const testArray = retrieveData();
    testArray.push(newTodo);
    return storeData(testArray);
  }

  static updateTodo = (todo) => {
    newListArray = retrieveData();
    newListArray = newListArray.filter((element) => element.index !== todo.index);
    const newTodo = new Todo(
      todo.description,
      todo.completed,
      todo.index,
    );
    newListArray.push(newTodo);
    storeData(newListArray);
  }

  static removeTodo = (index) => {
    newListArray = retrieveData();
    newListArray = newListArray.filter((element) => element.index.toString() !== index.toString());
    const reIndexedArray = [];
    newListArray.sort((x, y) => x.index - y.index).forEach((element, index) => {
      reIndexedArray.push(new Todo(element.description, element.completed, index + 1));
    });
    return storeData(reIndexedArray);
  }
}

const updateTodoHandler = () => {
  const inputElement = document.getElementsByClassName('edit-todo-input')[0];
  const formElement = inputElement.parentElement.parentElement;
  const indexTodo = formElement.getAttribute('id');
  const todo = Todo.getTodo(indexTodo);
  todo.description = inputElement.value;
  Todo.updateTodo(todo);
  const displayElement = document.createElement('li');
  displayElement.setAttribute('id', todo.index);
  const editIcon = new Image();
  editIcon.src = Edit;
  editIcon.setAttribute('class', 'icon');
  editIcon.addEventListener('click', (e) => {
    const displayElement = e.target.parentElement;
    const indexTodo = displayElement.getAttribute('id');
    const editElement = createEditFormElement(indexTodo);
    // editElement.addEventListener('submit', updateTodoHandler);
    const todoList = displayElement.parentElement;
    todoList.replaceChild(editElement, displayElement);
  });
  const label = document.createElement('label');
  const checkbox = createCheckbox(todo.completed);
  if (todo.completed) {
    displayElement.classList.add('completed');
  } else {
    displayElement.classList.remove('completed');
  }
  label.appendChild(checkbox);
  const descriptionElement = document.createElement('span');
  descriptionElement.innerText = todo.description;
  label.appendChild(descriptionElement);
  displayElement.appendChild(label);
  displayElement.appendChild(editIcon);
  formElement.parentElement.replaceChild(displayElement, formElement);
  return displayElement;
};

const loadAfterAllCleared = () => {
  const paragraph = document.getElementsByTagName('p')[0];
  const clearAllCompletedLink = document.createElement('a');
  clearAllCompletedLink.setAttribute('id', 'clear-all-completed');
  clearAllCompletedLink.setAttribute('href', '/');
  clearAllCompletedLink.innerText = 'Clear all completed';
  clearAllCompletedLink.addEventListener('click', clearAllCompletedHandler);
  paragraph.appendChild(clearAllCompletedLink);
};
window.onload = () => {
  loadElements();
  loadRefreshIcon();
  loadEnterIcon();
  loadAfterAllCleared();
  addTodoForm.addEventListener('submit', addTodoFormHandler);
};
