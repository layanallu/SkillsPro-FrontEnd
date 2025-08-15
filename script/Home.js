// Home.js - Main script for Task Management with Calendar and File Attachments

// After DOM loaded, initialize all features
// بعد تحميل الـ DOM بالكامل، قم بتهيئة جميع الميزات

document.addEventListener('DOMContentLoaded', () => {
  // ----- 1. Input Background Toggle -----
  const textInputs = document.querySelectorAll("input[type='text'], textarea");
  textInputs.forEach(input => {
    input.addEventListener('input', () => {
      input.style.backgroundColor = input.value.trim() ? '#ffffff' : '#f0f0f0';
    });
  });

  // ----- 2. Add Task Dialog & Dropdown -----
  const addTaskDialog = document.querySelector('.addTask');
  const openAddTaskBtn = document.getElementById('addTask');
  const closeAddTaskBtn = addTaskDialog.querySelector('.closeBtn');
  const addDropdown = document.querySelector('.addTask .custom-dropdown');
  const addDropdownSelected = addDropdown.querySelector('.dropdown-selected');
  const addDropdownOptions = addDropdown.querySelector('.dropdown-options');

  openAddTaskBtn.addEventListener('click', () => addTaskDialog.showModal());
  closeAddTaskBtn.addEventListener('click', () => addTaskDialog.close());

  addDropdown.addEventListener('click', () => {
    const isOpen = addDropdownOptions.style.display === 'block';
    addDropdownOptions.style.display = isOpen ? 'none' : 'block';
  });
  addDropdownOptions.querySelectorAll('div').forEach(option => {
    option.addEventListener('click', () => {
      addDropdownSelected.textContent = option.textContent;
      addDropdownSelected.classList.add('active');
      addDropdownSelected.style.color = 'black';
      addDropdownOptions.querySelectorAll('div').forEach(o => o.classList.remove('selected'));
      option.classList.add('selected');
      addDropdownOptions.style.display = 'none';
    });
  });
  document.addEventListener('click', event => {
    if (!addDropdown.contains(event.target)) addDropdownOptions.style.display = 'none';
  });

  // ----- 3. Calendar (Date Picker) -----
  const calendarDialog = document.getElementById('calendarDialog');
  const daysContainer = document.getElementById('days');
  const monthYearLabel = document.getElementById('month-year');
  const prevMonthBtn = document.getElementById('prev');
  const nextMonthBtn = document.getElementById('next');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  let currentCalendarDate = new Date();
  const todayDate = new Date();
  let selectedCalendarDate = null;
  let calendarInvocationMode = null; // 'add' or 'edit'

  function renderCalendar(displayDate) {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const first = new Date(year, month, 1).getDay();
    const last = new Date(year, month + 1, 0).getDate();

    monthYearLabel.textContent = `${monthNames[month]} ${year}`;
    daysContainer.innerHTML = '';

    // prev month fades
    const prevLast = new Date(year, month, 0).getDate();
    for (let i = first; i > 0; i--) {
      const el = document.createElement('div'); el.textContent = prevLast - i + 1;
      el.classList.add('fade'); daysContainer.append(el);
    }

    // current month days
    for (let d = 1; d <= last; d++) {
      const el = document.createElement('div');
      const thisDate = new Date(year, month, d);
      el.textContent = d; el.classList.add('day');

      // highlight
      if (selectedCalendarDate && thisDate.toDateString() === selectedCalendarDate.toDateString()) {
        el.classList.add('selected');
      } else if (!selectedCalendarDate && thisDate.toDateString() === todayDate.toDateString()) {
        el.classList.add('today');
      }

      // disable past
      const mid = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
      if (thisDate < mid) {
        el.classList.add('disabled');
      } else {
        el.addEventListener('click', () => {
          const fmt = `${d} ${monthNames[month]} ${year}`;
          selectedCalendarDate = thisDate;
          currentCalendarDate = new Date(thisDate);

          if (calendarInvocationMode === 'add') {
            document.querySelector('.addTask .calendarIcon').innerHTML =
              `<button id=\"setDate\" type=\"button\"><i class='bx bx-calendar'></i></button><span>${fmt}</span>`;
            bindAddCalendar();
          } else if (calendarInvocationMode === 'edit') {
            document.getElementById('editDeadline').textContent = fmt;
          }

          renderCalendar(currentCalendarDate);
          calendarDialog.close();
        });
      }
      daysContainer.append(el);
    }

    // next month fades
    const trail = 7 - new Date(year, month + 1, 0).getDay() - 1;
    for (let i = 1; i <= trail; i++) {
      const el = document.createElement('div'); el.textContent = i;
      el.classList.add('fade'); daysContainer.append(el);
    }
  }

  function bindAddCalendar() {
    const btn = document.getElementById('setDate');
    if (!btn) return;
    btn.addEventListener('click', ev => {
      ev.preventDefault();
      calendarInvocationMode = 'add';
      renderCalendar(currentCalendarDate);
      calendarDialog.showModal();
    });
  }

  // edit date binding
  const editBtnDate = document.getElementById('setDateEdit');
  if (editBtnDate) {
    editBtnDate.addEventListener('click', ev => {
      ev.preventDefault(); calendarInvocationMode = 'edit';
      const prevTxt = document.getElementById('editDeadline').textContent;
      if (prevTxt && prevTxt !== 'Deadline Date') {
        const [dy, mo, yr] = prevTxt.split(' ');
        selectedCalendarDate = new Date(yr, monthNames.indexOf(mo), +dy);
        currentCalendarDate = new Date(selectedCalendarDate);
      }
      renderCalendar(currentCalendarDate); calendarDialog.showModal();
    });
  }

  calendarDialog.addEventListener('click', evt => { if (evt.target === calendarDialog) calendarDialog.close(); });
  prevMonthBtn.addEventListener('click', () => { currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1); renderCalendar(currentCalendarDate); });
  nextMonthBtn.addEventListener('click', () => { currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1); renderCalendar(currentCalendarDate); });

  renderCalendar(currentCalendarDate);
  bindAddCalendar();

  // ----- 4. Invite Employees -----
  document.getElementById('shareTask').addEventListener('click', () => document.getElementById('empDialog').showModal());
  document.getElementById('shareBtn').addEventListener('click', () => {
    const selEmps = document.querySelectorAll('.emp-list li.selected');
    const shareBtn = document.getElementById('shareTask'); shareBtn.innerHTML = '';
    const img0 = document.createElement('img'); img0.src = 'img/profile.png'; img0.classList.add('invatedEmpImg');
    shareBtn.append(img0);
    selEmps.forEach(emp => {
      const src = emp.getAttribute('data-img'); const im = document.createElement('img'); im.src = src; im.classList.add('invatedEmpImg'); shareBtn.append(im);
    });
    const plusI = document.createElement('i'); plusI.className = 'bx bxs-plus-circle'; plusI.style.color = 'rgba(180,180,247,0.63)'; shareBtn.append(plusI);
    document.getElementById('empDialog').close();
  });
  document.querySelectorAll('.emp-list li').forEach(li => li.addEventListener('click', () => li.classList.toggle('selected')));

  // ----- 5. Task List Toggle & Undo -----
  const todoList = document.querySelector('.todo-list');
  const tasksLeft = document.getElementById('tasks-left');


  todoList.addEventListener('click', event => {
    const target = event.target;
    if (!target.classList.contains('bx-checkbox') && !target.classList.contains('bx-check')) return;
    const taskItem = target.closest('li');
    const needsEval = taskItem.getAttribute('evalNeed') === 'true';

    // if needs evaluation and not yet complete -> open file dialog
    if (needsEval && !taskItem.classList.contains('completed')) {
      currentEvalTaskItem = taskItem;
      fileDialog.showModal();
      return;
    }

    // original toggle & undo logic
    if (taskItem.classList.contains('completed')) {
      const doneTime = parseInt(taskItem.getAttribute('data-complete-time'));
      const now = new Date().getTime();
      if (doneTime && now - doneTime <= 5 * 60 * 1000) {
        taskItem.classList.remove('completed');
        target.classList.replace('bx-check', 'bx-checkbox'); target.classList.remove('bx-tada'); target.style.color = '';
        taskItem.setAttribute('data-completed', 'false'); taskItem.removeAttribute('data-complete-time');
        sortTasks();
      } else {
        showMessage('You can undo within 5 minutes only!', "error");
      }
    } else {
      taskItem.classList.add('completed');
      target.classList.replace('bx-checkbox', 'bx-check'); target.classList.add('bx-tada'); target.style.color = '#4caf50';
      taskItem.setAttribute('data-completed', 'true');
      taskItem.setAttribute('data-complete-time', new Date().getTime());
      sortTasks();
    }
    updateTasksLeft(); updateTaskInfo();
  });

  function updateTasksLeft() {
    const left = todoList.querySelectorAll("li[data-completed='false']").length;
    tasksLeft.textContent = `${left} Tasks Left`;
  }

  function updateTaskInfo() {
    todoList.querySelectorAll('li').forEach(li => {
      const dl = parseInt(li.getAttribute('data-deadline')); const comp = li.getAttribute('data-completed') === 'true';
      let info = li.querySelector('.task-info');
      if (!info) { info = document.createElement('p'); info.classList.add('task-info'); li.querySelector('.headerComment').append(info); }
      info.textContent = comp ? 'Well done' : (dl > 0 ? `${dl} days left` : 'Deadline passed');
    }); sortTasks();
  }

  function sortTasks() {
    Array.from(todoList.querySelectorAll('li'))
      .sort((a, b) => {
        const da = parseInt(a.getAttribute('data-deadline')), db = parseInt(b.getAttribute('data-deadline'));
        const ca = a.getAttribute('data-completed') === 'true', cb = b.getAttribute('data-completed') === 'true';
        if (ca && !cb) return 1; if (!ca && cb) return -1; return da - db;
      })
      .forEach(li => todoList.append(li));
  }

  function removeCompletedAt1AM() {
    setInterval(() => {
      const n = new Date(); if (n.getHours() === 1 && n.getMinutes() === 0) {
        todoList.querySelectorAll("li[data-completed='true']").forEach(li => li.remove()); updateTasksLeft();
      }
    }, 60000);
  }

  updateTasksLeft(); updateTaskInfo(); removeCompletedAt1AM();

  // ----- 6. File Attachment Dialog -----
  const fileDialog = document.getElementById('taskFileDialog');
  const fileInput = document.getElementById('taskFile');
  const attachBtn = document.getElementById('attachTaskFile-btn');
  const previewBox = document.getElementById('filePreviewContainer');



  // trigger file select


  fileInput.addEventListener('change', () => {


    // عدّد الملفات المحددة
    const files = Array.from(fileInput.files);

    // إذا ما في ملفات، عطّل زر الإرفاق واطلع
    if (files.length === 0) {
      attachBtn.disabled = true;
      attachBtn.classList.remove('active');
      return;
    }

    // لكل ملف، اعمل معاينة
    files.forEach(file => {
      const wrapper = document.createElement('div');
      wrapper.className = 'file-preview';

      let previewElement;
      if (file.type.startsWith('image/')) {
        // ملف صورة: اعرضها
        previewElement = document.createElement('img');
        const reader = new FileReader();
        reader.onload = e => previewElement.src = e.target.result;
        reader.readAsDataURL(file);
      } else {
        // غير صورة: اعرض أيقونة عامة
        previewElement = document.createElement('i');
        previewElement.className = 'bx bx-file';
        previewElement.style.fontSize = '48px';
        previewElement.style.color = '#6F6FF5';
      }

      const nameSpan = document.createElement('span');
      nameSpan.textContent = file.name;

      wrapper.append(previewElement, nameSpan);
      previewBox.append(wrapper);
    });

    // فعّل زر الإرفاق لأن صار عندنا ملف واحد على الأقل
    attachBtn.disabled = false;
    attachBtn.classList.add('active');
  });

  attachBtn.addEventListener('click', () => {
    if (!currentEvalTaskItem) return;
    currentEvalTaskItem.classList.add('completed'); currentEvalTaskItem.setAttribute('data-completed', 'true');
    const ic = currentEvalTaskItem.querySelector('.bx'); ic.classList.replace('bx-checkbox', 'bx-check'); ic.classList.add('bx-tada'); ic.style.color = '#4caf50';
    fileDialog.close(); fileInput.value = ''; previewBox.innerHTML = ''; attachBtn.disabled = true; attachBtn.classList.remove('active');
    updateTasksLeft(); updateTaskInfo(); sortTasks();
  });

  // close file dialog
  fileDialog.querySelector('.closeBtn').addEventListener('click', () => fileDialog.close());
  fileDialog.addEventListener('click', e => { if (e.target === fileDialog) fileDialog.close(); });

  // ----- 7. View/Edit Task Dialog Logic -----
  // ... integrate your existing View/Edit dialog code here ...
  // View + Edit Dialog with dynamic content loading 


  const ViewDialog = document.getElementById("taskDetailsDialog");
  const editBtn = document.getElementById("editTaskBtn");
  const deleteBtn = document.getElementById("deleteTaskBtn");
  const viewMode = document.getElementById("viewMode");
  const editMode = document.getElementById("editMode");
  const cancelBtn = document.getElementById("cancelEdit");

  let currentTaskData = {};

  // فتح الديالوق وتحميل بيانات li المحددة
  document.querySelectorAll(".taskListItem").forEach(item => {
    item.addEventListener("click", event => {
      // لا نفتح ViewDialog إذا نقرنا على أيقونة الـ checkbox
      if (
        event.target.classList.contains('bx-checkbox') ||
        event.target.classList.contains('bx-check')
      ) return;

      // ⬇️ قراءة البيانات من li
      const title = item.querySelector(".headerComment p")?.textContent || "Untitled Task";
      const type = item.getAttribute("data-type") || "";
      const desc = item.getAttribute("data-desc") || "";
      const deadline = item.getAttribute("deadline-date") || "";
      const completed = item.getAttribute("data-completed") === "true";
      const evalNeed = item.getAttribute("evalNeed") === "true";  // <<< هنا
      const id = item.getAttribute("data-id");

      currentTaskData = { id, title, type, desc, deadline, completed, evalNeed, element: item };

      // ⬇️ عرضها في View Mode
      document.getElementById("viewTitle").textContent = title;
      document.getElementById("viewType").textContent = type;
      document.getElementById("viewDescription").textContent = desc;
      document.getElementById("viewDeadline").textContent = deadline;
      // هنا نعكس evalNeed وليس completed
      document.getElementById("viewEval").checked = evalNeed;

      viewMode.style.display = "block";
      editMode.style.display = "none";
      ViewDialog.showModal();
    });
  });

  // إغلاق الديالوق بزر أو الضغط بالخارج
  ViewDialog.querySelector(".closeBtn").addEventListener("click", () => ViewDialog.close());
  ViewDialog.addEventListener("click", e => { if (e.target === ViewDialog) ViewDialog.close(); });








  // تفعيل Edit Mode مع تعبئة الحقول 
  editBtn.addEventListener("click", () => {
    viewMode.style.display = "none";
    editMode.style.display = "block";

    document.getElementById("editTitle").value = currentTaskData.title;
    document.getElementById("editDescription").value = currentTaskData.desc;
    document.getElementById("editDeadline").textContent = currentTaskData.deadline;
    // هنا نعكس evalNeed على الـ checkbox في الـ edit form
    document.getElementById("evalNeedEdit").checked = currentTaskData.evalNeed;
    document.querySelector("#editDropdown .dropdown-selected").textContent = currentTaskData.type;

    // لضبط التقويم المسبق
    localStorage.setItem("selectedCalendarTarget", "editDeadline");
    localStorage.setItem("preselectedDate", currentTaskData.deadline);
  });

  // إلغاء التعديل 
  cancelBtn.addEventListener("click", () => {
    viewMode.style.display = "block";
    editMode.style.display = "none";
  });

  // ✅ تفعيل الدروب داون المخصص 
  const dropdownEdit = document.getElementById("editDropdown");
  const selectedEdit = dropdownEdit.querySelector(".dropdown-selected");
  const optionsEdit = dropdownEdit.querySelector(".dropdown-options");

  dropdownEdit.addEventListener("click", function () {
    optionsEdit.style.display = optionsEdit.style.display === "block" ? "none" : "block";
  });

  optionsEdit.querySelectorAll("div").forEach(option => {
    option.addEventListener("click", function () {
      selectedEdit.textContent = this.textContent;
      selectedEdit.classList.add("active");
      selectedEdit.style.color = "black";
      optionsEdit.querySelectorAll("div").forEach(opt => opt.classList.remove("selected"));
      this.classList.add("selected");
      optionsEdit.style.display = "none";
    });
  });

  document.addEventListener("click", function (event) {
    if (!dropdownEdit.contains(event.target)) {
      optionsEdit.style.display = "none";
    }
  });


  // ✅ تحديث التاريخ المختار عند اختيار تاريخ من calendar
  const calendarObserver = new MutationObserver(() => {
    const newDate = localStorage.getItem("calendarPickedDate");
    const targetId = localStorage.getItem("selectedCalendarTarget");
    if (newDate && targetId) {
      const targetSpan = document.getElementById(targetId);
      if (targetSpan) {
        targetSpan.textContent = newDate;
      }
      localStorage.removeItem("calendarPickedDate");
      localStorage.removeItem("selectedCalendarTarget");
    }
  });

  calendarObserver.observe(document.body, { childList: true, subtree: true });




  // ✅ تفعيل زر مشاركة الموظفين 
  const shareBtnEdit = document.getElementById('shareTaskEdit');
  if (shareBtnEdit) {
    shareBtnEdit.addEventListener('click', function () {
      document.getElementById('empDialog').showModal();
    });

    document.getElementById('shareBtn').addEventListener('click', function () {
      const selectedEmployees = document.querySelectorAll('.emp-list li.selected');
      const shareTaskButton = document.getElementById('shareTaskEdit');

      shareTaskButton.innerHTML = '';

      const profileImg = document.createElement('img');
      profileImg.src = 'img/profile.png';
      profileImg.alt = 'Profile';
      profileImg.classList.add('invatedEmpImg');
      shareTaskButton.appendChild(profileImg);

      selectedEmployees.forEach(employee => {
        const imgSrc = employee.getAttribute('data-img');
        const imgElement = document.createElement('img');
        imgElement.src = imgSrc;
        imgElement.classList.add('invatedEmpImg');
        shareTaskButton.appendChild(imgElement);
      });

      const plusIcon = document.createElement('i');
      plusIcon.className = 'bx bxs-plus-circle';
      plusIcon.style.color = 'rgba(180,180,247,0.63)';
      shareTaskButton.appendChild(plusIcon);

      document.getElementById('empDialog').close();
    });
  }


  //  بعد الضغط على Apply Changes
  // 1️⃣ جلب العناصر
  const applyChangesBtn = document.getElementById('applyChanges');
  const confirmDialog = document.getElementById('confirmDialog');
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  const confirmEditBtn = document.getElementById('confirmEidtBtn');

  // 2️⃣ عند الضغط على Apply Changes -> افتح حوار التأكيد
  applyChangesBtn.addEventListener('click', event => {
    event.preventDefault();          // لمنع الـ form من الإرسال الفوري
    confirmDialog.showModal();
  });

  // 3️⃣ إلغاء التعديل -> إغلاق الحوّار
  cancelEditBtn.addEventListener('click', () => {
    confirmDialog.close();
  });

  // 4️⃣ إغلاق الحوّار عند النقر خارج المحتوى
  confirmDialog.addEventListener('click', e => {
    const rect = confirmDialog.getBoundingClientRect();
    const inside = (
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    );
    if (!inside) confirmDialog.close();
  });

  // 5️⃣ عند التأكيد
  confirmEditBtn.addEventListener('click', () => {
    confirmDialog.close();
    ViewDialog.close();
    // هنا ضيف كود تنفيذ التعديلات فعلياً
    showMessage("Task <strong>edited</strong> and collaborators notified successfully.", "success");
  });





  // ✅ زر الحذف (يخفي العنصر من القائمة مؤقتًا) 
  deleteBtn.addEventListener("click", () => {
    // عناصر الديالوق 
    const deleteDialog = document.getElementById('deleteConfirmDialog');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');



    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        deleteDialog.showModal();
      });
    });

    // إلغاء 
    cancelDeleteBtn.addEventListener('click', () => {
      deleteDialog.close();
    });
    // إغلاق عند الضغط خارج الديالوق 
    deleteDialog.addEventListener('click', (e) => {
      const rect = deleteDialog.getBoundingClientRect();
      const isInDialog =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (!isInDialog) {
        deleteDialog.close();
      }
    });





    // تأكيد الحذف 
    confirmDeleteBtn.addEventListener('click', () => {
      if (currentTaskData.element) {
        currentTaskData.element.remove();
        ViewDialog.close();
      }
      deleteDialog.close();
      showMessage("Task <span style='font-weight: bold;'>deleted </span> and collaborators notified successfully.", "success");
      
    });


    //THIS NOT WORKING IDK WHY
    const addTaskBtn = document.getElementById('addNewTask');
    addTaskBtn.addEventListener('click', () => {
      addTaskDialog.close();
      showMessage("Task <span style='font-weight: bold;'>Added </span> and collaborators notified successfully.", "success");
    });










  });


  const showBtn = document.getElementById('showAllPositions');
  const positionsDialog = document.getElementById('allPositionsDialog');
  const closeBtn = positionsDialog.querySelector('.closeBtn');

  showBtn.addEventListener('click', () => {
    // هنا يمكنك ملء القائمة ديناميكيًا قبل العرض، إذا أردت
    positionsDialog.showModal();
  });

  closeBtn.addEventListener('click', () => {
    positionsDialog.close();
  });


});






