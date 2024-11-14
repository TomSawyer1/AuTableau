document.addEventListener("DOMContentLoaded", () => {
    const BASE_URL = "http://localhost:5000";
    const form = document.getElementById("create-class-form");
    const selectClass = document.getElementById("select-class");
    const studentNameInput = document.getElementById("student-name");
    const addStudentForm = document.getElementById("add-student-form");
    const classroomsContainer = document.getElementById("class-list");
    const studentListContainer = document.getElementById("student-list");

    //  appels API
    async function apiRequest(endpoint, method = "GET", data = null) {
        const options = {
            method,
            headers: {
                "Content-Type": "application/json",
            },
        };
        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, options);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Erreur réseau");
            }
            return await response.json();
        } catch (error) {
            console.error("Erreur API :", error);
            alert(error.message);
        }
    }

    // Chargement initial des classes
    async function loadClassrooms() {
        const classrooms = await apiRequest("/classrooms");
        if (classrooms) {
            displayClassrooms(classrooms);
            populateClassSelect(classrooms);
        }
    }

    // Afficher les classes

function displayClassrooms(classrooms) {
    const classList = document.getElementById("class-list");
    classList.innerHTML = ""; 

    classrooms.forEach((classroom) => {
        // Création d'un conteneur pour chaque classe
        const classElement = document.createElement("div");
        classElement.className = "flex items-center justify-between p-4 border rounded-md shadow-sm";

        // Afficher le nom de la classe
        const className = document.createElement("span");
        className.textContent = classroom.name;
        className.className = "text-gray-700 font-medium";

        const actionsContainer = document.createElement("div");
        actionsContainer.className = "flex space-x-2";

        const editButton = document.createElement("button");
        editButton.textContent = "Modifier";
        editButton.className = "edit-class-btn bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600";
        editButton.addEventListener("click", () => editClass(classroom._id)); // ici on appel la function

        
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Supprimer";
        deleteButton.className = "delete-class-btn bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600";
        deleteButton.addEventListener("click", () => deleteClass(classroom._id)); // ici on appel la function

        actionsContainer.appendChild(editButton);
        actionsContainer.appendChild(deleteButton);

        classElement.appendChild(className);
        classElement.appendChild(actionsContainer);

        // Ajouter la classe à la liste
        classList.appendChild(classElement);
    });
}


