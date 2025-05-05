const SUPABASE_URL = "https://iptradvpkatbfgibcrru.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwdHJhZHZwa2F0YmZnaWJjcnJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MTMzOTAsImV4cCI6MjA1ODQ4OTM5MH0.oxYnh1vKKCv2cXEQMiBQv_3RehZcarmjscMApg6VLe8";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
let currentUserId = null;
window.addEventListener("load", async () => {
  const { data: { user }, error } = await client.auth.getUser();
  await updateNavbarUserInfo(user);
});

document.addEventListener("DOMContentLoaded", async () => {
  const { data: { session } } = await client.auth.getSession();
  const path = window.location.pathname;
  const isUserProtectedPage = path === "/user/";
  const isLoginOrSignupPage = path === "/login/" || path === "/signup/";
  if (session?.user && isLoginOrSignupPage) {
    window.location.href = "/user/";
    return;
  }
  
  if (!session && isUserProtectedPage) {
    window.location.href = "/login/";
    return;
  }
  
  const { data: { user }, error } = await client.auth.getUser();
  if (user) {
    const role = user.user_metadata?.role || "user";
    $('.user-access').show();
    if (role === 'admin') {
      $('.admin-access').show();
    } else {
      $('.admin-access').hide();
    }
    await updateNavbarUserInfo(user)
    currentUserId = user.id;

    const name = user.user_metadata?.full_name || "کاربر";
    const phone = user.user_metadata?.phone || "-";

    const loginStatus = document.getElementById("login-status");
    if (loginStatus) loginStatus.innerText = `خوش آمدید ${name} (${user.email})`;

    const authSection = document.getElementById("auth-section");
    if (authSection) authSection.style.display = "none";

    const logoutButton = document.getElementById("logout-button");
    if (logoutButton) logoutButton.style.display = "inline-block";

    if (document.getElementById("profile-name")) {
      document.getElementById("profile-name").value = name;
      document.getElementById("profile-phone").value = phone;
    }
  } else if (isUserProtectedPage) {
    showAuthModal("لطفاً برای ادامه وارد شوید.");
    window.location.href = "/login/";
  } else {
    $('.user-access').remove();
    $('.admin-access').remove();

  }
});

async function signUp() {
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const full_name = document.getElementById("signup-name").value;
  const phone = document.getElementById("signup-phone").value;

  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
        phone
      }
    }
  });

  if (error) {
    showAuthModal("خطا در ثبت‌نام: " + error.message);
    console.error(error);
  } else {
    showAuthModal("ایمیل تأیید را بررسی کنید.");
  }
}

async function logIn() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    showAuthModal("خطا در ورود: " + error.message);
    console.error(error);
  } else {
    window.location.href = "/user/";
  }
}

async function updateProfile() {
  const full_name = document.getElementById("profile-name").value;
  const phone = document.getElementById("profile-phone").value;

  const { data: { user }, error: userError } = await client.auth.getUser();
  if (!user || userError) {
    showAuthModal("کاربر یافت نشد.");
    return;
  }

  const { error: updateError } = await client.auth.updateUser({
    data: {
      full_name,
      phone
    }
  });

  if (updateError) {
    showAuthModal("خطا در بروزرسانی اطلاعات: " + updateError.message);
  } else {
    showAuthModal("اطلاعات با موفقیت بروزرسانی شد.");
  }
}

async function logout() {
  const { error } = await client.auth.signOut();
  if (error) console.error(error);
  window.location.href = "/";
}

function showAuthModal(message) {
  const alertBox = document.getElementById("authAlertBox");
  alertBox.innerHTML = message;
  const modal = new bootstrap.Modal(document.getElementById("authAlertModal"));
  modal.show();
}

$(document).on('submit', '#signup-form', function(event){
  event.preventDefault();
  signUp();
});

$(document).on('submit', '#login-form', function(event){
  event.preventDefault();
  logIn();
});

$(document).on('submit', '#profile-form', function(event){
  event.preventDefault();
  updateProfile();
});

$(document).on('click', '.logout-button', function(){
  logout();
});

async function openEditProfileModal() {
  const { data: { session }, error } = await client.auth.getSession();

  if (error || !session || !session.user) {
    showAuthModal("لطفاً وارد شوید.");
    return;
  }

  const user = session.user;
  document.getElementById("edit-fullname").value = user.user_metadata?.full_name || "";
  document.getElementById("edit-phone").value = user.user_metadata?.phone || "";

  const editModal = new bootstrap.Modal(document.getElementById('editProfileModal'));
  editModal.show();
}

