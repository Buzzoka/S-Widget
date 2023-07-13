// Spotify API credentials
const CLIENT_ID = '7669af05cc4b4b9da95d150b0863bb56';
const CLIENT_SECRET = '2913fdab618a4209843042a696cd7f96';
const REDIRECT_URI = 'https://buzzoka.github.io/S-Widget/';
const SCOPES = 'user-read-currently-playing';

// Construct the authorization URL with the scope
const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}&response_type=code`;

// Authorization token endpoint
const AUTH_TOKEN_URL = 'https://accounts.spotify.com/api/token';

// Spotify API base URL
const API_BASE_URL = 'https://api.spotify.com/v1';

// Access token variable
let accessToken = '';

// Function to retrieve access token
async function getAccessToken() {
  // Use the authorization code from the URL query parameter if available
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');

  // If authorization code is present, exchange it for an access token
  if (code) {
    try {
      const response = await fetch(AUTH_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: REDIRECT_URI,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        accessToken = data.access_token;
        return accessToken;
      } else {
        console.error('Failed to retrieve access token:', response.status);
      }
    } catch (error) {
      console.error('Error retrieving access token:', error);
    }
  }

  // If access token is not available, redirect user to authorization URL
  window.location.href = AUTH_URL;
}


// Function to fetch the currently playing song
async function fetchCurrentlyPlayingSong() {
  const currentlyPlayingUrl = `${API_BASE_URL}/me/player/currently-playing`;

  try {
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
  } catch (error) {
    console.error('Error fetching currently playing song:', error);
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
