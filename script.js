// Store times data
let playerTimes = {
  Player1: [],
  Player2: [],
  Player3: [],
  Player4: [],
  Player5: [],
  Player6: [],
};

// Store player names
let playerNames = {
  Player1: "Player 1",
  Player2: "Player 2",
  Player3: "Player 3",
  Player4: "Player 4",
  Player5: "Player 5",
  Player6: "Player 6",
};

// Store session title
let sessionTitle = "";

// Update individual player name
function updatePlayerName(playerId) {
  const nameInput = document.getElementById(`${playerId}-name`);
  const newName = nameInput.value.trim();
  if (newName) {
    playerNames[playerId] = newName;
  } else {
    playerNames[playerId] = playerId.replace("Player", "Player ");
    nameInput.value = "";
  }
  saveData();
}

// Add time to specific player
function addTimeToPlayer(playerId) {
  const timeInput = document.getElementById(`${playerId}-time`);
  let timeValue = timeInput.value.trim();

  // Clear any previous error messages
  const existingError = timeInput.parentNode.querySelector(".player-error");
  if (existingError) {
    existingError.remove();
  }

  // Validation
  if (!timeValue) {
    showError("Please enter a time.");
    return;
  }

  // Auto-complete incomplete time entries
  timeValue = autoCompleteTimeEntry(timeValue);

  if (!isValidTimeFormat(timeValue)) {
    showError("Please enter time in valid format (M:SS or M:SS.xxx)");
    return;
  }

  // Format time to ensure 2-place millisecond precision
  const formattedTime = formatTimeWithPrecision(timeValue);

  // Add time to player data
  const timeMs = timeToMs(formattedTime);
  playerTimes[playerId].push({
    time: formattedTime,
    timeMs: timeMs,
    timestamp: new Date(),
  });

  // Update display
  updatePlayerTable(playerId);
  updateBestTimes();
  updateCrowns();

  // Clear input
  timeInput.value = "";

  // Show success message
  showSuccess(`Added time ${formattedTime} for ${playerNames[playerId]}!`);

  // Save data
  saveData();
}

// Update player names
function updatePlayerNames() {
  for (let i = 1; i <= 6; i++) {
    const nameInput = document.getElementById(`player${i}Name`);
    const newName = nameInput.value.trim();
    if (newName) {
      playerNames[`Player${i}`] = newName;
    } else {
      playerNames[`Player${i}`] = `Player ${i}`;
    }
  }

  // Update dropdown options
  updateDropdown();

  // Update all table headers
  updateAllTableHeaders();

  // Save to localStorage
  saveData();

  showSuccess("Player names updated!");
}

// Update dropdown with current names
function updateDropdown() {
  const select = document.getElementById("playerSelect");
  const options = select.querySelectorAll("option[value]");
  options.forEach((option, index) => {
    if (option.value) {
      option.textContent = playerNames[option.value];
    }
  });
}

// Update all table headers
function updateAllTableHeaders() {
  Object.keys(playerNames).forEach((playerId) => {
    const header = document.getElementById(`${playerId}-header`);
    if (header) {
      // Preserve crown if it exists
      const crown = header.querySelector(".crown");
      header.textContent = playerNames[playerId];
      if (crown) {
        header.appendChild(crown);
      }
    }
  });
}

// Toggle settings visibility
function toggleSettings() {
  const settingsSection = document.querySelector(".settings-section");
  const toggleBtn = document.getElementById("toggleBtn");
  const showSettingsBtn = document.getElementById("showSettingsBtn");

  if (settingsSection.classList.contains("hidden")) {
    settingsSection.classList.remove("hidden");
    toggleBtn.textContent = "Hide Settings";
    showSettingsBtn.textContent = "Hide Settings";
  } else {
    settingsSection.classList.add("hidden");
    toggleBtn.textContent = "Show Settings";
    showSettingsBtn.textContent = "Settings";
  }
}

