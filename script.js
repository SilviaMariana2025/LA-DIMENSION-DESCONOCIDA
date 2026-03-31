// clave de la api de tmdb para poder hacer peticiones
const apiKey = "cca9b2bde33142b0834f22b8d3f12aa9";

// url base de la api de tmdb
const baseUrl = "https://api.themoviedb.org/3";

// id de la serie principal que se mostrará en el proyecto (the twilight zone)
const seriePrincipal = 6357; 

// función que muestra un mensaje de carga mientras se realiza una petición a la api
function mostrarLoading(){
const container = document.getElementById("results");
container.innerHTML = "<h2>⏳ Cargando...</h2>";
}

// función que genera el botón para regresar a la tarjeta principal
function botonVolver(){
return `<div class="icono-volver" onclick="verDetalles(${seriePrincipal})">↩</div>`;
}

// función que permite buscar series escribiendo un nombre en el input
async function buscarSerie() {

// obtiene el texto que escribió el usuario
const query = document.getElementById("searchInput").value;

// muestra mensaje de carga
mostrarLoading();

// construye la url para buscar series en tmdb
const url = `${baseUrl}/search/tv?api_key=${apiKey}&query=${query}&language=es-ES`;

try {

// realiza la petición a la api
const response = await fetch(url);

// convierte la respuesta en formato json
const data = await response.json();

// envía los resultados para mostrarlos en pantalla
mostrarResultados(data.results);
}
catch (error){
  const container = document.getElementById("results");

  container.innerHTML = `
    <h2>📡 Estás sin conexión</h2>
    <p>Solo puedes ver contenido cargado previamente.</p>
    ${botonVolver()}
  `;
}
}

// función que muestra las series encontradas en forma de tarjetas
function mostrarResultados(series){

const container = document.getElementById("results");

// cambia el estilo del contenedor para mostrar varias tarjetas
container.classList.remove("principal");
container.classList.add("grid");

// si no hay resultados se muestra un mensaje
if(series.length === 0){
container.innerHTML = "<h2>No se encontraron resultados 😢</h2>" + botonVolver();
return;
}

// agrega el botón para regresar
container.innerHTML = botonVolver();

// recorre todas las series encontradas
series.forEach(serie => {

// obtiene el poster de la serie si existe
const poster = serie.poster_path 
? `https://image.tmdb.org/t/p/w200${serie.poster_path}`
: "https://via.placeholder.com/200x300?text=Sin+Imagen";

// crea una descripción corta de la serie
const descripcionCorta = serie.overview
? serie.overview.substring(0,120) + "..."
: "Sin descripción disponible";

// crea un div para cada tarjeta
const div = document.createElement("div");

// estructura html de la tarjeta
div.innerHTML = `
<div class="card" onclick="verDetalles(${serie.id})">
<img src="${poster}">
<h3>${serie.name}</h3>
<p>${descripcionCorta}</p>
<button>Ver más</button>
</div>
`;

container.appendChild(div);

});

}

// función que muestra los detalles de una serie específica
async function verDetalles(id){

// solo permite entrar a la serie principal del proyecto
if(id !== seriePrincipal){
document.getElementById("results").innerHTML =
"<h2>⚠️ Solo puedes entrar a The Twilight Zone</h2>" + botonVolver();
return;
}

// muestra mensaje de carga
mostrarLoading();

// url para obtener detalles de la serie
const url = `${baseUrl}/tv/${id}?api_key=${apiKey}&language=es-ES`;

try{

// realiza la petición a la api
const response = await fetch(url);

// convierte la respuesta en json
const data = await response.json();

// envía los datos para mostrarlos
mostrarDetalles(data);

}catch(error){

console.error("Error:", error);

}

}

