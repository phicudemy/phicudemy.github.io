const SUPABASE_URL = "https://iptradvpkatbfgibcrru.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwdHJhZHZwa2F0YmZnaWJjcnJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MTMzOTAsImV4cCI6MjA1ODQ4OTM5MH0.oxYnh1vKKCv2cXEQMiBQv_3RehZcarmjscMApg6VLe8";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
let currentUserId = null;

window.onload = async () => {
  const { data: { session } } = await client.auth.getSession();
  const path = window.location.pathname;
  const isUserProtectedPage = path === "/user/"; // only protect /user/, not /user/signin/, etc.

  if (!session && isUserProtectedPage) {
    window.location.href = "/login/";
    return;
  }

  const { data: { user }, error } = await client.auth.getUser();
  if (user) {
    currentUserId = user.id;
    const name = user.user_metadata?.full_name || "User";
    const loginStatus = document.getElementById("login-status");
    if (loginStatus) loginStatus.innerText = `Logged in as ${name} (${user.email})`;

    const authSection = document.getElementById("auth-section");
    if (authSection) authSection.style.display = "none";

    const logoutButton = document.getElementById("logout-button");
    if (logoutButton) logoutButton.style.display = "inline-block";

    await ensureUserProfile(user);

    if (document.getElementById("profile-name")) {
      await loadUserProfile(user.id);
      showBookmarks();

      const statusBox = document.getElementById("status");
      const profileForm = document.getElementById("profile-form");
      if (statusBox) statusBox.style.display = "none";
      if (profileForm) profileForm.style.display = "block";
    }
  } else if (isUserProtectedPage) {
    showAuthModal("لطفاً برای استفاده از امکانات کاربران ایمیل خود را تأیید کنید.");
    window.location.href = "/login/";
  }
};

async function ensureUserProfile(user) {
  const { data, error } = await client
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!data) {
    const { error: insertError } = await client
      .from("profiles")
      .insert({
        id: user.id,
        full_name: user.user_metadata?.full_name || "",
        phone: user.user_metadata?.phone || ""
      });

    if (insertError) {
      console.error("Failed to create user profile:", insertError.message);
    }
  }
}

async function loadUserProfile(userId) {
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error loading profile:", error.message);
    return;
  }

  const nameInput = document.getElementById("profile-name");
  const phoneInput = document.getElementById("profile-phone");
  const profileSection = document.getElementById("profile-section");

  if (nameInput) nameInput.value = data.full_name || "";
  if (phoneInput) phoneInput.value = data.phone || "";
  if (profileSection) profileSection.style.display = "block";
}

async function signUp() {
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const name = document.getElementById("signup-name").value;
  const phone = document.getElementById("signup-phone").value;

  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        phone: phone
      }
    }
  });

  if (error) {
    showAuthModal("خطا در ثبت‌نام: " + error.message);
    console.error(error);
  } else {
    const { data: { user } } = await client.auth.getUser();
    if (user) {
      currentUserId = user.id;
      await ensureUserProfile(user);
    }
    showAuthModal("ایمیل خود را تأیید کنید.");
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
    showAuthModal("خطا در ورود به سایت: " + error.message);
    console.error(error);
  } else {
    const { data: { user } } = await client.auth.getUser();
    if (user) {
      currentUserId = user.id;
      await ensureUserProfile(user);
    }
    window.location.href = "/user/";
  }
}

async function updateProfile(userId) {
  const full_name = document.getElementById("profile-name").value;
  const phone = document.getElementById("profile-phone").value;

  const { error } = await client
    .from("profiles")
    .update({
      full_name,
      phone,
      updated_at: new Date()
    })
    .eq("id", userId);

  if (error) {
    showAuthModal("خطا در بروزرسانی پروفایل: " + error.message);
  } else {
    showAuthModal("پروفایل به‌روز شد!");
  }
}

async function logout() {
  const { error } = await client.auth.signOut();
  if (error) console.error(error);
  window.location.href = "/";
}

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

async function updatePassword() {
  const newPassword = document.getElementById("new-password").value;
  const { data, error } = await client.auth.updateUser({ password: newPassword });

  if (error) {
    showAuthModal("خطا در تنظیم مجدد پسورد: " + error.message);
    console.error(error);
  } else {
    showAuthModal("پسورد با موفقیت به‌روز شد. می‌توانید با پسورد جدید وارد شوید.");
    window.location.href = "/login/";
  }
}

$(document).on('submit', '#forgot-password-form', function(event){
  event.preventDefault();
  sendPasswordReset();
})

$(document).on('submit', '#reset-password-form', function(event){
  event.preventDefault();
  updatePassword();
})

$(document).on('submit', '#signup-form', function(event){
  event.preventDefault();
  signUp();
})

