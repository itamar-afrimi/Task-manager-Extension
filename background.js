chrome.commands.onCommand.addListener((command) => {
    if (command === "_execute_action") {
        chrome.windows.create({
            url: "popup.html", // Your sidebar content
            type: "normal",     // Use 'normal' instead of 'popup' to allow more flexibility
            width: window.innerWidth,         // Adjust the width to fit your needs
            height: window.innerHeight, // Full height of the screen
            left: 0,            // Place it on the left side
            top: 0              // Ensure it's at the top of the screen
        });
    }
});