function mostrarDetalles(serie){

const container = document.getElementById("results");
container.classList.remove("grid");

container.innerHTML = `

<h1 class="titulo-serie">LA DIMENSIÓN DESCONOCIDA</h1>

<img class="imagen-serie"
src="https://s3.amazonaws.com/arc-wordpress-client-uploads/infobae-wp/wp-content/uploads/2019/05/23190023/twilight-zone-4.jpg">

<h3>📖 Sinopsis</h3>

<p class="sinopsis">${serie.overview}</p>

<div class="botones-detalle">

<button onclick="verActores(${serie.id})">👥 Ver Actores</button>

<button onclick="verTemporadas(${serie.id})">📚 Temporadas</button>

<button onclick="verSimilares(${serie.id})">📺 Series Similares</button>

<button onclick="verTrailer(${serie.id})">🎬 Trailer</button>

<button onclick="verReviews(${serie.id})">⭐ Rating</button>


<button onclick="mostrarPopularidad(${serie.popularity})">🔥 Popularidad</button>

<button onclick="verDondeVer(${serie.id})">📺 Dónde verla</button>

<button onclick="mostrarGeneros('${serie.genres.map(g => g.name).join(", ")}')">🎭 Género</button>

</div>


${navigator.onLine ? `
<h2 class="titulo-video">
⚡ ENTRA SI TE ATREVES ⚡
</h2>
<iframe 
class="trailer"
src="https://www.youtube.com/embed/e5zg_zGhp7A"
frameborder="0"
allowfullscreen>
</iframe>
` : `
<h2>🚫 Sin conexión - Trailer no disponible</h2>
`}

`;

}

// función que obtiene los actores de la serie
async function verActores(id){

mostrarLoading();

// url para obtener el reparto de la serie
const url = `${baseUrl}/tv/${id}/aggregate_credits?api_key=${apiKey}&language=es-ES`;

try{

const response = await fetch(url);
const data = await response.json();

console.log(data.cast);

mostrarActores(data.cast);

}catch(error){

console.error("Error:", error);

}

}
function mostrarRating(rating){

const container = document.getElementById("results");

container.innerHTML = `
${botonVolver()}

<h2>⭐ Rating de la serie</h2>

<p>La serie tiene una calificación de <strong>${rating}</strong> en TMDB.</p>
`;

}
function mostrarPopularidad(pop){

const container = document.getElementById("results");

container.innerHTML = `
${botonVolver()}
<section id="popularidad" class="popularidad">
<h1 class="titulo-popularidad">🔥✨ POPULARIDAD DE THE TWILIGHT ZONE ✨🔥</h1>
<p>La popularidad actual de la serie es: <strong>${pop}</strong></p>
  <div class="popularidad-contenedor">

    <div class="popularidad-card">
      <h3>Impacto cultural</h3>
      <p>
        The Twilight Zone es considerada una de las series más influyentes de la televisión.
        Sus historias de ciencia ficción, misterio y crítica social han inspirado muchas
        películas y series modernas.
      </p>
    </div>

    <div class="popularidad-card">
      <h3>Episodios más recordados</h3>
      <ul>
        <li>Time Enough at Last</li>
        <li>Nightmare at 20,000 Feet</li>
        <li>The Monsters Are Due on Maple Street</li>
        <li>Eye of the Beholder</li>
      </ul>
    </div>

    <div class="popularidad-card">
      <h3>Datos interesantes</h3>
      <ul>
        <li>Se estrenó en 1959.</li>
        <li>Fue creada por Rod Serling.</li>
        <li>Tiene más de 150 episodios.</li>
        <li>Ha tenido varias versiones y adaptaciones.</li>
      </ul>
    </div>

    <div class="popularidad-card">
      <h3>Dónde verla</h3>
      <p>
        Actualmente algunos episodios pueden encontrarse en plataformas de streaming
        o en canales de televisión dedicados a series clásicas.
      </p>
    </div>

  </div>
</section>

`;

}
async function verDondeVer(id){

mostrarLoading();

const url = `${baseUrl}/tv/${id}/watch/providers?api_key=${apiKey}`;

try{

const response = await fetch(url);
const data = await response.json();

const container = document.getElementById("results");

let plataformas = "";

if(data.results.CO && data.results.CO.flatrate){

plataformas = data.results.CO.flatrate
.map(p => p.provider_name)
.join(", ");

}

container.innerHTML = `
${botonVolver()}
<section id="donde-ver" class="donde-ver">
  <div class="tarjeta-ver">

    <h2>¿Dónde ver The Twilight Zone?</h2>

    <p>
      Esta serie clásica de ciencia ficción puede encontrarse en diferentes
      plataformas de streaming y servicios digitales donde se pueden ver
      episodios completos.
    </p>

    <div class="logos-plataformas">
      <img src="https://cdn-icons-png.flaticon.com/512/732/732228.png" alt="Netflix">
      <img src="https://cdn-icons-png.flaticon.com/512/5968/5968756.png" alt="Prime Video">
      <img src="https://cdn-icons-png.flaticon.com/512/5968/5968885.png" alt="Paramount Plus">
      <img src="https://cdn-icons-png.flaticon.com/512/5968/5968764.png" alt="Pluto TV">
    </div>

  </div>
</section>

<h3>${plataformas}</h3>
`;

}catch(error){

console.error(error);

}

}

