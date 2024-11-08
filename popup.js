const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');

// Load tasks from storage when the popup loads
document.addEventListener('DOMContentLoaded', loadTasks);

// Add new task on form submit
taskForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const taskText = taskInput.value.trim();
    if (taskText) {
        addTask(taskText);
        saveTask(taskText);
        taskInput.value = '';  // Clear input field
    }
});

function loadTasks() {
    chrome.storage.local.get(['tasks'], function(result) {
        const tasks = result.tasks || [];
        tasks.forEach(renderTask);
    });
}

function addTask(taskText) {
    renderTask(taskText);
}

function renderTask(taskText) {
    const li = document.createElement('li');
    li.className = 'task-item';

    const label = document.createElement('span');
    label.textContent = taskText;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', function() {
        removeTask(taskText);
        li.remove();
    });

    li.appendChild(label);
    li.appendChild(deleteButton);
    taskList.appendChild(li);
}

function saveTask(taskText) {
    chrome.storage.local.get(['tasks'], function(result) {
        const tasks = result.tasks || [];
        tasks.push(taskText);
        chrome.storage.local.set({ tasks });
    });
}

function removeTask(taskText) {
    chrome.storage.local.get(['tasks'], function(result) {
        const tasks = result.tasks.filter(task => task !== taskText);
        chrome.storage.local.set({ tasks });
    });
}