$(document).on('submit', '#login-form', function(event){
  event.preventDefault();
  logIn();
})
async function bookmarkPost(title, url) {
    if (!currentUserId) {
      showAuthModal("برای ذخیره صفحه وارد شوید.");
      return;
    }
  
    const { error } = await client
      .from("bookmarks")
      .insert({
        user_id: currentUserId,
        post_title: title,
        post_url: url
      });
  
    if (error) {
      if (error.message.includes("duplicate key")) {
        showAuthModal("قبلاً ذخیره شده.");
      } else {
        console.error("Error bookmarking:", error);
        showAuthModal("Failed to save bookmark.");
      }
    } else {
      showAuthModal("Post bookmarked!");
    }
  }
  async function showBookmarks() {
    const { data, error } = await client
      .from("bookmarks")
      .select("*")
      .eq("user_id", currentUserId)
      .order("created_at", { ascending: false });
  
    if (error) {
      console.error("Error loading bookmarks:", error);
      return;
    }
  
    const container = document.getElementById("bookmarks");
    container.innerHTML = "<h4>Your Bookmarked Posts</h4>";
  
    data.forEach(b => {
      const link = document.createElement("a");
      link.href = b.post_url;
      link.innerText = b.post_title || b.post_url;
      link.className = "d-block mb-2";
      container.appendChild(link);
    });
  }
  
$(document).on('submit', '#registration-form', async function(event) {
  event.preventDefault();
  
  const formData = {
    event_url: $('#reg-url').val() || '',
    event_title: $('#reg-title').val() || '',
    pay_option_1: $('#reg-pay1').val() || '',
    pay_option_2: $('#reg-pay2').val() || '',
    full_name: $('#reg-fullname').val() || '',
    email: $('#reg-email').val() || '',
    phone: $('#reg-phone').val() || '',
    notes: $('#reg-notes').val() || '',
    user_id: $('#reg-user_id').val() || '',
  };

  console.log("Form data ready:", formData);
  
  await saveRegistration(formData);
});

async function saveRegistration(form) {
  const { data: { session }, error } = await client.auth.getSession();
  let token = session?.access_token || null;

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
        amount: 10000, // you can adjust dynamically if needed
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
      window.location.href = result.payment_url;  // Redirect user to Zarinpal for payment
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
  async function loadDashboard() {
    const { data: { session }, error } = await client.auth.getSession();
  
    if (error || !session || !session.user) {
      document.getElementById("user-info").innerHTML = `<p class="text-danger">لطفاً وارد شوید.</p>`;
      document.getElementById("event-list").innerHTML = "";
      return;
    }
  
    const user = session.user;
  
    // 🧠 Load user profile
    const { data: profile, error: profileError } = await client
      .from("profiles") // assuming your user profile table is "profiles"
      .select("full_name, phone")
      .eq("id", user.id)
      .single();
  
    if (profileError) {
      console.error("Error loading profile:", profileError);
    }
  
    document.getElementById("user-fullname").innerText = profile?.full_name || "-";
    document.getElementById("user-email").innerText = user.email || "-";
    document.getElementById("user-phone").innerText = profile?.phone || "-";
    document.getElementById("user-fullname").classList.remove('placeholder');
    document.getElementById("user-email").classList.remove('placeholder');
    document.getElementById("user-phone").classList.remove('placeholder');
  
    // 🧠 Load registered events
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

async function openEditProfileModal() {
  const { data: { session }, error } = await client.auth.getSession();

  if (error || !session || !session.user) {
    showAuthModal("لطفاً وارد شوید.");
    return;
  }

  const user = session.user;  // Fix this line!

  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Error loading profile:", profileError.message);
    return;
  }

  document.getElementById("edit-fullname").value = profile?.full_name || "";
  document.getElementById("edit-phone").value = profile?.phone || "";

  const editModal = new bootstrap.Modal(document.getElementById('editProfileModal'));
  editModal.show();
}

  
  $(document).on('submit', '#edit-profile-form', async function(event) {
    event.preventDefault();
  
    const full_name = $('#edit-fullname').val();
    const phone = $('#edit-phone').val();
  
    const { data: { session }, error } = await client.auth.getSession();

    if (error || !session || !session.user) {
      showAuthModal("لطفاً وارد شوید.");
      return;
    }
    const user = session.user;   // ✅ Add this line
    const { error: updateError } = await client
      .from("profiles")
      .update({
        full_name,
        phone,
        updated_at: new Date()
      })
      .eq("id", user.id);
  
    if (updateError) {
      showAuthModal("خطا در ذخیره تغییرات: " + updateError.message);
    } else {
      showAuthModal("اطلاعات با موفقیت به‌روزرسانی شد.");
      location.reload();  // Reload the dashboard to update name/phone
    }
  });
  function showAuthModal(message) {
    const alertBox = document.getElementById("authAlertBox");
    alertBox.innerHTML = message;
    
    const modal = new bootstrap.Modal(document.getElementById("authAlertModal"));
    modal.show();
  }
  