
const transactions = JSON.parse(localStorage.getItem("transactions")) || [];

const formatter = new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    signDisplay: "always"
});

const list = document.getElementById("transactionsList");
const form = document.getElementById("transaction-form");


const dateInput = document.getElementById("date");
const today = new Date().toISOString().split("T")[0];
dateInput.max = today;


const categorySelect = document.getElementById("category");
categorySelect.addEventListener("change", () => {
    if (categorySelect.value === "__custom__") {
        customFields.style.display = "block";
    } else {
        customFields.style.display = "none";
    }
});


const categoryFilter = document.getElementById("category-filter");
const customFields = document.getElementById("custom-category-fields");
const customEmoji = document.getElementById("custom-emoji");
const customName = document.getElementById("custom-name");
const formError = document.getElementById("form-error");
const status = document.getElementById("status");
const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expence = document.getElementById("expence");


const deleteModal = document.getElementById("delete-modal");
const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
const cancelDeleteBtn = document.getElementById("cancel-delete-btn");

const modal = document.getElementById("edit-modal");
const editType = document.getElementById("edit-type");
const editName = document.getElementById("edit-name");
const editAmount = document.getElementById("edit-amount");
const editDate = document.getElementById("edit-date");
const editError = document.getElementById("edit-error");
const editCategory = document.getElementById("edit-category");
const saveEditBtn = document.getElementById("save-edit-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");




form.addEventListener("submit", addTransaction);
categoryFilter.addEventListener("change", listLoader);




function updateBalance() {
    const totalIncome = transactions
        .filter(transaction => transaction.type === "income")
        .reduce((total, transaction) => total + transaction.amount, 0);

    const totalExpence = transactions
        .filter(transaction => transaction.type === "expence")
        .reduce((total, transaction) => total + transaction.amount, 0);

    const totalBalance = totalIncome - totalExpence;

    balance.textContent = formatter.format(totalBalance);
    income.textContent = formatter.format(totalIncome);
    expence.textContent = formatter.format(-totalExpence);
}


function listLoader() {
    list.innerHTML = "";

    status.textContent = "";

    if (transactions.length === 0) {
        status.textContent = "No transactions found";
        return;
    }

    const selectedFilter = categoryFilter.value;
    const filtered = selectedFilter === "all"
        ? transactions
        : transactions.filter(tx => tx.category === selectedFilter);

    filtered.forEach((transactions) => {
        const sign = "income" === transactions.type ? 1 : -1;
        const item = document.createElement("li");
        item.classList.add(transactions.type);


        const signedAmount = transactions.amount * sign;
        let formattedAmount = formatter.format(signedAmount);
        // formattedAmount = formattedAmount.replace("CZK", "").trim() + " Kč";

        item.innerHTML = `
            <div class="name">
                <h4>${transactions.name} <button class="edit-btn" onclick="editTransaction(${transactions.id})">✏️</button></h4>
                <p>${new Date(transactions.date).toLocaleDateString()}</p>
                <p class="category-tag">${transactions.category}</p>
            </div>

            <div class="amount"> 
                <span> ${formattedAmount}</span>
            </div >

            <div class="action">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" onclick="deleteTransaction(${transactions.id})">
                <path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
            </div>
        `;

        list.appendChild(item)

    });
}
refreshCategoryFilter();
listLoader();
updateBalance();


let pendingDeleteId = null;

function deleteTransaction(id) {
    pendingDeleteId = id;
    deleteModal.classList.remove("hidden");

    const transactionIndex = transactions.findIndex(transaction => transaction.id === id);
    transactions.splice(transactionIndex, 1);

    updateBalance();
    saveTransactions();
    listLoader();
}

const checkbox = document.getElementById("type");
checkbox.addEventListener("change", () => {
    checkbox.setAttribute("aria-label", checkbox.checked
        ? "Transaction type: Income selected"
        : "Transaction type: Expense selected");
});





confirmDeleteBtn.addEventListener("click", () => {
    const index = transactions.findIndex(t => t.id === pendingDeleteId);
    if (index !== -1) {
        transactions.splice(index, 1);
        saveTransactions();
        updateBalance();
        listLoader();
    }
    deleteModal.classList.add("hidden");
});

cancelDeleteBtn.addEventListener("click", () => {
    deleteModal.classList.add("hidden");
    pendingDeleteId = null;
});



const CUSTOM_CATEGORIES_KEY = "customCategories";

