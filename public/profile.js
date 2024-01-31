// Get the DOM elements
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const editProfileButton = document.getElementById("editProfile");
const saveProfileButton = document.getElementById("saveProfile");

// Function to make the fields editable
function makeFieldsEditable() {
    usernameInput.removeAttribute("readonly");
    emailInput.removeAttribute("readonly");
    editProfileButton.style.display = "none";
    saveProfileButton.style.display = "block";
}

// Function to save changes and make fields read-only
function saveProfileChanges() {
    const newUsername = usernameInput.value;
    const newEmail = emailInput.value;

    // Here, you can send the updated data to your server for saving

    // After saving the changes, make fields read-only again
    usernameInput.setAttribute("readonly", true);
    emailInput.setAttribute("readonly", true);
    editProfileButton.style.display = "block";
    saveProfileButton.style.display = "none";
}

// Add click event listeners to the buttons
editProfileButton.addEventListener("click", makeFieldsEditable);
saveProfileButton.addEventListener("click", saveProfileChanges);
