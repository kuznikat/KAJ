// const balance = document.getElementById('balance');

// const money_income = document.getElementById('money-income');
// const money_outcome = document.getElementById('money-outcome');

// const list = document.getElementById('list');
// const form = document.getElementById('list');
// const rext = document.getElementById('text');
// const amount = document.getElementById('amount');


// const scamTransactions = [
//     { id: 1, text: 'Grocery', amount: -560 },
//     { id: 2, text: 'Salary', amount: -25000 },
//     { id: 3, text: 'Cinema', amount: -210 },
//     { id: 4, text: 'Gym', amount: -350 }
// ];

// let Transactions = scamTransactions;

// function addTransactionDom(transaction) {
//     const sign = transaction[0].amount < 0 ? "-" : "+";
//     const item = document.createElement("li");

//     item.classList.add(
//         transaction[0].amount < 0 ? "outcome" : "income"
//     )


//     item.innerHTML = `
//     ${transaction[0].text}<span>${sign}${Math.abs(transaction[0].amount)}</span>
//     <button class="delete-btn" onclik="">X</button>
//     `;

//     list.appendChild(item);
// }

// //Function to update the balance, income and outcome

// function updateValues() {
//     const amounts = Transactions.map(transaction => transaction.amount);
//     const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(3);
//     const income = amounts.filter(item => item > 0).reduce((acc, item) => (acc += item), 0).toFixed(3);
//     const outcome = (amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) * -1).toFixed(3);
// }

// //Function to initiate app

// function InitiationApp() {
//     list.innerHTML = ""
//     Transactions.forEach(addTransactionDom);
//     updateValues();

// }

// addTransactionDom(Transactions);

