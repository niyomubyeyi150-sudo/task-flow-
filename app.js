import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// FIREBASE CONFIG
// FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "process.env.GOOGLE_API_KEY",
    authDomain: "task-flow-b7d13.firebaseapp.com",
    projectId: "task-flow-b7d13",
    storageBucket: "task-flow-b7d13.firebasestorage.app",
    messagingSenderId: "1048913102957",
    appId: "1:1048913102957:web:8c36a72ac407233a109764"
};


// INITIALIZE FIREBASE
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("Firebase connected successfully!");


// TASKS
let tasks = [];

let currentFilter = "all";


// SELECT HTML ELEMENTS
const taskForm = document.querySelector(".task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector(".task-list");
const taskCount = document.querySelector(".task-count");
const filters = document.querySelectorAll(".filter");
const statusMessage = document.querySelector(".status-message");


// DISPLAY TASKS
function displayTasks() {

    if (!taskList) {
        return;
    }

    taskList.innerHTML = "";

    let filteredTasks = tasks;

    // ACTIVE TASKS
    if (currentFilter === "active") {
        filteredTasks = tasks.filter(function(task) {
            return !task.completed;
        });
    }

    // COMPLETED TASKS
    if (currentFilter === "completed") {
        filteredTasks = tasks.filter(function(task) {
            return task.completed;
        });
    }


    // DISPLAY EACH TASK
    filteredTasks.forEach(function(task) {

        const listItem = document.createElement("li");
        listItem.className = "task-item";

        if (task.completed) {
            listItem.classList.add("completed");
        }

        listItem.dataset.id = task.id;


        // TASK CONTENT
        const taskContent = document.createElement("div");
        taskContent.className = "task-content";


        // CHECKBOX
        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.id = `task-${task.id}`;


        // LABEL
        const label = document.createElement("label");

        label.htmlFor = `task-${task.id}`;
        label.textContent = task.title;


        taskContent.appendChild(checkbox);
        taskContent.appendChild(label);


        // BUTTONS
        const taskActions = document.createElement("div");
        taskActions.className = "task-actions";


        // EDIT BUTTON
        const editButton = document.createElement("button");

        editButton.type = "button";
        editButton.className = "edit-button";
        editButton.textContent = "Edit";

        editButton.setAttribute(
            "aria-label",
            `Edit ${task.title}`
        );


        // DELETE BUTTON
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


        // CHECKBOX EVENT
        checkbox.addEventListener("change", function() {
            toggleTask(task.id);
        });


        // EDIT EVENT
        editButton.addEventListener("click", function() {
            editTask(task.id);
        });


        // DELETE EVENT
        deleteButton.addEventListener("click", function() {
            deleteTask(task.id);
        });

    });


    updateTaskCount();
}


// READ TASKS FROM FIRESTORE
async function loadTasks() {

    if (!taskList) {
        return;
    }

    // LOADING STATE
    taskList.innerHTML = "<li>Loading tasks...</li>";

    try {

        const tasksQuery = query(
            collection(db, "tasks"),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(tasksQuery);


        tasks = snapshot.docs.map(function(docSnapshot) {

            const data = docSnapshot.data();

            return {
                id: docSnapshot.id,
                title: data.title,
                completed: data.completed
            };

        });


        displayTasks();

        console.log("Tasks loaded from Firestore.");

    } catch (error) {

        console.error(
            "Error loading tasks:",
            error
        );

        taskList.innerHTML =
            "<li>Unable to load tasks.</li>";

        if (statusMessage) {
            statusMessage.textContent =
                "Could not load tasks. Please try again.";
        }

    }
}


// ADD TASK
if (taskForm) {

    taskForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const title = taskInput.value.trim();


            // EMPTY TASK
            if (title === "") {

                statusMessage.textContent =
                    "Please enter a task.";

                return;
            }


            // MAXIMUM 100 CHARACTERS
            if (title.length > 100) {

                statusMessage.textContent =
                    "Task must be 100 characters or less.";

                return;
            }


            try {

                // SAVE TO FIRESTORE
                const docRef = await addDoc(
                    collection(db, "tasks"),
                    {
                        title: title,
                        completed: false,
                        createdAt: serverTimestamp()
                    }
                );


                // ADD TO LOCAL ARRAY
                const newTask = {

                    id: docRef.id,

                    title: title,

                    completed: false

                };


                tasks.unshift(newTask);


                // CLEAR INPUT
                taskInput.value = "";

                statusMessage.textContent = "";


                // DISPLAY TASKS
                displayTasks();


                console.log(
                    "Task saved to Firestore:",
                    docRef.id
                );


            } catch (error) {

                console.error(
                    "Error adding task:",
                    error
                );

                statusMessage.textContent =
                    "Could not save task. Please try again.";

            }

        }
    );

}


// COMPLETE / UNCOMPLETE TASK
async function toggleTask(taskId) {

    const task = tasks.find(function(task) {

        return task.id === taskId;

    });


    if (!task) {
        return;
    }


    const newCompletedValue = !task.completed;


    try {

        // UPDATE FIRESTORE
        const taskRef = doc(
            db,
            "tasks",
            taskId
        );


        await updateDoc(
            taskRef,
            {
                completed: newCompletedValue
            }
        );


        // UPDATE LOCAL ARRAY
        task.completed = newCompletedValue;


        statusMessage.textContent = "";

        displayTasks();


        console.log(
            "Task completion updated."
        );


    } catch (error) {

        console.error(
            "Error updating task:",
            error
        );

        statusMessage.textContent =
            "Could not update task. Please try again.";

        displayTasks();

    }

}


// EDIT TASK
async function editTask(taskId) {

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


    // EMPTY TITLE
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


    try {

        const taskRef = doc(
            db,
            "tasks",
            taskId
        );


        await updateDoc(
            taskRef,
            {
                title: updatedTitle
            }
        );

        task.title = updatedTitle;


        statusMessage.textContent = "";

        displayTasks();


        console.log(
            "Task edited successfully."
        );


    } catch (error) {

        console.error(
            "Error editing task:",
            error
        );

        statusMessage.textContent =
            "Could not edit task. Please try again.";

    }

}

async function deleteTask(taskId) {

    const confirmed = confirm(
        "Are you sure you want to delete this task?"
    );


    if (!confirmed) {
        return;
    }


    try {

        const taskRef = doc(
            db,
            "tasks",
            taskId
        );

        await deleteDoc(taskRef);

        tasks = tasks.filter(function(task) {

            return task.id !== taskId;

        });


        statusMessage.textContent = "";

        displayTasks();


        console.log(
            "Task deleted successfully."
        );


    } catch (error) {

        console.error(
            "Error deleting task:",
            error
        );

        statusMessage.textContent =
            "Could not delete task. Please try again.";

    }

}

filters.forEach(function(button) {

    button.addEventListener(
        "click",
        function() {

            filters.forEach(function(filter) {

                filter.classList.remove("active");

            });


            button.classList.add("active");


            if (
                button.textContent.trim() === "All"
            ) {

                currentFilter = "all";

            }


            if (
                button.textContent.trim() === "Active"
            ) {

                currentFilter = "active";

            }


            if (
                button.textContent.trim() === "Completed"
            ) {

                currentFilter = "completed";

            }


            displayTasks();

        }
    );

});

function updateTaskCount() {

    if (!taskCount) {
        return;
    }


    const remainingTasks = tasks.filter(
        function(task) {

            return !task.completed;

        }
    ).length;


    if (remainingTasks === 1) {

        taskCount.textContent =
            "1 task left";

    } else {

        taskCount.textContent =
            `${remainingTasks} tasks left`;

    }

}
loadTasks();