function mostrarActores(actores){

const container = document.getElementById("results");

container.classList.remove("principal");
container.classList.add("grid");
container.innerHTML = botonVolver() + '<h1 class="titulo-actores">ACTORES</h1>';



actores.slice(0,20).forEach(actor => {

const foto = actor.profile_path
? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
: "https://via.placeholder.com/200x300?text=Actor";

const div = document.createElement("div");

div.innerHTML = `
<div class="card">
<img src="${foto}">
<h3>${actor.name}</h3>
<p>Personaje: ${actor.character || "No disponible"}</p>
</div>
`;

container.appendChild(div);

});

}

// función que obtiene series similares a la principal
async function verSimilares(id){

mostrarLoading();

// url para obtener series similares
const url = `${baseUrl}/tv/${id}/similar?api_key=${apiKey}&language=es-ES`;

try{

const response = await fetch(url);
const data = await response.json();

const container = document.getElementById("results");

container.classList.remove("principal");
container.classList.add("grid");


container.innerHTML = `
${botonVolver()}
<h1 class="titulo-similares">🌌 SERIES SIMILARES A THE TWILIGHT ZONE 🌌</h1>
<p class="descripcion-similares">
Descubre otras series de ciencia ficción, misterio y fenómenos inexplicables 👁️✨
</p>
`;

// recorrer series
data.results.forEach(serie => {

const poster = serie.poster_path
? `https://image.tmdb.org/t/p/w200${serie.poster_path}`
: "https://via.placeholder.com/200x300?text=Sin+Imagen";

const descripcionCorta = serie.overview
? serie.overview.substring(0,120) + "..."
: "Sin descripción disponible";

const div = document.createElement("div");

div.innerHTML = `
<div class="card" onclick="verDetalles(${serie.id})">
<img src="${poster}">
<h3>${serie.name}</h3>
<p>${descripcionCorta}</p>
<button>Ver más</button>
</div>
`;

container.appendChild(div);

});

}catch(error){
console.error("Error:", error);
}

}
// función que permite descubrir series por género
async function verPorGenero(idGenero){

mostrarLoading();

// url para descubrir series por género
const url = `${baseUrl}/discover/tv?api_key=${apiKey}&with_genres=${idGenero}&language=es-ES`;

try{

const response = await fetch(url);
const data = await response.json();

// muestra las series del género seleccionado
mostrarResultados(data.results);

}catch(error){

console.error("Error:", error);

}

}
async function verDetallesTemporada(idSerie, temporada){

mostrarLoading();

const url = `${baseUrl}/tv/${idSerie}/season/${temporada}?api_key=${apiKey}&language=es-ES`;

try{

const response = await fetch(url);
const data = await response.json();

const container = document.getElementById("results");

const imagen = data.poster_path
? `https://image.tmdb.org/t/p/w400${data.poster_path}`
: "https://via.placeholder.com/200x300?text=Sin+Imagen";


container.innerHTML = `
${botonVolver()}

<h1 class="titulo-temporadas">${data.name}</h1>

<img class="poster-detalle" src="${imagen}">

<div class="info-temporada">

<h3>📖 Descripción</h3>
<p>${data.overview || "Sin descripción disponible."}</p>

<h3>🎬 Episodios: ${data.episodes.length}</h3>

</div>

<h2>🖼 Galería de la temporada</h2>

<div class="galeria-temporada"></div>
`;

const galeria = document.querySelector(".galeria-temporada");

data.episodes.forEach(ep => {

if(!ep.still_path) return;

const img = document.createElement("img");

img.src = `https://image.tmdb.org/t/p/w400${ep.still_path}`;
img.alt = ep.name;

galeria.appendChild(img);

});

}catch(error){
console.error(error);
}

}





