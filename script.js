const form = document.getElementById("foodForm");
const issueSection = document.getElementById("issueSection");
const issueSelect = document.getElementById("issue");
const confirmation = document.getElementById("confirmation");

const CORRECT_FIELD_NAME = "entry.1083003025"; // Yes/No radio group name in your HTML

function setIssueVisibility(isWrong) {
  if (isWrong) {
    issueSection.classList.remove("hidden");
    // Make "What was wrong?" required only when visible
    if (issueSelect) issueSelect.required = true;
  } else {
    issueSection.classList.add("hidden");
    // Clear + not required when hidden
    if (issueSelect) {
      issueSelect.required = false;
      issueSelect.value = "";
    }
    // Also clear details so you don't carry old text
    const details = document.getElementById("details");
    if (details) details.value = "";
  }
}

// Show / hide issue section when radio changes
form.addEventListener("change", (e) => {
  if (e.target.name === CORRECT_FIELD_NAME) {
    setIssueVisibility(e.target.value === "No");
  }
});

// On submit: validate issue if "No", then let Google submit normally
form.addEventListener("submit", (e) => {
  const selected = form.querySelector(`input[name="${CORRECT_FIELD_NAME}"]:checked`);
  const isNo = selected && selected.value === "No";

  // If they said "No" but didn't choose an issue, block submit and prompt
  if (isNo && issueSelect && !issueSelect.value) {
    e.preventDefault();
    setIssueVisibility(true);
    issueSelect.focus();
    issueSelect.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  // Otherwise: allow normal submit to Google Form (do NOT preventDefault)
  confirmation.classList.remove("hidden");

  // Reset UI shortly after submit (Google still receives data)
  setTimeout(() => {
    form.reset();
    setIssueVisibility(false);
  }, 150);

  setTimeout(() => {
    confirmation.classList.add("hidden");
  }, 4000);
});

// On load: if user refreshes mid-selection, keep UI consistent
setIssueVisibility(false);
