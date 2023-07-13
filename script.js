// Spotify API credentials
const CLIENT_ID = '7669af05cc4b4b9da95d150b0863bb56';
const CLIENT_SECRET = '2913fdab618a4209843042a696cd7f96';

// Authorization token endpoint
const AUTH_TOKEN_URL = 'https://accounts.spotify.com/api/token';

// Spotify API base URL
const API_BASE_URL = 'https://api.spotify.com/v1';

// Access token variable
let accessToken = '';

// Function to retrieve access token
async function getAccessToken() {
  const response = await fetch(AUTH_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (response.ok) {
    const data = await response.json();
    accessToken = data.access_token;
  } else {
    console.error('Failed to retrieve access token');
  }
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
      const albumArtworkUrl = data.item.album.images[0].url;

      // Update the widget with the currently playing song information and album artwork
      document.getElementById('info_title').textContent = songTitle;
      document.getElementById('info_artist').textContent = artistName;
      document.querySelector('.album').style.backgroundImage = `url(${albumArtworkUrl})`;
    } else {
      document.getElementById('info_title').textContent = 'Nothing is playing';
      document.getElementById('info_artist').textContent = '';
      document.querySelector('.album').style.backgroundImage = 'none';
    }
  } else {
    console.error('Failed to fetch currently playing song');
  }
}

// Function to update the progress bar
function updateProgressBar() {
  // Get the current playback position and duration from your music player
  const currentTime = 124; // Example: replace with actual current playback position in seconds
  const duration = 242; // Example: replace with actual song duration in seconds

  // Calculate the progress percentage
  const progressPercentage = (currentTime / duration) * 100;

  // Update the progress bar
  document.getElementById('progress_top').style.width = `${progressPercentage}%`;
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
