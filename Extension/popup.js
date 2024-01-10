// popup.js

document.addEventListener('DOMContentLoaded', function() {
    var webPageFrame = document.getElementById('webPageFrame');
    
    if (webPageFrame) {
        webPageFrame.addEventListener('load', function() {
            // Perform actions after the iframe has loaded (if needed)
        });

        webPageFrame.src = 'https://thunderstore.io/moderation/review-queue/packages/'; // Set initial URL
    } else {
        console.error("Element with ID 'webPageFrame' not found.");
    }
});
