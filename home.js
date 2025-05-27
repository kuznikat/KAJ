
const transactions = [
    {
        id: 1,
        name: 'Salary',
        amount: 45000,
        date: new Date(),
        type: 'income'
    },
    {
        id: 2,
        name: 'Grocery',
        amount: 743,
        date: new Date(),
        type: 'expence'
    },
    {
        id: 3,
        name: 'Fitness',
        amount: 1500,
        date: new Date(),
        type: 'expence'
    },

];

const formatter = new Intl.NumberFormat('cz-CZ', {
    style: 'currency',
    currency: 'CZK',
    signDisplay: "always",
})



const list = document.getElementById("transactionsList");

const status = document.getElementById("status");


function listLoader() {
    list.innerHTML = "";

    if (transactions.length === 0) {
        status.textContent = "No transactions found";
        return;
    }

    transactions.forEach((transactions) => {
        const item = document.createElement("li");
        item.classList.add(transactions.type);


        let formattedAmount = formatter.format(transactions.amount);
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

function deleteTransaction(id) {
    // alert("Are you sure you want to delete this transaction?");
}