// Del classe
async function deleteClass(classId) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette classe ?")) {
        try {
            const response = await fetch(`http://localhost:5000/classrooms/${classId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                alert("Classe supprimée avec succès !");
                loadClassrooms(); // Recharger la liste des classes après suppression
            } else {
                const errorData = await response.json();
                alert(`Erreur : ${errorData.error || "Impossible de supprimer la classe."}`);
            }
        } catch (error) {
            console.error("Erreur lors de la suppression :", error);
            alert("Erreur réseau. Impossible de supprimer la classe.");
        }
    }
}

//edit class
async function editClass(classId) {
    const newName = prompt("Entrez le nouveau nom de la classe :");

    if (!newName || newName.trim() === "") {
        alert("Le nom de la classe ne peut pas être vide.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/classrooms/${classId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: newName.trim() }),
        });

        if (response.ok) {
            alert("Classe modifiée avec succès !");
            loadClassrooms(); 
        } else {
            const errorData = await response.json();
            alert(`Erreur : ${errorData.error || "Impossible de modifier la classe."}`);
        }
    } catch (error) {
        console.error("Erreur lors de la modification :", error);
        alert("Erreur réseau. Impossible de modifier la classe.");
    }
}


    // le select de class
    function populateClassSelect(classrooms) {
        selectClass.innerHTML = "<option value=''>Choisir une classe</option>";
        classrooms.forEach((classroom) => {
            const option = document.createElement("option");
            option.value = classroom._id;
            option.textContent = classroom.name;
            selectClass.appendChild(option);
        });
    }

    // Afficher les student
    function displayStudents(students) {
        const studentList = document.getElementById("student-list");
        studentList.innerHTML = ""; // mise a 0 des student
    
        students.forEach((student) => {
            
 const studentElement = document.createElement("div");
 studentElement.className = "student-item flex justify-between items-center p-2 border rounded-md";
    
 
        const studentName = document.createElement("span");
        studentName.textContent = student.name;
        studentName.className = "text-gray-700 font-medium";
            
        const actionsContainer = document.createElement("div");
        actionsContainer.className = "flex space-x-2";
            
        const editButton = document.createElement("button");
        editButton.textContent = "Modifier";
        editButton.className = "edit-student-btn bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600";
        editButton.addEventListener("click", () => editStudent(student._id));
            
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Supprimer";
        deleteButton.className = "delete-student-btn bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600";
        deleteButton.addEventListener("click", () => deleteStudent(student._id));
    
            // Ajouter les boutons au conteneur d'actions
            actionsContainer.appendChild(editButton);
            actionsContainer.appendChild(deleteButton);
    
            // Ajouter le nom de l'étudiant et les actions au conteneur principal
            studentElement.appendChild(studentName);
            studentElement.appendChild(actionsContainer);
    
            // Ajouter l'étudiant à la liste
            studentList.appendChild(studentElement);
        });
    }
    // supp student
    async function deleteStudent(studentId) {
        const classId = document.getElementById("select-class").value; // Récupérer l'ID de la classe sélectionnée
    
        if (!classId) {
            alert("Veuillez sélectionner une classe avant de supprimer un étudiant.");
            return;
        }
    
        if (confirm("Êtes-vous sûr de vouloir supprimer cet étudiant ?")) {
            try {
                const response = await fetch(`http://localhost:5000/classrooms/${classId}/students/${studentId}`, {
                    method: "DELETE",
                });
    
                if (response.ok) {
                    alert("Étudiant supprimé avec succès !");
                    loadStudents(classId); // Recharger la liste des étudiants
                } else {
                    const errorData = await response.json();
                    alert(`Erreur : ${errorData.error || "Impossible de supprimer l'étudiant."}`);
                }
            } catch (error) {
                console.error("Erreur lors de la suppression :", error);
                alert("Erreur réseau. Impossible de supprimer l'étudiant.");
            }
        }
    }
    

    //edit student

    async function editStudent(studentId) {
        const classId = document.getElementById("select-class").value; // Récupérer l'ID de la classe sélectionnée
    
        if (!classId) {
            alert("Veuillez sélectionner une classe avant de modifier un étudiant.");
            return;
        }
    
        const newName = prompt("Entrez le nouveau nom de l'étudiant :");
    
        if (!newName || newName.trim() === "") {
            alert("Le nom de l'étudiant ne peut pas être vide.");
            return;
        }
    
        try {
            const response = await fetch(`http://localhost:5000/classrooms/${classId}/students/${studentId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: newName.trim() }),
            });
    
            if (response.ok) {
                alert("Étudiant modifié avec succès !");
                loadStudents(classId); // Recharger la liste des étudiants
            } else {
                const errorData = await response.json();
                alert(`Erreur : ${errorData.error || "Impossible de modifier l'étudiant."}`);
            }
        } catch (error) {
            console.error("Erreur lors de la modification :", error);
            alert("Erreur réseau. Impossible de modifier l'étudiant.");
        }
    }
    
    // Charger les étudiants pour une classe donnée
    async function loadStudents(classroomId) {
        if (!classroomId) {
            studentListContainer.innerHTML = "<p class='text-gray-500'>Veuillez sélectionner une classe.</p>";
            return;
        }

        const students = await apiRequest(`/classrooms/${classroomId}/students`);
        if (students) {
            displayStudents(students);
        }
    }

    // Ajt class
    async function createClass(event) {
        event.preventDefault();
        const className = document.getElementById("class-name").value.trim();
        if (!className) {
            alert("Veuillez entrer un nom de classe.");
            return;
        }

        const newClass = await apiRequest("/classrooms", "POST", { name: className });
        if (newClass) {
            alert("Classe créée avec succès !");
            form.reset();
            loadClassrooms();
        }
    }

    // Ajt student
    async function addStudent(event) {
        event.preventDefault();
        const studentName = studentNameInput.value.trim();
        const classId = selectClass.value;

        if (!classId) {
            alert("Veuillez sélectionner une classe.");
            return;
        }

        if (!studentName) {
            alert("Veuillez entrer un nom d'étudiant.");
            return;
        }

        const newStudent = await apiRequest(`/classrooms/${classId}/students`, "POST", { name: studentName });
        if (newStudent) {
            alert("Étudiant ajouté avec succès !");
            addStudentForm.reset();
            loadStudents(classId); // Recharge les étudiants de cette classe
        }
    }

    // Écouteurs d'événements
    form.addEventListener("submit", createClass);
    addStudentForm.addEventListener("submit", addStudent);
    selectClass.addEventListener("change", (event) => {
        const classroomId = event.target.value;
        loadStudents(classroomId);
    });

    const randomCallButton = document.getElementById("random-call-btn");

    randomCallButton.addEventListener("click", randomStudentCall);

    // Fonction d'appel aléatoire d'un étudiant
    async function randomStudentCall() {
        const classId = selectClass.value;
        if (!classId) {
            alert("Veuillez sélectionner une classe pour faire un appel aléatoire.");
            return;
        }

        const students = await apiRequest(`/classrooms/${classId}/students`);
        if (!students || students.length === 0) {
            alert("Aucun étudiant dans cette classe pour l'appel.");
            return;
        }

        const randomIndex = Math.floor(Math.random() * students.length);
        const randomStudent = students[randomIndex];

        alert(`Appel aléatoire : ${randomStudent.name}`);
    }


    
    loadClassrooms();
});
