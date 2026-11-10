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
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

loadPopularShows();