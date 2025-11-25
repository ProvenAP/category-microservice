# category-microservice

Microservice for adding category management functionality to existing database items using file-based JSON communication.

## Prerequisites

Install the SQLite3 dependency:
```bash
npm install sqlite3
```

Run the microservice:
```bash
node microservice/index.js
```

---

## How to Programmatically REQUEST Data

Write a JSON object to `microservice/requests/request.json` using this helper function:

```javascript
const fs = require('fs');

function sendRequest(obj) {
    fs.writeFileSync(
        "./microservice/requests/request.json",
        JSON.stringify(obj, null, 2)
    );
}
```

### Example Call

```javascript
// Add a new category
sendRequest({
    action: "addCategory",
    body: { 
        categoryName: "Electronics", 
        description: "Electronic devices and accessories" 
    }
});
```

All requests must include an `action` field and a `body` object with the required parameters for that action.

---

## How to Programmatically RECEIVE Data

Read the response from `microservice/requests/response.json` using this helper function:

```javascript
function waitResponse() {
    return new Promise(resolve => {
        const file = "./microservice/requests/response.json"

        const interval = setInterval(() => {
            if (!fs.existsSync(file)) return;

            const raw = fs.readFileSync(file, "utf-8").trim();
            if (!raw) return;

            clearInterval(interval);
            resolve(JSON.parse(raw));

        }, 500);
    });
}
```

### Example Call

```javascript
// After sending a request, wait for the response
const response = await waitResponse();
console.log("Microservice responded with:", response);
```

---

## UML Sequence Diagram

<img width="1179" height="959" alt="image" src="https://github.com/user-attachments/assets/1d00344c-eb05-4938-b7e0-8bb2b80cd95d" />


---

## Available Actions

- `prepareUserTable` - Adds item_id column to existing table
- `addCategory` - Creates a new category
- `showCategories` - Lists all categories
- `addItemToCategory` - Links an item to a category
- `showUserTable` - Shows items with their categories
- `updateCategoryName` - Updates a category's name
- `updateCategoryDescription` - Updates a category's description
- `removeCategoryFromItem` - Unlinks a category from an item
- `removeCategory` - Deletes a category
- `removeCategoriesFromTable` - Removes item_id column from table
- `dropCategoriesAndConnector` - Drops all category tables
