const form = document.getElementById("foodForm");
const issueSection = document.getElementById("issueSection");
const confirmation = document.getElementById("confirmation");

// Show / hide issue section
form.addEventListener("change", function (e) {
  if (e.target.name === "correct") {
    if (e.target.value === "No") {
      issueSection.classList.remove("hidden");
    } else {
      issueSection.classList.add("hidden");
    }
  }
});

// Handle form submit
form.addEventListener("submit", function (e) {
  e.preventDefault();

  // Collect data (this is what will later go to Google Sheets)
  const data = {
    restaurant: form.restaurant.value,
    correct: form.correct.value,
    issue: form.issue ? form.issue.value : "",
    details: form.details.value,
    timestamp: new Date().toISOString()
  };

  console.log("Submission:", data);

  // Placeholder for Google Form submission
  // (We’ll hook this up next)

  form.reset();
  issueSection.classList.add("hidden");
  confirmation.classList.remove("hidden");

  setTimeout(() => {
    confirmation.classList.add("hidden");
  }, 4000);
});
