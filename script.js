const gallery = document.getElementById("gallery");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxCaption = document.getElementById("lightbox-caption");
const lightboxClose = document.getElementById("lightbox-close");

function openLightbox(src, alt, caption) {
  lightboxImage.src = src;
  lightboxImage.alt = alt;
  lightboxCaption.textContent = caption;
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImage.src = "";
  lightboxImage.alt = "";
  lightboxCaption.textContent = "";
  document.body.style.overflow = "";
}

async function loadPhotos() {
  try {
    const response = await fetch("photos.json");

    if (!response.ok) {
      throw new Error("Could not load photos.json");
    }

    const photos = await response.json();

    if (!Array.isArray(photos) || photos.length === 0) {
      gallery.innerHTML = "<p>No photos found.</p>";
      return;
    }

    const photoMarkup = photos
      .map((photo) => {
        const title = photo.title || "Untitled";
        const alt = photo.alt || title;
        const meta = photo.meta || "";
        const src = photo.src;
        const caption = meta ? `${title} · ${meta}` : title;

        return `
          <figure
            class="photo-card"
            data-src="${src}"
            data-alt="${alt}"
            data-caption="${caption}"
            tabindex="0"
          >
            <img src="${src}" alt="${alt}">
            <figcaption>
              <span class="photo-title">${title}</span>
              <span class="photo-meta">${meta}</span>
            </figcaption>
          </figure>
        `;
      })
      .join("");

    gallery.innerHTML = photoMarkup;
  } catch (error) {
    gallery.innerHTML = "<p>There was a problem loading the photo archive.</p>";
    console.error(error);
  }
}

gallery.addEventListener("click", (event) => {
  const card = event.target.closest(".photo-card");

  if (!card) {
    return;
  }

  openLightbox(
    card.dataset.src,
    card.dataset.alt,
    card.dataset.caption
  );
});

gallery.addEventListener("keydown", (event) => {
  const card = event.target.closest(".photo-card");

  if (!card) {
    return;
  }

  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openLightbox(
      card.dataset.src,
      card.dataset.alt,
      card.dataset.caption
    );
  }
});

lightboxClose.addEventListener("click", closeLightbox);

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
    closeLightbox();
  }
});

const diaryList = document.getElementById("diary-list");

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return map[char];
  });
}

function formatDiaryRating(rating) {
  if (rating === null || rating === undefined || Number.isNaN(Number(rating))) {
    return "No rating";
  }

  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? "½" : "";
  return "★".repeat(fullStars) + halfStar;
}

function formatDiaryDate(dateString) {
  if (!dateString) {
    return "";
  }

  const date = new Date(`${dateString}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

async function loadDiary() {
  if (!diaryList) {
    return;
  }

  try {
    const response = await fetch("letterboxd.json");

    if (!response.ok) {
      throw new Error("Could not load letterboxd.json");
    }

    const entries = await response.json();

    if (!Array.isArray(entries) || entries.length === 0) {
      diaryList.innerHTML = "<p>No diary entries found.</p>";
      return;
    }

    diaryList.innerHTML = entries.map((entry) => {
      const title = escapeHtml(entry.title || "Untitled");
      const year = entry.year ? `<span class="diary-year">${entry.year}</span>` : "";
      const watchedDate = formatDiaryDate(entry.watched_date);
      const rating = formatDiaryRating(Number(entry.rating));
      const rewatch = entry.rewatch ? `<span class="diary-pill">Rewatch</span>` : "";
      const note = entry.note
        ? `<p class="diary-note">${escapeHtml(entry.note)}</p>`
        : "";
      const poster = entry.poster
        ? `<img src="${entry.poster}" alt="${title} poster" loading="lazy">`
        : `<div class="diary-poster-fallback">No poster</div>`;
      const link = entry.link || "https://letterboxd.com/fillyvanilli/diary/";

      return `
        <article class="diary-entry">
          <a
            class="diary-poster"
            href="${link}"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open ${title} on Letterboxd"
          >
            ${poster}
          </a>

          <div class="diary-body">
            <div class="diary-entry-header">
              <h3 class="diary-title">
                <a href="${link}" target="_blank" rel="noopener noreferrer">${title}</a>
              </h3>
              ${year}
            </div>

            <div class="diary-meta">
              <span>${escapeHtml(watchedDate)}</span>
              <span class="diary-rating">${escapeHtml(rating)}</span>
              ${rewatch}
            </div>

            ${note}

            <a
              href="${link}"
              class="diary-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open on Letterboxd
            </a>
          </div>
        </article>
      `;
    }).join("");
  } catch (error) {
    diaryList.innerHTML = "<p>There was a problem loading the diary.</p>";
    console.error(error);
  }
}

loadPhotos();
loadDiary();