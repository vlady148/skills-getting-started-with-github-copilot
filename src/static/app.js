document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const participants = details.participants || [];
        const spotsLeft = details.max_participants - participants.length;
        const participantItems = participants.length
          ? participants
              .map(
                (participant) => `
                  <li class="participant-item">
                    <span class="participant-email">${participant}</span>
                    <button
                      type="button"
                      class="participant-remove"
                      data-activity="${encodeURIComponent(name)}"
                      data-email="${encodeURIComponent(participant)}"
                      aria-label="Remove ${participant} from ${name}"
                      title="Remove participant"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M9 3.75h6a1.5 1.5 0 0 1 1.5 1.5V6h2.25a.75.75 0 0 1 0 1.5H4.5A.75.75 0 0 1 4.5 6H6.75v-.75A1.5 1.5 0 0 1 8.25 3.75H9Zm1.5 0v.75h3v-.75h-3Zm-3 4.5h9l-.45 10.58a2.25 2.25 0 0 1-2.24 2.17H10.19a2.25 2.25 0 0 1-2.24-2.17L7.5 8.25Zm2.25 2.25a.75.75 0 0 0-.75.79l.28 6a.75.75 0 0 0 1.5-.07l-.28-6a.75.75 0 0 0-.75-.72Zm4.5 0a.75.75 0 0 0-.75.72l-.28 6a.75.75 0 0 0 1.5.07l.28-6a.75.75 0 0 0-.75-.79Z" fill="currentColor"/>
                      </svg>
                    </button>
                  </li>
                `
              )
              .join("")
          : '<li class="empty-state">No participants yet</li>';

        activityCard.innerHTML = `
          <div class="activity-card__header">
            <h4>${name}</h4>
            <span class="availability-badge ${spotsLeft === 0 ? "full" : "open"}">${spotsLeft} spots left</span>
          </div>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <div class="participants-section">
            <p class="participants-title">Participants</p>
            <ul class="participants-list">
              ${participantItems}
            </ul>
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  activitiesList.addEventListener("click", async (event) => {
    const removeButton = event.target.closest(".participant-remove");

    if (!removeButton) {
      return;
    }

    const { activity, email } = removeButton.dataset;
    const activityName = decodeURIComponent(activity);
    const participantEmail = decodeURIComponent(email);

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activityName)}/signup?email=${encodeURIComponent(participantEmail)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        messageDiv.classList.remove("hidden");
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
        messageDiv.classList.remove("hidden");
      }

      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to remove participant. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error removing participant:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
