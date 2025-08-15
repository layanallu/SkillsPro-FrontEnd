
const repDialog = document.getElementById("ReplacementDetails");
const openTargets = document.querySelectorAll("#replacement-requests .list li"); // كل العناصر اللي تضغطها
const closeBtn = repDialog.querySelector(".closeBtn");

// فتح الديالوق عند الضغط على li أو more details
openTargets.forEach(item => {
  item.addEventListener("click", (e) => {
    // تجاهل الضغط على الأيقونات (القبول/الرفض)
    if (e.target.tagName === 'I') return;

    repDialog.showModal();
  });
});

// إغلاق الديالوق عند الضغط على زر الإغلاق
closeBtn.addEventListener("click", () => {
  repDialog.close();
});

// إغلاق الديالوق عند الضغط خارج المحتوى
repDialog.addEventListener("click", (e) => {
  const repDialogRect = repDialog.getBoundingClientRect();
  if (
    e.clientX < repDialogRect.left ||
    e.clientX > repDialogRect.right ||
    e.clientY < repDialogRect.top ||
    e.clientY > repDialogRect.bottom
  ) {
    repDialog.close();
  }
});

const taskLink = document.querySelector('.task-link');
const replacementDialog = document.getElementById('ReplacementDetails');
const taskDialog = document.getElementById('taskDialog1');

if (taskLink && replacementDialog && taskDialog) {
  taskLink.style.cursor = 'pointer';

  taskLink.addEventListener('click', () => {
    replacementDialog.close(); // إغلاق الديالوق الحالي
    taskDialog.showModal();    // فتح ديالوق المهام
  });
}


const backBtn = document.querySelector('.backBtn');

if (backBtn && replacementDialog && taskDialog) {
  backBtn.addEventListener('click', () => {
    taskDialog.close();                // يقفل ديالوق المهام
    replacementDialog.showModal();    // يفتح ديالوق التفاصيل
  });
}

























document.addEventListener("DOMContentLoaded", () => {
  const taskDialog = document.getElementById("taskDialog");
  const rejectDialog = document.getElementById("rejectDialog");

  const closeButtons = document.querySelectorAll(".closeBtn");

  // ====================================================
  // 1. فتح Dialog الرفض عند الضغط على زر Reject
  // ====================================================
  document.querySelectorAll(".reject-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const actionDiv = e.target.closest(".actions");
      const targetId = actionDiv.dataset.id;

      rejectDialog.dataset.targetId = targetId;
      rejectDialog.showModal();
    });
  });

  // =====================================================================
  // 2. تنفيذ الرفض بعد ما المستخدم يكتب السبب ويضغط زر Confirm Reject
  // =====================================================================
  const confirmRejectBtn = rejectDialog.querySelector(".confirm-reject");

  confirmRejectBtn.addEventListener("click", () => {
    const textarea = rejectDialog.querySelector("textarea");

    if (!textarea.checkValidity()) {
      textarea.reportValidity();
      showMessage("You must provide a reason before rejecting.", "error");
      return;
    }

    const targetId = rejectDialog.dataset.targetId;
    const targetLi = document.querySelector(`li[data-id="${targetId}"]`);

    if (targetLi) {
      targetLi.classList.add("rejected");
      showMessage("Request <span style='font-weight: bold;'>rejected</span> successfully.", "error");
      repDialog.close();
      targetLi.remove(); // حذف العنصر

    }

    rejectDialog.close();

  });

  // ======================================================
  // 3. تنفيذ القبول عند الضغط على زر Accept
  // ======================================================
  document.querySelectorAll(".accept-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const actionDiv = e.target.closest(".actions");
      const targetId = actionDiv.dataset.id;
      const targetLi = document.querySelector(`li[data-id="${targetId}"]`);

      if (targetLi) {
        targetLi.classList.add("accepted");
        showMessage("Request <span style='font-weight: bold;'>accepted</span> successfully.", "success");
        targetLi.remove(); // حذف العنصر
      }

      repDialog.close();
      taskDialog.close();

    });
  });

  // =======================================================
  // 4. إغلاق أي Dialog عند الضغط على زر X
  // =======================================================
  closeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const dialog = btn.closest("dialog");
      if (dialog) dialog.close();
    });
  });

  // =======================================================
  // 5. إغلاق الديالوق عند الضغط خارج محتواه
  // =======================================================
  [taskDialog, rejectDialog].forEach(dialog => {
    dialog.addEventListener("click", (e) => {
      const rect = dialog.getBoundingClientRect();
      const isInDialog = (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      );

      if (!isInDialog) dialog.close();
    });
  });
});






















document.addEventListener('DOMContentLoaded', function () {
  const clickableCards = document.querySelectorAll('.clickable-card');

  clickableCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // إذا ضغط المستخدم على زر أو li، لا تفتح الصفحة
      if (
        e.target.closest('button') ||  // لو ضغط زر
        e.target.closest('li') ||      // أو ضغط li
        e.target.classList.contains('no-redirect') // أو عنصر فيه كلاس خاص
      ) {
        return;
      }

      // التنقل للصفحة المحددة
      const targetUrl = card.dataset.link;
      if (targetUrl) {
        window.location.href = targetUrl;
      }
    });
  });
});










