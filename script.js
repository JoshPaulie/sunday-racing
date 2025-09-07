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
  const timeValue = timeInput.value.trim();

  // Clear any previous error messages
  const existingError = timeInput.parentNode.querySelector(".player-error");
  if (existingError) {
    existingError.remove();
  }

  // Validation
  if (!timeValue) {
    showErrorForPlayer(playerId, "Please enter a time.");
    return;
  }

  if (!isValidTimeFormat(timeValue)) {
    showErrorForPlayer(playerId, "Please enter time in valid format (M:SS or M:SS.xxx)");
    return;
  }

  // Add time to player data
  const timeMs = timeToMs(timeValue);
  playerTimes[playerId].push({
    time: timeValue,
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
  showSuccessForPlayer(playerId, `Added time ${timeValue}!`);

  // Save data
  saveData();
}

// Show error message for specific player
function showErrorForPlayer(playerId, message) {
  const timeInput = document.getElementById(`${playerId}-time`);
  const timeInputRow = timeInput.parentNode;

  const errorDiv = document.createElement("div");
  errorDiv.className = "error player-error";
  errorDiv.textContent = message;
  errorDiv.style.cssText = `
    color: #ff6b6b;
    font-size: 12px;
    margin-top: 5px;
    padding: 5px;
    background: rgba(255, 107, 107, 0.1);
    border-radius: 4px;
    border-left: 3px solid #ff6b6b;
    grid-column: 1 / -1;
  `;

  timeInputRow.appendChild(errorDiv);

  setTimeout(() => {
    errorDiv.remove();
  }, 3000);
}

// Show success message for specific player
function showSuccessForPlayer(playerId, message) {
  const timeInput = document.getElementById(`${playerId}-time`);
  const timeInputRow = timeInput.parentNode;

  const successDiv = document.createElement("div");
  successDiv.className = "success player-success";
  successDiv.textContent = message;
  successDiv.style.cssText = `
    color: #e10600;
    font-size: 12px;
    margin-top: 5px;
    padding: 5px;
    background: rgba(225, 6, 0, 0.1);
    border-radius: 4px;
    border-left: 3px solid #e10600;
    grid-column: 1 / -1;
  `;

  timeInputRow.appendChild(successDiv);

  setTimeout(() => {
    successDiv.remove();
  }, 2000);
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

  // Add time to player data
  const timeMs = timeToMs(timeValue);
  playerTimes[selectedPlayer].push({
    time: timeValue,
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
  showSuccess(`Added time ${timeValue} for ${playerNames[selectedPlayer]}!`);
}

// Show error message
function showError(message) {
  const inputSection = document.querySelector(".input-section");
  const errorDiv = document.createElement("div");
  errorDiv.className = "error";
  errorDiv.textContent = message;
  errorDiv.style.display = "block";
  inputSection.appendChild(errorDiv);

  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

// Show success message
function showSuccess(message) {
  const inputSection = document.querySelector(".input-section");
  const successDiv = document.createElement("div");
  successDiv.style.cssText = `
        color: #e10600;
        font-size: 14px;
        margin-top: 10px;
        padding: 10px;
        background: rgba(225, 6, 0, 0.1);
        border-radius: 4px;
        border-left: 4px solid #e10600;
    `;
  successDiv.textContent = message;
  inputSection.appendChild(successDiv);

  setTimeout(() => {
    successDiv.remove();
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
    playerTimes[player].splice(index, 1);
    updatePlayerTable(player);
    updateBestTimes();
    updateCrowns();
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

// Allow Enter key to submit
document.getElementById("timeInput").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    addTime();
  }
});

// Load data from localStorage on page load
window.addEventListener("load", function () {
  const savedData = localStorage.getItem("racingTimesData");
  const savedNames = localStorage.getItem("playerNames");

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

// Add clear button to the page
window.addEventListener("load", function () {
  const inputSection = document.querySelector(".input-section");
  const clearButton = document.createElement("button");
  clearButton.textContent = "Clear All Data";
  clearButton.style.marginLeft = "10px";
  clearButton.style.background = "#ff6b6b";
  clearButton.onclick = clearAllData;

  const addButton = inputSection.querySelector("button");
  addButton.parentNode.insertBefore(clearButton, addButton.nextSibling);
});
