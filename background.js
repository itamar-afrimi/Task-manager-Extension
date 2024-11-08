chrome.commands.onCommand.addListener((command) => {
    if (command === "_execute_action") {
        chrome.windows.create({
            url: "popup.html",  // The URL of your popup
            type: "popup",  // Ensure it's a popup
            width: 400,  // Set a reasonable width
            height: 600,  // Set a reasonable height
            left: 100,  // Position it from the left side of the screen
            top: 100,  // Position it from the top
        });
    }
});
