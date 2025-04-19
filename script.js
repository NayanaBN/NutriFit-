// Wait for the DOM to be fully loaded before executing these functions
// Ensures elements are available when scripts run
document.addEventListener('DOMContentLoaded', function () {
    loadMeals();// Load saved meal data from localStorage
    loadWeight(); // Load stored weight data
    updateCalorieChart();// Update the calorie tracking chart
    updateProgressChart(); // Update the weight progress chart
});
// Listen for the Enter key in the calories input field to log a meal
document.getElementById('calories')?.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        logMeal(); // Calls the function to log meal data
    }
});
// Restrict weight input field to allow only numbers and decimal points
document.getElementById('weight')?.addEventListener('keypress', function (e) {
    if (!/[0-9.]$/.test(e.key)) {
        e.preventDefault(); // Prevents non-numeric characters
    }
});
// Function to play a reminder sound and execute a callback function afterward
function playReminderSound(callback) {
    let sound = document.getElementById('reminderSound'); // Get the audio element
    if (sound) {
        sound.currentTime = 0; // Reset playback position
        sound.play().then(() => {
            setTimeout(callback, 700); // Wait for 700ms before executing callback
        }).catch(error => {
            console.warn("Sound playback failed:", error); // Log warning if playback fails
            callback(); // Proceed with the callback even if sound fails
        });
    } else {
        callback(); // Execute callback if no sound element exists
    }
}

// Function to display an alert after playing a reminder sound
function showAlert(message) {
    playReminderSound(() => {
        confirm(message); // Show confirmation dialog with message
    });
}
// Login form event listener to authenticate users
document.getElementById('loginForm')?.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission
    let email = document.getElementById('email').value; // Get email input field value
    let password = document.getElementById('password').value; // Get password input field value
    if (email === '' || password === '') {
        alert('Please fill in all fields!'); // Alert if any field is empty
        return;
    }
    let users = JSON.parse(localStorage.getItem('users')) || []; // Retrieve stored users from localStorage
    let userExists = users.find(user => user.email === email && user.password === password); // Check for matching credentials
    if (userExists) {
        alert('Login Successful! Redirecting...'); // Show success message
        window.location.href = "planner.html"; // Redirect user to planner page
    } else {
        alert('Invalid credentials! Please register first.'); // Show error message
    }
});

// Register form event listener to store new users
document.getElementById('registerForm')?.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission
    let name = document.getElementById('name').value; // Get name input field value
    let email = document.getElementById('email').value; // Get email input field value
    let password = document.getElementById('password').value; // Get password input field value
    if (name === '' || email === '' || password === '') {
        alert('Please fill in all fields!'); // Alert if any field is empty
        return;
    }
    let users = JSON.parse(localStorage.getItem('users')) || []; // Retrieve stored users from localStorage
    let userExists = users.find(user => user.email === email); // Check if the user already exists
    if (userExists) {
        alert('User already exists! Please log in.'); // Alert if user exists
    } else {
        users.push({ name, email, password }); // Add new user to the array
        localStorage.setItem('users', JSON.stringify(users)); // Store updated user list in localStorage
        alert('Registration Successful! Redirecting to login page...'); // Show success message
        window.location.href = "login.html"; // Redirect to login page
    }
});

// Function to display a diet plan based on user selection
function showPlan() {
    let diet = document.getElementById('diet').value;// Get selected diet type from dropdown
    let plan = ''; // Initialize plan variable
    if (diet === 'vegan') {
        plan = `
        <strong>Vegan Diet Plan:</strong><br>
        🌱 Breakfast: Oatmeal with almond milk & berries <br>
        🥗 Lunch: Quinoa salad with chickpeas <br>
        🍛 Dinner: Stir-fried tofu with vegetables`;
    } else if (diet === 'keto') {
        plan = `
        <strong>Keto Diet Plan:</strong><br>
        🥚 Breakfast: Scrambled eggs with avocado <br>
        🥩 Lunch: Grilled chicken with spinach salad <br>
        🧀 Dinner: Salmon with steamed broccoli`;
    } else if (diet === 'gluten-free') {
        plan = `
        <strong>Gluten-Free Diet Plan:</strong><br>
        🍳 Breakfast: Greek yogurt with honey & nuts <br>
        🥗 Lunch: Grilled salmon with quinoa <br>
        🍛 Dinner: Brown rice with lentils and veggies`;
    }
    let resultDiv = document.getElementById('planResult'); // Get result display element
    resultDiv.innerHTML = plan; // Display the selected diet plan
    resultDiv.style.animation = "fadeIn 0.5s ease-in-out"; // Apply fade-in animation effect
}