// ReplacementFlow.js
// ReplacementFlow.js
// ReplacementFlow.js
document.addEventListener('DOMContentLoaded', () => {
  const vacDialog = document.getElementById('vacationDetailsDialog');
  const taskDialog = document.getElementById('taskDialog');
  const empDialog = document.getElementById('empDialog');
  const plusIcon = vacDialog.querySelector('.add-replacement');
  const repContainer = vacDialog.querySelector('.replacement-container');
  const acceptBtn = vacDialog.querySelector('.accept-btn');
  const rejectBtn = vacDialog.querySelector('.reject-btn');
  const listEl = taskDialog.querySelector('.task-list');
  const contBtn = taskDialog.querySelector('.continue-btn');
  const shareBtn = empDialog.querySelector('.shareBtn');

  // دالة ترجع عناصر الموظفين
  const empItems = () => Array.from(empDialog.querySelectorAll('.emp-list li'));

  // 0️⃣ اربط كليك على العناصر لتفعيل تحديد (selected)
  empItems().forEach(item => {
    item.addEventListener('click', () => {
      empItems().forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
    });
  });

  const tasks = [
    { title: 'Task A' },
    { title: 'Task B' },
  ];
  const assignment = {};    // taskIdx → empId
  const employees = {};    // empId → { id, name, img, tasks: [] }

  // 1️⃣ فتح مودال الإجازة
  document.querySelectorAll('#vacation-requests .request-item')
    .forEach(li => li.addEventListener('click', () => vacDialog.showModal()));

  // 2️⃣ الضغط على + لملء مودال المهام
  plusIcon.addEventListener('click', () => {
    listEl.innerHTML = '';
    contBtn.disabled = true;
    tasks.forEach((t, idx) => {
      const li = document.createElement('li');
      li.dataset.idx = idx;
      li.textContent = t.title;
      li.addEventListener('click', () => openEmpDialog(idx, li));
      listEl.append(li);
    });
    taskDialog.showModal();
  });

  // 3️⃣ فتح مودال اختيار الموظف مع مسح التحديد السابق
  function openEmpDialog(taskIdx, taskLi) {
    empItems().forEach(i => i.classList.remove('selected'));
    empDialog.showModal();

    // ربط زر Assign هنا فقط
    shareBtn.onclick = () => {
      const sel = empDialog.querySelector('.emp-list li.selected');
      if (!sel) return;

      const id = sel.dataset.id;
      const name = sel.dataset.name;
      const img = sel.dataset.img;

      // إنشاء سجل الموظف أول مرة
      if (!employees[id]) {
        employees[id] = { id, name, img, tasks: [] };
      }
      // إضافة المهمة
      employees[id].tasks.push(tasks[taskIdx].title);
      assignment[taskIdx] = id;

      // إزالة العنصر من قائمة المهام
      taskLi.remove();
      empDialog.close();

      // فحص إذا انتهيت من كل المهام
      contBtn.disabled = Object.keys(assignment).length < tasks.length;

      // منع تكرار binding
      shareBtn.onclick = null;
    };
  }

  // 4️⃣ Continue: عرض الصور في مودال الإجازة وربطها لعرض المهام
  // في مكان بناء الصور بعد الضغط على Continue:
  contBtn.addEventListener('click', () => {
    taskDialog.close();
    repContainer.innerHTML = '';

    Object.values(employees).forEach(emp => {
      // 1) نعمل wrapper للصورة
      const wrapper = document.createElement('div');
      wrapper.classList.add('img-wrapper');

      // 2) الصورة نفسها
      const imgEl = document.createElement('img');
      imgEl.src = emp.img;
      imgEl.alt = emp.name;
      imgEl.title = emp.name;
      imgEl.style.cursor = 'pointer';
      wrapper.append(imgEl);

      // 3) عند الضغط نولد tooltip
      imgEl.addEventListener('click', () => {
        // لو موجودة tooltip سابقتها نحذفها أول
        const old = wrapper.querySelector('.tooltip');
        if (old) old.remove();

        // ننشئ عنصر الـ tooltip
        const tip = document.createElement('div');
        tip.className = 'tooltip';
        tip.textContent = emp.tasks.join(', ');
        wrapper.append(tip);

        // نجعلها تظهر
        // (نحتاج تأخير بسيط لضمان تطبيق transition)
        requestAnimationFrame(() => tip.classList.add('show'));

        // تخفي بعد 3 ثواني
        setTimeout(() => {
          tip.classList.remove('show');
          // بعد انتهاء الإخفاء نحذفه
          setTimeout(() => tip.remove(), 200);
        }, 3000);
      });

      repContainer.append(wrapper);
    });

    plusIcon.style.display = 'none';
  });


  // 5️⃣ قبول/رفض نهائي
  acceptBtn.addEventListener('click', () => {
    // 1️⃣ عرض الرسالة
    showMessage("The request has been accepted successfully", "success");
    // 2️⃣ ثم إغلاق مودال الإجازة
    vacDialog.close();
  });
  rejectBtn.addEventListener('click', () => {
    const rejectDialog = document.getElementById('rejectDialog');
    const confirmRejectBtn = rejectDialog.querySelector('.confirm-reject');
  
    confirmRejectBtn.addEventListener('click', () => {
      const textarea = rejectDialog.querySelector('textarea');
      if (!textarea.checkValidity()) {
        textarea.reportValidity();
        return;
      }
  
      // 1️⃣ عرض رسالة الرفض بعد كتابة السبب
      showMessage("The request has been rejected successfully", "error");
  
      // 2️⃣ إغلاق مودالات الرفض والإجازة
      rejectDialog.close();
      vacDialog.close();
    });
    vacDialog.close();

  });


 

  // 6️⃣ إغلاق مودال بـ X أو بكليك خارجه
  document.querySelectorAll('dialog .closeBtn')
    .forEach(b => b.addEventListener('click', () => b.closest('dialog').close()));
  document.querySelectorAll('dialog').forEach(dlg =>
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); }));
});