// Convert time string to milliseconds for comparison
function timeToMs(timeStr) {
  const parts = timeStr.split(":");
  const minutes = parseInt(parts[0]);

  // Handle seconds with optional decimal places
  const secondsStr = parts[1];
  const seconds = parseFloat(secondsStr);

  return minutes * 60 * 1000 + seconds * 1000;
}

// Convert milliseconds back to time string (preserve original precision)
function msToTime(ms) {
  const minutes = Math.floor(ms / (60 * 1000));
  const totalSeconds = (ms % (60 * 1000)) / 1000;

  // Format seconds to preserve precision
  const secondsStr = totalSeconds.toFixed(3).replace(/\.?0+$/, "");

  return `${minutes}:${secondsStr.padStart(2, "0")}`;
}

// Validate time format - now supports arbitrary precision
function isValidTimeFormat(timeStr) {
  // Allow formats like: 1:23, 1:23.1, 1:23.12, 1:23.123, etc.
  const timeRegex = /^[0-9]+:[0-5]?[0-9](\.[0-9]+)?$/;
  return timeRegex.test(timeStr);
}

// Format time to ensure at least 2-place millisecond precision
function formatTimeWithPrecision(timeStr) {
  const parts = timeStr.split(":");
  const minutes = parts[0];
  const secondsPart = parts[1];

  // Check if there's a decimal point
  if (secondsPart.includes(".")) {
    const [seconds, milliseconds] = secondsPart.split(".");
    // Ensure seconds has 2 digits and milliseconds has at least 2 digits
    const formattedSeconds = seconds.padStart(2, "0");
    const formattedMs = milliseconds.padEnd(2, "0");
    return `${minutes}:${formattedSeconds}.${formattedMs}`;
  } else {
    // No decimal point, pad seconds to 2 digits and add .00
    const formattedSeconds = secondsPart.padStart(2, "0");
    return `${minutes}:${formattedSeconds}.00`;
  }
}

// Auto-complete incomplete time entries when submitting
function autoCompleteTimeEntry(timeStr) {
  // Remove any non-digits to count actual digits
  const digits = timeStr.replace(/[^\d]/g, "");

  if (digits.length === 0) return timeStr;

  // If user just typed digits without colons/dots, format it properly
  if (!/[:\.]/.test(timeStr)) {
    // Pure digits - use our formatting logic
    if (digits.length === 1) {
      return digits + ":00.00"; // "1" becomes "1:00.00"
    } else if (digits.length === 2) {
      return digits[0] + ":" + digits[1] + "0.00"; // "12" becomes "1:20.00"
    } else if (digits.length === 3) {
      return digits[0] + ":" + digits.substring(1) + ".00"; // "123" becomes "1:23.00"
    } else if (digits.length === 4) {
      return digits[0] + ":" + digits.substring(1, 3) + "." + digits[3] + "0"; // "1234" becomes "1:23.40"
    } else if (digits.length >= 5) {
      return digits[0] + ":" + digits.substring(1, 3) + "." + digits.substring(3, 5); // "12345" becomes "1:23.45"
    }
  }

  // Handle partial formatted entries
  const parts = timeStr.split(":");
  if (parts.length === 2) {
    const minutes = parts[0];
    const secondsPart = parts[1];

    if (!secondsPart.includes(".")) {
      // Just "1:23" - add milliseconds
      if (secondsPart.length === 1) {
        return minutes + ":" + secondsPart + "0.00"; // "1:2" becomes "1:20.00"
      } else {
        return minutes + ":" + secondsPart + ".00"; // "1:23" becomes "1:23.00"
      }
    } else {
      // "1:23.4" - pad milliseconds if needed
      const [seconds, ms] = secondsPart.split(".");
      if (seconds.length === 1) {
        const paddedSeconds = seconds + "0";
        return minutes + ":" + paddedSeconds + "." + (ms || "00");
      }
      if (!ms || ms.length === 1) {
        return minutes + ":" + seconds + "." + (ms || "0") + "0";
      }
    }
  }

  return timeStr; // Return as-is if already properly formatted
}

