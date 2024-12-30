/*
    Project Name: Wearable Sensor Group 7: Neuropulse
    Team Members: Om Agrawal, Derek Wang, Abhinav Kartik, Aaron Rogovoy
    Date: 6/3/2024
    Description: Create FAQ accordion section for the instructions page
*/

// Wait for the DOM content to fully load before running the script
document.addEventListener("DOMContentLoaded", function(event) { 
    // Get all elements with the class name "accordion"
    var acc = document.getElementsByClassName("accordion");
    var i;

    // Loop through all the elements with class name "accordion"
    for (i = 0; i < acc.length; i++) {
        // Add a click event listener to each accordion element
        acc[i].addEventListener("click", function() {
            // Toggle the "active" class for the clicked accordion
            this.classList.toggle("active");

            // Get the next sibling element of the clicked accordion, which is the panel
            var panel = this.nextElementSibling;

            // If the panel is currently open (maxHeight is set), close it
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
            } else {
                // If the panel is closed (maxHeight is not set), open it by setting maxHeight to its scrollHeight
                panel.style.maxHeight = panel.scrollHeight + "px";
            } 
        });
    }
});

