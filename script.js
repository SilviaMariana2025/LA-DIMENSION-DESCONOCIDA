const apiKey = "cca9b2bde33142b0834f22b8d3f12aa9";
const baseUrl = "https://api.themoviedb.org/3";
const seriePrincipal = 6357;

// 🔄 LOADING
function mostrarLoading() {
  document.getElementById("results").innerHTML = "<h2>⏳ Cargando...</h2>";
}

// 🔙 BOTÓN VOLVER
function botonVolver() {
  return `<div class="icono-volver" onclick="verDetalles(${seriePrincipal})">↩</div>`;
}

// 🔍 BUSCAR SERIE
async function buscarSerie() {
  const query = document.getElementById("searchInput").value;
  mostrarLoading();

  try {
    const res = await fetch(`${baseUrl}/search/tv?api_key=${apiKey}&query=${query}&language=es-ES`);
    const data = await res.json();
    mostrarResultados(data.results);
  } catch {
    document.getElementById("results").innerHTML =
      `<h2>📡 Sin conexión</h2>${botonVolver()}`;
  }
}

// 📺 MOSTRAR RESULTADOS
function mostrarResultados(series) {
  const container = document.getElementById("results");
  container.className = "grid";
  container.innerHTML = botonVolver();

  if (!series.length) {
    container.innerHTML += "<h2>No hay resultados 😢</h2>";
    return;
  }

  series.forEach(serie => {
    const poster = serie.poster_path
      ? `https://image.tmdb.org/t/p/w200${serie.poster_path}`
      : "https://via.placeholder.com/200x300";

    const div = document.createElement("div");
    div.innerHTML = `
      <div class="card" onclick="verDetalles(${serie.id})">
        <img src="${poster}">
        <h3>${serie.name}</h3>
        <p>${serie.overview?.substring(0,100) || "Sin descripción"}...</p>
      </div>
    `;
    container.appendChild(div);
  });
}

// 📄 DETALLES
async function verDetalles(id) {
  mostrarLoading();

  try {
    const res = await fetch(`${baseUrl}/tv/${id}?api_key=${apiKey}&language=es-ES`);
    const data = await res.json();
    localStorage.setItem("detalleSerie", JSON.stringify(data));
    mostrarDetalles(data);
  } catch {
    const guardado = localStorage.getItem("detalleSerie");
    if (guardado) mostrarDetalles(JSON.parse(guardado));
  }
}

// 🧠 MOSTRAR DETALLES
function mostrarDetalles(serie) {
  const container = document.getElementById("results");
  container.className = "";

  container.innerHTML = `
    <h1>LA DIMENSIÓN DESCONOCIDA</h1>

    <img src="https://s3.amazonaws.com/arc-wordpress-client-uploads/infobae-wp/wp-content/uploads/2019/05/23190023/twilight-zone-4.jpg">

    <p>${serie.overview}</p>

    <button onclick="verActores(${serie.id})">Actores</button>
    <button onclick="verSimilares(${serie.id})">Similares</button>
    <button onclick="verTemporadas(${serie.id})">Temporadas</button>
    <button onclick="verTrailer(${serie.id})">Trailer</button>
  `;
}

// 👥 ACTORES
async function verActores(id) {
  mostrarLoading();

  try {
    const res = await fetch(`${baseUrl}/tv/${id}/aggregate_credits?api_key=${apiKey}`);
    const data = await res.json();
    localStorage.setItem("actores", JSON.stringify(data.cast));
    mostrarActores(data.cast);
  } catch {
    const guardado = localStorage.getItem("actores");
    if (guardado) mostrarActores(JSON.parse(guardado));
  }
}

function mostrarActores(actores) {
  const container = document.getElementById("results");
  container.className = "grid";
  container.innerHTML = botonVolver();

  actores.slice(0, 10).forEach(a => {
    const div = document.createElement("div");
    div.innerHTML = `
      <div class="card">
        <h3>${a.name}</h3>
        <p>${a.character || ""}</p>
      </div>
    `;
    container.appendChild(div);
  });
}

// 📺 SIMILARES
async function verSimilares(id) {
  mostrarLoading();

  try {
    const res = await fetch(`${baseUrl}/tv/${id}/similar?api_key=${apiKey}`);
    const data = await res.json();
    mostrarResultados(data.results);
  } catch {
    const guardado = localStorage.getItem("similares");
    if (guardado) mostrarResultados(JSON.parse(guardado));
  }
}

// 🎬 TRAILER
async function verTrailer(id) {
  mostrarLoading();

  try {
    const res = await fetch(`${baseUrl}/tv/${id}/videos?api_key=${apiKey}`);
    const data = await res.json();

    const video = data.results.find(v => v.site === "YouTube");

    document.getElementById("results").innerHTML = `
      ${botonVolver()}
      <iframe src="https://www.youtube.com/embed/${video?.key}" allowfullscreen></iframe>
    `;
  } catch {
    document.getElementById("results").innerHTML =
      `${botonVolver()}<h2>No disponible</h2>`;
  }
}

// 📚 TEMPORADAS
async function verTemporadas(id) {
  mostrarLoading();

  try {
    const res = await fetch(`${baseUrl}/tv/${id}?api_key=${apiKey}`);
    const data = await res.json();
    mostrarTemporadas(data.seasons);
  } catch {
    document.getElementById("results").innerHTML =
      `${botonVolver()}<h2>Error</h2>`;
  }
}

function mostrarTemporadas(temps) {
  const container = document.getElementById("results");
  container.className = "grid";
  container.innerHTML = botonVolver();

  temps.forEach(t => {
    if (t.season_number === 0) return;

    const div = document.createElement("div");
    div.innerHTML = `
      <div class="card">
        <h3>${t.name}</h3>
        <p>${t.episode_count} episodios</p>
      </div>
    `;
    container.appendChild(div);
  });
}

// 🌐 ONLINE/OFFLINE
function updateOnlineStatus() {
  document.body.classList.toggle("offline", !navigator.onLine);
}

window.addEventListener("online", updateOnlineStatus);
window.addEventListener("offline", updateOnlineStatus);

// 🚀 INICIO
verDetalles(seriePrincipal);
updateOnlineStatus();