// Add time to player
function addTime() {
  const playerSelect = document.getElementById("playerSelect");
  const timeInput = document.getElementById("timeInput");
  const selectedPlayer = playerSelect.value;
  const timeValue = timeInput.value.trim();

  // Clear any previous error messages
  const existingError = document.querySelector(".error");
  if (existingError) {
    existingError.remove();
  }

  // Validation
  if (!selectedPlayer) {
    showError("Please select a player.");
    return;
  }

  if (!timeValue) {
    showError("Please enter a time.");
    return;
  }

  if (!isValidTimeFormat(timeValue)) {
    showError("Please enter time in valid format (MM:SS.MS), e.g., 1:23.12");
    return;
  }

  // Format time to ensure 2-place millisecond precision
  const formattedTime = formatTimeWithPrecision(timeValue);

  // Add time to player data
  const timeMs = timeToMs(formattedTime);
  playerTimes[selectedPlayer].push({
    time: formattedTime,
    timeMs: timeMs,
    timestamp: new Date(),
  });

  // Update display
  updatePlayerTable(selectedPlayer);
  updateBestTimes();
  updateCrowns();

  // Clear inputs
  timeInput.value = "";
  playerSelect.value = "";

  // Show success message
  showSuccess(`Added time ${formattedTime} for ${playerNames[selectedPlayer]}!`);
}

// Show error message
function showError(message) {
  // Remove any existing error messages
  const existingError = document.querySelector(".error-message");
  if (existingError) {
    existingError.remove();
  }

  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.textContent = message;
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #dc3545;
    color: white;
    padding: 15px 20px;
    border-radius: 6px;
    font-weight: bold;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `;

  document.body.appendChild(errorDiv);

  setTimeout(() => {
    errorDiv.style.animation = "slideOut 0.3s ease";
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.remove();
      }
    }, 300);
  }, 4000);
}

// Show success message
function showSuccess(message) {
  // Remove any existing success messages
  const existingSuccess = document.querySelector(".success-message");
  if (existingSuccess) {
    existingSuccess.remove();
  }

  const successDiv = document.createElement("div");
  successDiv.className = "success-message";
  successDiv.textContent = message;
  successDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #28a745;
    color: white;
    padding: 15px 20px;
    border-radius: 6px;
    font-weight: bold;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `;

  document.body.appendChild(successDiv);

  setTimeout(() => {
    successDiv.style.animation = "slideOut 0.3s ease";
    setTimeout(() => {
      if (successDiv.parentNode) {
        successDiv.remove();
      }
    }, 300);
  }, 3000);
}

// Update player table
function updatePlayerTable(player) {
  const tbody = document.getElementById(`${player}-times`);
  const times = playerTimes[player];

  // Sort times by fastest first
  const sortedTimes = [...times].sort((a, b) => a.timeMs - b.timeMs);

  tbody.innerHTML = "";

  sortedTimes.forEach((timeData, index) => {
    const row = document.createElement("tr");
    const attemptNumber = times.indexOf(timeData) + 1;

    // Highlight best time
    if (index === 0 && sortedTimes.length > 0) {
      row.style.background = "#2a2a2a";
      row.style.fontWeight = "bold";
      row.style.color = "#e10600";
      row.style.border = "1px solid #e10600";
    }

    row.innerHTML = `
            <td>#${attemptNumber}</td>
            <td>${timeData.time}</td>
            <td><button class="delete-btn" onclick="deleteTime('${player}', ${times.indexOf(timeData)})">Delete</button></td>
        `;

    tbody.appendChild(row);
  });
}

// Delete a time
function deleteTime(player, index) {
  if (confirm("Are you sure you want to delete this time?")) {
    const deletedTime = playerTimes[player][index].time;
    playerTimes[player].splice(index, 1);
    updatePlayerTable(player);
    updateBestTimes();
    updateCrowns();
    showSuccess(`Deleted time ${deletedTime} for ${playerNames[player]}!`);
  }
}

