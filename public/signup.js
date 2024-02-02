document.addEventListener("DOMContentLoaded", function () {
    const signupForm = document.querySelector("form");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmPassword");

    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = usernameInput.value;
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        try {
            const response = await fetch("/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password, confirmPassword }),
            });

            if (response.ok) {
                // Redirect to the login page after successful signup
                window.location.href = "/login.html";
            } else {
                const errorMessage = await response.text();
                displayError(errorMessage);
            }
        } catch (error) {
            console.error("Error during signup:", error);
            displayError("Internal Server Error");
        }
    });

    function displayError(message) {
        alert(message); // Display the error as an alert pop-up
    }
});