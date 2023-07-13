// Spotify API credentials
const CLIENT_ID = '7669af05cc4b4b9da95d150b0863bb56';
const CLIENT_SECRET = '2913fdab618a4209843042a696cd7f96';
const REDIRECT_URI = 'https://buzzoka.github.io/callback';
const SCOPES = 'user-read-currently-playing';

// Construct the authorization URL with the scope
const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}&response_type=token`;

// Authorization token endpoint
const AUTH_TOKEN_URL = 'https://accounts.spotify.com/api/token';

// Spotify API base URL
const API_BASE_URL = 'https://api.spotify.com/v1';

// Access token variable
let accessToken = '';

// Function to retrieve access token
async function getAccessToken() {
  // Use the access token from the URL fragment if available
  const params = new URLSearchParams(window.location.hash.substr(1));
  accessToken = params.get('access_token');

  // If access token is present, use it
  if (accessToken) {
    return accessToken;
  }

  // If access token is not available, redirect user to authorization URL
  window.location.href = AUTH_URL;
}

// Function to fetch the currently playing song
async function fetchCurrentlyPlayingSong() {
  const currentlyPlayingUrl = `${API_BASE_URL}/me/player/currently-playing`;

  const response = await fetch(currentlyPlayingUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.ok) {
    const data = await response.json();
    if (data.item) {
      const songTitle = data.item.name;
      const artistName = data.item.artists[0].name;
      const songDuration = data.item.duration_ms / 1000; // Convert duration from milliseconds to seconds
      const progressMs = data.progress_ms; // Current playback position in milliseconds

      // Update the widget with the currently playing song information
      document.getElementById('info_title').textContent = songTitle;
      document.getElementById('info_artist').textContent = artistName;
      document.getElementById('time-total').textContent = formatTime(songDuration);
      document.getElementById('time-elapsed').textContent = formatTime(progressMs / 1000); // Convert progress from milliseconds to seconds

      // Update the progress bar
      const progressPercentage = (progressMs / songDuration) * 100;
      document.getElementById('progress_top').style.width = `${progressPercentage}%`;
    } else {
      // No currently playing song
      document.getElementById('info_title').textContent = 'Nothing is playing';
      document.getElementById('info_artist').textContent = '';
      document.getElementById('time-total').textContent = '00:00';
      document.getElementById('time-elapsed').textContent = '00:00';
      document.getElementById('progress_top').style.width = '0%';
    }
  } else {
    console.error('Failed to fetch currently playing song');
  }
}

// Function to update the progress bar
function updateProgressBar() {
  // Get the current playback position and duration from your music player
  // Replace the hardcoded values below with your actual implementation
  const currentTime = 125; // Example: replace with actual current playback position in seconds
  const duration = 243; // Example: replace with actual song duration in seconds

  // Update the progress bar
  document.getElementById('progress_top').style.width = `${(currentTime / duration) * 100}%`;
  document.getElementById('time-elapsed').textContent = formatTime(currentTime);
  document.getElementById('time-total').textContent = formatTime(duration);
}

// Helper function to format time as MM:SS
function formatTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Call the necessary functions
getAccessToken().then(() => {
  fetchCurrentlyPlayingSong();
  updateProgressBar();
});
