




const allSideMenu = document.querySelectorAll('#sidebar .side-menu.top li a');

allSideMenu.forEach(item => {
    const li = item.parentElement;

    item.addEventListener('click', function () {
        allSideMenu.forEach(i => {
            i.parentElement.classList.remove('active');
        })
        li.classList.add('active');
    })
});




// TOGGLE SIDEBAR
const menuBar = document.querySelector('#content nav .bx.bx-menu');
const sidebar = document.getElementById('sidebar');

menuBar.addEventListener('click', function () {
    sidebar.classList.toggle('hide');
})


function autoToggleSidebar() {
  if (window.innerWidth <= 946) {
      sidebar.classList.add('hide');
  } else {
      sidebar.classList.remove('hide');
  }
}

// شغلها أول ما تفتح الصفحة
window.addEventListener('DOMContentLoaded', autoToggleSidebar);

// وتشغلها مع أي تغيير في الحجم
window.addEventListener('resize', autoToggleSidebar);




















function showMessage(message, type = "success") {
    const messageBar = document.querySelector(".message-bar");
  
    if (!messageBar) return;
  
    // نحذف الكلاسات القديمة
    messageBar.classList.remove("success", "error");
    messageBar.classList.add(type);
  
    messageBar.innerHTML = message;
  
    messageBar.style.display = "block";
    setTimeout(() => {
      messageBar.style.opacity = "1";
      messageBar.style.visibility = "visible";
    }, 50);
  
    setTimeout(() => {
      messageBar.style.opacity = "0";
      messageBar.style.visibility = "hidden";
      setTimeout(() => {
        messageBar.style.display = "none";
      }, 500);
    }, 3000);
  }
  
  








  document.addEventListener('DOMContentLoaded', () => {
    const dialog = document.getElementById('employeeDialog');
  if (!dialog) return; // إذا الديالوق مش موجود، لا تسوي شيء

  const closeBtn = dialog.querySelector('.closeBtn');
  
  // تأكد بعد أن زر الإغلاق موجود
  if (closeBtn) {
    closeBtn.addEventListener('click', () => dialog.close());
  }
    // 1) على كل صورة
    document.querySelectorAll('.profile-img').forEach(img => {
      img.addEventListener('click', async () => {
        //const userId = img.dataset.userId;
        // 2) تجيب بيانات الموظف من الباك إند:
        //    مثلاً: const data = await fetch(`/api/employee/${userId}`).then(r=>r.json());
        // 3) بعدين تملىء الـ dialog بمحتوى data
        //    dialog.querySelector('.modal-name').textContent = data.name;
        //    … وهكذا
  
        // 4) وأخيراً
        dialog.showModal();
      });
    });
  
    // زر الإغلاق
    closeBtn.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', e => {
      if (e.target === dialog) dialog.close();
    });
  });
  