// Affiche la dernière version publiée et pointe les boutons vers ses fichiers.
// Source : GitHub Releases (site sur GitHub Pages) ou /updates/latest.json (site sur le serveur NEXORA).
(function () {
  const cfg = window.NEXORA_SITE || {};
  const info = document.getElementById('release-info');
  const main = document.getElementById('download-main');
  const portable = document.getElementById('download-portable');
  const all = document.getElementById('all-releases');
  for (const a of document.querySelectorAll('a[data-download]:not(#download-main)')) a.href = '#telecharger';
  const mb = (n) => `${Math.round(n / 1048576)} Mo`;
  const show = (v) => {
    main.href = v.setupUrl;
    if (v.portableUrl) portable.href = v.portableUrl;
    else portable.hidden = true;
    const date = new Date(v.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    info.textContent = `Version ${v.version} · ${date}${v.size ? ` · ${mb(v.size)}` : ''}`;
  };
  const none = () => {
    main.removeAttribute('href');
    main.setAttribute('aria-disabled', 'true');
    portable.hidden = true;
    info.textContent = 'Le téléchargement sera disponible dès la première version publiée.';
  };

  if (cfg.owner && cfg.repo) {
    const page = `https://github.com/${cfg.owner}/${cfg.repo}/releases`;
    all.href = page;
    fetch(`https://api.github.com/repos/${cfg.owner}/${cfg.repo}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((rel) => {
        const setup = (rel.assets || []).find((a) => /^NEXORA-Setup-.*\.exe$/.test(a.name));
        const port = (rel.assets || []).find((a) => /^NEXORA-Portable-.*\.exe$/.test(a.name));
        if (!setup) return none();
        show({ version: String(rel.tag_name).replace(/^v/, ''), date: rel.published_at, setupUrl: setup.browser_download_url, portableUrl: port?.browser_download_url, size: setup.size });
      })
      .catch(() => {
        // Limite de l'API GitHub atteinte, par exemple : le lien vers la page des versions reste valable.
        main.href = `${page}/latest`;
        portable.hidden = true;
        info.textContent = 'Téléchargez la dernière version depuis la page des versions.';
      });
    return;
  }

  all.hidden = true;
  fetch('updates/latest.json', { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then((v) =>
      show({ version: v.version, date: v.date, setupUrl: `updates/${encodeURIComponent(v.setup)}`, portableUrl: v.portable ? `updates/${encodeURIComponent(v.portable)}` : null, size: v.setupSize }),
    )
    .catch(none);
})();
