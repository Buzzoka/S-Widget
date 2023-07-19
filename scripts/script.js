// Spotify API credentials
const CLIENT_ID = '7669af05cc4b4b9da95d150b0863bb56';
const CLIENT_SECRET = '2913fdab618a4209843042a696cd7f96';
const REDIRECT_URI = 'https://buzzoka.github.io/S-Widget/';
const SCOPES = 'user-read-currently-playing';

// Construct the authorization URL with the scope
const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
  REDIRECT_URI
)}&scope=${encodeURIComponent(SCOPES)}&response_type=code`;

// Authorization token endpoint
const AUTH_TOKEN_URL = 'https://accounts.spotify.com/api/token';

// Spotify API base URL
const API_BASE_URL = 'https://api.spotify.com/v1';

// Access token variable
let accessToken = '';

// Animation duration for visualizer
const VISUALIZER_ANIMATION_DURATION = 150; // Duration in milliseconds

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
        if (data.currently_playing_type === 'ad') {
          // Handle the case when an ad is playing
          document.querySelector('.info-title').textContent = 'Ad Break';
          document.querySelector('.info-artist').textContent = '';
          document.querySelector('.time-duration').textContent = '00:00';
          document.querySelector('.time-elapsed').textContent = '00:00';
          document.querySelector('.bar-top').style.width = '0%';
          document.querySelector('.album').style.backgroundImage = `url(assets/icons/AD.svg)`;
          resetVisualizerAnimation();
        } else {
          // Handle the case when a regular track is playing
          const songTitle = data.item.name;
          const artistName = data.item.artists[0].name;
          const songDuration = data.item.duration_ms; // Song duration in milliseconds
          const progressMs = data.progress_ms; // Current playback position in milliseconds

          // Update the widget with the currently playing song information
          document.querySelector('.info-title').textContent = songTitle;
          document.querySelector('.info-artist').textContent = artistName;
          document.querySelector('.time-elapsed').textContent = formatTime(Math.floor(progressMs / 1000)); // Convert progress from milliseconds to seconds
          document.querySelector('.time-duration').textContent = formatTime(Math.floor(songDuration / 1000)); // Convert duration from milliseconds to seconds

          // Update the album picture
          const albumImage = data.item.album.images[0].url; // Assuming the first image in the array is the desired size
          document.querySelector('.album').style.backgroundImage = `url(${albumImage})`;

          // Update the progress bar
          updateProgressBar(progressMs, songDuration);

          // Start the visualizer animation
          startVisualizerAnimation();
        }
      } else {
        // No currently playing song
        document.querySelector('.info-title').textContent = 'Nothing is playing';
        document.querySelector('.info-artist').textContent = '';
        document.querySelector('.time-duration').textContent = '00:00';
        document.querySelector('.time-elapsed').textContent = '00:00';
        document.querySelector('.bar-top').style.width = '0%';
        document.querySelector('.album').style.backgroundImage = `url(assets/icons/Music-Note.svg)`;
        resetVisualizerAnimation();
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
  // Update the progress bar
  const progressPercentage = (currentTime / duration) * 100;
  const cappedProgress = Math.min(progressPercentage, 100);
  document.querySelector('.bar-top').style.width = `${cappedProgress}%`;
  document.querySelector('.time-elapsed').textContent = formatTime(Math.floor(currentTime / 1000)); // Convert progress from milliseconds to seconds
  document.querySelector('.time-duration').textContent = formatTime(Math.floor(duration / 1000)); // Convert duration from milliseconds to seconds
}

// Helper function to format time as MM:SS
function formatTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.round(time % 60);

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Function to start the visualizer animation
function startVisualizerAnimation() {
  const visualizerElements = document.querySelectorAll('.visualizer > div');
  visualizerElements.forEach((element) => {
    element.style.height = '20px'; // Set initial height to 20px
    element.style.transition = `height ${VISUALIZER_ANIMATION_DURATION}ms linear`;
  });

  requestAnimationFrame(updateVisualizerAnimation);
}

// Function to update the visualizer animation
function updateVisualizerAnimation() {
  const visualizerElements = document.querySelectorAll('.visualizer > div');
  visualizerElements.forEach((element) => {
    const currentHeight = parseFloat(element.style.height);
    const newHeight = getRandomAnimationHeight(); // Get random height for animation
    element.style.height = `${newHeight}px`;
  });

  requestAnimationFrame(updateVisualizerAnimation);
}

// Function to reset the visualizer animation
function resetVisualizerAnimation() {
  const visualizerElements = document.querySelectorAll('.visualizer > div');
  visualizerElements.forEach((element) => {
    element.style.height = '20px';
    element.style.transition = 'none';
  });
}

// Function to pause the visualizer animation
function pauseVisualizerAnimation() {
  const visualizerElements = document.querySelectorAll('.visualizer > div');
  visualizerElements.forEach((element) => {
    const currentHeight = parseFloat(element.style.height);
    element.style.height = `${currentHeight}px`;
    element.style.transition = 'none';
  });
}




// ... Existing code above ...

// Function to check if text overflows and add animation classes accordingly
function checkTextOverflow() {
  const infoTitle = document.querySelector('.info-title');
  const infoArtist = document.querySelector('.info-artist');

  if (infoTitle.scrollWidth > infoTitle.offsetWidth) {
    infoTitle.classList.add('scroll-animation-left');
  } else {
    infoTitle.classList.remove('scroll-animation-left');
  }

  if (infoArtist.scrollWidth > infoArtist.offsetWidth) {
    infoArtist.classList.add('scroll-animation-right');
  } else {
    infoArtist.classList.remove('scroll-animation-right');
  }
}

getAccessToken().then(() => {
  setInterval(() => {
    fetchCurrentlyPlayingSong().catch((error) => {
      console.error('Error fetching currently playing song:', error);
    });
    checkTextOverflow();
  }, 1000);
});
