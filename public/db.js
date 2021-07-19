let db;

const request = indexedDB.open('BudgetDB', 1);

request.onupgradeneeded = ({ target }) => {
  db = target.result;
  db.createObjectStore("newBudget", { autoIncrement: true } );
};

request.onsuccess = function (e) {
    console.log('Success');
    db = e.target.result;
  
    if (navigator.onLine) {
      console.log('Online');
      checkDatabase();
    }
  };

request.onerror = function (e) {
  console.log(`Error!: ${e.target.errorCode}`);
};

function checkDatabase() {
    
  let transaction = db.transaction(['newBudget'], 'readwrite');

  const store = transaction.objectStore('newBudget');

  const getAll = store.getAll();


  getAll.onsuccess = function () {
   
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((res) => {
          if (res.length !== 0) {
            transaction = db.transaction(['newBudget'], 'readwrite');
            const currentStore = transaction.objectStore('newBudget');
            currentStore.clear();
            console.log('Clearing store');
          }
        });
    }
  };
}


const saveRecord = (record) => {
  console.log('Save record invoked');
  const transaction = db.transaction(['newBudget'], 'readwrite');
  const store = transaction.objectStore('newBudget');
  store.add(record);
};

window.addEventListener('online', checkDatabase);