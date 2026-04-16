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

loadPhotos();