const DEMO_KEY = "mdb_demo_registration";

const PLANS = {
  yearly200: { id: "yearly200", name: "Yearly Membership", amount: 200, renewal: "Renews every year" },
  yearly1000: { id: "yearly1000", name: "Yearly Membership", amount: 1000, renewal: "Renews every year" },
  lifetime: { id: "lifetime", name: "Lifetime Membership", amount: 10000, renewal: "One-time payment" },
};

const KAAVU_LOCATIONS = {
  "Muchilottu Kavu - Taliparamba": "Taliparamba, Kannur",
  "Muchilottu Kavu - Payyanur": "Payyanur, Kannur",
  "Muchilottu Kavu - Azhikode": "Azhikode, Kannur",
  "Muchilottu Kavu - Pappinisseri": "Pappinisseri, Kannur",
};

const DEFAULT_CONTRIBUTIONS = [
  {
    id: "CNT-10231",
    date: "2026-04-10",
    kaavu: "Muchilottu Kavu - Taliparamba",
    description: "Festival support contribution",
    amount: 1000,
    status: "Successful",
  },
  {
    id: "CNT-10174",
    date: "2026-03-02",
    kaavu: "Muchilottu Kavu - Taliparamba",
    description: "Monthly kaavu maintenance support",
    amount: 500,
    status: "Successful",
  },
];

function getData() {
  try {
    return JSON.parse(localStorage.getItem(DEMO_KEY) || "{}");
  } catch (_e) {
    return {};
  }
}

function setData(newData) {
  const data = { ...getData(), ...newData };
  localStorage.setItem(DEMO_KEY, JSON.stringify(data));
}

function getContributions() {
  const data = getData();
  if (!Array.isArray(data.contributions)) {
    setData({ contributions: DEFAULT_CONTRIBUTIONS });
    return [...DEFAULT_CONTRIBUTIONS];
  }
  return data.contributions;
}

function formatMoney(amount) {
  return new Intl.NumberFormat("en-IN").format(amount);
}

function initPlanPage() {
  const cards = document.querySelectorAll("[data-plan]");
  const continueBtn = document.getElementById("continue-plan");
  const selectedText = document.getElementById("selected-plan-text");
  const error = document.getElementById("plan-error");
  if (!cards.length || !continueBtn) return;

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      cards.forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
      const planId = card.dataset.plan;
      selectedText.textContent = `Selected: ${PLANS[planId].name} - INR ${formatMoney(PLANS[planId].amount)}`;
      error.textContent = "";
    });
  });
}

function initAccountPage() {
  const form = document.getElementById("registration-account-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    window.location.href = "registration-details.html";
  });
}

function initDetailsPage() {
  const form = document.getElementById("registration-form");
  if (!form) return;
  document.getElementById("details-full-name").textContent = "-";

  // ── Membership type toggle ──────────────────────────────────────────
  const typeCards = document.querySelectorAll(".membership-type-card");
  const familySection = document.getElementById("family-section");
  typeCards.forEach(card => {
    card.addEventListener("click", () => {
      typeCards.forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      const val = card.querySelector("input[type='radio']").value;
      if (familySection) familySection.style.display = val === "family" ? "block" : "none";
      if (val === "family" && getFamilyRows().length === 0) addFamilyRow();
    });
    // Also fire when the radio changes via keyboard
    const radio = card.querySelector("input[type='radio']");
    radio.addEventListener("change", () => card.click());
  });

  // ── Age eligibility ─────────────────────────────────────────────────
  const ageInput = document.getElementById("age");
  const ageNotice = document.getElementById("age-notice");
  const submitBtn = document.getElementById("details-submit-btn");

  function checkAge() {
    const val = parseInt(ageInput.value, 10);
    if (ageInput.value && val < 18) {
      ageNotice.classList.add("visible");
      submitBtn.disabled = true;
      submitBtn.style.opacity = "0.5";
    } else {
      ageNotice.classList.remove("visible");
      submitBtn.disabled = false;
      submitBtn.style.opacity = "";
    }
  }
  if (ageInput) ageInput.addEventListener("input", checkAge);

  // ── Family member rows ──────────────────────────────────────────────
  const familyList = document.getElementById("family-members-list");
  const addFamilyBtn = document.getElementById("add-family-btn");
  let familyRowCount = 0;

  function getFamilyRows() {
    return familyList ? Array.from(familyList.querySelectorAll(".family-member-row")) : [];
  }

  function addFamilyRow() {
    if (!familyList) return;
    familyRowCount++;
    const idx = familyRowCount;
    const row = document.createElement("div");
    row.className = "family-member-row";
    row.setAttribute("data-idx", idx);
    row.innerHTML = `
      <div class="form-group" style="margin:0;">
        <label for="fam-name-${idx}">Member ${idx} – Full Name</label>
        <input class="input" id="fam-name-${idx}" type="text" placeholder="Full name" />
      </div>
      <div class="form-group" style="margin:0;">
        <label for="fam-age-${idx}">Age</label>
        <input class="input" id="fam-age-${idx}" type="number" min="0" max="120" placeholder="Age" />
      </div>
      <button type="button" class="remove-family-btn" aria-label="Remove member ${idx}">✕</button>
    `;
    row.querySelector(".remove-family-btn").addEventListener("click", () => row.remove());
    familyList.appendChild(row);
  }

  if (addFamilyBtn) addFamilyBtn.addEventListener("click", addFamilyRow);

  // ── Form submit ─────────────────────────────────────────────────────
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("details-error");
    errorEl.textContent = "";

    const age = parseInt(document.getElementById("age").value, 10);
    if (!age || age < 18) {
      errorEl.textContent = "Age must be 18 or above to apply for membership.";
      ageNotice.classList.add("visible");
      return;
    }

    const kaavu = document.getElementById("kaavu").value;
    const phone = document.getElementById("phone").value.trim();
    const state = document.getElementById("state").value;
    const country = document.getElementById("country").value;
    const occupation = document.getElementById("occupation").value.trim();
    const familyName = document.getElementById("familyName").value.trim();

    if (!phone || !kaavu || !state || !country || !occupation || !familyName) {
      errorEl.textContent = "Please fill in all required fields.";
      return;
    }

    const membershipType = document.querySelector("input[name='membershipType']:checked")?.value || "individual";

    // Collect family members if family membership
    const familyMembers = [];
    if (membershipType === "family") {
      getFamilyRows().forEach(row => {
        const idx = row.getAttribute("data-idx");
        const name = row.querySelector(`#fam-name-${idx}`)?.value.trim();
        const famAge = row.querySelector(`#fam-age-${idx}`)?.value;
        if (name) familyMembers.push({ name, age: famAge || "" });
      });
    }

    setData({
      kaavu,
      phone,
      state,
      country,
      occupation,
      familyName,
      membershipType,
      familyMembers,
      age,
      relationshipStatus: document.getElementById("relationshipStatus").value,
      houseStreet: document.getElementById("houseStreet").value.trim(),
      areaLocality: document.getElementById("areaLocality").value.trim(),
      district: document.getElementById("district").value.trim(),
      pinCode: document.getElementById("pinCode").value.trim(),
    });
    window.location.href = "register-flow.html";
  });
}