async function verTemporadas(idSerie){

mostrarLoading();

const url = `${baseUrl}/tv/${idSerie}?api_key=${apiKey}&language=es-ES`;

try{

const response = await fetch(url);
const data = await response.json();

mostrarTemporadas(data.seasons);

}catch(error){
console.error(error);
}

}
function mostrarTemporadas(temporadas){

const container = document.getElementById("results");

container.classList.remove("grid");
container.classList.add("temporadas-container");

container.innerHTML = `
${botonVolver()}
<h1 class="titulo-temporadas">TEMPORADAS</h1>
<div class="temporadas-grid"></div>
`;

const grid = document.querySelector(".temporadas-grid");

temporadas.forEach(temp => {

if(temp.season_number === 0) return;

const imagen = temp.poster_path
? `https://image.tmdb.org/t/p/w300${temp.poster_path}`
: "https://via.placeholder.com/300x450?text=Temporada";

const div = document.createElement("div");

div.className = "temporada-card";

div.innerHTML = `
<img src="${imagen}">
<h3>${temp.name}</h3>
<p>Episodios: ${temp.episode_count}</p>
<p>${temp.air_date || "Fecha no disponible"}</p>
`;
div.onclick = () => verDetallesTemporada(seriePrincipal, temp.season_number);

grid.appendChild(div);

});

}
async function verTrailer(id){

mostrarLoading();
if (!navigator.onLine) {
  const container = document.getElementById("results");

  container.innerHTML = `
    ${botonVolver()}
    <h2>🚫 Sin conexión</h2>
    <p>Los trailers no están disponibles sin internet.</p>
  `;
  return;
}
const url = `${baseUrl}/tv/${id}/videos?api_key=${apiKey}`;

try{

const response = await fetch(url);
const data = await response.json();

const container = document.getElementById("results");

// videos de TMDB
let videos = data.results.filter(v => v.site === "YouTube");

// videos extra para completar 4
const extras = [
{ name:"Classic Trailer", key:"NzlG28B-R8Y"},
{ name:"Opening The Twilight Zone", key:"e5zg_zGhp7A"}
];

// combinar videos
videos = [...videos, ...extras];

container.innerHTML = `
${botonVolver()}

<h1 class="titulo-trailers">
🎬 Trailers de la The Twilight Zone 🎬
</h1>

<p class="descripcion-trailers">
Trailers y momentos icónicos de la serie.
Atrévete a entrar en la dimensión desconocida...
</p>

<div class="trailers-grid"></div>
`;

const grid = document.querySelector(".trailers-grid");

// mostrar solo 4
videos.slice(0,4).forEach(video => {

const div = document.createElement("div");

div.className = "trailer-card";

div.innerHTML = `
<h3>${video.name}</h3>

<iframe
src="https://www.youtube.com/embed/${video.key}"
frameborder="0"
allowfullscreen>
</iframe>
`;

grid.appendChild(div);

});

}catch(error){
console.error(error);
}
}
async function verReviews(id){

mostrarLoading();

const url = `${baseUrl}/tv/${id}/reviews?api_key=${apiKey}`;

try{

const response = await fetch(url);
const data = await response.json();

const container = document.getElementById("results");

if(data.results.length === 0){
container.innerHTML = botonVolver() + "<h2>No hay comentarios disponibles</h2>";
return;
}
container.innerHTML = `
${botonVolver()}

<section class="comentarios">
<h1 class="titulo-comentarios">💬✨ COMENTARIOS DE LOS ESPECTADORES ✨💬</h1>

  <div class="contenedor-comentarios">

    <div class="comentario">
      <p>"Una de las mejores series de ciencia ficción de la historia. Cada episodio tiene una historia única que te hace pensar."</p>
      <span>- Usuario 1</span>
    </div>

    <div class="comentario">
      <p>"Me encanta cómo cada capítulo tiene un final inesperado. Es una serie muy creativa."</p>
      <span>- Usuario 2</span>
    </div>

    <div class="comentario">
      <p>"The Twilight Zone mezcla misterio, ciencia ficción y crítica social de forma increíble."</p>
      <span>- Usuario 3</span>
    </div>

    <div class="comentario">
      <p>"Una serie clásica que sigue siendo interesante incluso hoy en día."</p>
      <span>- Usuario 4</span>
    </div>

    <div class="comentario">
      <p>"Cada episodio es diferente y siempre tiene un mensaje profundo. Es una serie muy adelantada a su tiempo."</p>
      <span>- Usuario 5</span>
    </div>

    <div class="comentario">
      <p>"Los giros inesperados al final de cada historia hacen que la serie sea muy emocionante."</p>
      <span>- Usuario 6</span>
    </div>

  </div>
</section>
`;


const grid = document.querySelector(".reviews-grid");

data.results.slice(0,4).forEach(review => {
    

const rating = review.author_details.rating 
? "⭐".repeat(Math.round(review.author_details.rating/2))
: "⭐⭐⭐";

const div = document.createElement("div");

div.className = "review-card";

div.innerHTML = `
<h3>${review.author}</h3>

<p class="estrellas">${rating}</p>

<p>${review.content.substring(0,300)}...</p>
`;

grid.appendChild(div);

});

}catch(error){
console.error(error);
}
}


