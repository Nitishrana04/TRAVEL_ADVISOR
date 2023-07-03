// Fetch the necessary DOM elements
// const mapElement = document.getElementById("map");
// const searchInput = document.getElementById("search");
// const hotelsCheckbox = document.getElementById("hotels");
// const restaurantsCheckbox = document.getElementById("restaurants");
// const rangeInput = document.getElementById("range");
const listingWrapper = document.getElementById("listing-wrapper");
const loader = document.getElementById("loader");
const mapElement = document.getElementById("map");
var map;
var marker;



function addMarker(lat, long, result_object) {
  if (!lat || !long || !map) return;
  marker = L.marker([lat, long]).addTo(map);
  marker.bindPopup(
    `<b>${result_object.name}</b><br />${result_object.address}<br /> ${result_object.location_string}.`
  );
}

function detailsComponent(details, index) {
  if (!details?.name) return;

  var carouselContainer = document.createElement("div");
  carouselContainer.id = `${details?.name}`;
  carouselContainer.className = "carousel slide";
  carouselContainer.setAttribute("data-ride", "carousel");

  // Create carousel inner element
  var carouselInner = document.createElement("div");
  carouselInner.className = "carousel-inner";

  // Create images for carousel items
  for (var i = 0; i < 2; i++) {
    var carouselItem1 = document.createElement("div");
    carouselItem1.className = `carousel-item ${i == 0 ? "active" : ""}`;
    carouselInner.appendChild(carouselItem1);

    var img1 = document.createElement("img");
    img1.className = "d-block";
    img1.width = "200";
    img1.height = "150";
    img1.src =
      details.photo?.images?.original.url || "https://placehold.co/200x150";
    img1.alt = "First slide";
    carouselItem1.appendChild(img1);
  }

  carouselContainer.appendChild(carouselInner);

  // Create previous and next controls
  var prevControl = document.createElement("a");
  prevControl.className = "carousel-control-prev";
  prevControl.href = `#${details?.name}`;
  prevControl.role = "button";
  prevControl.setAttribute("data-slide", "prev");
  carouselContainer.appendChild(prevControl);

  var prevIcon = document.createElement("span");
  prevIcon.className = "carousel-control-prev-icon";
  prevIcon.setAttribute("aria-hidden", "true");
  prevControl.appendChild(prevIcon);

  var prevLabel = document.createElement("span");
  prevLabel.className = "sr-only";
  prevLabel.innerText = "Previous";
  prevControl.appendChild(prevLabel);

  var nextControl = document.createElement("a");
  nextControl.className = "carousel-control-next";
  nextControl.href = `#${details?.name}`;
  nextControl.role = "button";
  nextControl.setAttribute("data-slide", "next");
  carouselContainer.appendChild(nextControl);

  var nextIcon = document.createElement("span");
  nextIcon.className = "carousel-control-next-icon";
  nextIcon.setAttribute("aria-hidden", "true");
  nextControl.appendChild(nextIcon);

  var nextLabel = document.createElement("span");
  nextLabel.className = "sr-only";
  nextLabel.innerText = "Next";
  nextControl.appendChild(nextLabel);

  // Create details container
  var detailsContainer = document.createElement("div");
  detailsContainer.className = "details-container";

  // Create details content
  var heading = document.createElement("div");
  heading.className = "text-truncate";
  heading.innerText = `${index + 1}. ${details?.name}`;
  detailsContainer.appendChild(heading);

  var ratingContainer = document.createElement("div");
  ratingContainer.className = "rating-container";

  for (var i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
    var ratingDot = document.createElement("div");
    ratingDot.className = "rating-dot";
    ratingContainer.appendChild(ratingDot);
  }

  detailsContainer.appendChild(ratingContainer);

  var br1 = document.createElement("br");
  detailsContainer.appendChild(br1);

  var span1 = document.createElement("span");
  span1.innerText = `${details.address || "-"}`;
  detailsContainer.appendChild(span1);

  var br2 = document.createElement("br");
  detailsContainer.appendChild(br2);

  var span2 = document.createElement("span");
  span2.innerText = `${details.location_string || "-"}`;
  detailsContainer.appendChild(span2);

  var br3 = document.createElement("br");
  detailsContainer.appendChild(br3);

  // var span3 = document.createElement("span");
  // span3.innerText = "Tickets From $65.79";
  // detailsContainer.appendChild(span3);

  var listingContainer = document.createElement("div");
  listingContainer.className = "listing-container";

  listingContainer.appendChild(carouselContainer);
  listingContainer.appendChild(detailsContainer);

  listingWrapper.appendChild(listingContainer);
}

function initMap(lat, long) {
  // Create a Leaflet map instance
  map = L.map("map").setView([lat, long], 13);

  // Add a tile layer to the map (you can choose different tile layers)
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    maxZoom: 18,
  }).addTo(map);
}

function removeMap() {
  if (map) {
    map.remove();
    map = null;
    mapElement.classList = [];
    mapElement.classList.add("map");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  var searchBar = document.getElementById("search-bar");
  searchBar.addEventListener("keyup", function (event) {
    // Check if the "Enter" key is pressed (key code 13)
    if (event.keyCode === 13) {
      while (listingWrapper.firstChild) {
        listingWrapper.removeChild(listingWrapper.firstChild);
      }
      removeMap();
      fetchData(event.target.value);
    }
  });
});

async function fetchData(query = "india gate") {
  const url = `https://travel-advisor.p.rapidapi.com/locations/auto-complete?query=${query}&lang=en_US&units=km`;
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "a4f5c0bfe5msh9e8cc85436fd9d4p1cd6a8jsn3f1ec5663a72",
      "X-RapidAPI-Host": "travel-advisor.p.rapidapi.com",
    },
  };

  try {
    loader.classList.add("loader");
    const response = await fetch(url, options);
    const result = await response.text();
    const data = JSON.parse(result).data;
    console.log(data);
    if(data.length > 0) {
      loader.classList.remove("loader");
    }
    data.forEach(({ result_object }, index) => {
      if (result_object.latitude && result_object.longitude && !map) {
        initMap(result_object.latitude, result_object.longitude);
      }
      detailsComponent(result_object, index);
      if (map) {
        addMarker(
          result_object.latitude,
          result_object.longitude,
          result_object
        );
      }
    });
  } catch (error) {
    console.error(error);
  }
}

fetchData();
