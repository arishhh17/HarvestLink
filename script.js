const listings = [
  {
    id: 1,
    farm: "Madhura Women Farmers Group",
    crop: "Tomato",
    district: "Kolar",
    route: "North belt",
    quantity: 1250,
    price: 18,
    urgency: "high",
    cold: false,
    quality: "Grade A mixed crates",
    window: "Today evening",
    daysLeft: 1,
    colors: ["#d9563f", "#f5b942"]
  },
  {
    id: 2,
    farm: "Riverbank Greens Collective",
    crop: "Spinach",
    district: "Mandya",
    route: "River road",
    quantity: 640,
    price: 22,
    urgency: "high",
    cold: true,
    quality: "Washed bunches",
    window: "Today afternoon",
    daysLeft: 1,
    colors: ["#16764f", "#8ccf78"]
  },
  {
    id: 3,
    farm: "Nandi Hills Orchard",
    crop: "Mango",
    district: "Chikkaballapur",
    route: "Hill farms",
    quantity: 980,
    price: 38,
    urgency: "medium",
    cold: false,
    quality: "Table fruit, ripening",
    window: "Tomorrow morning",
    daysLeft: 3,
    colors: ["#f5b942", "#ef7d37"]
  },
  {
    id: 4,
    farm: "Coastal Roots FPO",
    crop: "Onion",
    district: "Udupi",
    route: "Coastal route",
    quantity: 2100,
    price: 15,
    urgency: "low",
    cold: false,
    quality: "Dry sorted sacks",
    window: "Next 2 days",
    daysLeft: 5,
    colors: ["#b85a77", "#e5b7c7"]
  },
  {
    id: 5,
    farm: "Sunrise Vegetable Cluster",
    crop: "Beans",
    district: "Hoskote",
    route: "North belt",
    quantity: 760,
    price: 31,
    urgency: "medium",
    cold: true,
    quality: "Tender harvest",
    window: "Tomorrow morning",
    daysLeft: 2,
    colors: ["#2f9d73", "#6ec6a2"]
  },
  {
    id: 6,
    farm: "Lakeview Growers",
    crop: "Tomato",
    district: "Ramanagara",
    route: "River road",
    quantity: 890,
    price: 17,
    urgency: "high",
    cold: false,
    quality: "Processing grade",
    window: "Today evening",
    daysLeft: 1,
    colors: ["#cf4b3c", "#ffb347"]
  }
];

const buyers = [
  {
    id: 101,
    org: "FreshKart Kitchens",
    location: "Bengaluru",
    route: "North belt",
    crops: ["Tomato", "Beans", "Mango"],
    demand: 1600,
    priceCap: 28,
    cold: true,
    pickup: "Today evening",
    reliability: 96,
    type: "Institutional kitchen"
  },
  {
    id: 102,
    org: "Saha Food Processors",
    location: "Mysuru Road",
    route: "River road",
    crops: ["Tomato", "Spinach"],
    demand: 2200,
    priceCap: 24,
    cold: true,
    pickup: "Today afternoon",
    reliability: 91,
    type: "Processor"
  },
  {
    id: 103,
    org: "Hotel Cluster Cooperative",
    location: "Airport corridor",
    route: "Hill farms",
    crops: ["Mango", "Beans", "Spinach"],
    demand: 1000,
    priceCap: 45,
    cold: false,
    pickup: "Tomorrow morning",
    reliability: 88,
    type: "Hospitality buyer"
  },
  {
    id: 104,
    org: "Community Retail Network",
    location: "Mangaluru",
    route: "Coastal route",
    crops: ["Onion", "Tomato"],
    demand: 2500,
    priceCap: 20,
    cold: false,
    pickup: "Next 2 days",
    reliability: 93,
    type: "Retail distributor"
  }
];

let selectedIds = new Set([1, 5]);

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

const number = new Intl.NumberFormat("en-IN");

const qs = (selector) => document.querySelector(selector);
const qsa = (selector) => [...document.querySelectorAll(selector)];

const elements = {
  listingGrid: qs("#listingGrid"),
  resultCount: qs("#resultCount"),
  cropFilter: qs("#cropFilter"),
  routeFilter: qs("#routeFilter"),
  urgencyFilter: qs("#urgencyFilter"),
  coldFilter: qs("#coldFilter"),
  searchInput: qs("#searchInput"),
  selectedLoads: qs("#selectedLoads"),
  poolLoad: qs("#poolLoad"),
  poolVehicle: qs("#poolVehicle"),
  poolSaving: qs("#poolSaving"),
  matchListingSelect: qs("#matchListingSelect"),
  matchGrid: qs("#matchGrid"),
  toast: qs("#toast"),
  manifestDialog: qs("#manifestDialog"),
  manifestIntro: qs("#manifestIntro"),
  manifestList: qs("#manifestList"),
  manifestSaving: qs("#manifestSaving")
};

