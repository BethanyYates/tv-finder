const showSelect = document.getElementById("show-select");
const showDetails = document.getElementById("show-details");
const statusMessage = document.getElementById("status-message");

const requestOptions = {
    method: "GET",
    headers: {
        accept: "application/json",
        Authorization: `Bearer ${TMDB_TOKEN}`
    }
};

// Display loading or error messages
function showStatus(message, type = "") {
    statusMessage.textContent = message;
    statusMessage.className = type;
}

// Handle API errors
function handleApiError(error) {
    console.error(error);

    if (error.message.includes("401")) {
        showStatus(
            "TMDB rejected your API token. Check your API Read Access Token in config.js.",
            "error"
        );
    } else {
        showStatus(
            "Something went wrong while loading the TV shows. Please try again.",
            "error"
        );
    }
}

// Request popular TV shows
async function loadPopularShows() {
    const url = "https://api.themoviedb.org/3/tv/popular";

    // Clear old messages and show loading status
    showStatus("Loading popular shows...", "loading");

    try {
        const res = await fetch(url, requestOptions);

        if (!res.ok) {
            throw new Error(`Request failed with status ${res.status}`);
        }

        const data = await res.json();
        fillDropdown(data.results);

        // Remove loading message after success
        showStatus("");

    } catch (error) {
        handleApiError(error);
    }
}

function fillDropdown(shows) {
    // Clear the dropdown before adding new options
    showSelect.innerHTML = "";

    // Create the placeholder option
    const placeholder = document.createElement("option");
    placeholder.textContent = "Select a show";
    placeholder.value = "";
    showSelect.appendChild(placeholder);

    // Create an option for each TV show
    shows.forEach(function (show) {
        const option = document.createElement("option");
        option.textContent = show.name;
        option.value = show.id;
        showSelect.appendChild(option);
    });
}

// Request details for the selected TV show
async function loadShowDetails(id) {
    const url = `https://api.themoviedb.org/3/tv/${id}`;

    // Clear previous details and show loading message
    showDetails.replaceChildren();
    showStatus("Loading show details...", "loading");

    try {
        const res = await fetch(url, requestOptions);

        if (!res.ok) {
            throw new Error(`Request failed with status ${res.status}`);
        }

        const show = await res.json();
        displayDetails(show);

        // Remove loading message after success
        showStatus("");

    } catch (error) {
        handleApiError(error);
    }
}

function displayDetails(show) {
    // Clear the previous show's details
    showDetails.innerHTML = "";

    // Create the show name
    const title = document.createElement("h2");
    title.textContent = show.name;
    showDetails.appendChild(title);

    // Create the show poster or a fallback message
    if (show.poster_path) {
        const poster = document.createElement("img");
        poster.src = `https://image.tmdb.org/t/p/w500${show.poster_path}`;
        poster.alt = `Poster for ${show.name}`;
        showDetails.appendChild(poster);
    } else {
        const noPoster = document.createElement("p");
        noPoster.textContent = "No poster available";
        showDetails.appendChild(noPoster);
    }

    // Create the overview
    const overview = document.createElement("p");
    overview.textContent = show.overview || "No overview available.";
    showDetails.appendChild(overview);

    // Create the genres
    const genres = document.createElement("p");
    const genreNames = show.genres.map(function (genre) {
        return genre.name;
    });
    genres.textContent = `Genres: ${genreNames.join(", ") || "Not available"}`;
    showDetails.appendChild(genres);

    // Create the number of seasons
    const seasons = document.createElement("p");
    seasons.textContent = `Seasons: ${show.number_of_seasons}`;
    showDetails.appendChild(seasons);

    // Create the number of episodes
    const episodes = document.createElement("p");
    episodes.textContent = `Episodes: ${show.number_of_episodes}`;
    showDetails.appendChild(episodes);

    // Create the show's status
    const status = document.createElement("p");
    status.textContent = `Status: ${show.status}`;
    showDetails.appendChild(status);
}

// Listen for dropdown changes
showSelect.addEventListener("change", function () {
    const id = showSelect.value;

    if (id === "") {
        showDetails.replaceChildren();
        showStatus("");
        return;
    }

    loadShowDetails(id);
});

loadPopularShows();