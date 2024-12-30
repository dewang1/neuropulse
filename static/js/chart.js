/*
    Project Name: Wearable Sensor Group 7: Neuropulse
    Team Members: Om Agrawal, Derek Wang, Abhinav Kartik, Aaron Rogovoy
    Date: 6/3/2024
    Description: Data and chart functions for Firebase. Updates home page statistics and charts with Firebase data.
*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, get, onValue, off } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDSgK4oXAvW6L-GKt5n7REP-hTSQXc_J78",
    authDomain: "wearable-sensor-7.firebaseapp.com",
    databaseURL: "https://wearable-sensor-7-default-rtdb.firebaseio.com",
    projectId: "wearable-sensor-7",
    storageBucket: "wearable-sensor-7.appspot.com",
    messagingSenderId: "372835216898",
    appId: "1:372835216898:web:baec8373660bd9714ec11b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getDatabase(app);

let currentUser = null;
let myChart = null;
let activeListener = null;
const deviationValue = 300;  // Threshold value for deviations

// Function to get the logged-in user
function getUser() {
    let keepLoggedIn = localStorage.getItem('keepLoggedIn');
    if (keepLoggedIn == "yes") {
        currentUser = JSON.parse(localStorage.getItem("user"));
    } else {
        currentUser = JSON.parse(sessionStorage.getItem("user"));
    }
}

// Function to convert time string to seconds
function timeToSeconds(time) {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
}

// Function to convert seconds to time string (H:M:S)
function secondsToTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function displayNoDataMessage(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.font = '20px Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.fillText('No data found', ctx.canvas.width / 2, ctx.canvas.height / 2);
}

// Function to fetch and update EMG data from Firebase for a specific date
export function updateDailyData(date) {
    getUser();
    if (!currentUser) {
        throw new Error("No user logged in");
    }

    const formattedDate = date.split('-').join('-');
    console.log("Selected Date:", formattedDate);  // Logging the selected date

    const dbRef = ref(db, `users/${currentUser.uid}/data/${formattedDate}`);
    console.log("Database Reference Path:", dbRef.toString());  // Logging the reference path

    // Check if the selected date is the current date
    const currentDate = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });

    // Remove any active listener if it exists
    if (activeListener) {
        off(activeListener.ref, 'value', activeListener.callback);
        activeListener = null;
    }

    // If the selected date is the current date, use onValue to listen for real-time updates
    if (formattedDate === currentDate) {
        const callback = (snapshot) => {
            updateChart(snapshot, formattedDate);
        };
        onValue(dbRef, callback, (error) => {
            console.error("Error fetching data:", error);
        });
        activeListener = { ref: dbRef, callback: callback };
    } else {
        // Otherwise, use get to fetch the data once
        get(dbRef).then((snapshot) => {
            updateChart(snapshot, formattedDate);
        }).catch((error) => {
            console.error("Error fetching data:", error);
        });
    }
}

function updateChart(snapshot, formattedDate) {
    const ctx = document.getElementById('myChart').getContext('2d');
    if (!snapshot.exists()) {
        console.error("No data found for the selected date");
        if (myChart) {
            myChart.destroy();
        }
        displayNoDataMessage(ctx);
        document.getElementById('deviationRate').textContent = '0%';
        return;
    }

    const data = snapshot.val();
    console.log("Data from Firebase:", data);  // Logging the data from Firebase

    const points = [];
    let testCount = 0;
    let deviationCount = 0;

    for (let time in data) {
        const value = parseFloat(data[time]);
        points.push({
            x: timeToSeconds(time),
            y: value
        });
        testCount++;
        if (value < deviationValue) {
            deviationCount++;
        }
    }

    // Calculate and update deviation rate
    const deviationRate = testCount > 0 ? ((deviationCount / testCount) * 100).toFixed(2) + '%' : '0%';
    document.getElementById('deviationRate').textContent = deviationRate;

    // Update tests and deviations counts
    document.getElementById('testsCount').textContent = testCount;
    document.getElementById('deviationsCount').textContent = deviationCount;

    // Destroy existing chart if it exists
    if (myChart) {
        myChart.destroy();
    }

    // Create a new chart
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'EMG Sensor Value',
                    data: points,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    fill: false,
                    pointRadius: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 0 // Disable animations
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        color: 'black',
                        text: 'Time (H:M:S)',
                        font: {
                            size: 20
                        },
                    },
                    ticks: {
                        callback: function(value) {
                            return secondsToTime(value);
                        },
                        font: {
                            size: 16
                        },
                        autoSkip: true,
                        autoSkipPadding: 10,
                        stepSize: 60,  // Base step size is 1 minute
                        minRotation: 0,
                        maxRotation: 0,
                        major: {
                            enabled: true
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        color: 'black',
                        text: 'EMG Value',
                        font: {
                            size: 12
                        },
                    },
                    beginAtZero: true,
                    ticks: {
                        font: {
                            size: 12
                        }
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'EMG Values in Session',
                    color: 'black',
                    font: {
                        size: 24
                    },
                    padding: {
                        top: 10,
                        bottom: 30
                    }
                },
                legend: {
                    display: false  // Disable the legend
                },
                tooltip: {
                    callbacks: {
                        title: function(tooltipItems) {
                            const timeInSeconds = tooltipItems[0].parsed.x;
                            return `Time (H:M:S): ${secondsToTime(timeInSeconds)}`;
                        }
                    }
                },
                backgroundColorBelowThreshold: {
                    threshold: deviationValue,
                    color: 'rgba(255, 99, 132, 0.1)'  // Light red color
                }
            }
        },
        // Plugin to fill background below threshold value
        plugins: [{
            id: 'backgroundColorBelowThreshold',
            beforeDraw: function(chart, args, options) {
                const { ctx, chartArea: { top, bottom, left, right }, scales: { y } } = chart;
                const threshold = options.threshold;
                const thresholdY = y.getPixelForValue(threshold);

                ctx.save();
                ctx.fillStyle = options.color;
                ctx.fillRect(left, thresholdY, right - left, bottom - thresholdY);
                ctx.restore();
            }
        }]
    });
}

// Function to fetch and update EMG data for monthly view from Firebase. Graphs the deviation rate over a month
export function updateMonthlyData(month) {
    getUser();
    if (!currentUser) {
        throw new Error("No user logged in");
    }

    // Remove any active listener if it exists when switching to monthly view
    if (activeListener) {
        off(activeListener.ref, 'value', activeListener.callback);
        activeListener = null;
    }
    // Get the year, month number, and total days in the selected month
    const [year, monthNum] = month.split('-').map(Number);
    const monthString = String(monthNum).padStart(2, '0');
    const daysInMonth = new Date(year, monthNum, 0).getDate();


    const dbRef = ref(db, `users/${currentUser.uid}/data`);
    get(dbRef).then((snapshot) => {
        const ctx = document.getElementById('myChart').getContext('2d');
        if (!snapshot.exists()) {
            console.error("No data found for the selected month");
            if (myChart) {
                myChart.destroy();
            }
            displayNoDataMessage(ctx);
            document.getElementById('deviationRate').textContent = '0%';
            return;
        }

        const yearData = snapshot.val();
        console.log("Year Data from Firebase:", yearData);

        let totalTests = 0;
        let totalDeviations = 0;
        const dailyDeviations = {};
        const dailyTests = {};

        // Iterate over each day in the selected month to calculate total tests and deviations in the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayString = `${year}-${monthString}-${String(day).padStart(2, '0')}`;
            if (yearData[dayString]) {
                const dayData = yearData[dayString];
                for (let time in dayData) {
                    const value = parseFloat(dayData[time]);
                    totalTests++;
                    if (!dailyTests[dayString]) dailyTests[dayString] = 0;
                    dailyTests[dayString]++;
                    if (value < deviationValue) {
                        totalDeviations++;
                        if (!dailyDeviations[dayString]) dailyDeviations[dayString] = 0;
                        dailyDeviations[dayString]++;
                    }
                }
            }
        }

        if (totalTests === 0) {
            console.error("No data found for the selected month");
            if (myChart) {
                myChart.destroy();
            }
            displayNoDataMessage(ctx);
            document.getElementById('deviationRate').textContent = '0%';
            return;
        }

        // Calculate and update deviation rate
        const deviationRate = totalTests > 0 ? ((totalDeviations / totalTests) * 100).toFixed(2) + '%' : '0%';
        document.getElementById('deviationRate').textContent = deviationRate;

        // Update tests and deviations counts
        document.getElementById('testsCount').textContent = totalTests;
        document.getElementById('deviationsCount').textContent = totalDeviations;

        // Prepare chart data
        const points = [];
        for (let day = 1; day <= daysInMonth; day++) {
            const dayString = `${year}-${monthString}-${String(day).padStart(2, '0')}`;
            if (dailyTests[dayString]) {
                points.push({
                    x: day,
                    y: (dailyDeviations[dayString] || 0) / dailyTests[dayString]
                });
            }
        }

        // Destroy existing chart if it exists
        if (myChart) {
            myChart.destroy();
        }

        // Create a new chart
        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'Deviation Rate',
                        data: points,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'linear', // Using linear scale for day numbers
                        position: 'bottom',
                        title: {
                            display: true,
                            text: 'Day of the Month',
                            font: {
                                size: 20
                            },
                        },
                        ticks: {
                            min: 1,
                            max: daysInMonth, // Set the x-axis range
                            stepSize: 1, // Step size for each day
                            font: {
                                size: 16
                            },
                            callback: function(value) {
                                return Number.isInteger(value) ? value : null; // Only show integer tick marks
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Deviation Rate',
                            font: {
                                size: 20
                            },
                        },
                        beginAtZero: true,
                        ticks: {
                            font: {
                                size: 16
                            }
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Daily Deviation Rate for Selected Month',
                        font: {
                            size: 24
                        },
                        padding: {
                            top: 10,
                            bottom: 30
                        }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            title: function(tooltipItems) {
                                return `Day of Month: ${tooltipItems[0].parsed.x}`;
                            }
                        }
                    }
                }
            }
        });
    }).catch((error) => {
        console.error("Error fetching monthly data:", error);
    });
}
