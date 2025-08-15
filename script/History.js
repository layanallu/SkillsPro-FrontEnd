const avatars = [
  "img/profile.png",
  "img/Aaliyah.png",
  "img/Reema.png",
  "img/Yousf.png",
  "img/Nora.png"
];

const container = document.getElementById("workedWithContainer");
const maxVisible = 3;
const overlapOffset = 20;

// احسب كم صورة مخفية
const hiddenCount = avatars.length - maxVisible;

if (hiddenCount > 0) {
  const more = document.createElement("div");
  more.className = "extra-count";
  more.innerText = `+${hiddenCount}`;
  more.style.left = `${0}px`; // أول وحدة
  more.style.zIndex = avatars.length + 1;
  container.appendChild(more);
}

// بعدين أضف الصور
avatars.forEach((src, index) => {
  if (index < maxVisible) {
    const img = document.createElement("img");
    img.className = "profile-img"
    img.src = src;
    img.style.left = `${(index + 1) * overlapOffset}px`; // تبدأ بعد extra-count
    img.style.zIndex = avatars.length - index; // من الخلف للأمام
    container.appendChild(img);
  }
});

container.style.width = `${(maxVisible + 1) * overlapOffset + 15}px`;

  
  
  
    