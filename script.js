const form = document.getElementById("foodForm");
const issueSection = document.getElementById("issueSection");
const confirmation = document.getElementById("confirmation");

// Show / hide issue section
form.addEventListener("change", function (e) {
  if (e.target.name === "entry.1083003025") {
    if (e.target.value === "No") {
      issueSection.classList.remove("hidden");
    } else {
      issueSection.classList.add("hidden");
    }
  }
});

// Handle form submit
form.addEventListener("submit", function () {
  // DO NOT prevent default — Google needs the submit

  // Show confirmation message
  confirmation.classList.remove("hidden");

  // Reset UI (Google still receives data)
  setTimeout(() => {
    form.reset();
    issueSection.classList.add("hidden");
  }, 100);

  // Hide confirmation after a few seconds
  setTimeout(() => {
    confirmation.classList.add("hidden");
  }, 4000);
});
