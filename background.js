chrome.commands.onCommand.addListener((command) => {
    if (command === "_execute_action") {
        chrome.windows.create({
            url: "popup.html",  // The URL of your popup
            type: "popup",  // Ensure it's a popup
            width: window.innerWidth,  // Set a reasonable width
            height: window.innerHeight,  // Set a reasonable height
            left: 0,  // Position it from the left side of the screen
            top: 0,  // Position it from the top
        });
    }
});
