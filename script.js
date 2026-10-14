const repositoryList = document.querySelector("#repository-list");
const statusMessage = document.querySelector("#status");

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid star date: ${value}`);
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(date);
}

function createRepositoryItem(event) {
  const { full_name: fullName, html_url: url, description, language } = event.repo;

  if (!fullName || !url || !event.created_at) {
    throw new Error("A repository event is missing its name, URL, or star date.");
  }

  const item = document.createElement("li");
  item.className = "repository-card";

  const link = document.createElement("a");
  link.className = "repository-name";
  link.href = url;
  link.textContent = fullName;
  link.target = "_blank";
  link.rel = "noopener noreferrer";

  const summary = document.createElement("p");
  summary.className = "repository-description";
  summary.textContent = description || "No description provided.";

  const metadata = document.createElement("p");
  metadata.className = "repository-meta";

  const starredDate = document.createElement("span");
  starredDate.textContent = `Starred ${formatDate(event.created_at)}`;
  metadata.append(starredDate);

  if (language) {
    const languageLabel = document.createElement("span");
    languageLabel.textContent = language;
    metadata.append(languageLabel);
  }

  item.append(link, summary, metadata);
  return item;
}

async function loadRepositories() {
  try {
    const response = await fetch("events.json");

    if (!response.ok) {
      throw new Error(`Unable to load repository events (${response.status}).`);
    }

    const events = await response.json();

    if (!Array.isArray(events)) {
      throw new Error("Repository events must be a list.");
    }

    const items = events.map(createRepositoryItem);
    repositoryList.replaceChildren(...items);
    statusMessage.textContent = items.length
      ? ""
      : "No starred repositories yet.";
  } catch (error) {
    statusMessage.classList.add("is-error");
    statusMessage.textContent = `Could not load starred repositories: ${error.message}`;
  }
}

loadRepositories();
