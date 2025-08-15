document.addEventListener("DOMContentLoaded", () => {
    const taskDialog = document.getElementById("taskDialog");
    const rejectDialog = document.getElementById("rejectDialog");
  
    const closeButtons = document.querySelectorAll(".closeBtn");
  
    // ==============================================
    // 1. فتح Dialog المهام عند الضغط على .task-link
    // ==============================================
    document.querySelectorAll(".task-link").forEach(link => {
      link.addEventListener("click", () => {
        taskDialog.showModal();
      });
    });
  
    // ====================================================
    // 2. فتح Dialog الرفض عند الضغط على زر Reject
    // ====================================================
    document.querySelectorAll(".reject-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const actionDiv = e.target.closest(".actions");
        const targetId = actionDiv.dataset.id;
  
        // نخزن معرف الكرت داخل الديالوق عشان نرجع له لاحقًا
        rejectDialog.dataset.targetId = targetId;
        rejectDialog.showModal();
      });
    });
  
    // =====================================================================
    // 3. تنفيذ الرفض بعد ما المستخدم يكتب السبب ويضغط زر Confirm Reject
    // =====================================================================
    const confirmRejectBtn = rejectDialog.querySelector(".confirm-reject");
  
    confirmRejectBtn.addEventListener("click", () => {
      const textarea = rejectDialog.querySelector("textarea");
  
      // نستخدم HTML required بدل alert
      if (!textarea.checkValidity()) {
        textarea.reportValidity();
        showMessage("You must provide a reason before rejecting.", "error");

        return;
      }
  
      const targetId = rejectDialog.dataset.targetId;
      const targetLi = document.querySelector(`li[data-id="${targetId}"]`);
      const targetActions = document.querySelector(`.actions[data-id="${targetId}"]`);
  
      if (targetLi) {
        targetLi.classList.remove("pending");
        targetLi.classList.add("rejected");
        showMessage("Request <span style='font-weight: bold;'>rejected</span> successfully." , "success");

      }
  
      if (targetActions) {
        targetActions.remove();
      }
  
      rejectDialog.close();
    });
  
    // ======================================================
    // 4. تنفيذ القبول عند الضغط على زر Accept
    // ======================================================
    document.querySelectorAll(".accept-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const actionDiv = e.target.closest(".actions");
        const targetId = actionDiv.dataset.id;
  
        const targetLi = document.querySelector(`li[data-id="${targetId}"]`);
        const targetActions = document.querySelector(`.actions[data-id="${targetId}"]`);
  
        if (targetLi) {
          targetLi.classList.remove("pending");
          targetLi.classList.add("accepted");
          showMessage("Request <span style='font-weight: bold;'>accepted</span> successfully.", "success");

        }
  
        if (targetActions) {
          targetActions.remove();
        }
      });
    });
  
    // =======================================================
    // 5. إغلاق أي Dialog عند الضغط على زر X أو خارج الديالوق
    // =======================================================
    closeButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        btn.closest("dialog").close();
      });
    });
  
    // إغلاق الديالوق عند الضغط على المساحة الرمادية
    [taskDialog, rejectDialog].forEach(dialog => {
      dialog.addEventListener("click", (e) => {
        const rect = dialog.getBoundingClientRect();
        if (
          e.clientX < rect.left ||
          e.clientX > rect.right ||
          e.clientY < rect.top ||
          e.clientY > rect.bottom
        ) {
          dialog.close();
        }
      });
    });
  });





























  // Manager

  document.addEventListener("DOMContentLoaded", () => {
    const empDialog = document.getElementById("empDialog");
    const shareBtn = empDialog.querySelector(".shareBtn");
  
    const addButtons = document.querySelectorAll(".add-replacement");
    let currentTargetContainer = null;
  
    // فتح ديالوق اختيار الموظف عند الضغط على +
    addButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        currentTargetContainer = btn.closest(".replacement-container");
        empDialog.showModal();
  
        // إزالة أي تحديد سابق
        empDialog.querySelectorAll("li").forEach(li => li.classList.remove("selected"));
      });
    });
  
    // تفعيل التحديد
    empDialog.querySelectorAll("li").forEach(item => {
      item.addEventListener("click", () => {
        empDialog.querySelectorAll("li").forEach(li => li.classList.remove("selected"));
        item.classList.add("selected");
      });
    });
  
    // عند الضغط على Assign
    shareBtn.addEventListener("click", () => {
      if (!currentTargetContainer) return;
  
      const selected = empDialog.querySelector("li.selected");
      if (!selected) return;
  
      const imgSrc = selected.dataset.img;
      const imgAlt = selected.dataset.name;
  
      // إنشاء صورة الموظف واستبدال الأيقونة +
      const newImg = document.createElement("img");
      newImg.src = imgSrc;
      newImg.alt = imgAlt;
      newImg.classList.add("profile-img");
  
      currentTargetContainer.innerHTML = ""; // إزالة محتوى السابق
      currentTargetContainer.appendChild(newImg);
  
      empDialog.close();
    });
  
    // عند الضغط على Accept
    document.querySelectorAll(".accept-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const actionDiv = e.target.closest(".actions");
        const targetId = actionDiv.dataset.id;
        const targetLi = document.querySelector(`li[data-id="${targetId}"]`);
        const container = targetLi?.querySelector(".replacement-container");
  
        // إذا لا يوجد موظف مضاف، ضع "/"
        if (container && container.children.length === 1 && container.querySelector(".add-replacement")) {
          container.innerHTML = "/";
        }
  
        showMessage("The vacation has been accepted successfully", "success");
  
        if (targetLi) {
          targetLi.classList.add("accepted");
        }
  
        // إغلاق كل الحوارات المفتوحة
        document.querySelectorAll("dialog").forEach(d => d.close());
      });
    });
    document.querySelectorAll(".reject-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const actionDiv = e.target.closest(".actions");
        const targetId = actionDiv.dataset.id;
        const targetLi = document.querySelector(`li[data-id="${targetId}"]`);
        const rejectDialog = document.getElementById("rejectDialog");
    
        rejectDialog.dataset.targetId = targetId;
        rejectDialog.showModal();
    
        // زر تأكيد الرفض داخل الديالوق
        const confirmRejectBtn = rejectDialog.querySelector(".confirm-reject");
        confirmRejectBtn.onclick = () => {
          const textarea = rejectDialog.querySelector("textarea");
          if (!textarea.checkValidity()) {
            textarea.reportValidity();
            return;
          }
    
          if (targetLi) {
            const container = targetLi.querySelector(".replacement-container");
    
            // إذا لا يوجد موظف مضاف، ضع "/"
            if (container && container.children.length === 1 && container.querySelector(".add-replacement")) {
              container.innerHTML = "/";
            }
    
            targetLi.classList.add("rejected");
            showMessage("Request <span style='font-weight: bold;'>rejected</span> successfully.", "success");
          }
    
          rejectDialog.close();
        };
      });
    });
    
  
    // نفس منطق رفض الطلب موجود في الكود الأصلي
  });
  
  