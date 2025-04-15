// Updated auth.js to store user full_name and phone in auth metadata only (no profiles table)
const SUPABASE_URL = "https://iptradvpkatbfgibcrru.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwdHJhZHZwa2F0YmZnaWJjcnJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MTMzOTAsImV4cCI6MjA1ODQ4OTM5MH0.oxYnh1vKKCv2cXEQMiBQv_3RehZcarmjscMApg6VLe8";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
let currentUserId = null;

window.onload = async () => {
  const { data: { session } } = await client.auth.getSession();
  const path = window.location.pathname;
  const isUserProtectedPage = path === "/user/";

  if (!session && isUserProtectedPage) {
    window.location.href = "/";
    return;
  }

  const { data: { user }, error } = await client.auth.getUser();
  if (user) {
    currentUserId = user.id;
    const name = user.user_metadata?.full_name || "User";
    const phone = user.user_metadata?.phone || "-";

    const loginStatus = document.getElementById("login-status");
    if (loginStatus) loginStatus.innerText = `Logged in as ${name} (${user.email})`;

    const authSection = document.getElementById("auth-section");
    if (authSection) authSection.style.display = "none";

    const logoutButton = document.getElementById("logout-button");
    if (logoutButton) logoutButton.style.display = "inline-block";

    if (document.getElementById("profile-name")) {
      document.getElementById("profile-name").value = name;
      document.getElementById("profile-phone").value = phone;
    }
  } else if (isUserProtectedPage) {
    alert("Please confirm your email before continuing.");
    window.location.href = "/";
  }
};

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
    alert("Sign up failed: " + error.message);
    console.error(error);
  } else {
    alert("Check your inbox to confirm your email.");
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
    alert("Login failed: " + error.message);
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
    alert("User not found");
    return;
  }

  const { data, error } = await client.auth.updateUser({
    data: {
      full_name,
      phone
    }
  });

  if (error) {
    alert("Failed to update profile: " + error.message);
    console.error(error);
  } else {
    alert("Profile updated!");
  }
}

async function logout() {
  const { error } = await client.auth.signOut();
  if (error) console.error(error);
  window.location.href = "/";
}

$(document).on('submit', '#signup-form', function(event){
  event.preventDefault();
  signUp();
})

$(document).on('submit', '#login-form', function(event){
  event.preventDefault();
  logIn();
})

$(document).on('submit', '#profile-form', function(event){
  event.preventDefault();
  updateProfile();
})

$(document).on('click', '#logout-button', function(){
  logout();
});
