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



// Validate that a task has the required structure
function validateTask(task) {

    return task && typeof task.text === 'string' && typeof task.done === 'boolean' && typeof task.id === 'string';
}

// Add a task to the UI
function addTask(task) {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.dataset.id = task.id;

    // Ensure 'linksExpanded' exists for each task
    task.linksExpanded = task.linksExpanded || false; // Default to false if undefined
    if (task.done) li.classList.add('completed');

    const taskHeader = document.createElement('div');
    taskHeader.className = 'task-header';

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

    const toggleLinksBtn = document.createElement('button');
    toggleLinksBtn.className = 'toggle-links-btn';
    toggleLinksBtn.textContent = task.linksExpanded ? 'Hide Links' : 'Show Links'; // Set button text based on task's state
    toggleLinksBtn.addEventListener('click', function() {
        task.linksExpanded = !task.linksExpanded; // Toggle the expanded state in task
        toggleLinksBtn.textContent = task.linksExpanded ? 'Hide Links' : 'Show Links';
        const linksContainer = li.querySelector('.links');
        linksContainer.classList.toggle('expanded', task.linksExpanded); // Toggle visibility
        saveTask(task); // Save the updated state to local storage
    });

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
            updateLinksVisibility(task, li); // Ensure the new link follows the visibility rules
        }
    });

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-task-btn';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', function() {
        removeTask(task); // Remove task from storage
        li.remove();
    });

    label.appendChild(checkmark);
    label.appendChild(text);
    taskHeader.appendChild(label);
    taskHeader.appendChild(linkInput);
    taskHeader.appendChild(linkButton);
    taskHeader.appendChild(toggleLinksBtn);
    taskHeader.appendChild(deleteButton);
    li.appendChild(taskHeader);

    // Link section
    const linksContainer = document.createElement('div');
    linksContainer.className = 'links';
    task.links.forEach((link, index) => {
        addLinkToTask(linksContainer, link, index);
    });
    li.appendChild(linksContainer);

    // Apply the links visibility based on the 'expanded' class
    linksContainer.classList.toggle('expanded', task.linksExpanded);

    taskList.appendChild(li);
}

// Ensures visibility of links is updated based on task state
function updateLinksVisibility(task, li) {
    const linksContainer = li.querySelector('.links');
    if (task.linksExpanded) {
        linksContainer.classList.add('expanded');
    } else {
        linksContainer.classList.remove('expanded');
    }
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
// Load tasks from local storage and display only valid tasks
function loadTasks() {
    console.log("Loading tasks from storage...");
    chrome.storage.local.get({ tasks: [] }, function(result) {
        const tasks = result.tasks.filter(task => validateTask(task)); // Filter valid tasks only
        console.log("Filtered tasks loaded from storage:", tasks);
        chrome.storage.local.set({tasks: tasks});// Debug: Check loaded tasks
        tasks.forEach(task => addTask(task)); // Display each task in the UI
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
        // console.log("before remove we have", result.tasks.length)
        const tasks = result.tasks.filter(t => t.id !== task.id); // Filter out task by ID
        chrome.storage.local.set({ tasks: tasks });
        // console.log("after remove we have", tasks.length)

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

        // Find the task containing the link using its index
        const task = tasks.find(task => task.links[index] !== undefined);
        if (task) {
            console.log(task)

            // Remove the link at the specified index from the task
            task.links.splice(index, 1);

            // Save the updated tasks to local storage
            chrome.storage.local.set({ tasks :tasks});
        }
    });
}

