// creating variable to store db connection
let db;

//establishing the connection
const request = indexedDB.open('budget-tracker', 1);
request.onupgradeneeded = function(event) {
    const db = event.target.result; 
    db.createObjectStored('new_item', { autoIncrement: true });
};
//When request is successful
request.onsuccess = function(event) {
    db =event.target.result; 
    if (navigator.onLine) {
        uploadTransaction();
    };
};

request.onerror = function (event) {
    console.log(event.target.errorCode); //Throws an error
}
function saveRecord(record) {
    const transaction = db.transaction(['new_item'], 'readwrite');
    const processItemObjectStore = transaction.objectStore('new_item');
    processItemObjectStore.add(record);
}

function uploadTransaction() {
    const transaction = db.transaction(['new_item'], 'readwrite');
    const processItemObjectStore = transaction.objectStore('new_item');
    const getAll = processItemObjectStore.getAll();

    getAll.onsuccess = function() {
        //transmit data via api if there is data
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                };

                const transaction = db.transaction(['new_item'], 'readwrite');
                const transactionObjectStore = transaction.objectStore('new_item');
                transactionObjectStore.clear();

                alert('All the saved transactions have been submitted');
            })
            .catch(err => console.log(err));
        }
    };
}
window.addEventListener('online', uploadTransaction);