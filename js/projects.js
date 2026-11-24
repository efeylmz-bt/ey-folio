/* =========================================
   DYNAMIC PROJECT RENDERER & DETAIL VIEW
   ========================================= */

   document.addEventListener("DOMContentLoaded", async () => {
    const listContainer = document.querySelector("[data-projects-container]");
    const detailContainer = document.querySelector("[data-project-detail]");
    const demoContainer = document.querySelector("[data-project-demo]");
  
    if (!listContainer && !detailContainer && !demoContainer) return;
  
    try {
      const response = await fetch("data/projects.json");
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
  
      const allProjects = await response.json();
  
      if (listContainer) {
        renderProjectList(listContainer, allProjects);
      }
  
      if (detailContainer) {
        renderProjectDetail(detailContainer, allProjects);
      }
  
      if (demoContainer) {
        renderProjectDemo(demoContainer, allProjects);
      }
    } catch (error) {
      console.error("Projeler yüklenirken hata oluştu:", error);
      const target = listContainer || detailContainer || demoContainer;
      target.innerHTML = `
        <div class="empty-state">
          Veriler yüklenemedi. Sayfayı Live Server üzerinden açtığından emin ol.
        </div>
      `;
    }
  });
  
  function renderProjectDemo(container, allProjects) {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get("id");
    const project = allProjects.find((item) => item.id === projectId);
  
    if (!project) {
      container.innerHTML = `
        <div class="empty-state">
          Demo bulunamadı. <a href="projects.html" class="action-link">Projelere geri dön →</a>
        </div>
      `;
      return;
    }
  
    const backDetailLink = document.getElementById("back-to-detail");
    if (backDetailLink) {
      backDetailLink.setAttribute("href", `project.html?id=${encodeURIComponent(project.id)}`);
    }
  
    document.title = `${project.title} — Canlı Demo`;
  
    const tagsHtml = Array.isArray(project.tags)
      ? project.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")
      : "";
  
    const highlightsHtml = Array.isArray(project.highlights) && project.highlights.length
      ? project.highlights.map((item) => `
        <div class="preview-metric-box">
          <div class="timeline-date">MODÜL / ÖZELLİK</div>
          <div style="font-weight: 600;">${escapeHtml(item)}</div>
        </div>
      `).join("")
      : "";
  
    container.innerHTML = `
      <div class="panel-card">
        <div class="preview-topbar">
          <span class="preview-dots">
            <span></span>
            <span></span>
            <span></span>
          </span>
          <span>demo / ${escapeHtml(project.id || "preview")}</span>
        </div>
  
        <div class="project-meta">
          <span>${escapeHtml(project.category || "")}</span>
          <span>${escapeHtml(project.year || "")}</span>
        </div>
  
        <h1 style="font-size: var(--text-3xl); margin-bottom: var(--space-3);">
          ${escapeHtml(project.title || "")} — Canlı Demo
        </h1>
  
        <p style="color: var(--color-text-muted); margin-bottom: var(--space-6);">
          ${escapeHtml(project.details || project.summary || "")}
        </p>
  
        <div class="two-col-grid" style="margin-bottom: var(--space-6);">
          ${highlightsHtml}
        </div>
  
        <div class="tag-list">${tagsHtml}</div>
      </div>
    `;
  }
  
  function renderProjectList(container, allProjects) {
    const onlyFeatured = container.hasAttribute("data-projects-featured");
    const limitAttr = container.getAttribute("data-projects-limit");
    const limit = limitAttr ? Number(limitAttr) : null;
  
    let projects = [...allProjects];
  
    if (onlyFeatured) {
      projects = projects.filter((item) => item.featured === true);
    }
  
    if (limit && Number.isFinite(limit)) {
      projects = projects.slice(0, limit);
    }
  
    if (!projects.length) {
      container.innerHTML = `<div class="empty-state">Gösterilecek proje bulunamadı.</div>`;
      return;
    }
  
    container.classList.add("projects-grid");
    container.innerHTML = projects.map(createProjectCard).join("");
  }
  
  function renderProjectDetail(container, allProjects) {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get("id");
    const project = allProjects.find((item) => item.id === projectId);
  
    if (!project) {
      container.innerHTML = `
        <div class="empty-state">
          Aradığın proje bulunamadı. <a href="projects.html" class="action-link">Projelere geri dön →</a>
        </div>
      `;
      return;
    }
  
    document.title = `${project.title} — EY · Folio`;
  
    const tagsHtml = Array.isArray(project.tags)
      ? project.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")
      : "";
  
    const highlightsHtml = Array.isArray(project.highlights) && project.highlights.length
      ? `
        <div style="margin-top: var(--space-6);">
          <div class="timeline-date">ÖNE ÇIKAN ÖZELLİKLER</div>
          <ul style="display: flex; flex-direction: column; gap: var(--space-2); margin-top: var(--space-2); color: var(--color-text-muted); font-size: var(--text-sm);">
            ${project.highlights.map((point) => `<li>• ${escapeHtml(point)}</li>`).join("")}
          </ul>
        </div>
      `
      : "";
  
    container.innerHTML = `
      <article class="panel-card" style="max-width: 780px;">
        <div class="project-meta">
          <span>${escapeHtml(project.category || "")}</span>
          <span>${escapeHtml(project.year || "")}</span>
        </div>
  
        <h1 style="font-size: var(--text-3xl); margin-bottom: var(--space-3);">
          ${escapeHtml(project.title || "")}
        </h1>
  
        <p style="font-size: var(--text-lg); color: var(--color-text-muted);">
          ${escapeHtml(project.summary || "")}
        </p>
  
        ${project.details ? `
          <p style="margin-top: var(--space-4); color: var(--color-text); font-size: var(--text-base);">
            ${escapeHtml(project.details)}
          </p>
        ` : ""}
  
        ${highlightsHtml}
  
        <div class="tag-list" style="margin-top: var(--space-6);">
          ${tagsHtml}
        </div>
  
        <div class="project-actions" style="margin-top: var(--space-6);">
          <button type="button" class="btn-primary" id="open-live-preview">Canlı Önizleme</button>
          ${project.repoUrl ? `<a href="${escapeAttribute(project.repoUrl)}" target="_blank" rel="noopener noreferrer" class="btn-secondary">Kaynak Kod (GitHub)</a>` : ""}
        </div>
      </article>
  
      <div class="preview-modal-backdrop" id="preview-modal" role="dialog" aria-modal="true" aria-labelledby="preview-modal-title">
        <div class="preview-modal-box">
          <div class="preview-modal-header">
            <div>
              <div class="timeline-date">CANLI ÖNİZLEME MODU</div>
              <h2 id="preview-modal-title" style="font-size: var(--text-xl);">${escapeHtml(project.title || "")}</h2>
            </div>
            <button type="button" class="preview-modal-close" id="close-live-preview">Kapat ✕</button>
          </div>
  
          <div class="preview-stage">
            <div class="project-meta" style="margin-bottom: var(--space-2);">
              <span>${escapeHtml(project.category || "")}</span>
              <span>${escapeHtml(project.year || "")}</span>
            </div>
            <p style="font-weight: 600; margin-bottom: var(--space-2);">${escapeHtml(project.summary || "")}</p>
            <p class="project-summary">
              ${escapeHtml(project.details || "Bu proje modüler yapısı ve örnek verileriyle önizleme modunda görüntüleniyor.")}
            </p>
            <div class="tag-list">${tagsHtml}</div>
          </div>
  
          <div style="display: flex; justify-content: flex-end; gap: var(--space-3); flex-wrap: wrap;">
            ${project.liveUrl && project.liveUrl.startsWith("http")
              ? `<a href="${escapeAttribute(project.liveUrl)}" target="_blank" rel="noopener noreferrer" class="btn-primary">Yeni Sekmede Aç ↗</a>`
              : `<a href="${escapeAttribute(project.liveUrl || "index.html")}" class="btn-primary">İlgili Sayfaya Git →</a>`
            }
          </div>
        </div>
      </div>
    `;
  
    const openBtn = document.getElementById("open-live-preview");
    const closeBtn = document.getElementById("close-live-preview");
    const modal = document.getElementById("preview-modal");
  
    if (openBtn && modal) {
      openBtn.addEventListener("click", () => {
        modal.classList.add("is-open");
      });
    }
  
    if (closeBtn && modal) {
      closeBtn.addEventListener("click", () => {
        modal.classList.remove("is-open");
      });
    }
  
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.remove("is-open");
        }
      });
    }
  }
  
  function createProjectCard(project) {
    const tagsHtml = Array.isArray(project.tags)
      ? project.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")
      : "";
  
    const detailHref = project.id
      ? `project.html?id=${encodeURIComponent(project.id)}`
      : (project.liveUrl || "projects.html");
  
    return `
      <article class="project-card">
        <div>
          <div class="project-meta">
            <span>${escapeHtml(project.category || "")}</span>
            <span>${escapeHtml(project.year || "")}</span>
          </div>
          <h3 class="project-title">${escapeHtml(project.title || "")}</h3>
          <p class="project-summary">${escapeHtml(project.summary || "")}</p>
          <div class="tag-list">${tagsHtml}</div>
        </div>
  
        <div class="project-actions">
          <a href="${escapeAttribute(detailHref)}" class="action-link">İncele →</a>
          ${project.repoUrl ? `<a href="${escapeAttribute(project.repoUrl)}" target="_blank" rel="noopener noreferrer" class="action-link action-link--muted">Kaynak Kod</a>` : ""}
        </div>
      </article>
    `;
  }
  
  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }
  
  function escapeAttribute(value) {
    const cleaned = String(value).trim();
    if (cleaned.toLowerCase().startsWith("javascript:")) {
      return "#";
    }
    return escapeHtml(cleaned);
  }