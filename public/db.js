let db;

const request = indexedDB.open('BudgetDB', 1);

request.onupgradeneeded = ({ target }) => {
  db = target.result;
  db.createObjectStore("BudgetStore", { autoIncrement: true } );
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
    
  let transaction = db.transaction(['BudgetStore'], 'readwrite');

  const store = transaction.objectStore('BudgetStore');

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
            transaction = db.transaction(['BudgetStore'], 'readwrite');
            const currentStore = transaction.objectStore('BudgetStore');
            currentStore.clear();
            console.log('Clearing store');
          }
        });
    }
  };
}


const saveRecord = (record) => {
  console.log('Save record invoked');
  const transaction = db.transaction(['BudgetStore'], 'readwrite');
  const store = transaction.objectStore('BudgetStore');
  store.add(record);
};

window.addEventListener('online', checkDatabase);