function formatKg(value) {
  return `${number.format(value)} kg`;
}

function normalize(value) {
  return String(value).trim().toLowerCase();
}

function unique(values) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function fillSelect(select, values) {
  const current = select.value;
  const first = select.querySelector("option").outerHTML;
  select.innerHTML = first + values.map((value) => `<option value="${value}">${value}</option>`).join("");
  if ([...select.options].some((option) => option.value === current)) {
    select.value = current;
  }
}

function hydrateFilters() {
  fillSelect(elements.cropFilter, unique(listings.map((listing) => listing.crop)));
  fillSelect(elements.routeFilter, unique(listings.map((listing) => listing.route)));
  elements.matchListingSelect.innerHTML = listings
    .map((listing) => `<option value="${listing.id}">${listing.crop} from ${listing.farm}</option>`)
    .join("");
}

function getFilteredListings() {
  const search = normalize(elements.searchInput.value);
  const crop = elements.cropFilter.value;
  const route = elements.routeFilter.value;
  const urgency = elements.urgencyFilter.value;
  const coldOnly = elements.coldFilter.checked;

  return listings.filter((listing) => {
    const haystack = normalize(`${listing.farm} ${listing.crop} ${listing.district} ${listing.route}`);
    return (
      (!search || haystack.includes(search)) &&
      (crop === "all" || listing.crop === crop) &&
      (route === "all" || listing.route === route) &&
      (urgency === "all" || listing.urgency === urgency) &&
      (!coldOnly || listing.cold)
    );
  });
}

function urgencyLabel(urgency) {
  const labels = {
    high: "High urgency",
    medium: "Medium urgency",
    low: "Low urgency"
  };
  return labels[urgency] || urgency;
}

