const state = {
  files: [],
};

const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const fileList = document.getElementById('fileList');
const generateBtn = document.getElementById('generateBtn');
const orientationSelect = document.getElementById('orientation');
const pageSizeSelect = document.getElementById('pageSize');
const qualityInput = document.getElementById('quality');
const marginInput = document.getElementById('margin');

const PAGE_SIZES = {
  A4: { width: 595.28, height: 841.89 },
  Letter: { width: 612, height: 792 },
  Legal: { width: 612, height: 1008 },
};

const handleFiles = (incomingFiles) => {
  const unique = Array.from(incomingFiles).filter((file) =>
    !state.files.find((existing) => existing.name === file.name && existing.size === file.size)
  );

  if (!unique.length) return;
  state.files = state.files.concat(unique.map((file, index) => ({
    id: `${Date.now()}-${index}`,
    file,
  })));

  refreshFileList();
};

const refreshFileList = () => {
  fileList.innerHTML = '';
  state.files.forEach(({ id, file }, index) => {
    const li = document.createElement('li');
    li.className = 'file-item';

    const meta = document.createElement('div');
    meta.className = 'file-item__meta';
    meta.innerHTML = `<strong>${file.name}</strong><span>${formatBytes(file.size)}</span>`;

    const actions = document.createElement('div');
    actions.className = 'file-item__actions';

    const upBtn = document.createElement('button');
    upBtn.className = 'icon-btn';
    upBtn.innerText = '↑';
    upBtn.disabled = index === 0;
    upBtn.addEventListener('click', () => moveFile(index, index - 1));

    const downBtn = document.createElement('button');
    downBtn.className = 'icon-btn';
    downBtn.innerText = '↓';
    downBtn.disabled = index === state.files.length - 1;
    downBtn.addEventListener('click', () => moveFile(index, index + 1));

    const removeBtn = document.createElement('button');
    removeBtn.className = 'icon-btn';
    removeBtn.innerText = '✕';
    removeBtn.addEventListener('click', () => removeFile(id));

    actions.append(upBtn, downBtn, removeBtn);
    li.append(meta, actions);
    fileList.appendChild(li);
  });

  generateBtn.disabled = state.files.length === 0;
};

const moveFile = (from, to) => {
  if (to < 0 || to >= state.files.length) return;
  const files = [...state.files];
  const [moved] = files.splice(from, 1);
  files.splice(to, 0, moved);
  state.files = files;
  refreshFileList();
};

const removeFile = (id) => {
  state.files = state.files.filter((item) => item.id !== id);
  refreshFileList();
};

const formatBytes = (bytes, decimals = 2) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};

const setupDragAndDrop = () => {
  ['dragenter', 'dragover'].forEach((event) => {
    dropzone.addEventListener(event, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach((event) => {
    dropzone.addEventListener(event, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    });
  });

  dropzone.addEventListener('drop', (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    handleFiles(files);
  });
};

const readFileAsDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const compressImage = async (file) => {
  if (!window.imageCompression) return file;
  const quality = Number(qualityInput.value) || 0.8;
  const options = {
    maxSizeMB: 5,
    maxWidthOrHeight: 3000,
    useWebWorker: true,
    initialQuality: quality,
  };
  try {
    return await window.imageCompression(file, options);
  } catch (error) {
    console.warn('Image compression failed:', error);
    return file;
  }
};

const addImageToPdf = async (pdfDoc, page, imageBytes, orientation, margin, size) => {
  let embeddedImage;
  if (imageBytes.type?.includes('png')) {
    embeddedImage = await pdfDoc.embedPng(imageBytes.data);
  } else if (imageBytes.type?.includes('jpg') || imageBytes.type?.includes('jpeg')) {
    embeddedImage = await pdfDoc.embedJpg(imageBytes.data);
  } else {
    embeddedImage = await pdfDoc.embedPng(imageBytes.data);
  }

  const { width, height } = embeddedImage.scale(1);
  const pageWidth = orientation === 'portrait' ? size.width : size.height;
  const pageHeight = orientation === 'portrait' ? size.height : size.width;

  const availableWidth = pageWidth - margin * 2;
  const availableHeight = pageHeight - margin * 2;

  const widthRatio = availableWidth / width;
  const heightRatio = availableHeight / height;
  const scale = Math.min(widthRatio, heightRatio, 1);

  const imgWidth = width * scale;
  const imgHeight = height * scale;

  const x = (pageWidth - imgWidth) / 2;
  const y = (pageHeight - imgHeight) / 2;

  page.drawImage(embeddedImage, {
    x,
    y,
    width: imgWidth,
    height: imgHeight,
  });
};

const generatePdf = async () => {
  if (!window.PDFLib) return;
  const { PDFDocument } = window.PDFLib;

  const orientation = orientationSelect.value;
  const pageSize = PAGE_SIZES[pageSizeSelect.value] || PAGE_SIZES.A4;
  const margin = (Number(marginInput.value) || 10) * 2.83465; // mm to points

  const pdfDoc = await PDFDocument.create();

  for (const { file } of state.files) {
    const compressed = await compressImage(file);
    const dataUrl = await readFileAsDataURL(compressed);
    const bytes = await fetch(dataUrl).then((res) => res.arrayBuffer());
 
    const page = pdfDoc.addPage([pageSize.width, pageSize.height]);
    await addImageToPdf(
      pdfDoc,
      page,
      { data: bytes, type: file.type },
      orientation,
      margin,
      pageSize
    );
  }

  const pdfBytes = await pdfDoc.save();
  downloadBlob(pdfBytes, `Pic2Pdf-${new Date().toISOString().split('T')[0]}.pdf`);
};

const downloadBlob = (bytes, filename) => {
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

const setup = () => {
  setupDragAndDrop();
  uploadBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (event) => handleFiles(event.target.files));
  generateBtn.addEventListener('click', () => {
    generateBtn.disabled = true;
    generateBtn.textContent = '生成中...';
    generatePdf()
      .catch((error) => alert(`生成失败：${error.message}`))
      .finally(() => {
        generateBtn.disabled = state.files.length === 0;
        generateBtn.textContent = '生成 PDF';
      });
  });
};

document.addEventListener('DOMContentLoaded', setup);
