# Pic2Pdf

一个可以在浏览器端将多张图片合成为 PDF 的 Web 工具，适用于桌面与移动设备，并支持部署到 GitHub Pages 作为静态站点。

## ✨ 产品亮点
- **多格式支持**：拖拽或选择 PNG、JPG、JPEG、WebP、HEIC/HEIF 等图片，自动过滤重复文件。
- **所见即所得的排序与布局**：列表中可一键上移/下移/删除，支持纵向或横向纸张方向、A4/Letter/Legal 尺寸、可调页边距。
- **浏览器端合成**：集成 `pdf-lib` 与 `browser-image-compression`，纯前端完成图片压缩与 PDF 生成，无需后端，方便静态托管。
- **移动端友好**：响应式布局与触控操作按钮，适合手机浏览器直接使用。
- **隐私友好**：所有处理都在本地浏览器中完成，图片不会上传到服务器。

## 🧩 技术栈
- 结构：`index.html` + `styles/main.css` + `scripts/main.js` 纯前端实现。
- 库：
  - [`pdf-lib`](https://pdf-lib.js.org/) 负责创建页面、嵌入图片、导出 PDF。
  - [`browser-image-compression`](https://www.npmjs.com/package/browser-image-compression) 在生成 PDF 前压缩图片，减小体积。
- 托管：可直接放在任意静态站（GitHub Pages、Vercel、Netlify、本地服务器等）。

## 📦 目录结构
```
Pic2Pdf/
├── index.html          # 页面骨架与 CDN 脚本引入
├── styles/
│   └── main.css        # 响应式界面与组件样式
├── scripts/
│   └── main.js         # 上传管理、排序、压缩、PDF 合成逻辑
├── assets/             # 预留素材（目前为空）
├── README.md
└── .gitignore
```

## 🚀 使用方式
1. 克隆仓库：
   ```bash
   git clone <your-repo-url>
   cd Pic2Pdf
   ```
2. 启动任意静态服务器（示例）：
   ```bash
   python3 -m http.server 4173
   ```
3. 浏览器访问 `http://localhost:4173`，即可上传图片、调整顺序与参数，点击「生成 PDF」完成下载。

## 🌐 部署到 GitHub Pages
1. 推送代码到 GitHub 仓库的 `main` 分支根目录。
2. 进入仓库 Settings → Pages，将 **Source** 设置为 `Deploy from a branch`, `main` / `root`。
3. 保存后等待构建完成，即可通过 `https://<username>.github.io/Pic2Pdf/` 访问。

> 若需自动化部署，可添加 GitHub Actions（如 `peaceiris/actions-gh-pages`）在每次 push 时发布。

## 📱 兼容性与建议
- 建议使用支持 ES2020 的现代浏览器：Chrome 90+、Edge 90+、Safari 15+、Firefox 90+。
- HEIC/HEIF 的浏览器解析受系统支持限制，可提示用户预先转换。
- 大图合成可能占用较多内存，可适度降低压缩质量或分批生成。

## 📌 后续可拓展
- 新增图片预览缩略图与拖拽排序。
- 支持暗色主题与多语言切换。
- 通过 Service Worker 增强离线可用性。

## 📝 License
遵循仓库内的 `LICENSE`。
