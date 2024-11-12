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
        addTask(task, task.done);
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
function addTask(task, isDone) {
    const li = document.createElement('li');
    li.className = 'task-item';

    const label = document.createElement('label');
    const checkmark = document.createElement('span');
    checkmark.className = 'checkmark';
    if (isDone) checkmark.classList.add('checked');
    checkmark.addEventListener('click', function() {
        checkmark.classList.toggle('checked');
        li.classList.toggle('completed');
        updateTask(task.text, checkmark.classList.contains('checked'));
    });

    const text = document.createElement('span');
    text.textContent = task.text;

    const taskLinks = document.createElement('div');
    taskLinks.className = 'task-links';

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
    const saveLinkButton = document.createElement('button');
    saveLinkButton.textContent = 'Save Link';
    saveLinkButton.addEventListener('click', function() {
        const link = linkInput.value.trim();
        if (link) {
            const linkElement = document.createElement('a');
            linkElement.href = link;
            linkElement.target = '_blank';
            linkElement.textContent = 'Read more';
            taskLinks.appendChild(linkElement);
            linkInput.value = '';  // Clear input field
        }
    });
    taskLinks.appendChild(saveLinkButton);

    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
    deleteButton.addEventListener('click', function() {
        removeTask(task);
        li.remove();
    });

    label.appendChild(checkmark);
    label.appendChild(text);
    li.appendChild(label);
    li.appendChild(linkInput);
    li.appendChild(linkButton);
    // li.appendChild(taskLinks);  // Append the links section
    li.appendChild(deleteButton);
    taskList.appendChild(li);
    const linksContainer = document.createElement('div');
    linksContainer.className = 'links';
    li.appendChild(linksContainer);

    task.links.forEach((link, index) => {
        addLinkToTask(linksContainer, link, index);
    });

    taskList.appendChild(li);
}


// Save task to local storage
function saveTask(taskText, isDone, links) {
    chrome.storage.local.get(['tasks'], function(result) {
        const tasks = result.tasks || [];
        const updatedTasks = tasks.map(task =>
            task.text === taskText ? { ...task, done: isDone, links: links } : task
        );
        chrome.storage.local.set({ tasks: updatedTasks });
    });
}

// Update task in storage
function updateTask(taskText, isDone) {
    chrome.storage.local.get(['tasks'], function(result) {
        const tasks = result.tasks.map(task =>
            task.text === taskText ? { ...task, done: isDone } : task
        );
        chrome.storage.local.set({ tasks });
    });
}

// Remove task from storage
function removeTask(taskText) {
    chrome.storage.local.get(['tasks'], function(result) {
        const tasks = result.tasks.filter(task => task.text !== taskText);
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
                task.links.splice(index, 1); // Remove link from the task's links array
            }
        });
        chrome.storage.local.set({ tasks });
    });
}