// Listen for the DOM to fully load before running the script
document.addEventListener("DOMContentLoaded", function () {
    const signupForm = document.querySelector("form");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmPassword");

    // Handle form submission events
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Collect input values
        const username = usernameInput.value;
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Attempt to sign up with the provided credentials
        try {
            const response = await fetch("/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                // Convert credentials to a JSON string
                body: JSON.stringify({ username, password, confirmPassword }),
            });

            // Check if the signup was successful
            if (response.ok) {
                // Redirect to login page on successful signup
                window.location.href = "/login.html";
            } else {
                // If signup failed, display the returned error message
                const errorMessage = await response.text();
                displayError(errorMessage);
            }
        } catch (error) {
            // Log any errors and display a generic error message
            console.error("Error during signup:", error);
            displayError("Internal Server Error");
        }
    });

    // Function to display error messages
    function displayError(message) {
        alert(message);
    }
});