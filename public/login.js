// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
    // Select the login form and input fields
    const loginForm = document.querySelector("form");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    // Handle the form submission
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Get values from input fields
        const username = usernameInput.value;
        const password = passwordInput.value;

        // Try to log in with the provided credentials
        try {
            const response = await fetch("/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            // Check if the login was successful
            if (response.ok) {
                window.location.href = "/index.html";
            } else {
                // If login failed, display an error message
                const errorMessage = await response.text();
                alert(errorMessage);
            }
        } catch (error) {
            // Log and alert any network or server errors
            console.error("Error during login:", error);
            alert("Internal Server Error");
        }
    });
});