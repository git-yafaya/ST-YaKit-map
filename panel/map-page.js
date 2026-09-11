import { YaKitIcon } from '../../ST-YaKit-chat/shared/ui/icon.js';

/** 地图常驻卡片，页面名称由导航栏提供。 */
export function createMapPage() {
  const el = document.createElement('section');
  el.className = 'yakit-panel__body yakit-map-view';
  el.id = 'yakit-map-view';

  const content = document.createElement('div');
  content.className = 'yakit-card__content yakit-map-canvas';
  const empty = document.createElement('div');
  empty.className = 'yakit-map-empty';
  empty.innerHTML = '<p>暂无地图</p>';
  YaKitIcon.createElement('layers', { size: 40 }).then(icon => {
    icon.setAttribute('aria-hidden', 'true');
    empty.prepend(icon);
  });
  content.append(empty);

  const card = document.createElement('div');
  card.className = 'yakit-card yakit-map-canvas-card';
  card.append(content);
  el.append(card);
  return el;
}
