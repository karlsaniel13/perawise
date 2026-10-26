
const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navMenu");
const themeBtn = document.getElementById("themeBtn");

const budgetDisplay = document.getElementById("budgetDisplay");
const spentDisplay = document.getElementById("spentDisplay");
const remainingDisplay = document.getElementById("remainingDisplay");
const progressBar = document.getElementById("progressBar");
const budgetMessage = document.getElementById("budgetMessage");
const budgetForm = document.getElementById("budgetForm");
const budgetInput = document.getElementById("budgetInput");

const expenseForm = document.getElementById("expenseForm");
const expenseDesc = document.getElementById("expenseDesc");
const expenseAmount = document.getElementById("expenseAmount");
const expenseCategory = document.getElementById("expenseCategory");
const expenseError = document.getElementById("expenseError");
const filterCategory = document.getElementById("filterCategory");
const expenseList = document.getElementById("expenseList");

const splitForm = document.getElementById("splitForm");
const billAmount = document.getElementById("billAmount");
const peopleCount = document.getElementById("peopleCount");
const tipPercent = document.getElementById("tipPercent");
const splitResult = document.getElementById("splitResult");

const contactForm = document.getElementById("contactForm");
const contactName = document.getElementById("contactName");
const contactEmail = document.getElementById("contactEmail");
const contactMessage = document.getElementById("contactMessage");
const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const messageError = document.getElementById("messageError");
const formSuccess = document.getElementById("formSuccess");

// Load saved information
let budget = Number(localStorage.getItem("perawise-budget")) || 0;
let expenses = [];

try {
    expenses = JSON.parse(
        localStorage.getItem("perawise-expenses")
    ) || [];
} catch (error) {
    expenses = [];
}

// Save information
function saveData() {
    localStorage.setItem("perawise-budget", budget);
    localStorage.setItem(
        "perawise-expenses",
        JSON.stringify(expenses)
    );
}

// Format Philippine Peso
function formatPeso(amount) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP"
    }).format(amount);
}

// Update budget summary
function updateSummary() {
    const spent = expenses.reduce(function(sum, item) {
        return sum + Number(item.amount);
    }, 0);

    const remaining = budget - spent;
    const percent = budget > 0 ? (spent / budget) * 100 : 0;

    budgetDisplay.textContent = formatPeso(budget);
    spentDisplay.textContent = formatPeso(spent);
    remainingDisplay.textContent = formatPeso(remaining);

    remainingDisplay.classList.toggle("negative", remaining < 0);

    progressBar.style.width = Math.min(percent, 100) + "%";
    progressBar.classList.remove("warning", "danger");

    if (budget === 0) {
        budgetMessage.textContent =
            "Set a budget to start tracking your spending.";
    } else if (spent > budget) {
        progressBar.classList.add("danger");
        budgetMessage.textContent =
            "Over budget by " + formatPeso(spent - budget) +
            ". Time to cut back!";
    } else if (percent >= 80) {
        progressBar.classList.add("warning");
        budgetMessage.textContent =
            "Careful! You have used " + Math.round(percent) +
            "% of your budget.";
    } else {
        budgetMessage.textContent =
            "You are on track. Keep it up!";
    }
}

// Show expenses
function renderExpenses() {
    const selected = filterCategory.value;

    const visible = expenses.filter(function(item) {
        return selected === "All" || item.category === selected;
    });

    expenseList.innerHTML = "";

    if (visible.length === 0) {
        const empty = document.createElement("li");
        empty.className = "empty";
        empty.textContent = "No expenses to show yet.";
        expenseList.appendChild(empty);
        return;
    }

    visible.forEach(function(item) {
        const li = document.createElement("li");
        li.className = "expense-item";

        const info = document.createElement("div");
        info.className = "expense-info";

        const title = document.createElement("strong");
        title.textContent = item.description;

        const meta = document.createElement("span");
        meta.className = "meta";
        meta.textContent = item.category + " • " + item.date;

        info.append(title, meta);

        const amount = document.createElement("span");
        amount.className = "expense-amount";
        amount.textContent = formatPeso(item.amount);

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.dataset.id = item.id;
        deleteBtn.textContent = "Delete";
        deleteBtn.setAttribute(
            "aria-label",
            "Delete " + item.description
        );

        li.append(info, amount, deleteBtn);
        expenseList.appendChild(li);
    });
}

