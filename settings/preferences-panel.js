import { createAccordionCard } from '../../ST-YaKit-chat/shared/ui/accordion.js';
import { enhanceSelect } from '../../ST-YaKit-chat/settings/custom-select.js';

/** 设置页沿用纪实的卡片和下拉样式，外观变化只作用于当前面板。 */
export function createPreferencesPanel({ theme, onNavigationStyleChange }) {
  const el = document.createElement('section');
  el.className = 'yakit-panel__body yakit-map-settings-view';
  el.id = 'yakit-map-settings-view';

  const themeSection = document.createElement('div');
  themeSection.className = 'yakit-preferences-section yakit-card__content';
  themeSection.innerHTML = `
    <label class="field-label" for="yakit-map-theme-select">主题</label>
    <select id="yakit-map-theme-select">
      <option value="forest">林系风(默认)</option>
      <option value="follow">跟随酒馆</option>
      <option value="light">浅色</option>
      <option value="dark">深色</option>
    </select>
    <p class="yakit-preferences-notice">选择界面配色，切换后即时生效。</p>
    <div class="yakit-preferences-section yakit-navigation-style-field">
      <span class="field-label" id="yakit-map-navigation-style-label">导航栏样式</span>
      <div class="yakit-pill-group yakit-segmented yakit-navigation-style" role="radiogroup" aria-labelledby="yakit-map-navigation-style-label">
        <label class="yakit-pill yakit-navigation-style-option">
          <input type="radio" name="yakit-map-navigation-style" value="auto" checked>
          <span>自动</span>
        </label>
        <label class="yakit-pill yakit-navigation-style-option">
          <input type="radio" name="yakit-map-navigation-style" value="top">
          <span>上方</span>
        </label>
        <label class="yakit-pill yakit-navigation-style-option">
          <input type="radio" name="yakit-map-navigation-style" value="bottom">
          <span>下方</span>
        </label>
      </div>
    </div>
  `;
  const themeSelect = themeSection.querySelector('select');
  themeSelect.value = theme.getTheme();
  themeSelect.addEventListener('change', () => theme.setTheme(themeSelect.value));
  themeSection.querySelectorAll('input').forEach(input => {
    input.addEventListener('change', () => {
      if (input.checked) onNavigationStyleChange(input.value);
    });
  });

  const apiContent = document.createElement('div');
  apiContent.className = 'yakit-card__content';
  apiContent.innerHTML = `
    <div class="yakit-api-config-toolbar">
      <div class="yakit-preferences-section">
        <label class="field-label" for="yakit-map-api-config">使用配置</label>
        <select id="yakit-map-api-config" disabled><option value="">未配置</option></select>
      </div>
      <button type="button" class="yakit-btn-primary" disabled>配置 API</button>
    </div>
    <div class="yakit-api-config-list" role="group" aria-label="已保存的副 API"></div>
  `;
  const promptContent = document.createElement('div');
  promptContent.className = 'yakit-card__content yakit-prompt-entries';
  promptContent.innerHTML = `
    <button type="button" class="yakit-card yakit-api-config-card" disabled>内置提示词 ›</button>
    <button type="button" class="yakit-card yakit-api-config-card" disabled>自定义提示词 ›</button>
  `;
  el.append(
    createAccordionCard({ title: '界面设置', contentEl: themeSection }).el,
    createAccordionCard({ title: '副 API', contentEl: apiContent }).el,
    createAccordionCard({ title: '提示词', contentEl: promptContent }).el,
  );

  // 加入页面后再增强下拉框，让浮层随所在页面滚动时收起。
  const controls = [enhanceSelect(themeSelect), enhanceSelect(apiContent.querySelector('select'))];
  return { el, close() { controls.forEach(control => control.close()); } };
}