function renderListings() {
  const filtered = getFilteredListings();
  elements.resultCount.textContent = `Showing ${filtered.length} ${filtered.length === 1 ? "lot" : "lots"}`;

  if (!filtered.length) {
    elements.listingGrid.innerHTML = `<div class="empty-state">No surplus lots match these filters. Try a wider route or remove cold-chain only.</div>`;
    return;
  }

  elements.listingGrid.innerHTML = filtered
    .map((listing) => {
      const selected = selectedIds.has(listing.id);
      return `
        <article class="listing-card">
          <div class="crop-visual" style="--crop-a: ${listing.colors[0]}; --crop-b: ${listing.colors[1]}">
            <span class="crop-chip">${listing.crop}</span>
          </div>
          <div class="listing-body">
            <div class="listing-top">
              <div>
                <strong>${listing.farm}</strong>
                <span>${listing.district} | ${listing.route}</span>
              </div>
              <div class="price">Rs. ${listing.price}/kg</div>
            </div>
            <div class="listing-meta">
              <div><span>Quantity</span><strong>${formatKg(listing.quantity)}</strong></div>
              <div><span>Window</span><strong>${listing.window}</strong></div>
              <div><span>Need</span><strong>${listing.cold ? "Cold-chain" : "Ambient"}</strong></div>
            </div>
            <p>${listing.quality}. ${urgencyLabel(listing.urgency)} with ${listing.daysLeft} day${listing.daysLeft === 1 ? "" : "s"} of quality window.</p>
            <div class="card-actions">
              <button class="ghost-button" type="button" data-match="${listing.id}">Find buyers</button>
              <button class="${selected ? "secondary-action" : "primary-action"}" type="button" data-select="${listing.id}">
                ${selected ? "Selected" : "Add to pool"}
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function buyerScore(listing, buyer) {
  let score = 0;
  const reasons = [];

  if (buyer.crops.includes(listing.crop)) {
    score += 34;
    reasons.push("Crop demand matches");
  }

  if (buyer.route === listing.route) {
    score += 24;
    reasons.push("Same transport route");
  }

  if (buyer.priceCap >= listing.price) {
    const margin = buyer.priceCap - listing.price;
    score += Math.min(18, 10 + margin);
    reasons.push(`Price fits up to Rs. ${buyer.priceCap}/kg`);
  }

  if (!listing.cold || buyer.cold) {
    score += 12;
    reasons.push(listing.cold ? "Buyer can handle cold-chain" : "No cold-chain constraint");
  }

  const quantityFit = Math.min(listing.quantity, buyer.demand) / Math.max(listing.quantity, buyer.demand);
  score += Math.round(quantityFit * 12);
  reasons.push(`${Math.round(quantityFit * 100)}% quantity fit`);

  score += Math.round((buyer.reliability - 80) / 4);

  return {
    buyer,
    score: Math.min(99, Math.max(0, score)),
    reasons: reasons.slice(0, 4)
  };
}

function renderMatches(listingId = Number(elements.matchListingSelect.value || listings[0].id)) {
  const listing = listings.find((item) => item.id === Number(listingId)) || listings[0];
  elements.matchListingSelect.value = String(listing.id);

  const matches = buyers
    .map((buyer) => buyerScore(listing, buyer))
    .filter((match) => match.score >= 36)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (!matches.length) {
    elements.matchGrid.innerHTML = `<div class="empty-state">No strong buyer match yet. Post this lot to nearby aggregators or adjust price expectations.</div>`;
    return;
  }

  elements.matchGrid.innerHTML = matches
    .map(({ buyer, score, reasons }) => {
      const savedLoss = Math.round(listing.quantity * (listing.urgency === "high" ? 0.16 : 0.09));
      return `
        <article class="match-card">
          <header>
            <div>
              <span class="score-pill">${score}% fit</span>
              <h3>${buyer.org}</h3>
            </div>
          </header>
          <p>${buyer.type} in ${buyer.location}. Needs up to ${formatKg(buyer.demand)}. Pickup: ${buyer.pickup}.</p>
          <ul class="match-reasons">
            ${reasons.map((reason) => `<li>${reason}</li>`).join("")}
          </ul>
          <button class="primary-action full" type="button" data-reserve="${buyer.id}" data-listing="${listing.id}">
            Reserve ${formatKg(savedLoss)} at risk
          </button>
        </article>
      `;
    })
    .join("");
}

function renderPool() {
  const selected = listings.filter((listing) => selectedIds.has(listing.id));
  const totalLoad = selected.reduce((sum, listing) => sum + listing.quantity, 0);
  const saving = Math.round(totalLoad * 2.8);
  const vehicle =
    totalLoad > 2600 ? "Medium truck" : totalLoad > 1200 ? "Mini truck" : totalLoad > 0 ? "Pickup van" : "Mini truck";

  elements.poolLoad.textContent = formatKg(totalLoad);
  elements.poolVehicle.textContent = vehicle;
  elements.poolSaving.textContent = currency.format(saving);

  if (!selected.length) {
    elements.selectedLoads.innerHTML = `<p class="empty-state">Select surplus lots to build a shared route.</p>`;
  } else {
    elements.selectedLoads.innerHTML = selected
      .map(
        (listing) => `
        <div class="selected-load">
          <span>${listing.crop} | ${listing.district}</span>
          <strong>${formatKg(listing.quantity)}</strong>
        </div>
      `
      )
      .join("");
  }

  updateMetrics();
}

function updateMetrics() {
  const surplus = listings.reduce((sum, listing) => sum + listing.quantity, 0);
  const demand = buyers.reduce((sum, buyer) => sum + buyer.demand, 0);
  const selected = listings.filter((listing) => selectedIds.has(listing.id));
  const urgentSelected = selected.reduce((sum, listing) => {
    const riskRate = listing.urgency === "high" ? 0.16 : listing.urgency === "medium" ? 0.1 : 0.05;
    return sum + Math.round(listing.quantity * riskRate);
  }, 0);

  qs("#metricSurplus").textContent = formatKg(surplus);
  qs("#metricDemand").textContent = formatKg(demand);
  qs("#metricVehicles").textContent = "4";
  qs("#metricLoss").textContent = selected.length ? "22%" : "0%";
  qs("#impactLossKg").textContent = formatKg(urgentSelected);
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => elements.toast.classList.remove("show"), 2800);
}

function toggleSelected(id) {
  if (selectedIds.has(id)) {
    selectedIds.delete(id);
  } else {
    selectedIds.add(id);
  }
  renderListings();
  renderPool();
}

function createManifest() {
  const selected = listings.filter((listing) => selectedIds.has(listing.id));
  if (!selected.length) {
    showToast("Select at least one surplus lot before creating a manifest.");
    return;
  }

  const load = selected.reduce((sum, listing) => sum + listing.quantity, 0);
  const saving = Math.round(load * 2.8);
  elements.manifestIntro.textContent = `${selected.length} pickup stop${selected.length === 1 ? "" : "s"} grouped into one dispatch with ${formatKg(load)} total load.`;
  elements.manifestList.innerHTML = selected
    .map(
      (listing) => `
      <div class="manifest-row">
        <div>
          <strong>${listing.farm}</strong>
          <p>${listing.crop}, ${listing.district}, ${listing.window}</p>
        </div>
        <strong>${formatKg(listing.quantity)}</strong>
      </div>
    `
    )
    .join("");
  elements.manifestSaving.textContent = `Estimated shared transport saving: ${currency.format(saving)}`;
  elements.manifestDialog.showModal();
}

function addListing(event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const crop = data.get("crop").trim();
  const listing = {
    id: Date.now(),
    farm: data.get("farm").trim(),
    crop,
    district: data.get("district").trim(),
    route: data.get("route"),
    quantity: Number(data.get("quantity")),
    price: Number(data.get("price")),
    urgency: data.get("urgency"),
    cold: data.has("cold"),
    quality: "Newly posted lot",
    window: data.get("urgency") === "high" ? "Today evening" : "Tomorrow morning",
    daysLeft: data.get("urgency") === "high" ? 1 : 3,
    colors: ["#276f9f", "#6ec6a2"]
  };
  listings.unshift(listing);
  selectedIds.add(listing.id);
  hydrateFilters();
  renderAll();
  event.currentTarget.reset();
  showToast(`${crop} surplus added and selected for pooling.`);
}

function addBuyer(event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const crop = data.get("crop").trim();
  buyers.unshift({
    id: Date.now(),
    org: data.get("org").trim(),
    location: data.get("location").trim(),
    route: data.get("route"),
    crops: [crop],
    demand: Number(data.get("demand")),
    priceCap: Number(data.get("priceCap")),
    cold: data.has("cold"),
    pickup: data.get("pickup"),
    reliability: 86,
    type: "New buyer request"
  });
  renderMatches();
  updateMetrics();
  event.currentTarget.reset();
  showToast(`${crop} buyer request added to matching.`);
}

function renderAll() {
  renderListings();
  renderPool();
  renderMatches();
}

function bindEvents() {
  qsa("[data-scroll-target]").forEach((button) => {
    button.addEventListener("click", () => qs(button.dataset.scrollTarget).scrollIntoView({ behavior: "smooth" }));
  });

  qsa("#filters input, #filters select").forEach((input) => {
    input.addEventListener("input", renderListings);
    input.addEventListener("change", renderListings);
  });

  qs("#clearFilters").addEventListener("click", () => {
    elements.searchInput.value = "";
    elements.cropFilter.value = "all";
    elements.routeFilter.value = "all";
    elements.urgencyFilter.value = "all";
    elements.coldFilter.checked = false;
    renderListings();
  });

  elements.listingGrid.addEventListener("click", (event) => {
    const selectButton = event.target.closest("[data-select]");
    const matchButton = event.target.closest("[data-match]");

    if (selectButton) {
      toggleSelected(Number(selectButton.dataset.select));
    }

    if (matchButton) {
      renderMatches(Number(matchButton.dataset.match));
      qs("#matches").scrollIntoView({ behavior: "smooth" });
    }
  });

  elements.matchListingSelect.addEventListener("change", () => renderMatches());
  qs("#refreshMatches").addEventListener("click", () => {
    renderMatches();
    showToast("Buyer matches refreshed.");
  });

  elements.matchGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-reserve]");
    if (!button) return;
    const listing = listings.find((item) => item.id === Number(button.dataset.listing));
    const buyer = buyers.find((item) => item.id === Number(button.dataset.reserve));
    showToast(`${buyer.org} reserved interest in ${listing.crop} from ${listing.farm}.`);
  });

  qsa("[data-route-pick]").forEach((button) => {
    button.addEventListener("click", () => {
      elements.routeFilter.value = button.dataset.routePick;
      renderListings();
      qs("#marketplace").scrollIntoView({ behavior: "smooth" });
    });
  });

  qs("#createManifest").addEventListener("click", createManifest);
  qs("#closeManifest").addEventListener("click", () => elements.manifestDialog.close());
  qs("#confirmManifest").addEventListener("click", () => {
    elements.manifestDialog.close();
    showToast("Shared pickup confirmed for dispatcher review.");
  });

  qs("#surplusForm").addEventListener("submit", addListing);
  qs("#buyerForm").addEventListener("submit", addBuyer);
}

hydrateFilters();
bindEvents();
renderAll();