$(document).on('submit', '#edit-profile-form', async function(event) {
  event.preventDefault();

  const full_name = $('#edit-fullname').val();
  const phone = $('#edit-phone').val();

  const { data: { user }, error: userError } = await client.auth.getUser();
  if (userError || !user) {
    showAuthModal("لطفاً وارد شوید.");
    return;
  }

  const { error: updateError } = await client.auth.updateUser({
    data: {
      full_name,
      phone
    }
  });

  if (updateError) {
    showAuthModal("خطا در ذخیره تغییرات: " + updateError.message);
  } else {
    showAuthModal("اطلاعات با موفقیت به‌روزرسانی شد.");
    location.reload();  // Refresh the page to show updated info
  }
});

$(document).on('submit', '#registration-form', async function(event) {
  event.preventDefault();

  const { data: { session } } = await client.auth.getSession();
  const user = session?.user;

  const formData = {
    event_url: $('#reg-url').val() || '',
    event_title: $('#reg-title').val() || '',
    pay_option_1: $('#reg-pay1').val() || '',
    pay_option_2: $('#reg-pay2').val() || '',
    full_name: user?.user_metadata?.full_name || $('#reg-fullname').val() || '',
    email: user?.email || $('#reg-email').val() || '',
    phone: user?.user_metadata?.phone || $('#reg-phone').val() || '',
    notes: $('#reg-notes').val() || '',
    amount: $('input[name="amount"]:checked').val(),
    type: $('input[name="amount"]:checked').next("label").children('.regType').text() || '',
    user_id: user?.id || '',
    pre_register: $("#switchPreRegister").val()
  };

  await saveRegistration(formData, session?.access_token);
});

async function saveRegistration(form, token = null) {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch('https://iptradvpkatbfgibcrru.supabase.co/functions/v1/create_payment', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        user_id: form.user_id,
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        event_title: form.event_title,
        amount: form.amount,
        type:form.type,
        event_url: form.event_url,
        description: form.notes,
        pre_register: form.pre_register
      })
    });

    const result = await response.json();
    console.log("Server response:", result);

    const status = document.getElementById("registration-status");

    if (result.already_registered) {
      showAuthModal(result.message);
      if (status) {
        status.innerText = result.message;
        status.className = "text-warning";
      }
    } else if (result.payment_url) {
      window.location.href = result.payment_url;
    } else {
      showAuthModal("خطا در اتصال به درگاه پرداخت");
      if (status) {
        status.innerText = "خطا در اتصال به درگاه پرداخت";
        status.className = "text-danger";
      }
    }

  } catch (err) {
    console.error("Unexpected error:", err);
    showAuthModal("مشکل غیرمنتظره در ثبت‌نام");
  }
}


async function loadDashboard(user) {
  const full_name = user.user_metadata?.full_name || "-";
  const phone = user.user_metadata?.phone || "-";

  document.getElementById("user-fullname").innerText = full_name;
  document.getElementById("user-email").innerText = user.email || "-";
  document.getElementById("user-phone").innerText = phone;

  document.getElementById("user-fullname").classList.remove('placeholder');
  document.getElementById("user-email").classList.remove('placeholder');
  document.getElementById("user-phone").classList.remove('placeholder');

}
async function loadEvents(user) {
  const { data: events, error: fetchError } = await client
    .from("registeration")
    .select("id, event_title, type, event_url, status, created_at, pay_confirm")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const eventList = document.getElementById("event-list");
  eventList.innerHTML = "";


  if (fetchError) {
    console.error("Error loading registrations:", fetchError);
    eventList.innerHTML += `<p class="text-danger">خطا در بارگیری رویدادها</p>`;
    return;
  }

  if (!events.length) {
    eventList.innerHTML += `<p class="text-warning">هیچ رویدادی ثبت نشده است.</p>`;
    return;
  }

  events.forEach(event => {
    const div = document.createElement("tr");
    
    div.innerHTML = `
      <th scope="row"><strong><a href="${event.event_url}" target="_blank">${event.event_title}</strong></a></th>
      <td>${new Date(event.created_at).toLocaleDateString("fa-IR")}</td>
      <td>${event.type || "عادی"}</td>
      <td><a href="/status/?reg_id=${event.id}">${event.pay_confirm ? '<i class="bi bi-check2-square"></i> پرداخت شده' : "<i class='bi bi-hourglass-split'></i> در انتظار پرداخت"}</a></td>
    `;
    eventList.appendChild(div);
  });

  
}

$(document).on('submit', '#forgot-password-form', function(event){
  event.preventDefault();
  sendPasswordReset();
})
async function sendPasswordReset() {
  const email = document.getElementById("reset-email").value;
  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + "/user/reset/"
  });

  if (error) {
    showAuthModal("خطا در ارسال ایمیل تنظیم مجدد پسورد: " + error.message);
    console.error(error);
  } else {
    showAuthModal("لینکی برای تنظیم مجدد پسورد ایمیل شد. ایمیل خود را چک کنید.");
  }
}

