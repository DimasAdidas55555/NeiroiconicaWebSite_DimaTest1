document.querySelectorAll('[data-video-story]').forEach(story => {
  const tabs = [...story.querySelectorAll('[data-video-tab]')];
  const activate = tab => {
    tabs.forEach(item => {
      const active = item === tab;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    story.querySelectorAll('[data-video-panel]').forEach(panel => {
      const active = panel.dataset.videoPanel === tab.dataset.videoTab;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
      if (!active) panel.querySelectorAll('video').forEach(video => video.pause());
    });
  };
  tabs.forEach((tab, i) => {
    tab.tabIndex = i ? -1 : 0;
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', event => {
      const index = event.key === 'ArrowRight' ? (i+1)%tabs.length : event.key === 'ArrowLeft' ? (i+tabs.length-1)%tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length-1 : -1;
      if(index<0)return;
      event.preventDefault();activate(tabs[index]);tabs[index].focus();
    });
  });
});
