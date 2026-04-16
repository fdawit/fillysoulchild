async function loadPhotos() {
  const gallery = document.getElementById("gallery");

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

        return `
          <figure class="photo-card">
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

loadPhotos();