async function updateNavbarUserInfo(user) {
  const userName = user.user_metadata?.full_name || user.email || "کاربر";
  const userInfoItem = document.getElementById("nav-user-info");

  if (user && userInfoItem) {
    userInfoItem.style.display = 'block';
    // const role = user.user_metadata.role || "user";
    // console.log(role)
    // userInfoItem.innerHTML = `
    //   <a class="nav-link dropdown-toggle" href="#" id="nav-user-name" role="button" data-bs-toggle="dropdown" aria-expanded="false">
    //     ${userName}
    //   </a>
    //   <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="nav-user-name">
    //     <li><a class="dropdown-item" href="/user/">داشبورد</a></li>
    //     <li><a class="dropdown-item" href="/user/changepassword/">تغییر رمز عبور</a></li>
    //     ${role === "admin" ? '<li><hr class="dropdown-divider"></li><li id="admin-panel-link"><a class="dropdown-item" href="/manage/">مدیریت کاربران</a></li>' : ""}
    //     <li><hr class="dropdown-divider"></li>
    //     <li><button class="logout-button dropdown-item text-danger" id="nav-logout">خروج</button>
    //   </ul>    
    // `;
  }
}

async function getCurrentUserInfo() {
  const { data: { user }, error: userError } = await client.auth.getUser();

  if (userError || !user) {
    console.error("User not found or not logged in.");
    return null;
  }

  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Error loading profile:", profileError.message);
    return null;
  }

  // Combine auth user and profile data
  const result = {
    id: user.id,
    email: user.email,
    created_at: user.created_at,
    full_name: profile.full_name,
    phone: profile.phone,
    other: profile // includes everything from your custom table
  };

  // Convert to array if needed
  return Object.values(result);
}

async function changePasswordWithVerification() {
  const currentPassword = document.getElementById("current-password").value;
  const newPassword = document.getElementById("new-password").value;

  const { data: { user }, error: userError } = await client.auth.getUser();
  if (userError || !user) {
    showAuthModal("لطفاً وارد شوید.");
    return;
  }

  // Re-authenticate the user by signing in again
  const { error: loginError } = await client.auth.signInWithPassword({
    email: user.email,
    password: currentPassword
  });

  if (loginError) {
    showAuthModal("رمز عبور فعلی اشتباه است.");
    return;
  }

  // If correct, update to the new password
  const { error: updateError } = await client.auth.updateUser({
    password: newPassword
  });

  if (updateError) {
    showAuthModal("خطا در تغییر رمز عبور: " + updateError.message);
  } else {
    showAuthModal("رمز عبور با موفقیت تغییر کرد. لطفاً دوباره وارد شوید.");
    const modalElement = document.getElementById("authAlertModal");
    const modalInstance = bootstrap.Modal.getInstance(modalElement);

    modalElement.addEventListener("hidden.bs.modal", async() => {
      await client.auth.signOut();
      window.location.href = "/login/";
    }, { once: true }); // Ensure it only fires once
  }
}

async function checkAdminAccess(user , error) {
  if (error || !user || user.user_metadata.role !== "admin") {
    alert("دسترسی غیرمجاز");
    window.location.href = "/";
    return;
  }
}

