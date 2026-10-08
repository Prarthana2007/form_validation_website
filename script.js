const registrationForm = document.getElementById("registrationForm");
const successMessage = document.getElementById("successMessage");
const registrationSummary = document.getElementById("registrationSummary");
const registrationDetails = document.getElementById("registrationDetails");
const dismissSuccess = document.getElementById("dismissSuccess");
const aboutField = document.getElementById("about");
const aboutCounter = document.getElementById("aboutCounter");
const passwordField = document.getElementById("password");
const confirmPasswordField = document.getElementById("confirmPassword");
const strengthLabel = document.getElementById("strengthLabel");
const strengthFill = document.getElementById("strengthFill");
const hobbyInputs = document.querySelectorAll('input[name="hobbies"]');
const today = new Date();
const latestBirthDate = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());
// Keep the input limit in local calendar time so it matches the age check.
const latestBirthDateValue = `${latestBirthDate.getFullYear()}-${String(latestBirthDate.getMonth() + 1).padStart(2, "0")}-${String(latestBirthDate.getDate()).padStart(2, "0")}`;
document.getElementById("dob").max = latestBirthDateValue;

const validators = {
  fullName(value) {
    return value.trim().length >= 3 ? "" : "Enter your full name (at least 3 characters).";
  },
  dob(value) {
    if (!value) return "Please enter your date of birth.";
    const birthDate = new Date(`${value}T00:00:00`);
    if (Number.isNaN(birthDate.getTime()) || birthDate > latestBirthDate) return "You must be at least 17 years old to register.";
    return "";
  },
  gender(value) {
    return value ? "" : "Please select a gender option.";
  },
  phone(value) {
    return /^[6-9]\d{9}$/.test(value.trim()) ? "" : "Enter 10 digits starting with 6, 7, 8, or 9.";
  },
  email(value) {
    return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(value.trim()) ? "" : "Enter a valid email address.";
  },
  password(value) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s]).{8,}$/.test(value) ? "" : "Use 8+ characters with uppercase, lowercase, a number, and a special character.";
  },
  confirmPassword(value) {
    return value && value === passwordField.value ? "" : "Your passwords do not match.";
  },
  registerNumber(value) {
    return value.trim() ? "" : "Enter your register number.";
  },
  department(value) {
    return value ? "" : "Please select your department.";
  },
  year(value) {
    return value ? "" : "Please select your year of study.";
  },
  cgpa(value) {
    const score = Number(value);
    return value !== "" && Number.isFinite(score) && score >= 0 && score <= 10 ? "" : "Enter a CGPA between 0 and 10.";
  },
  address(value) {
    return value.trim() ? "" : "Enter your street address.";
  },
  city(value) {
    return value.trim() ? "" : "Enter your city.";
  },
  state(value) {
    return value.trim() ? "" : "Enter your state.";
  },
  pinCode(value) {
    return /^\d{6}$/.test(value.trim()) ? "" : "Enter a valid 6-digit PIN code.";
  },
  about(value) {
    if (!value.trim()) return "Add a short introduction about yourself.";
    return value.length <= 200 ? "" : "Keep your introduction to 200 characters or fewer.";
  }
};

function showFieldState(name, message) {
  const container = document.querySelector(`[data-field="${name}"]`);
  const error = document.getElementById(`${name}Error`);
  if (!container || !error) return !message;

  error.textContent = message;
  container.classList.toggle("is-invalid", Boolean(message));
  container.classList.toggle("is-valid", !message);

  const control = container.querySelector("input:not([type='checkbox']), select, textarea");
  if (control) {
    if (message) control.setAttribute("aria-invalid", "true");
    else control.removeAttribute("aria-invalid");
  }
  return !message;
}

function validateField(name) {
  const control = document.getElementById(name);
  const message = validators[name](control.value);
  return showFieldState(name, message);
}

function validateHobbies() {
  const selected = Array.from(hobbyInputs).some((input) => input.checked);
  const container = document.querySelector('[data-field="hobbies"]');
  const error = document.getElementById("hobbiesError");
  error.textContent = selected ? "" : "Choose at least one hobby.";
  container.classList.toggle("is-invalid", !selected);
  container.classList.toggle("is-valid", selected);
  hobbyInputs.forEach((input) => {
    if (!selected) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
  });
  return selected;
}

function validateTerms() {
  const terms = document.getElementById("terms");
  const container = document.querySelector('[data-field="terms"]');
  const error = document.getElementById("termsError");
  const accepted = terms.checked;
  error.textContent = accepted ? "" : "You need to accept the terms to continue.";
  container.classList.toggle("is-invalid", !accepted);
  container.classList.toggle("is-valid", accepted);
  if (!accepted) terms.setAttribute("aria-invalid", "true");
  else terms.removeAttribute("aria-invalid");
  return accepted;
}

