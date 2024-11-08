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
        const task = { text: taskText, done: false, links: [] }; // Task structure
        addTask(task);
        saveTask(task); // Save task to local storage
        taskInput.value = ''; // Clear input field
    }
});

// Load tasks from local storage and display
function loadTasks() {
    chrome.storage.local.get(['tasks'], function(result) {
        const tasks = result.tasks || [];
        tasks.forEach(task => addTask(task));
    });
}

// Add a task to the UI
function addTask(task) {
    const li = document.createElement('li');
    li.className = 'task-item';

    const label = document.createElement('label');
    const checkmark = document.createElement('span');
    checkmark.className = 'checkmark';
    if (task.done) checkmark.classList.add('checked');
    checkmark.addEventListener('click', function() {
        checkmark.classList.toggle('checked');
        task.done = checkmark.classList.contains('checked');
        updateTask(task); // Update the task status in storage
    });

    const text = document.createElement('span');
    text.textContent = task.text;

    const linkInput = document.createElement('input');
    linkInput.type = 'url';
    linkInput.placeholder = 'Add a related link...';
    const linkButton = document.createElement('button');
    linkButton.textContent = 'Add Link';
    linkButton.addEventListener('click', function() {
        const link = linkInput.value.trim();
        if (link) {
            task.links.push(link);
            addLinkToTask(li, link, task.links.length - 1); // Add the link to the task
            saveTask(task); // Save updated task to storage
            linkInput.value = ''; // Clear the link input
        }
    });

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete task';
    deleteButton.addEventListener('click', function() {
        removeTask(task); // Remove task from storage
        li.remove();
    });

    label.appendChild(checkmark);
    label.appendChild(text);
    li.appendChild(label);
    li.appendChild(linkInput);
    li.appendChild(linkButton);
    li.appendChild(deleteButton);

    const linksContainer = document.createElement('div');
    linksContainer.className = 'links';
    li.appendChild(linksContainer);

    task.links.forEach((link, index) => {
        addLinkToTask(linksContainer, link, index);
    });

    taskList.appendChild(li);
}

// Save task to local storage
function saveTask(task) {
    chrome.storage.local.get(['tasks'], function(result) {
        const tasks = result.tasks || [];
        const updatedTasks = tasks.filter(t => t.text !== task.text); // Remove task if already exists
        updatedTasks.push(task); // Add updated task to the array
        chrome.storage.local.set({ tasks: updatedTasks });
    });
}

// Update task in storage
function updateTask(task) {
    chrome.storage.local.get(['tasks'], function(result) {
        const tasks = result.tasks || [];
        const updatedTasks = tasks.map(t =>
            t.text === task.text ? task : t // Update the task if it matches
        );
        chrome.storage.local.set({ tasks: updatedTasks });
    });
}

// Remove task from storage
function removeTask(task) {
    chrome.storage.local.get(['tasks'], function(result) {
        const tasks = result.tasks.filter(t => t.text !== task.text); // Filter out task
        chrome.storage.local.set({ tasks });
    });
}

// Add link to task UI
function addLinkToTask(container, link, index) {
    const linkElement = document.createElement('div');
    linkElement.className = 'link';

    const linkText = document.createElement('a');
    linkText.href = link;
    linkText.target = '_blank';
    linkText.textContent = link;

    const deleteLinkButton = document.createElement('button');
    deleteLinkButton.textContent = 'Delete';
    deleteLinkButton.addEventListener('click', function() {
        container.removeChild(linkElement);
        removeLink(index);
    });

    linkElement.appendChild(linkText);
    linkElement.appendChild(deleteLinkButton);
    container.appendChild(linkElement);
}

// Remove link from task in storage
function removeLink(index) {
    chrome.storage.local.get(['tasks'], function(result) {
        const tasks = result.tasks;
        tasks.forEach(task => {
            if (task.links[index]) {
                task.links.splice(index, 1); // Remove the link from task
            }
        });
        chrome.storage.local.set({ tasks });
    });
}
