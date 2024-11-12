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
        // Create the task with a unique ID
        const task = { id: Date.now().toString(), text: taskText, done: false, links: [] };

        // Display the task in the UI immediately
        addTask(task);

        // Save the task to storage in the background
        saveTask(task);

        // Clear the input field
        taskInput.value = '';
    }
});

// Load tasks from local storage and display only valid tasks
function loadTasks() {
    console.log("Loading tasks from storage...");
    chrome.storage.local.get({ tasks: [] }, function(result) {
        const tasks = result.tasks.filter(task => validateTask(task)); // Filter valid tasks only
        console.log("Filtered tasks loaded from storage:", tasks); // Debug: Check loaded tasks
        tasks.forEach(task => addTask(task)); // Display each task in the UI
    });
}

// Validate that a task has the required structure
function validateTask(task) {
    return task && typeof task.text === 'string' && typeof task.done === 'boolean' && typeof task.id === 'string';
}

// Add a task to the UI
function addTask(task) {
    if (!validateTask(task)) {
        console.warn("Invalid task data, skipping:", task);
        return; // Skip adding invalid tasks
    }

    console.log("Adding task to UI:", task); // Debug: Show task being added
    const li = document.createElement('li');
    li.className = 'task-item';
    li.dataset.id = task.id;

    if (task.done) li.classList.add('completed');

    const label = document.createElement('label');
    const checkmark = document.createElement('span');
    checkmark.className = 'checkmark';
    if (task.done) checkmark.classList.add('checked');
    checkmark.addEventListener('click', function() {
        checkmark.classList.toggle('checked');
        li.classList.toggle('completed');
        task.done = checkmark.classList.contains('checked');
        updateTask(task); // Update the task's status in storage
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
            addLinkToTask(li, link, task.links.length - 1);
            saveTask(task); // Save updated task to storage
            linkInput.value = ''; // Clear the link input
        }
    });

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.style.backgroundColor = '#ff4d4d';
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

// Save task to local storage only if valid
function saveTask(newTask) {
    if (!validateTask(newTask)) {
        console.error("Invalid task structure, not saving:", newTask);
        return; // Exit if task is invalid
    }

    chrome.storage.local.get({ tasks: [] }, function(result) {
        const tasks = result.tasks;

        // Check if task already exists in storage
        const existingTaskIndex = tasks.findIndex(task => task.id === newTask.id);

        if (existingTaskIndex !== -1) {
            tasks[existingTaskIndex] = newTask; // Update existing task
        } else {
            tasks.push(newTask); // Add new task if not already present
        }

        chrome.storage.local.set({ tasks: tasks }, function() {
            if (chrome.runtime.lastError) {
                console.error("Error saving task:", chrome.runtime.lastError);
            } else {
                console.log("Task saved successfully:", tasks); // Debug: Log tasks saved to storage
            }
        });
    });
}

// Update task in storage
function updateTask(task) {
    if (!validateTask(task)) {
        console.error("Invalid task data, skipping update:", task);
        return; // Skip update if task is invalid
    }
    saveTask(task); // Re-use saveTask to handle update logic
}

// Remove task from storage
function removeTask(task) {
    console.log("Removing task from storage:", task); // Debug: Show task being removed
    chrome.storage.local.get({ tasks: [] }, function(result) {
        const tasks = result.tasks.filter(t => t.id !== task.id); // Filter out task by ID
        chrome.storage.local.set({ tasks: tasks });
    });
}

// Add link to task UI
function addLinkToTask(container, link, index) {
    console.log("Adding link to task in UI:", link); // Debug: Show link being added
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
    chrome.storage.local.get({ tasks: [] }, function(result) {
        const tasks = result.tasks;
        tasks.forEach(task => {
            if (task.links[index]) {
                task.links.splice(index, 1); // Remove the link from task
            }
        });
        chrome.storage.local.set({ tasks });
    });
}
