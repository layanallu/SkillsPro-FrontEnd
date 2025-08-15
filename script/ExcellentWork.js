

const pdfFiles = [
  {
    url: "PDFs/farisproposal.pdf",
    title: "Design Proposal",
    date: "Apr. 7, 2025",
    points: 25,
    profile: "img/profile.png"
  },
  {
    url: "PDFs/Portfolio_Albertus.pdf",
    title: "Albertus Portfolio",
    date: "Mar. 30, 2025",
    points: 30,
    profile: "img/profile.png"
  }
];

const container = document.getElementById("pdf-container");

pdfFiles.forEach(file => {
  renderPDFPreview(file);
});

function renderPDFPreview(file) {
  const previewWrapper = document.createElement("div");
  previewWrapper.className = "pdf-preview";
  container.appendChild(previewWrapper);

  pdfjsLib.getDocument(file.url).promise.then(pdf => {
    pdf.getPage(1).then(page => {
      const scale = 1;
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      page.render(renderContext).promise.then(() => {
        canvas.style.filter = "blur(5px)";
        canvas.style.cursor = "pointer";

        const canvasWrapper = document.createElement("div");
        canvasWrapper.className = "canvas-wrapper";
        canvasWrapper.appendChild(canvas);

        // ➕ لما يضغط يفتح الملف
        canvasWrapper.addEventListener("click", () => {
          window.open(file.url, "_blank");
        });

        // ➕ نضيف الجزء السفلي (معلومات الكارد)
        const info = document.createElement("div");
        info.className = "pdf-info";
        info.innerHTML = `
  <img class="profile" src="${file.profile}" alt="profile">
  <div class="details">
    <h3>${file.title}</h3>
    <p>${file.date}</p>
  </div>
  <div class="points">
    <h2>
      <span class="number">${file.points}</span>
      <span class="label">
        <span class="highlight">Grant</span><br>
        <p>Points</p>
      </span>
    </h2>
  </div>
`;


        // ➕ نضيف الكانفاس والمعلومات
        previewWrapper.appendChild(canvasWrapper);
        previewWrapper.appendChild(info);
      });
    });
  });
}




const sortBtn = document.querySelector(".sort-icon");

// أول شي نحذف كل الكروت ونعيد عرضها بترتيب
function renderAllCards(sortedArray) {
  container.innerHTML = ""; // يمسح الموجود
  sortedArray.forEach(file => {
    renderPDFPreview(file);
  });
}

// عند الضغط على زر السورت
sortBtn.addEventListener("click", () => {
  const sorted = [...pdfFiles].sort((a, b) => b.points - a.points);
  renderAllCards(sorted);
});