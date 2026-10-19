
const products = [
  { id: 1, name: "Short Butterfly Locs",         type: "butterfly", length: "short",  price: 250, image: "shortButterlyLocs1.jpg" },
  { id: 2, name: "Medium Butterfly Locs",        type: "butterfly", length: "medium", price: 350, image: "mediumButterflyLocs1.webp" },
  { id: 3, name: "Long Butterfly Locs",          type: "butterfly", length: "long",   price: 450, image: "longButterflyLocs1.jpg" },
  { id: 4, name: "Short Faux Locs",              type: "faux",      length: "short",  price: 250, image: "shortFauxLocs1.webp" },
  { id: 5, name: "Medium Faux Locs",             type: "faux",      length: "medium", price: 350, image: "mediumFauxLocs1.jpg" },
  { id: 6, name: "Long Faux Locs",               type: "faux",      length: "long",   price: 450, image: "longFauxLocs1.jpg" },
  { id: 7, name: "Short Goddess Faux Locs",      type: "goddess",   length: "short",  price: 300, image: "ShortGoddessFauxLocs1.jpg" },
  { id: 8, name: "Medium Goddess Faux Locs",     type: "goddess",   length: "medium", price: 400, image: "mediumGoddessFauxLocs1.jpg" },
  { id: 9, name: "Long Goddess Faux Locs",       type: "goddess",   length: "long",   price: 500, image: "LongGoddessFauxLocs1.jpg" }
];


const typeNames   = { butterfly: "Butterfly locs", faux: "Faux locs", goddess: "Goddess faux locs" };
const lengthNames = { short: "Short", medium: "Medium", long: "Long" };


const $ = (selector) => document.querySelector(selector);


function load(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch (error) {
    return fallback;
  }
}
function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    
  }
}




function showPage(id) {
  const target = document.getElementById(id);
  if (!target || !target.classList.contains("page")) return;

  // hide every page, then show only the chosen one
  document.querySelectorAll(".page").forEach((page) => page.classList.remove("active"));
  target.classList.add("active");

  // highlight the matching nav link
  document.querySelectorAll("nav a").forEach((link) => {
    link.classList.toggle("current", link.dataset.page === id);
  });

  window.scrollTo(0, 0);
}


document.addEventListener("click", (event) => {
  const link = event.target.closest("[data-page]");
  if (!link) return;
  event.preventDefault();                 
  showPage(link.dataset.page);
  history.replaceState(null, "", "#" + link.dataset.page);
});


let textPercent = 100;

function changeTextSize(change) {
  
  textPercent = Math.min(150, Math.max(80, textPercent + change));
  document.documentElement.style.fontSize = textPercent + "%";
}
$("#smaller").addEventListener("click", () => changeTextSize(-10));
$("#larger").addEventListener("click",  () => changeTextSize(10));



function getFilteredProducts() {
  const length = $("#filter-length").value;   
  const type   = $("#filter-type").value;

  return products.filter((product) => {
    const lengthMatches = length === "all" || product.length === length;
    const typeMatches   = type === "all"   || product.type === type;
    return lengthMatches && typeMatches;
  });
}

function renderProducts() {
  const list = getFilteredProducts();
  const container = $("#product-list");

  $("#result-count").textContent =
    list.length + (list.length === 1 ? " product found" : " products found");

  if (list.length === 0) {
    container.innerHTML = "<p>No locs match those filters. Try clearing a filter.</p>";
    return;
  }

  
  container.innerHTML = list.map((product) => {
    const picture = product.image
      ? `<img class="product-photo" src="${product.image}" alt="${product.name}">`
      : `<div class="product-img" role="img" aria-label="Photo of ${product.name} coming soon"></div>`;

    return `
      <article>
        ${picture}
        <h3>${product.name}</h3>
        <p>${typeNames[product.type]} &middot; ${lengthNames[product.length]}</p>
        <p class="price">N$${product.price}</p>
        <button type="button" class="add-to-cart" data-id="${product.id}">Add to cart</button>
      </article>`;
  }).join("");
}


