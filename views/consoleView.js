// Define a class to manage console interactions
class ConsoleView {
  // Display a response in the console
  displayResponse(response) {
    console.log(response);
  }

  // Prompt the user for input
  promptUser() {
    process.stdout.write('> ');
  }
}

// Export the ConsoleView class for use in other files
module.exports = ConsoleView;