function initPaymentPage() {
  const submitBtn = document.getElementById("submit-payment");
  if (!submitBtn) return;

  document.getElementById("pay-plan").textContent = "-";
  document.getElementById("pay-member").textContent = "-";
  document.getElementById("pay-kaavu").textContent = "-";
  document.getElementById("pay-total").textContent = "-";

  submitBtn.addEventListener("click", () => {
    document.getElementById("payment-error").textContent = "";
  });
}

function initApprovalPage() {
  const data = getData();
  const plan = PLANS[data.planId];
  const nameEl = document.getElementById("app-name");
  if (!nameEl) return;

  nameEl.textContent = data.fullName || "Member";
  document.getElementById("app-plan").textContent = plan
    ? `${plan.name} - INR ${formatMoney(plan.amount)}`
    : "-";
  document.getElementById("app-kaavu").textContent = data.kaavu || "-";

  const approveBtn = document.getElementById("approve-member");
  approveBtn.addEventListener("click", () => {
    setData({ approvalStatus: "approved" });
  });
}

function initMemberDashboard() {
  const nameNode = document.getElementById("member-name");
  if (!nameNode) return;
  const data = getData();
  const plan = PLANS[data.planId];
  const selectedKaavu = data.kaavu || "Muchilottu Kavu - Taliparamba";

  nameNode.textContent = data.fullName || "Member";
  document.getElementById("member-kaavu").textContent =
    `Kaavu: ${selectedKaavu}`;
  const kaavuNameNode = document.getElementById("kaavu-name");
  if (kaavuNameNode) {
    kaavuNameNode.textContent = selectedKaavu;
  }
  const kaavuNameAboutNode = document.getElementById("kaavu-name-about");
  if (kaavuNameAboutNode) {
    kaavuNameAboutNode.textContent = selectedKaavu;
  }
  const kaavuLocationNode = document.getElementById("kaavu-location");
  if (kaavuLocationNode) {
    kaavuLocationNode.textContent = KAAVU_LOCATIONS[selectedKaavu] || "Kannur";
  }
  document.getElementById("member-plan").textContent = plan
    ? `${plan.name} - INR ${formatMoney(plan.amount)}`
    : "Yearly Membership";
}

document.addEventListener("DOMContentLoaded", () => {
  initAccountPage();
  initPlanPage();
  initDetailsPage();
  initPaymentPage();
  initApprovalPage();
  initMemberDashboard();
  initAdminDashboard();
  initLoginPage();
  initContributionPage();
  initContributionPaymentPage();
});

