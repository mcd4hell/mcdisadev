var statusDot, statusContent, spotifyListening;

// Ensure elements exist before using (called in update_presence)
function ensureElements() {
  if (!statusDot) statusDot = document.querySelector(".status-dot");
  if (!statusContent) statusContent = document.getElementById("statusContent");
  if (!spotifyListening) spotifyListening = document.getElementById("spotifyListening");
}

let reconnectAttempts = 0;
const maxReconnects = 5;

const lanyard = new WebSocket("wss://api.lanyard.rest/socket");

// Error handling + reconnect
lanyard.onerror = function (error) {
  console.error("Lanyard WebSocket error:", error);
  if (statusContent) {
    statusContent.innerHTML = "Connection Failed";
  }
  if (statusDot) {
    statusDot.className = "status-dot offline";
  }
  
  // Schedule reconnect
  if (reconnectAttempts < maxReconnects) {
    setTimeout(() => {
      console.log(`Reconnecting Lanyard... (${reconnectAttempts + 1}/${maxReconnects})`);
      reconnectAttempts++;
      location.reload();  // Simple reliable reconnect: reload page
    }, 5000 * Math.pow(2, reconnectAttempts));
  }
};

lanyard.onclose = function (event) {
  console.log("Lanyard WebSocket closed:", event.code);
  if (statusContent) {
    statusContent.innerHTML = "Disconnected";
  }
};

var api = {};
var received = false;

lanyard.onopen = function () {
  console.log("Lanyard WebSocket connected");
  lanyard.send(
    JSON.stringify({
      op: 2,
      d: {
        subscribe_to_id: "715783278237450280",
      },
    })
  );
};

setInterval(() => {
  if (received) {
    lanyard.send(
      JSON.stringify({
        op: 3,
      })
    );
  }
}, 30000);

lanyard.onmessage = function (event) {
  try {
    received = true;
    api = JSON.parse(event.data);

    if (api.t === "INIT_STATE" || api.t === "PRESENCE_UPDATE") {
      update_presence();
    }
  } catch (e) {
    console.error("Lanyard message parse error:", e);
  }
};

function update_presence() {
  ensureElements();
  if (!statusDot) {
    console.warn("Status elements still not available");
    return;
  }
  
  // Spotify handling with safer parsing
  if (api.d.listening_to_spotify) {
    try {
      const trackId = api.d.spotify.track_id;
      let song = api.d.spotify.song || "Unknown Track";
      let artist = api.d.spotify.artist || "Unknown Artist";
      
      // Safer parsing
      if (song.includes("(")) song = song.split("(")[0].trim();
      if (artist.includes(";")) artist = artist.split(";")[0].split(",")[0].trim();
      
      spotifyListening.innerHTML = `<i class="fab fa-spotify text-green-500 animate-spin ml-1 mr-1"></i> Listening <a href="https://open.spotify.com/track/${trackId}" target="_blank" class="hover:text-gray-400">${song}</a> by ${artist}`;
    } catch (e) {
      console.warn("Spotify data parse error:", e);
      spotifyListening.innerHTML = "";
    }
  } else {
    spotifyListening.innerHTML = "";
  }
  
  // Fixed status logic
  const status = api.d.discord_status || "offline";
  let dotClass = "status-dot offline";
  let statusText = "Offline";
  
  switch (status) {
    case "online":
      dotClass = "status-dot online";
      statusText = "Online";
      break;
    case "idle":
      dotClass = "status-dot idle";
      statusText = "Idle";
      break;
    case "dnd":
      dotClass = "status-dot offline";  // Red for DND
      statusText = "Do Not Disturb";
      break;
    default:
      dotClass = "status-dot status-loading";
      statusText = "Loading...";
  }
  
  statusDot.className = dotClass;
  statusContent.innerHTML = statusText;
  
  console.log("Status updated:", status, "- Spotify:", api.d.listening_to_spotify ? "Active" : "Inactive");
}
