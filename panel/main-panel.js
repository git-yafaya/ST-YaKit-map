import { YaKitTheme } from '../../ST-YaKit-chat/shared/theme/theme.js';
import { createNavigation, resolveNavigationStyle } from '../../ST-YaKit-chat/shared/ui/navigation.js';
import { attachDialogMotion } from '../../ST-YaKit-chat/panel/dialog-motion.js';
import { createMapPage } from './map-page.js';
import { createPreferencesPanel } from '../settings/preferences-panel.js';

/** 组装绘界面板，页面切换和关闭沿用纪实的交互。 */
export function buildMainPanel() {
  const root = document.createElement('dialog');
  root.id = 'yakit-map-panel';
  root.className = 'yakit-panel';
  root.dataset.view = 'map';
  // 自动跟随当前文档的设备类型，手动选择只保留在当前面板。
  const applyNavigationStyle = value => {
    root.dataset.navigationStyle = resolveNavigationStyle(value, root.ownerDocument.defaultView.navigator);
  };
  applyNavigationStyle('auto');
  root.setAttribute('aria-labelledby', 'yakit-map-title');
  // 每个面板使用自己的主题容器，共用纪实的主题切换方法。
  const theme = { ...YaKitTheme };
  theme.init(root);
  const closePanel = attachDialogMotion(root);

  const header = document.createElement('header');
  header.className = 'yakit-panel__header';
  // 标题始终放在顶部，页签单独排列并保留上下切换。
  const heading = document.createElement('div');
  heading.className = 'yakit-header-navigation';
  heading.innerHTML = `
    <span class="yakit-icon yakit-map-menu-icon yakit-brand-icon" aria-hidden="true"></span>
    <h2 class="yakit-panel__title" id="yakit-map-title">YaKit-绘界</h2>
  `;
  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'yakit-icon-btn';
  closeButton.setAttribute('aria-label', '关闭绘界');
  closeButton.textContent = '×';
  closeButton.addEventListener('click', closePanel);

  const preferences = createPreferencesPanel({
    theme,
    onNavigationStyleChange: applyNavigationStyle,
  });
  const views = { map: createMapPage(), settings: preferences.el };
  const tabs = createNavigation({
    idPrefix: 'yakit-map-navigation',
    items: [
      { value: 'map', label: '地图', icon: '../../ST-YaKit-map/icons/map', panelId: views.map.id },
      { value: 'settings', label: '设置', icon: 'nav-settings', panelId: views.settings.id },
    ],
    onChange: switchView,
  });
  const viewport = document.createElement('div');
  viewport.className = 'yakit-map-viewport';
  const track = document.createElement('div');
  track.className = 'yakit-map-track';
  for (const [name, view] of Object.entries(views)) {
    view.setAttribute('role', 'tabpanel');
    view.setAttribute('aria-labelledby', `yakit-map-navigation-${name}`);
    track.append(view);
  }
  viewport.append(track);

  header.append(heading, closeButton);
  root.append(header, tabs.el, viewport);

  // 隐藏页跳过键盘和读屏访问，视觉平移交给共用尺寸的页面轨道。
  function switchView(name) {
    preferences.close();
    root.dataset.view = name;
    for (const [key, view] of Object.entries(views)) {
      view.inert = key !== name;
      view.setAttribute('aria-hidden', String(view.inert));
    }
    tabs.setActive(name);
  }
  switchView('map');

  // 只有按下和松开都在遮罩上时关闭，避免拖动面板内容时误关。
  let backdropPressed = false;
  const outsidePanel = event => {
    const rect = root.getBoundingClientRect();
    return event.target === root && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom);
  };
  root.addEventListener('pointerdown', event => { backdropPressed = outsidePanel(event); });
  root.addEventListener('click', event => {
    if (backdropPressed && outsidePanel(event)) closePanel();
    backdropPressed = false;
  });
  root.addEventListener('cancel', () => preferences.close());
  root.addEventListener('close', () => switchView('map'));
  return root;
}