const clickableCards = document.querySelectorAll('.container');

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



























// بيانات الموظف
const employee = {
  name: 'Lama Ahmed',
  avatarUrl: 'img/profile.png',
  points: 125
};

document.addEventListener('DOMContentLoaded', () => {
  const card = document.getElementById('celebrationCard');
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
// تهيئة الكونفيتي

  
let W, H;
function resizeCanvas() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ألوان فاقعة وروحّيه
const colors = [
  '#ff595e', // أحمر غني
  '#ffca3a', // أصفر فاقع
  '#8ac926', // أخضر ليموني
  '#1982c4', // أزرق قوي
  '#6a4c93'  // بنفسجي ملكي
];


let particles = [], animationStart = null;

function createParticle() {
  return {
    x: Math.random() * W,
    y: -10,
    r: Math.random() * 6 + 4,
    d: Math.random() * 20 + 10,
    tilt: Math.random() * 10 - 10,
    tiltAngleIncrement: Math.random() * 0.07 + 0.05,
    tiltAngle: 0,
    color: colors[Math.floor(Math.random() * colors.length)]
  };
}

function updateParticles() {
  particles.forEach(p => {
    p.tiltAngle += p.tiltAngleIncrement;
    p.y += (Math.cos(p.d) + 3 + p.r/2);
    p.x += Math.sin(p.d);
    p.tilt = Math.sin(p.tiltAngle) * 15;
  });
  particles = particles.filter(p => p.y < H + 20);
}

function drawParticles() {
  ctx.clearRect(0,0,W,H);
  particles.forEach(p => {
    ctx.beginPath();
    ctx.lineWidth = p.r;
    ctx.strokeStyle = p.color;
    ctx.moveTo(p.x + p.tilt + p.r/2, p.y);
    ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r/2);
    ctx.stroke();
  });
}

function confettiLoop(timestamp) {
  if (!animationStart) animationStart = timestamp;
  const elapsed = timestamp - animationStart;

  if (elapsed < 5000) {
    for (let i = 0; i < 5; i++) particles.push(createParticle());
    updateParticles();
    drawParticles();
    requestAnimationFrame(confettiLoop);
  } else {
    ctx.clearRect(0,0,W,H);
  }
}


const DURATION       = 5000; // مدة الكونفيتي كاملة بالملّي
const FADE_DURATION  = 1000; // مدة التلاشي بالملّي

function confettiLoop(ts) {
  if (!animationStart) animationStart = ts;
  const elapsed = ts - animationStart;
  let alpha = 1;

  // 1️⃣ خلال الـ DURATION: استمر بالإنتاج الطبيعي
  if (elapsed < DURATION) {
    for (let i = 0; i < 5; i++) particles.push(createParticle());
  }
  // 2️⃣ بين DURATION و DURATION+FADE_DURATION: لا تنتج، بل قلّل الشفافية
  else if (elapsed < DURATION + FADE_DURATION) {
    const fadeElapsed = elapsed - DURATION;
    alpha = 1 - (fadeElapsed / FADE_DURATION);
  }
  // 3️⃣ بعد DURATION+FADE_DURATION: انتهى كل شيء
  else {
    ctx.clearRect(0, 0, W, H);
    return;
  }

  // تحديث ورسم الكونفيتي مع تطبيق alpha
  updateParticles();
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  ctx.globalAlpha = alpha;
  drawParticles();
  ctx.restore();

  requestAnimationFrame(confettiLoop);
}


// عرض الكارد وإطلاق الكونفيتي

  
  document.getElementById('eomName').textContent   = employee.name;
  document.getElementById('eomAvatar').src        = employee.avatarUrl;
  document.getElementById('eomPoints').textContent = `${employee.points} Points`;

  requestAnimationFrame(confettiLoop);

  // بعد 10 ثواني: اخفِ الكونفيتي واختفي الكارد
  setTimeout(() => {
    // أولاً نظّف الكونفيتي
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // ثم اختفِ الكارد
    card.style.opacity = '0';
    card.style.transform = 'translate(-50%, -50%) scale(0)';
  }, 5000);
});