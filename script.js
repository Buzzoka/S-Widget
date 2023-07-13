// Spotify API credentials
const CLIENT_ID = '7669af05cc4b4b9da95d150b0863bb56';
const CLIENT_SECRET = '2913fdab618a4209843042a696cd7f96';
const REDIRECT_URI = 'http://localhost:3000/callback';
const SCOPES = 'user-read-currently-playing';

// Construct the authorization URL with the scope
const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}&response_type=token`;

// Function to fetch the currently playing song from the server
async function fetchCurrentlyPlayingSong() {
  try {
    const response = await fetch('http://localhost:3000/currently-playing');
    if (response.ok) {
      const data = await response.json();
      if (data.songTitle) {
        const songTitle = data.songTitle;
        const artistName = data.artistName;
        const songDuration = data.songDuration;
        const progressMs = data.progressMs;

        // Update the widget with the currently playing song information
        document.getElementById('info_title').textContent = songTitle;
        document.getElementById('info_artist').textContent = artistName;
        document.getElementById('time-total').textContent = formatTime(songDuration);
        document.getElementById('time-elapsed').textContent = formatTime(progressMs / 1000);

        const progressPercentage = (progressMs / songDuration) * 100;
        document.getElementById('progress_top').style.width = `${progressPercentage}%`;

        // Update the progress bar
        updateProgressBar(progressMs / 1000, songDuration);
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
function updateProgressBar(currentTime, duration) {
  const progressPercentage = (currentTime / duration) * 100;
  document.getElementById('progress_top').style.width = `${progressPercentage}%`;
  document.getElementById('time-elapsed').textContent = formatTime(currentTime);
  document.getElementById('time-total').textContent = formatTime(duration);
}

// Helper function to format time as MM:SS
function formatTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Call the necessary functions
fetchCurrentlyPlayingSong();
