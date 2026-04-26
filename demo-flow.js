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

  form.addEventListener("submit", (e) => {
    e.preventDefault();
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
