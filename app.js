// ================================
// TASK DATA
// ================================

let tasks = [
    {
        id: 1,
        title: "Complete the HTML structure",
        completed: false
    },
    {
        id: 2,
        title: "Design the responsive layout",
        completed: false
    },
    {
        id: 3,
        title: "Create the Firebase project",
        completed: true
    }
];

let currentFilter = "all";


// ================================
// SELECT HTML ELEMENTS
// ================================

const taskForm = document.querySelector(".task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector(".task-list");
const taskCount = document.querySelector(".task-count");
const filters = document.querySelectorAll(".filter");
const statusMessage = document.querySelector(".status-message");


// ================================
// DISPLAY TASKS
// ================================

function displayTasks() {

    taskList.innerHTML = "";

    let filteredTasks = tasks;

    // Show active tasks
    if (currentFilter === "active") {
        filteredTasks = tasks.filter(function(task) {
            return !task.completed;
        });
    }

    // Show completed tasks
    if (currentFilter === "completed") {
        filteredTasks = tasks.filter(function(task) {
            return task.completed;
        });
    }


    // Create each task
    filteredTasks.forEach(function(task) {

        const listItem = document.createElement("li");

        listItem.className = "task-item";

        if (task.completed) {
            listItem.classList.add("completed");
        }

        listItem.dataset.id = task.id;


        // ================================
        // TASK CONTENT
        // ================================

        const taskContent = document.createElement("div");

        taskContent.className = "task-content";


        // Checkbox
        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.id = `task-${task.id}`;


        // Label
        const label = document.createElement("label");

        label.htmlFor = `task-${task.id}`;
        label.textContent = task.title;


        taskContent.appendChild(checkbox);
        taskContent.appendChild(label);


        // ================================
        // TASK ACTIONS
        // ================================

        const taskActions = document.createElement("div");

        taskActions.className = "task-actions";


        // Edit button
        const editButton = document.createElement("button");

        editButton.type = "button";
        editButton.className = "edit-button";
        editButton.textContent = "Edit";
        editButton.setAttribute(
            "aria-label",
            `Edit ${task.title}`
        );


        // Delete button
        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute(
            "aria-label",
            `Delete ${task.title}`
        );


        taskActions.appendChild(editButton);
        taskActions.appendChild(deleteButton);


        // Add everything to the list item
        listItem.appendChild(taskContent);
        listItem.appendChild(taskActions);

        taskList.appendChild(listItem);


        // ================================
        // CHECKBOX EVENT
        // ================================

        checkbox.addEventListener("change", function() {
            toggleTask(task.id);
        });


        // ================================
        // EDIT EVENT
        // ================================

        editButton.addEventListener("click", function() {
            editTask(task.id);
        });


        // ================================
        // DELETE EVENT
        // ================================

        deleteButton.addEventListener("click", function() {
            deleteTask(task.id);
        });

    });


    updateTaskCount();
}


// ================================
// ADD TASK
// ================================

taskForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const title = taskInput.value.trim();


    // Check for empty task
    if (title === "") {

        statusMessage.textContent =
            "Please enter a task.";

        return;
    }


    // Check maximum length
    if (title.length > 100) {

        statusMessage.textContent =
            "Task must be 100 characters or less.";

        return;
    }


    // Create new task
    const newTask = {
        id: Date.now(),
        title: title,
        completed: false
    };


    // Add task at the beginning
    tasks.unshift(newTask);


    // Clear input
    taskInput.value = "";

    // Clear message
    statusMessage.textContent = "";


    // Display tasks
    displayTasks();

});


// ================================
// COMPLETE / UNCOMPLETE TASK
// ================================

function toggleTask(taskId) {

    const task = tasks.find(function(task) {
        return task.id === taskId;
    });


    if (task) {

        task.completed = !task.completed;

        displayTasks();
    }
}


// ================================
// EDIT TASK
// ================================

function editTask(taskId) {

    const task = tasks.find(function(task) {
        return task.id === taskId;
    });


    if (!task) {
        return;
    }


    const newTitle = prompt(
        "Edit your task:",
        task.title
    );


    // User cancelled
    if (newTitle === null) {
        return;
    }


    const updatedTitle = newTitle.trim();


    // Empty task
    if (updatedTitle === "") {

        statusMessage.textContent =
            "Task cannot be empty.";

        return;
    }


    // Maximum length
    if (updatedTitle.length > 100) {

        statusMessage.textContent =
            "Task must be 100 characters or less.";

        return;
    }


    task.title = updatedTitle;

    statusMessage.textContent = "";

    displayTasks();
}


// ================================
// DELETE TASK
// ================================

function deleteTask(taskId) {

    const confirmed = confirm(
        "Are you sure you want to delete this task?"
    );


    if (!confirmed) {
        return;
    }


    tasks = tasks.filter(function(task) {
        return task.id !== taskId;
    });


    displayTasks();
}


// ================================
// FILTER TASKS
// ================================

filters.forEach(function(button) {

    button.addEventListener("click", function() {

        // Remove active class from all buttons
        filters.forEach(function(filter) {
            filter.classList.remove("active");
        });


        // Add active class to clicked button
        button.classList.add("active");


        // Decide which filter to use
        if (button.textContent.trim() === "All") {
            currentFilter = "all";
        }

        if (button.textContent.trim() === "Active") {
            currentFilter = "active";
        }

        if (button.textContent.trim() === "Completed") {
            currentFilter = "completed";
        }


        displayTasks();

    });

});


// ================================
// TASK COUNTER
// ================================

function updateTaskCount() {

    const remainingTasks = tasks.filter(function(task) {
        return !task.completed;
    }).length;


    if (remainingTasks === 1) {

        taskCount.textContent = "1 task left";

    } else {

        taskCount.textContent =
            `${remainingTasks} tasks left`;

    }
}


// ================================
// INITIAL DISPLAY
// ================================

displayTasks();