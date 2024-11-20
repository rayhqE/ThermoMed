document.addEventListener('DOMContentLoaded', function() {
    let medicines = [];

    // Fetch the JSON data
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            medicines = data;
            // Start the temperature simulation after data is fetched
            simulateTemperature();
        })
        .catch(error => console.error('Error loading JSON data:', error));

    // Function to simulate temperature
    function simulateTemperature() {
        const simulatedTemperatureSpan = document.getElementById('simulated-temperature');
        let currentTemperature = parseFloat(localStorage.getItem('currentTemperature')) || 15;
        let increasing = localStorage.getItem('increasing') === 'true';
        let phase = parseInt(localStorage.getItem('phase')) || 1;
        let phaseTimer = parseInt(localStorage.getItem('phaseTimer')) || 0;

        const updateTemperature = () => {
            if (phase === 1) {
                if (increasing) {
                    currentTemperature += 0.25;
                    if (currentTemperature >= 30) {
                        currentTemperature = 30;
                        increasing = false;
                    }
                } else {
                    currentTemperature -= 0.25;
                    if (currentTemperature <= 15) {
                        currentTemperature = 15;
                        increasing = true;
                    }
                }
                phaseTimer += 10;
                if (phaseTimer >= 60) {
                    phase = 2;
                    phaseTimer = 0;
                    currentTemperature = 31;
                }
            } else if (phase === 2) {
                if (increasing) {
                    currentTemperature += 0.25;
                    if (currentTemperature >= 35) {
                        currentTemperature = 35;
                        increasing = false;
                    }
                } else {
                    currentTemperature -= 0.25;
                    if (currentTemperature <= 15) {
                        currentTemperature = 15;
                        increasing = true;
                    }
                }
                phaseTimer += 10;
                if (phaseTimer >= 60) {
                    phase = 1;
                    phaseTimer = 0;
                    currentTemperature = 15;
                }
            }

            if (simulatedTemperatureSpan) {
                simulatedTemperatureSpan.textContent = currentTemperature.toFixed(1);
            }

            localStorage.setItem('currentTemperature', currentTemperature);
            localStorage.setItem('increasing', increasing);
            localStorage.setItem('phase', phase);
            localStorage.setItem('phaseTimer', phaseTimer);

            updateMedicineList(currentTemperature);
            checkTemperatureAndSendEmail(currentTemperature);
        };

        setInterval(updateTemperature, 10000);
        updateTemperature();
    }

    function updateMedicineList(currentTemperature) {
        const rows = document.querySelectorAll('#medicine-list tr');

        rows.forEach(row => {
            const thresholdCell = row.cells[2];
            if (!thresholdCell) return;

            const threshold = parseFloat(thresholdCell.textContent);
            const arrow = row.querySelector('.arrow');

            if (arrow) {
                if (currentTemperature > threshold) {
                    arrow.style.display = 'inline';
                    row.classList.add('highlighted');
                } else {
                    arrow.style.display = 'none';
                    row.classList.remove('highlighted');
                }
            } else {
                console.warn('Arrow element not found in row:', row);
            }
        });
    }

    if (window.location.pathname.includes('list-of-medicine.html')) {
        const savedTemperature = parseFloat(localStorage.getItem('currentTemperature')) || 15;
        updateMedicineList(savedTemperature);
    }

    function checkMedicineQuality() {
        const resultContainer = document.getElementById('result');
        if (resultContainer) {
            const temperature = parseFloat(document.getElementById('simulated-temperature').textContent);

            if (isNaN(temperature)) {
                resultContainer.innerHTML = '<p style="color: red;">Unable to get simulated temperature.</p>';
                return;
            }

            const compromisedMedicines = medicines.filter(medicine => temperature > medicine.threshold_temperature_celsius);

            if (compromisedMedicines.length > 0) {
                resultContainer.innerHTML = `
                    <p style="color: red;">Too hot to store. Lower the temperature.</p>
                    <p>The following medicines are compromised:</p>
                    <ul>
                        ${compromisedMedicines.map(medicine => `
                            <li>${medicine.medicine_name} (ID: ${medicine.medicine_id}, Threshold: ${medicine.threshold_temperature_celsius}°C)</li>
                        `).join('')}
                    </ul>
                `;
            } else {
                resultContainer.innerHTML = '<p>The temperature is safe for all medicines.</p>';
            }
        } else {
            console.error('Result container not found');
        }
    }

    function saveTemperature(temperature) {
        let temperatures = JSON.parse(localStorage.getItem('temperatures')) || [];
        temperatures.push(temperature);

        if (temperatures.length > 14) {
            temperatures.shift();
        }

        localStorage.setItem('temperatures', JSON.stringify(temperatures));
    }

    function displayWeeklyAverageTemperature() {
        const averageTemperatureElement = document.getElementById('average-temperature');

        if (!averageTemperatureElement) return;

        const temperatures = JSON.parse(localStorage.getItem('temperatures')) || [];

        if (temperatures.length === 0) {
            averageTemperatureElement.innerHTML = '<h2>No data available</h2>';
            return;
        }

        const sum = temperatures.reduce((a, b) => a + b, 0);
        const average = sum / temperatures.length;

        const temperatureDisplay = `<p style="font-size: 3rem; ${average > 30 ? 'color: red;' : ''}">${average.toFixed(1)}°C</p>`;

        averageTemperatureElement.innerHTML = `
            <h2>Weekly Average Temperature</h2>
            ${temperatureDisplay}
        `;
    }

    const checkQualityButton = document.getElementById('check-quality');
    if (checkQualityButton) {
        checkQualityButton.addEventListener('click', checkMedicineQuality);
    } else {
        console.error('Check Quality button not found');
    }

    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', (event) => {
            const href = link.getAttribute('href');

            if (href.startsWith('#')) {
                event.preventDefault();
                const sectionId = href.substring(1);
                scrollToSection(sectionId);
            } else {
                window.location.href = href;
            }
        });
    });

    function scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        } else {
            console.error('Section not found:', sectionId);
        }
    }

    if (window.location.pathname.includes('laboratory.html')) {
        displayWeeklyAverageTemperature();
    }

    function checkTemperatureAndSendEmail(currentTemperature) {
        if (currentTemperature >= 30) {
            const templateParams = {
                temperature: currentTemperature,
                message: "The current simulated temperature has reached " + currentTemperature + "°C."
            };

            emailjs.send('service_m3wh8ie', 'template_9oou04p', templateParams)
            .then(function(response) {
                console.log('Email sent successfully!', response.status, response.text);
            }, function(error) {
                console.error('Failed to send email.', error);
            });
        }
    }
});
