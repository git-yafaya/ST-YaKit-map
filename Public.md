# YaKit-绘界 · 仓库与公开接口说明

YaKit-绘界是 SillyTavern 地图扩展，目前提供界面预览及主题、导航布局切换；源码使用原生 JavaScript ES Modules、CSS 和 SVG，无需构建，公共 UI 依赖同级 `ST-YaKit-chat`。

## 仓库结构

```text
ST-YaKit-map/
├── .gitignore                      本地文件排除规则
├── AGENTS.md                       项目开发与人工验收规范
├── manifest.json                   扩展信息及加载入口
├── index.js                        酒馆菜单注册和弹窗打开
├── style.css                       共享主题与本地样式入口
├── icons/
│   └── map.svg                     扩展入口、标题栏与地图页签共用的图标
├── panel/
│   ├── main-panel.js               标题栏、自动导航、主题容器和弹窗交互
│   └── map-page.js                 固定地图卡片与空态
├── settings/
│   └── preferences-panel.js        设置分组、主题及三项导航样式选项
├── styles/
│   ├── panel.css                   入口与标题图标、窗口、导航和响应式动效样式
│   ├── content.css                 卡片与地图空态样式
│   └── preferences.css             设置控件、下拉浮层与主题状态样式
├── tests/                          本地检查目录，不提交
│   └── navigation-style.test.mjs    导航设置、图标与会话保留检查
├── README.md                       用户安装与使用说明
└── Public.md                       结构、接入状态与验证说明
```

以下文件由同级纪实扩展提供，绘界直接引用，不加载纪实的入口或业务模块：

| 外部文件（相对于纪实目录） | 用途 |
| --- | --- |
| `shared/theme/tokens.css` | 主题颜色与圆角变量 |
| `shared/theme/theme.js` | 主题控制方法，由绘界独立的控制对象调用 |
| `shared/ui/navigation.css` | 导航选中底色与滑动动效 |
| `styles/motion.css` | 弹窗与遮罩的进退场关键帧 |
| `shared/ui/icon.js`、`icons/layers.svg`、`icons/nav-settings.svg` | 空态和导航图标加载；地图页签使用绘界本地 SVG |
| `shared/ui/accordion.js` | 折叠卡片与可访问状态 |
| `shared/ui/navigation.js` | 页签选择、方向键及 Home/End 导航；`resolveNavigationStyle(value, device)` 解析自动位置 |
| `settings/custom-select.js` | 主题与配置下拉框的外观、键盘操作和浮层 |
| `panel/dialog-motion.js` | 关闭按钮、Esc 和遮罩的退场过程 |

纪实的页面专用 CSS 绑定了自身弹窗 ID；绘界在自己的 ID 下按相同样式定义窗口和卡片，避免再次引入页面专用规则改变纪实布局。

## 加载与数据流

1. 酒馆读取 `manifest.json`，加载 `index.js` 和 `style.css`，随后解析引用的共享文件。
2. 入口向 `#extensionsMenu` 添加带地图图标的“绘界”按钮；菜单不存在时输出提示并停止注册，已有同名入口时不重复创建。
3. 首次点击创建一个原生 `dialog`，初始化独立主题对象，组装地图页、设置页和导航，通过 `showModal()` 打开；后续打开复用原节点。
4. 顶部标题栏左侧为地图图标和“YaKit-绘界”，右侧为关闭按钮；弹窗通过 `aria-labelledby` 关联标题。导航默认按所在文档的设备类型选择位置：电脑使用标题栏下方文字页签，手机和平板使用正文下方图标页签；页签驱动双页轨道平移，非当前页设置 `inert` 和 `aria-hidden`；切页时收起下拉浮层。
5. 地图始终显示在固定卡片中；设置页依次显示“界面设置”“副 API”“提示词”三个默认收起的卡片，展开状态由公共组件管理。
6. 主题选择切换根节点主题类，导航样式单选组保留 `auto`、`top` 或 `bottom`，默认 `auto`；共用解析函数将其转换为具体 `top` 或 `bottom` 写入根节点 `data-navigation-style`。解析使用 `root.ownerDocument.defaultView.navigator`；手动上下位置直接生效，自动、缺省或非法值按移动设备信号、Android/iPhone/iPad/iPod/Mobile UA 或 Macintosh 且多点触控识别为下方，其余为上方。选择只保存在当前面板内存中。
7. 关闭按钮、Esc，以及按下和松开都位于遮罩的点击共用退场动画；关闭后返回地图页。主题、导航位置和设置分组的展开状态在本次页面会话内保留；刷新后恢复默认主题、`auto` 导航和收起状态。

界面不读取聊天、地图或模型数据；空聊天与普通聊天呈现相同空态。没有用户业务输入、模型请求、文件写入或设置持久化。入口和标题栏通过 CSS 遮罩共用本地 `icons/map.svg`，入口为 `20px`，标题为 `24px`，颜色跟随所在区域的主题；空态与导航 SVG 由公共组件读取酒馆托管的扩展资源；地图页签使用相对图标名 `../../ST-YaKit-map/icons/map`，解析到绘界本地 `icons/map.svg`，设置页签使用纪实 `icons/nav-settings.svg`。上方始终显示文字，下方只在 SVG 加载成功后隐藏文字，加载失败保留文字；页签始终保留 `title`、`aria-label` 和隐藏于读屏的图标。副 API 配置与提示词入口禁用，不执行配置读取、保存或请求。

