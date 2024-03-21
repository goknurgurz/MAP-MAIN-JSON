import { detectType, setStorage, detectIcon } from "./helpers.js";

const form = document.querySelector("form");
const list = document.querySelector("ul");

form.addEventListener("submit", handleSubmit);
list.addEventListener("click", handleClick);

var map;
var notes = JSON.parse(localStorage.getItem("notes")) || [];
var coords = [];
var layerGroup = [];

navigator.geolocation.getCurrentPosition(
  loadMap,
  console.log("Kullanıcı kabul etmedi")
);

function onMapClick(e) {
  form.style.display = "flex";
  coords = [e.latlng.lat, e.latlng.lng];

  var marker2 = L.marker([e.latlng.lat, e.latlng.lng]).addTo(layerGroup);

  L.circleMarker(coords, { color: "blue", radius: 5 }).addTo(layerGroup);
}

function loadMap(e) {
  map = L.map("map").setView([e.coords.latitude, e.coords.longitude], 14);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap",
  }).addTo(map);

  layerGroup = L.layerGroup().addTo(map);

  renderNoteList(notes);

  map.on("click", onMapClick);
}
function renderMarker(item) {
  L.marker(item.coords, { icon: detectIcon(item.status) })
    .addTo(layerGroup)
    .bindPopup(` ${item.desc}`);
}

function handleSubmit(e) {
  e.preventDefault();

  const desc = e.target[0].value;
  const date = e.target[1].value;
  const status = e.target[2].value;

  notes.push({
    id: new Date().getTime(),
    desc,
    date,
    status,
    coords,
  });

  setStorage(notes);

  renderNoteList(notes);

  form.style.display = "none";
}

function renderNoteList(items) {
  list.innerHTML = "";

  layerGroup.clearLayers();

  items.forEach((item) => {
    const listEle = document.createElement("li");

    listEle.dataset.id = item.id;

    listEle.innerHTML = `
           <div style="gap:1px">
              <p>${item.desc}</p>
              <p><span>Tarih:</span> ${item.date}</p>
              <p><span>Durum:</span> ${detectType(item.status)}</p>
            </div>
            <i id="fly" class="bi bi-geo-fill"></i>
            <i id="delete" class="bi bi-trash3-fill"></i>
    `;

    list.insertAdjacentElement("afterbegin", listEle);

    renderMarker(item);
  });
}

function handleClick(e) {
  const id = e.target.parentElement.dataset.id;
  if (e.target.id === "delete") {
    notes = notes.filter((note) => note.id != id);

    setStorage(notes);

    renderNoteList(notes);
  }

  if (e.target.id === "fly") {
    const note = notes.find((note) => note.id == id);

    map.flyTo(note.coords);
  }
}

const sidebar = document.querySelector(".sidebar");
const arrowIcon = document.querySelector(".arrow-icon");

function toggleSidebar() {
  sidebar.classList.toggle("sidebar-hidden");
  arrowIcon.classList.toggle("arrow-icon");
  if (arrowIcon.classList.contains("sidebar-hidden")) {
    arrowIcon.style.fontSize = "23px";
  } else {
    arrowIcon.style.fontSize = "32px";
  }
}

arrowIcon.addEventListener("click", toggleSidebar);

// sidebar.addEventListener("transitionend", () => {
//   if (sidebar.classList.contains("sidebar-hidden")) {
//     sidebar.style.transition = "transform 0.5s ease";
//     setTimeout(() => {
//       sidebar.style.transition = "none";
//     }, 0);
//   }
// });

arrowIcon.addEventListener("click", toggleSidebar);

sidebar.addEventListener("transitionend", () => {
  if (sidebar.classList.contains("sidebar-hidden")) {
    arrowIcon.style.transition = "font-size 0.5s ease";
    arrowIcon.style.fontSize = "23px";
  } else {
    arrowIcon.style.transition = "font-size 0.5s ease";
    arrowIcon.style.fontSize = "32px";
  }
});

var circle = L.circle([51.508, -0.11], {
  color: "red",
  fillColor: "#f03",
  fillOpacity: 0.5,
  radius: 500,
}).addTo(map);