async function loadAdminDashboard() {
  const { data: { session }, error: sessionError } = await client.auth.getSession();

  if (sessionError || !session || !session.access_token) {
    document.getElementById("user-list").innerHTML = `<div class="text-danger">لطفاً وارد شوید.</div>`;
    return;
  }

  const token = session.access_token;

  const response = await fetch(`${SUPABASE_URL}/functions/v1/list_users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  const result = await response.json();

  const userList = document.getElementById("user-list");
  userList.innerHTML = "";

  if (!Array.isArray(result.users)) {
    userList.innerHTML = `<div class="text-danger">خطا در بارگذاری کاربران</div>`;
    return;
  }

  result.users.forEach(user => {
  const div = document.createElement("tr");

  const role = user.role || "user";
  const fullName = user.full_name || "-";
  const phone = user.phone || "-";

  div.innerHTML = `
      <th scope="row"><strong>${fullName}</strong></th>
      <td>${phone}</td>
      <td>${user.email}</td>
      <td>
        <select id="role-select-${user.id}" class="form-select form-select-sm w-auto d-inline-block mt-1">
          <option value="user" ${role === "user" ? "selected" : ""}>کاربر</option>
          <option value="editor" ${role === "editor" ? "selected" : ""}>دبیر</option>
          <option value="admin" ${role === "admin" ? "selected" : ""}>مدیر</option>
        </select>
      </td>
      <td>
        <button class="btn btn-primary btn-sm me-2" onclick="updateUserRole('${user.id}')">ثبت</button>
        <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id}')">حذف کاربر</button>
      </td>
      `;

    userList.appendChild(div);
  });
}

async function updateUserRole(userId) {
  const newRole = document.getElementById(`role-select-${userId}`).value;
  const { data: { session }, error } = await client.auth.getSession();
  if (!session || !session.access_token) return alert("شما وارد نشده‌اید.");

  const token = session.access_token;

  const response = await fetch(`${SUPABASE_URL}/functions/v1/update_user_role`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ user_id: userId, new_role: newRole })
  });

  const result = await response.json();

  if (result.error) {
    alert("خطا در بروزرسانی نقش: " + (result.error || "نامشخص"));
  } else {
    alert("نقش با موفقیت بروزرسانی شد.");
    loadAdminDashboard();
  }
}

async function deleteUser(userId) {
  const confirmDelete = confirm("آیا مطمئن هستید که می‌خواهید این کاربر را حذف کنید؟");
  if (!confirmDelete) return;

  const { data: { session } } = await client.auth.getSession();
  const token = session?.access_token;

  const res = await fetch("https://iptradvpkatbfgibcrru.supabase.co/functions/v1/delete_user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ user_id: userId })
  });

  const result = await res.json();
  if (result.success) {
    alert("کاربر با موفقیت حذف شد.");
    location.reload();
  } else {
    alert("خطا در حذف کاربر: " + (result.error || ""));
  }
}

async function payPending(regId) {
  const { data: { session }, error } = await client.auth.getSession();
  if (!session || !session.access_token) {
    showAuthModal("لطفاً ابتدا وارد شوید.");
    return;
  }

  try {
    // Step 1: Fetch registration info
    const { data: registration, error: fetchError } = await client
      .from("registeration")
      .select("id, user_name, user_email, user_phone, amount, event_url, event_title")
      .eq("id", regId)
      .single();

    if (fetchError || !registration) {
      showAuthModal("ثبت‌نام یافت نشد یا مشکلی در دریافت اطلاعات رخ داد.");
      return;
    }

    // Step 2: Call Edge Function with full data
    const response = await fetch("https://iptradvpkatbfgibcrru.supabase.co/functions/v1/create_payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        reg_id: regId,
        user_id: session.user.id,
        full_name: registration.user_name,
        email: registration.user_email,
        phone: registration.user_phone,
        amount: registration.amount,
        event_url: registration.event_url,
        event_title: registration.event_title,
        description: registration.notes,
        pre_register: false
      })
    });

    const result = await response.json();

    if (result.payment_url) {
      window.location.href = result.payment_url;
    } else {
      showAuthModal(result.message || "مشکلی در اتصال به درگاه پرداخت رخ داد.");
    }

  } catch (err) {
    console.error("Error initiating payment:", err);
    showAuthModal("مشکل غیرمنتظره در پرداخت.");
  }
}

async function showRegisteredEvents() {
  const { data, error } = await client
    .from("registeration")
    .select("event_url, event_title, status, created_at");

  if (error || !data.length) {
    document.getElementById("registered-events").innerHTML = "<p>هیچ رویدادی ثبت نشده است.</p>";
    return;
  }

  const eventMap = new Map();

  data.forEach(item => {
    const key = item.event_url;
    if (!eventMap.has(key)) {
      eventMap.set(key, {
        title: item.event_title,
        url: item.event_url,
        preregistered: 0,
        registered: 0,
        last_date: item.created_at
      });
    }

    const event = eventMap.get(key);
    if (item.status === "paid") {
      event.registered += 1;
    } else {
      event.preregistered += 1;
    }

    if (new Date(item.created_at) > new Date(event.last_date)) {
      event.last_date = item.created_at;
    }
  });
  const sortedEvents = Array.from(eventMap.values()).sort((a, b) => new Date(b.last_date) - new Date(a.last_date));

let html = "";
for (const event of sortedEvents) {
  const dateFormatted = new Date(event.last_date).toLocaleDateString("fa-IR", {
    year: "numeric", month: "long", day: "numeric"
  });
  const eventID = window.btoa(event.url);
  html += `
    <tr>
      <th scope="row"><a href="/status/?event_id=${eventID}">${event.title}</a></th>
      <td>${dateFormatted}</td>
      <td>${event.registered}</td>
      <td>${event.preregistered}</td>
    </tr>`;
}

document.getElementById("user-list").innerHTML = html;
}

async function initRegistrationForm() {

  const currentUserInfo = await getCurrentUserInfo();
  console.log("User Info:", currentUserInfo);
  // Optionally autofill user fields
  if (currentUserInfo) {
    $('#signupAlert').hide();
    const [id, email, created_at, full_name, phone] = currentUserInfo;
    $('#reg-fullname').val(full_name || '');
    $('#reg-email').val(email || '');
    $('#reg-phone').val(phone || '');
    $('#reg-user_id').val(id || '');
  } else {
    $('#signupAlert').show();
  }
}