缺失纪实的共享文件会导致相关模块或样式加载失败，因此两个扩展必须同级安装并保留 `ST-YaKit-chat`、`ST-YaKit-map` 目录名。这里只复用无宿主初始化依赖的 UI 模块，纪实是否开启不影响这些文件的读取。

## 设置与主题

界面选择在当前面板实例内保留，没有持久化设置。

| 项目 | 当前值或含义 |
| --- | --- |
| 主题 | 默认 `forest`；选项顺序为林系风、跟随酒馆、浅色、深色，对应 `forest`、`follow`、`light`、`dark` |
| 标题栏 | 固定顶部，沿用纪实的高度、间距和字重，显示共用地图图标、名称及关闭按钮 |
| 导航栏样式 | 默认 `auto` 按设备解析；`top` 位于标题栏下方并显示文字，`bottom` 位于正文下方并显示图标；三项同排，选择会话内保留 |
| 桌面窗口 | 宽度上限 `1280px`，高度上限 `820px`，同时受当前视口限制 |
| 移动端 | 视口宽度不超过 `600px` 时贴合屏幕，并留出设备安全区 |
| 页面 | 地图与设置共用窗口及滚动视口，切页不改变窗口大小 |
| 动效 | 进退场与切页 `240ms`，设置分组沿用纪实的折叠过渡 |
| 减少动态效果 | 跟随系统偏好停用动画和过渡 |

绘界以 `{ ...YaKitTheme }` 创建独立主题控制对象，`init(root)` 将其绑定到绘界弹窗；共享方法使用该对象自己的容器及回调。四套颜色使用纪实的 `--yakit-*` 变量，跟随酒馆模式映射宿主主题变量。控件选中、浮层、悬停及禁用样式都限定在绘界弹窗内。

主题下拉复用纪实的 Popover 控件：方向键选择，点击外部、滚动、切页或关闭弹窗时收起。隐藏的原生字段保留 `change` 事件；导航选项使用独立的 `yakit-map-navigation-style` 单选组。副 API 下拉显示“未配置”，配置与提示词按钮处于禁用状态。

## 公开 API

当前没有对其他插件公开的全局 API 或就绪事件。页面构建函数仅供内部模块组装界面。

## 当前接入状态

| 项目 | 状态 |
| --- | --- |
| 酒馆入口 | 使用 `#extensionsMenu` 注册原生按钮，由扩展加载器加载 ESM 和 CSS |
| 界面 | 已有大窗口、固定地图卡片、独立标题栏、设置分组、四种主题、导航自动/手动位置与底部图标 |
| 业务 | 尚未接入地图绘制、地点与角色数据、聊天读取、模型请求及保存 |
| 宿主数据服务 | 未使用 `extension_settings`、`getContext()` 或宿主 API 服务 |
| 外部依赖 | 同级 YaKit-Chat `0.0.17` 或更新版本的上述公共 UI 文件及设置图标，无新增软件包 |
| 版本门槛 | `manifest.json` 声明 SillyTavern `1.14.0`，沿用纪实的最低版本要求 |
| 浏览器能力 | 原生 `dialog`、Popover、`inert`、CSS 网格及动态视口单位 |

## 开发与验证

UI、业务代码分开修改，新增代码使用中文注释；页面共用尺寸、主题和微动效。具体规范与人工验收要求见 [AGENTS.md](AGENTS.md)。

本地 `tests/navigation-style.test.mjs` 使用 Node DOM 替身检查默认自动解析、手动覆盖、自动选中、关闭重开、图标资源与可访问名称；不启动浏览器，不替代人工验收。该文件按仓库规则被忽略。在仓库根目录运行：

```bash
node tests/navigation-style.test.mjs
for file in index.js panel/*.js settings/*.js; do
  node --input-type=module --check < "$file" || exit 1
done
python3 -m json.tool manifest.json > /dev/null
git diff --check
```

静态检查不替代界面验收；界面由人工在酒馆中确认，不使用 computer use 或其他自动化方式：

1. 从扩展菜单打开“绘界”，确认字体、配色、卡片及微动效与纪实一致。
2. 切换地图与设置，确认地图固定卡片、共用标题栏及设置分组布局，窗口尺寸保持一致。
3. 切换四种主题和同排“自动、上方、下方”，确认自动项保持选中、手动位置即时覆盖；关闭重开后确认选择保留，刷新恢复自动。
4. 在电脑、手机和平板上确认自动时分别显示上方文字或下方图标，手动切换后位置不被自动覆盖；检查图标、可访问名称、移动端安全区及原有窗口尺寸。
5. 使用关闭按钮、遮罩和 Esc 关闭并重开，确认退出动效与焦点恢复正常。
6. 开启系统“减少动态效果”，确认页面和弹窗直接切换。
