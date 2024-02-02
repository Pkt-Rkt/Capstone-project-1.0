document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.querySelector("form");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = usernameInput.value;
        const password = passwordInput.value;

        try {
            const response = await fetch("/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                // Redirect after successful login
                window.location.href = "/index.html";
            } else {
                const errorMessage = await response.text();
                alert(errorMessage); // Display the error message in an alert
            }
        } catch (error) {
            console.error("Error during login:", error);
            alert("Internal Server Error"); // Display an alert for internal server error
        }
    });
});