let progressChartInstance = null; // Store chart instance globally
document.getElementById('weight').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent form submission (if inside a form)
        logWeight(); // Call the function to log weight
    }
});
// Function to log weight
function logWeight() {
    const weightInput = document.getElementById('weight'); // Get weight input field
    let weight = weightInput.value.trim(); // Trim whitespace from input value
    if (weight === '' || isNaN(weight) || Number(weight) <= 0) {
        alert('Please enter a valid number for weight!'); // Validate weight input
        return;
    }
    weight = parseFloat(weight); // Convert input to floating-point number
    let weights = JSON.parse(localStorage.getItem('weights')) || []; // Retrieve stored weight data
    weights.push(weight); // Add new weight entry to array
    localStorage.setItem('weights', JSON.stringify(weights)); // Store updated weights in localStorage
    weightInput.value = ''; // Clear input field after logging weight
    updateProgressChart(); // Refresh the weight progress chart
}
function resetWeight() {
    if (confirm("Are you sure you want to reset your weight progress?")) {
        localStorage.removeItem('weights'); // Clear stored weight data
        document.getElementById('weight').value = ''; // Clear input field

        // Reset the chart
        if (progressChartInstance) {
            progressChartInstance.destroy(); // Destroy the existing chart
            progressChartInstance = null;  // Reset instance
        }

        updateProgressChart(true); // Refresh chart with empty data
        alert("Weight progress has been reset.");
    }
}

function updateCalorieChart() { const ctx = document.getElementById('calorieChart')?.getContext('2d'); if (!ctx) return;

    const meals = JSON.parse(localStorage.getItem('meals')) || [];
    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    const remainingCalories = Math.max(0, 2000 - totalCalories);
    
    if (window.calorieChartInstance) window.calorieChartInstance.destroy();
    
    window.calorieChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Consumed', 'Remaining'],
            datasets: [{
                data: [totalCalories, remainingCalories],
                backgroundColor: ['#ff9a8b', '#d3f8e2'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: { enabled: false },
                legend: { display: false },
                datalabels: {
                    color: '#333',
                    formatter: (value, context) => {
                        return context.chart.data.labels[context.dataIndex] === 'Consumed'
                            ? `${value} kcal`
                            : '';
                    }
                },
                doughnutLabel: {}
            }
        },
        plugins: [
            ChartDataLabels,
            {
                id: 'caloriesCenterText',
                beforeDraw: (chart) => {
                    const { width } = chart;
                    const { height } = chart;
                    const ctx = chart.ctx;
                    ctx.restore();
                    const fontSize = (height / 10).toFixed(2);
                    ctx.font = `${fontSize}px Arial`;
                    ctx.textBaseline = "middle";
                    ctx.fillStyle = '#444';
                    const text = `${totalCalories} kcal`;
                    const textX = Math.round((width - ctx.measureText(text).width) / 2);
                    const textY = height / 2;
                    ctx.fillText(text, textX, textY);
                    ctx.save();
                }
            }
        ]
    });
}

// Function to update weight progress chart
function updateProgressChart(reset = false) {
    const canvas = document.getElementById('progressChart');
    if (!canvas) {
        console.warn("progressChart canvas not found!");
        return;
    }

    const ctx = canvas.getContext('2d');
    const weights = reset ? [] : JSON.parse(localStorage.getItem('weights')) || [];

    // Generate labels like "Day 1", "Day 2", ...
    const labels = weights.map((_, i) => `Day ${i + 1}`);

    // Destroy existing chart if it exists
    if (progressChartInstance) {
        progressChartInstance.destroy();
    }

    // Create a new chart instance
    progressChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Weight (kg)',
                data: weights,
                borderColor: 'blue',
                backgroundColor: 'rgba(0, 0, 255, 0.1)',
                tension: 0.3,
                pointRadius: 5,
                pointBackgroundColor: 'blue',
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Weight (kg)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Days'
                    }
                }
            }
        }
    });
}