// Set budget
budgetForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const value = parseFloat(budgetInput.value);

    if (!Number.isFinite(value) || value <= 0) {
        alert("Please enter a budget greater than zero.");
        return;
    }

    budget = value;

    saveData();
    updateSummary();
    budgetForm.reset();
});

// Add expense
expenseForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const description = expenseDesc.value.trim();
    const amount = parseFloat(expenseAmount.value);
    const category = expenseCategory.value;

    if (description === "" || !Number.isFinite(amount) || amount <= 0) {
        expenseError.textContent =
            "Enter a description and an amount greater than zero.";
        return;
    }

    expenseError.textContent = "";

    const newExpense = {
        id: Date.now(),
        description: description,
        amount: amount,
        category: category,
        date: new Date().toLocaleDateString("en-PH")
    };

    expenses.unshift(newExpense);

    saveData();
    renderExpenses();
    updateSummary();
    expenseForm.reset();
});

// Delete expense
expenseList.addEventListener("click", function(event) {
    const button = event.target.closest(".delete-btn");

    if (!button) return;

    const id = Number(button.dataset.id);

    expenses = expenses.filter(function(item) {
        return item.id !== id;
    });

    saveData();
    renderExpenses();
    updateSummary();
});

// Filter expenses
filterCategory.addEventListener("change", renderExpenses);

// Split bill calculator
splitForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const bill = parseFloat(billAmount.value);
    const people = Number(peopleCount.value);
    const tipRate = Number(tipPercent.value);

    if (
        !Number.isFinite(bill) || bill <= 0 ||
        !Number.isInteger(people) || people < 1 ||
        !Number.isFinite(tipRate) || tipRate < 0
    ) {
        splitResult.textContent =
            "Please enter a valid bill, number of people, and tip.";
        return;
    }

    const tip = bill * (tipRate / 100);
    const total = bill + tip;
    const perPerson = total / people;

    splitResult.textContent =
        "Total with tip: " + formatPeso(total) +
        " | Each person pays: " + formatPeso(perPerson);
});

// Validate email
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Contact form
contactForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = contactName.value.trim();
    const email = contactEmail.value.trim();
    const message = contactMessage.value.trim();

    nameError.textContent = "";
    emailError.textContent = "";
    messageError.textContent = "";
    formSuccess.textContent = "";

    let isValid = true;

    if (name.length < 2) {
        nameError.textContent =
            "Please enter your name (at least 2 letters).";
        isValid = false;
    }

    if (!isValidEmail(email)) {
        emailError.textContent =
            "Please enter a valid email address.";
        isValid = false;
    }

    if (message.length < 10) {
        messageError.textContent =
            "Your message should be at least 10 characters.";
        isValid = false;
    }

    if (isValid) {
        formSuccess.textContent =
            "Thank you, " + name +
            "! Your message has been received.";

        contactForm.reset();
    }
});

// Mobile navigation
menuBtn.addEventListener("click", function() {
    navMenu.classList.toggle("open");
});

navMenu.addEventListener("click", function(event) {
    if (event.target.closest("a")) {
        navMenu.classList.remove("open");
    }
});

// Dark mode
function applyTheme(isDark) {
    document.body.classList.toggle("dark", isDark);
    themeBtn.textContent = isDark ? "Light Mode" : "Dark Mode";
}

themeBtn.addEventListener("click", function() {
    const isDark = !document.body.classList.contains("dark");

    applyTheme(isDark);

    localStorage.setItem(
        "perawise-theme",
        isDark ? "dark" : "light"
    );
});

// Load saved theme
applyTheme(localStorage.getItem("perawise-theme") === "dark");

// Update footer year
document.getElementById("year").textContent =
    new Date().getFullYear();

// Initial display
updateSummary();
renderExpenses();