function mostrarGeneros(generos){

const container = document.getElementById("results");

container.classList.remove("grid");
container.innerHTML = `
${botonVolver()}

<section class="generos">

<h1 class="titulo-generos">🎭✨ GÉNEROS DE THE TWILIGHT ZONE ✨🎭</h1>

<p class="descripcion-generos">
Esta serie mezcla diferentes estilos narrativos que hacen cada episodio único.
Aquí están los principales géneros que forman parte de la serie.
</p>

<div class="generos-grid">

<div class="genero-card">
<img src="https://images.unsplash.com/photo-1534447677768-be436bb09401">
<h3>🚀 Ciencia Ficción</h3>
<p>
Explora viajes en el tiempo, tecnología avanzada y realidades alternativas.
</p>
</div>

<div class="genero-card">
<img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb">
<h3>🕵️ Misterio</h3>
<p>
Historias llenas de enigmas, situaciones inexplicables y finales sorprendentes.
</p>
</div>

<div class="genero-card">
<img src="https://images.unsplash.com/photo-1524985069026-dd778a71c7b4">
<h3>🎭 Drama</h3>
<p>
Relatos profundos que muestran emociones humanas y dilemas morales.
</p>
</div>

<div class="genero-card">
<img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee">
<h3>✨ Fantasía</h3>
<p>
Eventos sobrenaturales y mundos imaginarios que desafían la lógica.
</p>
</div>

</div>

</section>
`;

}


function updateOnlineStatus() {
  const banner = document.getElementById("offline-banner");

  if (navigator.onLine) {
    document.body.classList.remove("offline");
    banner.style.display = "none";
  } else {
    document.body.classList.add("offline");
    banner.style.display = "block";
  }
}

// inicia la aplicación mostrando la tarjeta principal de the twilight zone
verDetalles(seriePrincipal);

// Manejo del estado offline
function updateOnlineStatus() {
  if (navigator.onLine) {
    document.body.classList.remove("offline");
  } else {
    document.body.classList.add("offline");
  }
}

// Escucha los cambios de conexión
window.addEventListener("online", updateOnlineStatus);
window.addEventListener("offline", updateOnlineStatus);

// Verificación inicial
updateOnlineStatus();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js")
    .then(() => console.log("Service Worker registrado"))
    .catch(error => console.log("Error:", error));
}