$("#filter-length").addEventListener("change", renderProducts);
$("#filter-type").addEventListener("change", renderProducts);

$("#clear-filters").addEventListener("click", () => {
  $("#filter-length").value = "all";
  $("#filter-type").value = "all";
  renderProducts();
});


$("#product-list").addEventListener("click", (event) => {
  const button = event.target.closest(".add-to-cart");
  if (button) addToCart(Number(button.dataset.id));
});



let cart = load("cart", []);

function addToCart(id) {
  const item = cart.find((entry) => entry.id === id);
  if (item) {
    item.qty++;                       
  } else {
    cart.push({ id: id, qty: 1 });   
  }
  $("#order-message").textContent = "";
  save("cart", cart);
  renderCart();
}

function changeQuantity(id, change) {
  const item = cart.find((entry) => entry.id === id);
  if (!item) return;
  item.qty += change;
  if (item.qty <= 0) {
    cart = cart.filter((entry) => entry.id !== id); 
  }
  save("cart", cart);
  renderCart();
}

function renderCart() {
  const list = $("#cart-items");

  if (cart.length === 0) {
    list.innerHTML = "<li>Your cart is empty.</li>";
    $("#cart-total").textContent = "0";
    return;
  }

  list.innerHTML = cart.map((item) => {
    const product = products.find((p) => p.id === item.id);
    return `
      <li>
        <span class="cart-name">${product.name} &times; ${item.qty}</span>
        <span>N$${product.price * item.qty}</span>
        <span class="qty-controls">
          <button type="button" class="qty-btn" data-action="minus" data-id="${product.id}"
                  aria-label="Remove one ${product.name}">&minus;</button>
          <button type="button" class="qty-btn" data-action="plus" data-id="${product.id}"
                  aria-label="Add one ${product.name}">+</button>
        </span>
      </li>`;
  }).join("");

  
  const total = cart.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.id);
    return sum + product.price * item.qty;
  }, 0);
  $("#cart-total").textContent = total;
}

$("#cart-items").addEventListener("click", (event) => {
  const button = event.target.closest(".qty-btn");
  if (!button) return;
  const id = Number(button.dataset.id);
  changeQuantity(id, button.dataset.action === "plus" ? 1 : -1);
});

$("#checkout-btn").addEventListener("click", () => {
  const message = $("#order-message");

  if (cart.length === 0) {
    message.textContent = "Add at least one item before placing your order.";
    return;
  }

  const method = document.querySelector('input[name="delivery"]:checked').value;
  const total = $("#cart-total").textContent;

  message.textContent =
    "Order received! Total: N$" + total + ". " +
    (method === "yango"
      ? "We will arrange delivery by Yango."
      : "Your order will be ready for pickup.") +
    " We will contact you to confirm payment.";

  cart = [];
  save("cart", cart);
  renderCart();
});




// Block past dates in the date picker
$("#date").min = new Date().toISOString().split("T")[0];

// Show a preview of the uploaded style photo
$("#photo").addEventListener("change", (event) => {
  const file = event.target.files[0];
  const preview = $("#photo-preview");

  if (file && file.type.startsWith("image/")) {
    preview.src = URL.createObjectURL(file);
    preview.hidden = false;
  } else {
    preview.hidden = true;
  }
});