let customCategories = JSON.parse(localStorage.getItem(CUSTOM_CATEGORIES_KEY)) || [];

function saveCustomCategories() {
    localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(customCategories));
}



function addTransaction(e) {
    e.preventDefault();


    const form = e.target;
    const fData = new FormData(form);


    const name = fData.get("name").trim();
    const amount = parseFloat(fData.get("amount"));
    const date = fData.get("date");

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Name must contain at least one letter (including Czech letters)
    const nameHasLetter = /[a-zA-Zá-žÁ-Ž]/.test(name);

    // Name must NOT contain special characters
    const nameHasSpecialChar = /[^a-zA-Z0-9á-žÁ-Ž\s]/.test(name);

    formError.textContent = "";

    if (
        !name ||
        !nameHasLetter ||
        nameHasSpecialChar ||
        isNaN(amount) ||
        amount <= 0 ||
        !date ||
        selectedDate > today
    ) {
        formError.textContent = "No numbers-only names, no special characters allowed.";
        return;
    }

    let category;

    if (categorySelect.value === "__custom__") {
        const emoji = customEmoji.value.trim();
        const categoryName = customName.value.trim();

        if (!emoji || !categoryName) {
            formError.textContent = "Please fill in both custom emoji and name.";
            return;
        }

        category = `${emoji} ${categoryName}`;

        // Check if category already exists
        const exists = customCategories.some(cat => cat === category);
        if (!exists) {
            customCategories.push(category);
            saveCustomCategories();
            addCategoryOptionToSelect(category);
            addCategoryToFilterDropdown(category);
        }
    } else {
        category = categorySelect.value;
    }

    transactions.push({
        id: transactions.length + 1,
        name,
        amount,
        date: new Date(date),
        type: 'on' === fData.get("type") ? "income" : "expence",
        category,

    });

    form.reset();
    updateBalance();
    saveTransactions();
    listLoader();
    refreshCategoryFilter();
}


let currentEditId = null;

function editTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    currentEditId = id;

    editName.value = transaction.name;
    editAmount.value = transaction.amount;
    editDate.value = new Date(transaction.date).toISOString().split("T")[0];
    editType.value = transaction.type;


    // Load category options
    editCategory.innerHTML = [...categorySelect.options]
        .filter(opt => !opt.disabled)
        .map(opt => `<option value="${opt.value}">${opt.textContent}</option>`)
        .join("");
    editCategory.value = transaction.category;

    editError.textContent = "";
    modal.classList.remove("hidden");
}

saveEditBtn.addEventListener("click", () => {
    const transaction = transactions.find(t => t.id === currentEditId);
    if (!transaction) return;

    const name = editName.value.trim();
    const amount = parseFloat(editAmount.value);
    const date = editDate.value;
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (
        !name ||
        isNaN(amount) ||
        amount <= 0 ||
        !date ||
        selectedDate > today
    ) {
        editError.textContent = "Fill all fields correctly. No future dates.";
        return;
    }

    transaction.name = name;
    transaction.amount = amount;
    transaction.date = new Date(date);
    transaction.type = editType.value;
    transaction.category = editCategory.value;

    saveTransactions();
    updateBalance();
    listLoader();
    modal.classList.add("hidden");
});


cancelEditBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
});






function addCategoryOptionToSelect(cat) {
    if (!cat || typeof cat !== "string" || cat.trim() === "") return;

    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.insertBefore(option, categorySelect.querySelector('option[value="__custom__"]'));
}

customCategories.forEach(addCategoryOptionToSelect);

function addCategoryToFilterDropdown(cat) {
    if (!cat || typeof cat !== "string" || cat.trim() === "") return;

    const filter = document.getElementById("category-filter");

    // Skip if already present
    if ([...filter.options].some(opt => opt.value === cat)) return;

    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    filter.appendChild(opt);
}


function refreshCategoryFilter() {
    const uniqueCategories = [
        ...new Set(transactions.map(tx => tx.category))
    ];
    const filter = document.getElementById("category-filter");
    filter.innerHTML = '<option value="all">All</option>';
    uniqueCategories.forEach(cat => {
        if (!cat || typeof cat !== "string" || cat.trim() === "") return;
        const opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = cat;
        filter.appendChild(opt);
    });
}



function saveTransactions() {
    try {
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        localStorage.setItem("transactions", JSON.stringify(transactions));
    } catch (error) {
        console.error("Error saving transactions:", error);
        status.textContent = "Failed to save data.";
    }
}

