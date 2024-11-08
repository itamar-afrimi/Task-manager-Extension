const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');

// Load tasks when the popup loads
document.addEventListener('DOMContentLoaded', loadTasks);

// Add new task on form submit
taskForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const taskText = taskInput.value.trim();
    if (taskText) {
        addTask(taskText, false);
        saveTask(taskText, false);
        taskInput.value = ''; // Clear input field
    }
});

function loadTasks() {
    chrome.storage.local.get(['tasks'], function(result) {
        const tasks = result.tasks || [];
        tasks.forEach(task => addTask(task.text, task.done));
    });
}

function addTask(taskText, isDone) {
    const li = document.createElement('li');
    li.className = 'task-item';

    const label = document.createElement('label');
    const checkmark = document.createElement('span');
    checkmark.className = 'checkmark';
    if (isDone) checkmark.classList.add('checked');
    checkmark.addEventListener('click', function() {
        checkmark.classList.toggle('checked');
        updateTask(taskText, checkmark.classList.contains('checked'));
    });

    const text = document.createElement('span');
    text.textContent = taskText;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = '✕';
    deleteButton.addEventListener('click', function() {
        removeTask(taskText);
        li.remove();
    });

    label.appendChild(checkmark);
    label.appendChild(text);
    li.appendChild(label);
    li.appendChild(deleteButton);
    taskList.appendChild(li);
}

function saveTask(taskText, isDone) {
    chrome.storage.local.get(['tasks'], function(result) {
        const tasks = result.tasks || [];
        tasks.push({ text: taskText, done: isDone });
        chrome.storage.local.set({ tasks });
    });
}

function updateTask(taskText, isDone) {
    chrome.storage.local.get(['tasks'], function(result) {
        const tasks = result.tasks.map(task =>
            task.text === taskText ? { ...task, done: isDone } : task
        );
        chrome.storage.local.set({ tasks });
    });
}

function removeTask(taskText) {
    chrome.storage.local.get(['tasks'], function(result) {
        const tasks = result.tasks.filter(task => task.text !== taskText);
        chrome.storage.local.set({ tasks });
    });
}