// Update best times display
function updateBestTimes() {
  Object.keys(playerTimes).forEach((player) => {
    const bestTimeDiv = document.getElementById(`${player}-best`);
    const times = playerTimes[player];

    if (times.length > 0) {
      const bestTimeMs = Math.min(...times.map((t) => t.timeMs));
      const bestTimeEntry = times.find((t) => t.timeMs === bestTimeMs);
      bestTimeDiv.textContent = `Best: ${bestTimeEntry.time}`;
    } else {
      bestTimeDiv.textContent = "Best: --";
    }
  });
}

// Update crown indicators
function updateCrowns() {
  // Remove all existing crowns
  document.querySelectorAll(".crown").forEach((crown) => crown.remove());
  document.querySelectorAll(".fastest-overall").forEach((table) => {
    table.classList.remove("fastest-overall");
  });

  // Find overall fastest time
  let fastestTime = Infinity;
  let fastestPlayer = null;

  Object.keys(playerTimes).forEach((player) => {
    const times = playerTimes[player];
    if (times.length > 0) {
      const playerBest = Math.min(...times.map((t) => t.timeMs));
      if (playerBest < fastestTime) {
        fastestTime = playerBest;
        fastestPlayer = player;
      }
    }
  });

  // Add crown to fastest player
  if (fastestPlayer) {
    const crownContainer = document.getElementById(`${fastestPlayer}-crown`);
    const crown = document.createElement("span");
    crown.className = "crown";
    crown.textContent = "👑";
    crown.title = "Fastest Overall Time!";
    crownContainer.appendChild(crown);

    // Highlight the table
    const table = document.getElementById(`${fastestPlayer}-table`);
    table.classList.add("fastest-overall");
  }
}

// Load data from localStorage on page load
window.addEventListener("load", function () {
  const savedData = localStorage.getItem("racingTimesData");
  const savedNames = localStorage.getItem("playerNames");
  const savedTitle = localStorage.getItem("sessionTitle");

  if (savedData) {
    try {
      playerTimes = JSON.parse(savedData);

      // Update all displays
      Object.keys(playerTimes).forEach((player) => {
        updatePlayerTable(player);
      });
      updateBestTimes();
      updateCrowns();
    } catch (e) {
      console.error("Failed to load saved data:", e);
    }
  }

  if (savedNames) {
    try {
      playerNames = JSON.parse(savedNames);

      // Update name inputs with saved names
      Object.keys(playerNames).forEach((playerId) => {
        const nameInput = document.getElementById(`${playerId}-name`);
        if (nameInput) {
          nameInput.value = playerNames[playerId];
        }
      });
    } catch (e) {
      console.error("Failed to load saved names:", e);
    }
  }

  if (savedTitle) {
    sessionTitle = savedTitle;
    const titleInput = document.getElementById("session-title");
    if (titleInput) {
      titleInput.value = sessionTitle;
    }
  }

  // Add Enter key support for time inputs
  for (let i = 1; i <= 6; i++) {
    const timeInput = document.getElementById(`Player${i}-time`);
    if (timeInput) {
      timeInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
          addTimeToPlayer(`Player${i}`);
        }
      });
    }
  }
});

// Save data to localStorage whenever times change
function saveData() {
  localStorage.setItem("racingTimesData", JSON.stringify(playerTimes));
  localStorage.setItem("playerNames", JSON.stringify(playerNames));
  localStorage.setItem("sessionTitle", sessionTitle);
}

// Override the addTime function to include data saving
const originalAddTime = addTime;
addTime = function () {
  originalAddTime();
  saveData();
};

// Override the deleteTime function to include data saving
const originalDeleteTime = deleteTime;
deleteTime = function (player, index) {
  originalDeleteTime(player, index);
  saveData();
};

