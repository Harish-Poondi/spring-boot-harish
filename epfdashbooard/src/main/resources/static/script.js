document.addEventListener("DOMContentLoaded", () => {
    const epfForm = document.getElementById("epfForm");
    const retirementAgeInput = document.getElementById("retirementAge");
    const retAgeSpan = document.getElementById("retAge");
    const balanceAmountSpan = document.getElementById("balanceAmount");
    const chartElement = document.getElementById("epfChart");

    epfForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Collect form values efficiently
        const formData = {
            currentBalance: document.getElementById("currentBalance").value,
            salary: document.getElementById("salary").value,
            annualIncrease: document.getElementById("annualIncrease").value,
            rateOfInterest: document.getElementById("rateOfInterest").value,
            currentAge: document.getElementById("currentAge").value,
            retirementAge: retirementAgeInput.value,
            voluntaryContribution: document.getElementById("voluntaryContribution").value
        };

        const params = new URLSearchParams(formData);

        try {
            const response = await fetch(`/epf/calculate?${params}`);
            if (!response.ok) throw new Error("Failed to fetch data");

            const data = await response.json();
            console.log("API Response:", data);

            // Calculate total balance
            const totalBalance = data.employeeContribution + data.employerContribution + data.interestEarned;
            balanceAmountSpan.textContent = totalBalance.toLocaleString("en-IN");

            // Destroy existing chart if it exists
            const existingChart = Chart.getChart(chartElement);
            if (existingChart) existingChart.destroy();

            // Render new chart
            new Chart(chartElement, {
                type: "pie",
                data: {
                    labels: [
                        `Employee Contribution: ${Number(data.employeeContribution).toLocaleString("en-IN")}`,
                        `Employer Contribution: ${Number(data.employerContribution).toLocaleString("en-IN")}`,
                        `Interest Earned: ${Number(data.interestEarned).toLocaleString("en-IN")}`,
                        `Voluntary PF Contribution: ${Number(data.voluntaryContribution).toLocaleString("en-IN")}`
                    ],
                    datasets: [{
                        data: [
                            Number(data.employeeContribution),
                            Number(data.employerContribution),
                            Number(data.interestEarned),
                            Number(data.voluntaryContribution)
                        ],
                        backgroundColor: ["#8B0000", "#FFA500", "#008000", "#FFC0CB"]
                    }]
                },
                options: {
                    responsive: false,
                    maintainAspectRatio: false,
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: (tooltipItem) => {
                                    let dataset = tooltipItem.dataset.data;
                                    let value = dataset[tooltipItem.dataIndex];
                                    let total = dataset.reduce((sum, val) => sum + val, 0);
                                    let percentage = ((value / total) * 100).toFixed(2);
                                    return `${tooltipItem.label}: ${percentage}% (${value})`;
                                }
                            }
                        }
                    }
                }
            });

        } catch (error) {
            console.error("Error:", error);
        }
    });

    // Update retirement age display dynamically
    retirementAgeInput.addEventListener("input", () => {
        retAgeSpan.textContent = retirementAgeInput.value;
    });
});