const SUPABASE_URL = "https://iptradvpkatbfgibcrru.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwdHJhZHZwa2F0YmZnaWJjcnJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MTMzOTAsImV4cCI6MjA1ODQ4OTM5MH0.oxYnh1vKKCv2cXEQMiBQv_3RehZcarmjscMApg6VLe8";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
let currentUserId = null;

window.onload = async () => {
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
  }
};

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

$(document).on('click', '#logout-button', function(){
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
    user_id: user?.id || '',
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
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        amount: 10000, // or use form.amount
        event_url: form.event_url,
        description: 'ثبت‌نام برای رویداد'
      })
    });

    const result = await response.json();
    console.log("Server response:", result);

    const status = document.getElementById("registration-status");

    if (result.already_registered) {
      showAuthModal(result.message);
      status.innerText = result.message;
      status.className = "text-warning";
    } else if (result.payment_url) {
      window.location.href = result.payment_url;
    } else {
      showAuthModal("خطا در اتصال به درگاه پرداخت");
      status.innerText = "خطا در اتصال به درگاه پرداخت";
      status.className = "text-danger";
    }

  } catch (err) {
    console.error("Unexpected error:", err);
    showAuthModal("مشکل غیرمنتظره در ثبت‌نام");
  }
}

async function loadDashboard() {
  const { data: { session }, error } = await client.auth.getSession();

  if (error || !session || !session.user) {
    document.getElementById("user-info").innerHTML = `<p class="text-danger">لطفاً وارد شوید.</p>`;
    document.getElementById("event-list").innerHTML = "";
    return;
  }

  const user = session.user;
  const full_name = user.user_metadata?.full_name || "-";
  const phone = user.user_metadata?.phone || "-";

  document.getElementById("user-fullname").innerText = full_name;
  document.getElementById("user-email").innerText = user.email || "-";
  document.getElementById("user-phone").innerText = phone;

  document.getElementById("user-fullname").classList.remove('placeholder');
  document.getElementById("user-email").classList.remove('placeholder');
  document.getElementById("user-phone").classList.remove('placeholder');

  const { data: events, error: fetchError } = await client
    .from("registeration")
    .select("event_title, event_url, status, created_at, pay_confirm")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (fetchError) {
    console.error("Error loading registrations:", fetchError);
    document.getElementById("event-list").innerHTML += `<p class="text-danger">خطا در بارگیری رویدادها</p>`;
    return;
  }

  if (!events.length) {
    document.getElementById("event-list").innerHTML += `<p class="text-warning">هیچ رویدادی ثبت نشده است.</p>`;
    return;
  }

  let html = '<div class="list-group mt-3">';
  events.forEach(event => {
    html += `
      <a href="${event.event_url}" class="list-group-item list-group-item-action">
        <div class="d-flex w-100 justify-content-between">
          <h5 class="mb-1">${event.event_title}</h5>
          <small>${new Date(event.created_at).toLocaleDateString("fa-IR")}</small>
        </div>
        <p class="mb-1">وضعیت: ${event.pay_confirm ? "پرداخت شده ✅" : "در انتظار پرداخت ❌"}</p>
      </a>
    `;
  });
  html += '</div>';

  document.getElementById("event-list").innerHTML += html;
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
