//views/consoleView.js
class ConsoleView {
  displayResponse(response) {
    console.log(response);
  }

  promptUser() {
    process.stdout.write('> ');
  }
}

module.exports = ConsoleView;
