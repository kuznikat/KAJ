
const transactions = JSON.parse(localStorage.getItem("transactions")) || [];

const formatter = new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    signDisplay: "always"
});

const list = document.getElementById("transactionsList");
const form = document.getElementById("transaction-form");
const formError = document.getElementById("form-error");
const status = document.getElementById("status");
const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expence = document.getElementById("expence");

form.addEventListener("submit", addTransaction);


function updateBalance() {
    const totalIncome = transactions
        .filter(transaction => transaction.type === "income")
        .reduce((total, transaction) => total + transaction.amount, 0);

    const totalExpence = transactions
        .filter(transaction => transaction.type === "expence")
        .reduce((total, transaction) => total + transaction.amount, 0);

    const totalBalance = totalIncome - totalExpence;

    balance.textContent = formatter.format(totalBalance).replace("CZK", "").trim() + " Kč";
    income.textContent = formatter.format(totalIncome).replace("CZK", "").trim() + " Kč";
    expence.textContent = formatter.format(-totalExpence).replace("CZK", "").trim() + " Kč";
}




function listLoader() {
    list.innerHTML = "";

    status.textContent = "";

    if (transactions.length === 0) {
        status.textContent = "No transactions found";
        return;
    }

    transactions.forEach((transactions) => {
        const sign = "income" === transactions.type ? 1 : -1;
        const item = document.createElement("li");
        item.classList.add(transactions.type);


        const signedAmount = transactions.amount * sign;
        let formattedAmount = formatter.format(signedAmount);
        formattedAmount = formattedAmount.replace("CZK", "").trim() + " Kč";

        item.innerHTML = `
            <div class="name">
                <h4>${transactions.name}</h4>
                <p>${new Date(transactions.date).toLocaleDateString()}</p>
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

listLoader();
updateBalance();

function deleteTransaction(id) {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    const transactionIndex = transactions.findIndex(transaction => transaction.id === id);
    transactions.splice(transactionIndex, 1);

    updateBalance();
    saveTransactions();
    listLoader();
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

    //     formError.textContent = "";

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

    transactions.push({
        id: transactions.length + 1,
        name,
        amount,
        date: new Date(date),
        type: 'on' === fData.get("type") ? "income" : "expence",
    });

    form.reset();
    updateBalance();
    saveTransactions();
    listLoader();
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