// Clear all times only
function clearAllTimes() {
  if (confirm("Are you sure you want to clear all times? Player names will be kept. This cannot be undone.")) {
    playerTimes = {
      Player1: [],
      Player2: [],
      Player3: [],
      Player4: [],
      Player5: [],
      Player6: [],
    };

    Object.keys(playerTimes).forEach((player) => {
      updatePlayerTable(player);
    });
    updateBestTimes();
    updateCrowns();
    saveData();
  }
}

// Reset player names to default
function resetPlayerNames() {
  if (confirm("Are you sure you want to reset all player names to default? Times will be kept.")) {
    playerNames = {
      Player1: "Player 1",
      Player2: "Player 2",
      Player3: "Player 3",
      Player4: "Player 4",
      Player5: "Player 5",
      Player6: "Player 6",
    };

    // Update all name inputs
    Object.keys(playerNames).forEach((playerId) => {
      const nameInput = document.getElementById(`${playerId}-name`);
      if (nameInput) {
        nameInput.value = playerNames[playerId];
      }
    });

    saveData();
  }
}

// Clear all data function (for testing/reset)
function clearAllData() {
  if (confirm("Are you sure you want to clear all times? This cannot be undone.")) {
    playerTimes = {
      Player1: [],
      Player2: [],
      Player3: [],
      Player4: [],
      Player5: [],
      Player6: [],
    };

    Object.keys(playerTimes).forEach((player) => {
      updatePlayerTable(player);
    });
    updateBestTimes();
    updateCrowns();
    saveData();
  }
}

// Initialize for time inputs on page load
window.addEventListener("load", function () {
  console.log("Page loaded - additional initialization"); // Debug log
});

// Session title management
function saveSessionTitle() {
  const titleInput = document.getElementById("session-title");
  sessionTitle = titleInput.value.trim();
  saveData();
}

// Export session data
function exportSession() {
  const sessionData = {
    sessionTitle: sessionTitle || "Untitled Session",
    exportDate: new Date().toISOString(),
    playerNames: playerNames,
    playerTimes: playerTimes,
    version: "1.0",
  };

  const dataStr = JSON.stringify(sessionData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(dataBlob);

  // Create filename with session title and date
  const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
  const titlePart = sessionTitle ? sessionTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase() : "session";
  link.download = `${titlePart}_${date}.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showSuccess("Session exported successfully!");
}

// Import session data
function importSession() {
  const fileInput = document.getElementById("import-file");
  fileInput.click();
}

// Handle file import
function handleFileImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.type !== "application/json") {
    showError("Please select a valid JSON file.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedData = JSON.parse(e.target.result);

      // Validate the imported data structure
      if (!importedData.playerNames || !importedData.playerTimes) {
        showError("Invalid session file format.");
        return;
      }

      // Confirm import with user
      const confirmMessage = `Import session "${importedData.sessionTitle || "Untitled Session"}"?\n\nThis will replace all current data including:\n- Player names\n- All times\n- Session title\n\nThis cannot be undone.`;

      if (confirm(confirmMessage)) {
        // Import the data
        sessionTitle = importedData.sessionTitle || "";
        playerNames = importedData.playerNames || playerNames;
        playerTimes = importedData.playerTimes || playerTimes;

        // Update the UI
        const titleInput = document.getElementById("session-title");
        if (titleInput) {
          titleInput.value = sessionTitle;
        }

        // Update name inputs
        Object.keys(playerNames).forEach((playerId) => {
          const nameInput = document.getElementById(`${playerId}-name`);
          if (nameInput) {
            nameInput.value = playerNames[playerId];
          }
        });

        // Update all tables
        Object.keys(playerTimes).forEach((player) => {
          updatePlayerTable(player);
        });

        updateBestTimes();
        updateCrowns();

        // Save the imported data
        saveData();

        showSuccess(`Session "${sessionTitle || "Untitled Session"}" imported successfully!`);
      }
    } catch (error) {
      console.error("Import error:", error);
      showError("Failed to import session. Please check the file format.");
    }

    // Clear the file input
    event.target.value = "";
  };

  reader.readAsText(file);
}
