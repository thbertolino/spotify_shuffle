/* Início do código - script.js */

// CONFIG DO SPOTIFY
const CLIENT_ID = "39300b1668d6473783173aa8629ccf6f";

// ❗ Ao publicar no Github Pages troque isso para:
// const REDIRECT_URI = "https://SEU_USUARIO.github.io/SEU_REPOSITORIO";
const REDIRECT_URI = window.location.origin + window.location.pathname;

const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";

let token = localStorage.getItem("spotify_token");

// ----------------------------------------------
// 1. Se token não existe, tenta pegar do hash (#)
// ----------------------------------------------
if (!token && window.location.hash) {
    const hash = window.location.hash
        .substring(1)
        .split("&")
        .reduce((acc, item) => {
            const [key, value] = item.split("=");
            acc[key] = value;
            return acc;
        }, {});

    token = hash.access_token;

    if (token) {
        localStorage.setItem("spotify_token", token);
        window.location.hash = ""; // limpa URL
    }
}

// LOGIN
document.getElementById("login-btn").onclick = () => {
    const url = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
        REDIRECT_URI
    )}&response_type=${RESPONSE_TYPE}&scope=user-library-read`;
    window.location.href = url;
};

// ----------------------------------------------
// 2. Buscar álbuns salvos
// ----------------------------------------------
async function getSavedAlbums() {
    let albums = [];
    let url = "https://api.spotify.com/v1/me/albums?limit=50";

    while (url) {
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const data = await response.json();
        albums = albums.concat(data.items);

        url = data.next; // paginação
    }

    return albums;
}

// ----------------------------------------------
// 3. Mostrar álbum aleatório
// ----------------------------------------------
function mostrarAlbum(album) {
    const html = `
        <h2>${album.name}</h2>
        <img src="${album.images[0].url}" width="300">
        <p>${album.artists.map(a => a.name).join(", ")}</p>

        <br>
        <a href="${album.external_urls.spotify}" target="_blank">
            🎧 Ouvir no Spotify
        </a>
    `;

    document.getElementById("album").innerHTML = html;
}

// ----------------------------------------------
// 4. Fluxo principal
// ----------------------------------------------
async function start() {
    if (!token) return;

    document.getElementById("login-btn").style.display = "none";

    const albums = await getSavedAlbums();

    if (albums.length === 0) {
        document.getElementById("album").innerHTML =
            "<p>Você não tem álbuns salvos.</p>";
        return;
    }

    // Função para sortear
    function randomize() {
        const item = albums[Math.floor(Math.random() * albums.length)];
        mostrarAlbum(item.album);
    }

    // Primeiro álbum ao carregar
    randomize();

    // Botão "Outro álbum"
    document.getElementById("random-btn").style.display = "block";
    document.getElementById("random-btn").onclick = randomize;
}

start();

/* Fim do código - script.js */
