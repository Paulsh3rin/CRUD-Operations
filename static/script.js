document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('student-form');
    const studentTableBody = document.getElementById('student-table').getElementsByTagName('tbody')[0];
    const dobInput = document.getElementById('dob');

    // Set the maximum date to today's date to prevent future dates
    const today = new Date().toISOString().split('T')[0];
    dobInput.max = today;

    // Set a default value for DOB input to start the date picker from 1999
    const defaultYear = 1999;
    dobInput.addEventListener('focus', function() {
        if (!dobInput.value) {
            dobInput.value = `${defaultYear}-01-01`;
        }
        dobInput.showPicker();  // Ensure the date picker shows up immediately
    });

    // Function to create a table row for a student
    function createStudentTableRow(student) {
        const tr = document.createElement('tr');
        tr.dataset.id = student.student_id;  // Add data-id attribute for easy selection

        tr.innerHTML = `
            <td>${student.student_id}</td>
            <td>${student.first_name}</td>
            <td>${student.last_name}</td>
            <td>${student.dob}</td>
            <td>${student.amount_due}</td>
            <td>
                <button onclick="updateStudent(${student.student_id})">Update</button>
                <button onclick="deleteStudent(${student.student_id})">Delete</button>
            </td>
        `;

        return tr;
    }

    // Event listener for form submission
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const firstName = document.getElementById('first_name').value;
        const lastName = document.getElementById('last_name').value;
        let dob = dobInput.value;
        if (dob === `${defaultYear}-01-01`) {
            dob = ''; // Set to empty if default date is not changed
        }
        const amountDue = document.getElementById('amount_due').value;

        fetch('/students', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ first_name: firstName, last_name: lastName, dob: dob, amount_due: amountDue })
        })
        .then(response => response.json())
        .then(student => {
            const tr = createStudentTableRow(student);
            studentTableBody.appendChild(tr);
            form.reset();
            dobInput.type = 'text'; // Reset the type to text to show placeholder
            dobInput.placeholder = 'DOB';  // Reset the placeholder
            dobInput.value = ''; // Clear the value to show the placeholder
        });
    });

    // Fetch and display all students
    fetch('/students')
        .then(response => response.json())
        .then(students => {
            students.forEach(student => {
                const tr = createStudentTableRow(student);
                studentTableBody.appendChild(tr);
            });
        });

    // Function to delete a student
    window.deleteStudent = function(student_id) {
        fetch(`/students/${student_id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                document.querySelector(`#student-table tr[data-id='${student_id}']`).remove();
            }
        });
    }

    // Function to update a student
    window.updateStudent = function(student_id) {
        const tr = document.querySelector(`#student-table tr[data-id='${student_id}']`);
        const firstName = prompt('Enter new first name', tr.children[1].textContent);
        const lastName = prompt('Enter new last name', tr.children[2].textContent);
        const dob = prompt('Enter new date of birth (YYYY-MM-DD)', tr.children[3].textContent);
        const amountDue = prompt('Enter new amount due', tr.children[4].textContent);

        if (firstName && lastName && dob && amountDue) {
            fetch(`/students/${student_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ first_name: firstName, last_name: lastName, dob: dob, amount_due: amountDue })
            })
            .then(response => response.json())
            .then(updatedStudent => {
                tr.children[1].textContent = updatedStudent.first_name;
                tr.children[2].textContent = updatedStudent.last_name;
                tr.children[3].textContent = updatedStudent.dob;
                tr.children[4].textContent = updatedStudent.amount_due;
            });
        }
    }
});
