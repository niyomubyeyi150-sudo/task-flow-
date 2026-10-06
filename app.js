import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyCdpDfq90q2BJ44lAt28BLaDUQGszJAqbM",
    authDomain: "task-flow-b7d13.firebaseapp.com",
    projectId: "task-flow-b7d13",
    storageBucket: "task-flow-b7d13.firebasestorage.app",
    messagingSenderId: "1048913102957",
    appId: "1:1048913102957:web:8c36a72ac407233a109764"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("Firebase connected successfully!");



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



const taskForm = document.querySelector(".task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector(".task-list");
const taskCount = document.querySelector(".task-count");
const filters = document.querySelectorAll(".filter");
const statusMessage = document.querySelector(".status-message");



function displayTasks() {

    taskList.innerHTML = "";

    let filteredTasks = tasks;

    if (currentFilter === "active") {
        filteredTasks = tasks.filter(function(task) {
            return !task.completed;
        });
    }

    if (currentFilter === "completed") {
        filteredTasks = tasks.filter(function(task) {
            return task.completed;
        });
    }


    filteredTasks.forEach(function(task) {

        const listItem = document.createElement("li");

        listItem.className = "task-item";

        if (task.completed) {
            listItem.classList.add("completed");
        }

        listItem.dataset.id = task.id;

        const taskContent = document.createElement("div");

        taskContent.className = "task-content";

        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.id = `task-${task.id}`;


       
        const label = document.createElement("label");

        label.htmlFor = `task-${task.id}`;
        label.textContent = task.title;


        taskContent.appendChild(checkbox);
        taskContent.appendChild(label);



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



        listItem.appendChild(taskContent);
        listItem.appendChild(taskActions);

        taskList.appendChild(listItem);



        checkbox.addEventListener("change", function() {
            toggleTask(task.id);
        });



        editButton.addEventListener("click", function() {
            editTask(task.id);
        });



        deleteButton.addEventListener("click", function() {
            deleteTask(task.id);
        });

    });


    updateTaskCount();
}



// ADD TASK
taskForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const title = taskInput.value.trim();

    if (title === "") {
        statusMessage.textContent = "Please enter a task.";
        return;
    }

    if (title.length > 100) {
        statusMessage.textContent =
            "Task must be 100 characters or less.";
        return;
    }

    try {
        const docRef = await addDoc(collection(db, "tasks"), {
            title: title,
            completed: false
        });

        const newTask = {
            id: docRef.id,
            title: title,
            completed: false
        };

        tasks.unshift(newTask);

        taskInput.value = "";
        statusMessage.textContent = "";
        displayTasks();

        console.log("Task saved to Firestore:", docRef.id);

    } catch (error) {
        console.error("Error adding task:", error);
        statusMessage.textContent =
            "Could not save task. Please try again.";
    }
});

function toggleTask(taskId) {

    const task = tasks.find(function(task) {
        return task.id === taskId;
    });


    if (task) {

        task.completed = !task.completed;

        displayTasks();
    }
}

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


    if (newTitle === null) {
        return;
    }

    const updatedTitle = newTitle.trim();


    if (updatedTitle === "") {

        statusMessage.textContent =
            "Task cannot be empty.";

        return;
    }


    if (updatedTitle.length > 100) {

        statusMessage.textContent =
            "Task must be 100 characters or less.";

        return;
    }


    task.title = updatedTitle;

    statusMessage.textContent = "";

    displayTasks();
}


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


filters.forEach(function(button) {

    button.addEventListener("click", function() {
        filters.forEach(function(filter) {
            filter.classList.remove("active");
        });


        button.classList.add("active");
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


displayTasks();