function initLoginPage() {
  const form = document.getElementById("login-form");
  if (!form) return;

  const identifier = document.getElementById("login-identifier");
  const password = document.getElementById("login-password");
  const error = document.getElementById("login-error");
  const submit = document.getElementById("login-submit");
  const forgot = document.getElementById("forgot-password");

  forgot.addEventListener("click", () => {
    error.textContent = "Password reset link has been sent to your registered contact.";
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    error.textContent = "";

    const loginId = identifier.value.trim().toLowerCase();
    const pass = password.value.trim();
    const data = getData();

    if (!loginId || !pass) {
      error.textContent = "Please enter login credentials.";
      return;
    }

    submit.textContent = "Signing in...";
    submit.disabled = true;

    setTimeout(() => {
      const isAdmin = loginId === "admin" || loginId.includes("admin");
      const isMemberAlias = loginId === "member" || loginId === "user";
      const isRegisteredMember =
        loginId === (data.email || "").toLowerCase() ||
        loginId === (data.phone || "").replace(/\s+/g, "");

      if (isAdmin) {
        const parsedName = identifier.value.trim();
        const cleanName =
          parsedName.toLowerCase() === "admin" ? "Admin" : parsedName;
        setData({ adminLoginName: cleanName || "Admin" });
        window.location.href = "admin-dashboard.html";
        return;
      }

      if (isMemberAlias || isRegisteredMember) {
        // Demo shortcut: "member" / "user" alias always goes straight to dashboard
        if (isMemberAlias || data.approvalStatus === "approved") {
          window.location.href = "member-dashboard.html";
          return;
        }
        submit.textContent = "Login";
        submit.disabled = false;
        error.textContent = "Your membership is under committee review.";
        return;
      }

      submit.textContent = "Login";
      submit.disabled = false;
      error.textContent = "Invalid credentials. Please check and try again.";
    }, 700);
  });
}

function initAdminDashboard() {
  const adminNameNode = document.getElementById("admin-name");
  if (!adminNameNode) return;
  const data = getData();
  adminNameNode.textContent = data.adminLoginName || "Admin";
}

function buildReceiptText(item, memberName) {
  return [
    "MDB Contribution Receipt",
    "------------------------",
    `Reference ID: ${item.id}`,
    `Date: ${item.date}`,
    `Member: ${memberName || "Member"}`,
    `Kaavu: ${item.kaavu}`,
    `Description: ${item.description}`,
    `Amount: INR ${formatMoney(item.amount)}`,
    `Status: ${item.status}`,
  ].join("\n");
}

function downloadReceipt(item) {
  const data = getData();
  const text = buildReceiptText(item, data.fullName);
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `receipt-${item.id}.txt`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function initContributionPage() {
  const form = document.getElementById("contribution-form");
  const tbody = document.getElementById("contribution-history-body");
  if (!form || !tbody) return;

  const data = getData();
  const kaavuSelect = document.getElementById("contribution-kaavu");
  if (data.kaavu) kaavuSelect.value = data.kaavu;

  const contributions = getContributions();
  tbody.innerHTML = "";
  contributions.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.date}</td>
      <td>${item.kaavu}</td>
      <td>${item.description}</td>
      <td>INR ${formatMoney(item.amount)}</td>
      <td>${item.id}</td>
      <td><span class="status approved">${item.status}</span></td>
      <td><button class="btn btn-ghost" type="button" data-receipt-id="${item.id}">Download Receipt</button></td>
    `;
    tbody.appendChild(row);
  });

  tbody.querySelectorAll("[data-receipt-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = contributions.find((c) => c.id === btn.dataset.receiptId);
      if (item) downloadReceipt(item);
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const amount = Number(document.getElementById("contribution-amount").value);
    const kaavu = document.getElementById("contribution-kaavu").value;
    const description = document.getElementById("contribution-description").value.trim();
    const error = document.getElementById("contribution-error");

    if (!amount || amount <= 0 || !kaavu || !description) {
      error.textContent = "Please fill amount, kaavu, and contribution description.";
      return;
    }
    error.textContent = "";
    setData({
      pendingContribution: {
        amount,
        kaavu,
        description,
      },
    });
    window.location.href = "contribution-payment.html";
  });
}

function initContributionPaymentPage() {
  const confirmBtn = document.getElementById("confirm-contribution-payment");
  if (!confirmBtn) return;

  const data = getData();
  const pending = data.pendingContribution;
  const error = document.getElementById("contribution-payment-error");

  if (!pending) {
    error.textContent = "No pending contribution found. Please add contribution details first.";
    confirmBtn.style.pointerEvents = "none";
    confirmBtn.style.opacity = "0.6";
    return;
  }

  document.getElementById("pay-contribution-kaavu").textContent = pending.kaavu;
  document.getElementById("pay-contribution-amount").textContent = `INR ${formatMoney(pending.amount)}`;
  document.getElementById("pay-contribution-description").textContent = pending.description;

  confirmBtn.addEventListener("click", () => {
    const contributions = getContributions();
    const refNo = `CNT-${Math.floor(10000 + Math.random() * 89999)}`;
    const today = new Date().toISOString().slice(0, 10);
    const newItem = {
      id: refNo,
      date: today,
      kaavu: pending.kaavu,
      description: pending.description,
      amount: pending.amount,
      status: "Successful",
    };
    setData({
      contributions: [newItem, ...contributions],
      pendingContribution: null,
    });
  });
}