$("#booking-form").addEventListener("submit", (event) => {
  event.preventDefault();                       
  const form = event.target;
  form.classList.add("was-validated");    
  const message = $("#booking-message");
  const errors = [];

  if ($("#name").value.trim().length < 2) errors.push("Enter your full name.");
  if (!$("#email").value || !$("#email").validity.valid) errors.push("Enter a valid email address.");
  if (!/^[+\d][\d\s-]{6,}$/.test($("#phone").value.trim())) errors.push("Enter a valid phone number.");
  if ($("#service").value === "") errors.push("Choose a service.");
  if ($("#date").value === "" || $("#date").value < $("#date").min) errors.push("Choose a date from today onwards.");

  if (errors.length > 0) {
    message.textContent = errors.join(" ");
    return;
  }

  
  const bookings = load("bookings", []);
  bookings.push({
    name: $("#name").value.trim(),
    email: $("#email").value,
    phone: $("#phone").value.trim(),
    contact: document.querySelector('input[name="contact"]:checked').value,
    service: $("#service").value,
    date: $("#date").value,
    notes: $("#notes").value.trim()
  });
  save("bookings", bookings);

  message.textContent =
    "Thank you, " + $("#name").value.trim() + "! Your request is sent. " +
    "The stylist will reply within 24 hours on " +
    document.querySelector('input[name="contact"]:checked').value + ".";

  form.reset();
  form.classList.remove("was-validated");
  $("#photo-preview").hidden = true;
});


const sampleReviews = [
  { name: "Mbitjita", rating: 5, comment: "Great service!" },
  { name: "Beverly", rating: 4, comment: "Wow, what a great experience!" }
];

let reviews = load("reviews", sampleReviews);

function renderReviews() {
  const list = $("#review-list");
  list.innerHTML = "";

  reviews.forEach((review) => {
   
    const box = document.createElement("div");
    box.className = "review";

    const heading = document.createElement("h3");
    heading.textContent = review.name;

    const stars = document.createElement("p");
    stars.className = "stars";
    stars.textContent = "\u2605".repeat(review.rating) + "\u2606".repeat(5 - review.rating);
    stars.setAttribute("aria-label", review.rating + " out of 5 stars");

    const comment = document.createElement("p");
    comment.textContent = review.comment;

    box.append(heading, stars, comment);
    list.append(box);
  });

  const average = $("#average-rating");
  if (reviews.length === 0) {
    average.textContent = "No reviews yet. Be the first!";
  } else {
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    average.textContent =
      "Average rating: " + (sum / reviews.length).toFixed(1) + " / 5 from " +
      reviews.length + (reviews.length === 1 ? " review" : " reviews");
  }
}

$("#review-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.target;
  form.classList.add("was-validated");

  const name = $("#reviewer").value.trim();
  const comment = $("#comment").value.trim();
  if (name === "" || comment === "") return;

  reviews.unshift({    
    name: name,
    rating: Number($("#rating").value),
    comment: comment
  });
  save("reviews", reviews);
  renderReviews();

  form.reset();
  form.classList.remove("was-validated");
});


const galleryImages = [
  { src: "afro1.jpg",                 alt: "Crochet afro" },
  { src: "longButterflyLocs1.jpg",    alt: "Long butterfly locs" },
  { src: "longFauxLocs1.jpg",         alt: "Long faux locs" },
  { src: "LongGoddessFauxLocs1.jpg",  alt: "Long goddess faux locs" },
  { src: "mediumButterflyLocs1.webp", alt: "Medium butterfly locs" },
  { src: "mediumFauxLocs1.jpg",       alt: "Medium faux locs" }
];

let currentSlide = 0;

function showSlide(index) {
  
  currentSlide = (index + galleryImages.length) % galleryImages.length;

  const slide = galleryImages[currentSlide];
  $("#slide-img").src = slide.src;
  $("#slide-img").alt = slide.alt;
  $("#slide-caption").textContent = slide.alt;
  $("#slide-counter").textContent = (currentSlide + 1) + " / " + galleryImages.length;
}

$("#next-slide").addEventListener("click", () => showSlide(currentSlide + 1));
$("#prev-slide").addEventListener("click", () => showSlide(currentSlide - 1));

// Left and right arrow keys also work (only while on the Gallery page)
document.addEventListener("keydown", (event) => {
  if (!$("#gallery").classList.contains("active")) return;
  if (event.key === "ArrowRight") showSlide(currentSlide + 1);
  if (event.key === "ArrowLeft")  showSlide(currentSlide - 1);
});




renderProducts();
renderCart();
renderReviews();
showSlide(0);
showPage(location.hash.slice(1) || "home");
