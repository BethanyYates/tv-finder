/* =========================================
   TV SHOW FINDER - JAVASCRIPT
   ========================================= */

// Get HTML elements
const showSelect = document.getElementById("show-select");
const showDetails = document.getElementById("show-details");
const statusMessage = document.getElementById("status-message");

// Shared TMDB API request settings
// TMDB_TOKEN comes from config.js
const requestOptions = {
    method: "GET",
    headers: {
        accept: "application/json",
        Authorization: `Bearer ${TMDB_TOKEN}`
    }
};

// Track the latest details request
let currentRequest = 0;

/* =========================================
   STATUS MESSAGES
   ========================================= */

function showStatus(message, type = "") {
    statusMessage.textContent = message;
    statusMessage.className = type;
}

/* =========================================
   ERROR HANDLING
   ========================================= */

function handleApiError(error) {
    console.error("TMDB API Error:", error);

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

/* =========================================
   LOAD POPULAR TV SHOWS
   ========================================= */

async function loadPopularShows() {
    const url = "https://api.themoviedb.org/3/tv/popular";

    showSelect.disabled = true;
    showStatus("Loading popular TV shows...", "loading");

    try {
        const response = await fetch(url, requestOptions);

        if (!response.ok) {
            throw new Error(
                `Request failed with status ${response.status}`
            );
        }

        const data = await response.json();

        fillDropdown(data.results);

        showStatus("");

    } catch (error) {
        handleApiError(error);

    } finally {
        showSelect.disabled = false;
    }
}

/* =========================================
   POPULATE DROPDOWN
   ========================================= */

function fillDropdown(shows) {
    // Remove existing dropdown options
    showSelect.replaceChildren();

    // Create placeholder
    const placeholder = document.createElement("option");
    placeholder.textContent = "Select a TV show";
    placeholder.value = "";

    showSelect.appendChild(placeholder);

    // Add popular TV shows
    shows.forEach(function (show) {
        const option = document.createElement("option");

        option.textContent = show.name;
        option.value = show.id;

        showSelect.appendChild(option);
    });
}

/* =========================================
   LOAD SELECTED SHOW DETAILS
   ========================================= */

async function loadShowDetails(id) {
    const requestId = ++currentRequest;
    const url = `https://api.themoviedb.org/3/tv/${id}`;

    showDetails.replaceChildren();

    showStatus("Loading show details...", "loading");

    try {
        const response = await fetch(url, requestOptions);

        if (!response.ok) {
            throw new Error(
                `Request failed with status ${response.status}`
            );
        }

        const show = await response.json();

        // Ignore outdated requests
        if (requestId !== currentRequest) {
            return;
        }

        displayDetails(show);

        showStatus("");

    } catch (error) {
        if (requestId === currentRequest) {
            handleApiError(error);
        }
    }
}

/* =========================================
   HELPER: CREATE INFORMATION PARAGRAPH
   ========================================= */

function createInfoParagraph(label, value) {
    const paragraph = document.createElement("p");

    const strong = document.createElement("strong");
    strong.textContent = `${label}: `;

    const text = document.createElement("span");
    text.textContent = value;

    paragraph.appendChild(strong);
    paragraph.appendChild(text);

    return paragraph;
}

/* =========================================
   DISPLAY TV SHOW DETAILS
   ========================================= */

function displayDetails(show) {
    // Clear previous show details
    showDetails.replaceChildren();

    // Create show title
    const title = document.createElement("h2");
    title.textContent = show.name || "Unknown TV Show";

    showDetails.appendChild(title);

    // Create two-column layout
    const showLayout = document.createElement("div");
    showLayout.className = "show-layout";

    // Create poster container
    const posterContainer = document.createElement("div");
    posterContainer.className = "poster-container";

    // Create show information container
    const showInfo = document.createElement("div");
    showInfo.className = "show-info";

    /* TV SHOW POSTER */

    if (show.poster_path) {
        const poster = document.createElement("img");

        poster.src =
            `https://image.tmdb.org/t/p/w500${show.poster_path}`;

        poster.alt = `Poster for ${show.name}`;
        poster.loading = "lazy";

        posterContainer.appendChild(poster);

    } else {
        const noPoster = document.createElement("p");

        noPoster.className = "no-poster";
        noPoster.textContent = "No poster available";

        posterContainer.appendChild(noPoster);
    }

    /* OVERVIEW */

    const overviewHeading = document.createElement("h3");
    overviewHeading.textContent = "Overview";

    const overview = document.createElement("p");
    overview.className = "show-overview";

    overview.textContent =
        show.overview || "No overview available.";

    showInfo.appendChild(overviewHeading);
    showInfo.appendChild(overview);

    /* GENRES */

    const genreNames = Array.isArray(show.genres)
        ? show.genres.map(function (genre) {
            return genre.name;
        })
        : [];

    const genres = createInfoParagraph(
        "Genres",
        genreNames.join(", ") || "Not available"
    );

    showInfo.appendChild(genres);

    /* SEASONS */

    const seasons = createInfoParagraph(
        "Seasons",
        show.number_of_seasons ?? "Not available"
    );

    showInfo.appendChild(seasons);

    /* EPISODES */

    const episodes = createInfoParagraph(
        "Episodes",
        show.number_of_episodes ?? "Not available"
    );

    showInfo.appendChild(episodes);

    /* SHOW STATUS */

    const status = createInfoParagraph(
        "Status",
        show.status || "Not available"
    );

    showInfo.appendChild(status);

    /* COMBINE BOTH COLUMNS */

    showLayout.appendChild(posterContainer);
    showLayout.appendChild(showInfo);

    // Add layout to the details card
    showDetails.appendChild(showLayout);
}

/* =========================================
   DROPDOWN EVENT LISTENER
   ========================================= */

showSelect.addEventListener("change", function () {
    const id = showSelect.value;

    // Invalidate any previous details request
    currentRequest++;

    if (id === "") {
        showDetails.replaceChildren();
        showStatus("");
        return;
    }

    loadShowDetails(id);
});

/* =========================================
   INITIALIZE WEBSITE
   ========================================= */

loadPopularShows();