const supabaseUrl = "https://przmomhaqfcqjzhnqnmh.supabase.co";
const supabaseKey = "SUA_PUBLISHABLE_KEY_AQUI";

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// LOGIN
async function signUp() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabase.auth.signUp({ email, password });

  console.log(data, error);
}

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (data.user) {
    document.getElementById("auth").style.display = "none";
    document.getElementById("app").style.display = "block";
  }

  console.log(data, error);
}

async function logout() {
  await supabase.auth.signOut();

  document.getElementById("auth").style.display = "block";
  document.getElementById("app").style.display = "none";
}