function updatePasswordStrength() {
  const password = passwordField.value;
  const criteria = [/[a-z]/.test(password), /[A-Z]/.test(password), /\d/.test(password), /[^A-Za-z\d\s]/.test(password)];
  const score = criteria.filter(Boolean).length;
  let strength = "Not set";
  let level = 0;
  if (password) {
    if (password.length >= 8 && score === 4) {
      strength = "Strong";
      level = 3;
    } else if (password.length >= 8 && score >= 2) {
      strength = "Medium";
      level = 2;
    } else {
      strength = "Weak";
      level = 1;
    }
  }
  strengthLabel.textContent = strength;
  strengthLabel.style.color = level === 3 ? "#32805e" : level === 2 ? "#ad8428" : level === 1 ? "#c34646" : "";
  strengthFill.style.width = `${level * 33.333}%`;
  strengthFill.classList.toggle("medium", level === 2);
  strengthFill.classList.toggle("strong", level === 3);
}

function updateAboutCounter() {
  const length = aboutField.value.length;
  aboutCounter.textContent = `${length} / 200`;
  aboutCounter.classList.toggle("at-limit", length >= 190);
}

function renderRegistrationDetails() {
  const selectedHobbies = Array.from(hobbyInputs)
    .filter((input) => input.checked)
    .map((input) => input.nextElementSibling.textContent.trim())
    .join(", ");
  const details = [
    ["Full name", document.getElementById("fullName").value.trim()],
    ["Date of birth", document.getElementById("dob").value],
    ["Gender", document.getElementById("gender").selectedOptions[0].textContent.trim()],
    ["Phone number", `+91 ${document.getElementById("phone").value.trim()}`],
    ["Email address", document.getElementById("email").value.trim()],
    ["Register number", document.getElementById("registerNumber").value.trim()],
    ["Department", document.getElementById("department").selectedOptions[0].textContent.trim()],
    ["Year of study", document.getElementById("year").selectedOptions[0].textContent.trim()],
    ["CGPA", `${document.getElementById("cgpa").value} / 10`],
    ["Address", document.getElementById("address").value.trim()],
    ["City", document.getElementById("city").value.trim()],
    ["State", document.getElementById("state").value.trim()],
    ["PIN code", document.getElementById("pinCode").value.trim()],
    ["Hobbies", selectedHobbies],
    ["About", aboutField.value.trim(), true]
  ];

  registrationDetails.replaceChildren();
  details.forEach(([label, value, wide]) => {
    const item = document.createElement("div");
    if (wide) item.classList.add("detail-wide");
    const term = document.createElement("dt");
    term.textContent = label;
    const description = document.createElement("dd");
    description.textContent = value;
    item.append(term, description);
    registrationDetails.append(item);
  });
}

Object.keys(validators).forEach((name) => {
  const control = document.getElementById(name);
  control.addEventListener("blur", () => validateField(name));
  control.addEventListener("input", () => {
    if (control.closest(".field").classList.contains("is-invalid") || control.closest(".field").classList.contains("is-valid")) validateField(name);
    if (name === "password") {
      updatePasswordStrength();
      if (confirmPasswordField.value) validateField("confirmPassword");
    }
  });
  control.addEventListener("change", () => {
    if (control.closest(".field").classList.contains("is-invalid") || control.closest(".field").classList.contains("is-valid")) validateField(name);
  });
});

aboutField.addEventListener("input", updateAboutCounter);
hobbyInputs.forEach((input) => input.addEventListener("change", () => {
  if (document.querySelector('[data-field="hobbies"]').classList.contains("is-invalid") || document.querySelector('[data-field="hobbies"]').classList.contains("is-valid")) validateHobbies();
}));
document.getElementById("terms").addEventListener("change", validateTerms);

registrationForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const fieldsAreValid = Object.keys(validators).map(validateField).every(Boolean);
  const hobbiesAreValid = validateHobbies();
  const termsAreValid = validateTerms();

  if (!fieldsAreValid || !hobbiesAreValid || !termsAreValid) {
    successMessage.hidden = true;
    registrationSummary.hidden = true;
    const firstInvalid = registrationForm.querySelector(".is-invalid input, .is-invalid select, .is-invalid textarea, .terms-row.is-invalid input");
    if (firstInvalid) firstInvalid.focus({ preventScroll: true });
    return;
  }

  renderRegistrationDetails();
  successMessage.hidden = false;
  registrationSummary.hidden = false;
  successMessage.scrollIntoView({ behavior: "smooth", block: "center" });
});

registrationForm.addEventListener("reset", () => {
  window.setTimeout(() => {
    registrationForm.querySelectorAll(".is-invalid, .is-valid").forEach((container) => container.classList.remove("is-invalid", "is-valid"));
    registrationForm.querySelectorAll(".field-error").forEach((error) => { error.textContent = ""; });
    registrationForm.querySelectorAll("[aria-invalid]").forEach((control) => control.removeAttribute("aria-invalid"));
    successMessage.hidden = true;
    registrationSummary.hidden = true;
    registrationDetails.replaceChildren();
    strengthLabel.textContent = "Not set";
    strengthLabel.style.color = "";
    strengthFill.style.width = "0";
    strengthFill.classList.remove("medium", "strong");
    updateAboutCounter();
  }, 0);
});

dismissSuccess.addEventListener("click", () => {
  successMessage.hidden = true;
  registrationSummary.hidden = true;
});