function logMeal() { 
    let foodItem = document.getElementById('foodItem').value; 
    let calories = document.getElementById('calories').value;

    if (foodItem === '' || calories === '') {
        alert('Please enter a food item and calories!');
        return;
    }
    
    let date = new Date();
    let formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()} (${date.toLocaleDateString('en-US', { weekday: 'long' })})`;
    
    let meals = JSON.parse(localStorage.getItem('meals')) || [];
    meals.push({ foodItem, calories: parseInt(calories), date: formattedDate });
    localStorage.setItem('meals', JSON.stringify(meals));
    
    // Clear input fields after adding meal
    document.getElementById('foodItem').value = '';
    document.getElementById('calories').value = '';
    
    loadMeals();
    updateCalorieChart();
    playReminderSound();
    }

function loadMeals() {
    const mealList = document.getElementById('mealList');
    mealList.innerHTML = '';
    const meals = JSON.parse(localStorage.getItem('meals')) || [];
    meals.forEach((meal, index) => {
        const dateObj = new Date(meal.date);
        const formattedDate = dateObj.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short'
        });
        const formattedTime = dateObj.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit'
        });
        const li = document.createElement('li');
        li.classList.add('meal-item');
        li.innerHTML = `
            <span class="meal-info">
                <strong>${meal.foodItem}</strong> - ${meal.calories} kcal · <small>${formattedDate}, ${formattedTime}</small>
            </span>
            <button class="delete-btn" onclick="deleteMeal(${index})" title="Delete Meal">🗑️
                <i class="fas fa-trash-alt"></i>
            </button>
        `;
        mealList.appendChild(li);
    });
    updateCalorieChart();
}
function showWorkout() {
    let workoutType = document.getElementById('workoutType').value;
    let workoutPlan = ''; 

    if (workoutType === 'cardio') {
        workoutPlan = `
        <strong>🔥 Cardio Workout Plan:</strong><br>
        🏃 Warm-up: 5 min jump rope <br>
        🚴 Main: 20 min cycling or running <br>
        🏋️ Cool-down: 5 min stretching`;
    } else if (workoutType === 'strength') {
        workoutPlan = `
        <strong>💪 Strength Training Plan:</strong><br>
        🏋️ Warm-up: 5 min dynamic stretching <br>
        🏋️ Main: Squats, Deadlifts, Bench Press (3 sets) <br>
        🏋️ Cool-down: Foam rolling & stretching`;
    } else if (workoutType === 'yoga') {
        workoutPlan = `
        <strong>🧘 Yoga Routine:</strong><br>
        🌞 Morning: Sun Salutations (5 rounds) <br>
        🧘‍♂️ Mid-day: Warrior Pose & Tree Pose (2 min each) <br>
        🌙 Evening: Relaxing meditation & deep breathing`;
    }

    document.getElementById('workoutPlan').innerHTML = workoutPlan;
}

function formatDate(raw) {
    const date = new Date(raw);
    const day = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${day}, ${time}`;
}
function deleteMeal(index) {
    let meals = JSON.parse(localStorage.getItem('meals')) || [];
    meals.splice(index, 1);
    localStorage.setItem('meals', JSON.stringify(meals));
    loadMeals();
}
function playReminderSound() {
    let sound = document.getElementById('reminderSound');
    if (sound) sound.play();
}
function logWeight() {
    const weightInput = document.getElementById('weight');
    let weight = weightInput.value.trim();

    if (weight === '' || isNaN(weight) || Number(weight) <= 0) {
        alert('Please enter a valid number for weight!');
        return;
    }

    weight = parseFloat(weight);
    let weights = JSON.parse(localStorage.getItem('weights')) || [];
    weights.push(weight);
    localStorage.setItem('weights', JSON.stringify(weights));

    weightInput.value = ''; // Clear input
    updateProgressChart(); // Show chart
}
function calculateBMI() {
    const weight = parseFloat(document.getElementById('weight').value);
    const heightCm = parseFloat(document.getElementById('height').value);
    const result = document.getElementById('bmiResult');

    if (!weight || !heightCm || weight <= 0 || heightCm <= 0) {
        result.textContent = "❗ Please enter both weight and height correctly.";
        result.style.color = "red";
        return;
    }

    const heightM = heightCm / 100;
    const bmi = weight / (heightM * heightM);
    let category = "";
    let message = "";

    if (bmi < 18.5) {
        category = "Underweight";
        message = "Your weight is less than what is considered healthy for your height.";
    } else if (bmi < 24.9) {
        category = "Healthy weight";
        message = "Great! Your weight is within the healthy range.";
    } else if (bmi < 29.9) {
        category = "Overweight";
        message = "Your weight is more than what is considered healthy. Consider a healthy diet and exercise.";
    } else {
        category = "Obese";
        message = "Your weight is much higher than normal. Please consult a doctor or nutritionist.";
    }

    result.innerHTML = `🧮 Your BMI is <strong>${bmi.toFixed(1)}</strong> → <strong>${category}</strong><br>${message}`;
    result.style.color = "#333";
}







