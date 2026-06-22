const supportedLanguages = ["en", "fr"];
const dictionaryCache = new Map();
let activeLanguage = "en";

const getValue = (source, path) => path.split(".").reduce((acc, key) => acc?.[key], source);

const loadDictionary = async (lang) => {
  if (dictionaryCache.has(lang)) {
    return dictionaryCache.get(lang);
  }

  const response = await fetch(`locales/${lang}.json`);
  if (!response.ok) {
    throw new Error(`Could not load localization file: ${lang}`);
  }

  const dictionary = await response.json();
  dictionaryCache.set(lang, dictionary);
  return dictionary;
};

const resolveLanguage = (lang) => (supportedLanguages.includes(lang) ? lang : "en");

const resolveInitialLanguage = () => {
  const urlLanguage = new URLSearchParams(window.location.search).get("lang");
  if (urlLanguage) {
    return resolveLanguage(urlLanguage);
  }

  return resolveLanguage(localStorage.getItem("fab-language"));
};

const renderServices = (items = []) => {
  const target = document.querySelector("[data-services]");
  target.innerHTML = items
    .map(
      (item) => `
        <article class="service-card">
          <img src="${item.image}" alt="${item.title}" loading="lazy">
          <div class="service-card-content">
            <h3>${item.title}</h3>
            <p>${item.copy}</p>
            <ul class="symptom-list">
              ${item.symptoms.map((symptom) => `<li>${symptom}</li>`).join("")}
            </ul>
          </div>
        </article>
      `,
    )
    .join("");
};

const renderProcess = (steps = []) => {
  const target = document.querySelector("[data-process]");
  target.innerHTML = steps
    .map(
      (step, index) => `
        <article class="process-step">
          <span>0${index + 1}</span>
          <h3>${step.title}</h3>
          <p>${step.copy}</p>
        </article>
      `,
    )
    .join("");
};

const renderProjects = (items = []) => {
  const target = document.querySelector("[data-projects]");
  target.innerHTML = items
    .map(
      (item) => `
        <figure class="project-card">
          <img src="${item.image}" alt="${item.title}" loading="lazy">
          <figcaption>${item.title}</figcaption>
        </figure>
      `,
    )
    .join("");
};

const renderStars = (rating = 5) => {
  const normalizedRating = Math.max(0, Math.min(5, Number(rating) || 0));
  return Array.from({ length: 5 }, (_, index) => {
    const isFilled = index < normalizedRating;
    return `<span class="${isFilled ? "star-filled" : "star-empty"}" aria-hidden="true">★</span>`;
  }).join("");
};

const renderReviews = (items = []) => {
  const target = document.querySelector("[data-reviews]");
  target.innerHTML = items
    .map(
      (item) => `
        <article class="review-card">
          <div class="review-stars" aria-label="${item.rating || 5} out of 5 stars">
            ${renderStars(item.rating)}
          </div>
          <blockquote>"${item.quote}"</blockquote>
          <cite>${item.author}</cite>
        </article>
      `,
    )
    .join("");
};

const renderDictionary = (dictionary) => {
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const value = getValue(dictionary, node.dataset.i18n);
    if (value) {
      node.textContent = value;
    }
  });

  renderServices(dictionary.services?.items);
  renderProcess(dictionary.solution?.steps);
  renderProjects(dictionary.projects?.items);
  renderReviews(dictionary.reviews?.items);
};

const setLanguage = async (lang) => {
  activeLanguage = resolveLanguage(lang);

  try {
    const dictionary = await loadDictionary(activeLanguage);
    document.documentElement.lang = activeLanguage;
    document.querySelector("[data-lang-toggle]").textContent = activeLanguage === "en" ? "FR" : "EN";
    renderDictionary(dictionary);
    localStorage.setItem("fab-language", activeLanguage);
  } catch (error) {
    console.error(error);
  }
};

document.querySelector("[data-lang-toggle]").addEventListener("click", () => {
  setLanguage(activeLanguage === "en" ? "fr" : "en");
});

setLanguage(resolveInitialLanguage());
