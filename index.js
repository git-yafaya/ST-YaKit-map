import { buildMainPanel } from './panel/main-panel.js';

/** 酒馆菜单只负责打开界面，弹窗关闭后继续复用。 */
function registerMenuEntry() {
  const menu = document.getElementById('extensionsMenu');
  if (!menu) {
    console.warn('[YaKit-绘界] 未找到酒馆扩展菜单。');
    return;
  }
  if (document.getElementById('yakit-map-menu-entry')) return;

  let panel;
  const entry = document.createElement('button');
  entry.id = 'yakit-map-menu-entry';
  entry.type = 'button';
  entry.className = 'list-group-item yakit-menu-entry';
  const icon = document.createElement('span');
  icon.className = 'yakit-icon yakit-map-menu-icon extensionsMenuExtensionButton';
  icon.setAttribute('aria-hidden', 'true');
  const label = document.createElement('span');
  label.textContent = '绘界';
  entry.append(icon, label);
  entry.addEventListener('click', () => {
    if (!panel) {
      panel = buildMainPanel();
      document.body.append(panel);
    }
    if (!panel.open) {
      panel.showModal();
      panel.dispatchEvent(new Event('yakit:open'));
    }
  });
  menu.append(entry);
}

registerMenuEntry();
