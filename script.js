const showSelect = document.getElementById("show-select");

async function loadPopularShows() {
    const url = "https://api.themoviedb.org/3/tv/popular";

    const options = {
        method: "GET",
        headers: {
            accept: "application/json",
            Authorization: `Bearer ${TMDB_TOKEN}`
        }
    };

    try {
        const res = await fetch(url, options);

        if (!res.ok) {
            throw new Error(`Request failed with status ${res.status}`);
        }

        const data = await res.json();
        fillDropdown(data.results);
        
    } catch (error) {
        console.error(error);
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

loadPopularShows();