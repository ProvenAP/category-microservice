const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const db = require("./microservice/db");


// if no database exists in this, create one

// by uncommenting this following code block, you create a test table to run commands on
// db.serialize(() => {
// db.run(`    
//     CREATE TABLE IF NOT EXISTS test_sample (
//         ingredient_id INTEGER PRIMARY KEY AUTOINCREMENT, 
//         ingredient_name TEXT NOT NULL
//     )`);

//     const ingredients = ['lettuce', 'orange', 'carrot', 'seaweed', 'milk'];

//     ingredients.forEach(name => {
//         db.run("INSERT INTO test_sample (ingredient_name) VALUES (?)", [name]);
//     });
// });


// These functions will have to be included in your file that uses these microservices.
// These insure that you can access both json files to communicate with the microservice.

function sendRequest(obj) {
    fs.writeFileSync(
        "./microservice/requests/request.json",
        JSON.stringify(obj, null, 2)
    );
}

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



// Here are all the functions that will show you information about your tables

async function showUserTableWithCategories(tableName, itemNameColumn) {
    sendRequest({
        action: "showUserTable",
        body: { tableName, itemNameColumn }
    });

    const response = await waitResponse();
    console.log("Microservice responded with: ", response);
}

async function showCategories() {
    sendRequest({
        action: "showCategories"
    });

    const response = await waitResponse();
    console.log("Microservice responded with categories:", response);
}

// here are all the functions that work on adding

async function addCategoriesColumn(tableName) {
    sendRequest({
        action: "prepareUserTable",
        body: { tableName }
    });

    const response = await waitResponse();
    console.log("Microservice responded with:", response);
}


async function addCategory(categoryName, description) {
    sendRequest({
        action: "addCategory",
        body: { categoryName, description }
    });

    const response = await waitResponse();
    console.log("Microservice responded with:", response);
}

async function addItemToCategory(categoryId, itemId) {
    sendRequest({
        action: "addItemToCategory",
        body: { categoryId, itemId }
    });

    const response = await waitResponse();
    console.log("Microservice responded with:", response);
}

// here are the commands that update information in the categories

async function updateCategoryName(categoryId, newName) {
    sendRequest({
        action: "updateCategoryName",
        body: { categoryId, newName }
  });
    const response = await waitResponse();
    console.log("Microservice responded with:", response);
}

async function updateCategoryDescription(categoryId, newDescription) {
    sendRequest({
        action: "updateCategoryDescription",
        body: { categoryId, newDescription }
  });
    const response = await waitResponse();
    console.log("Microservice responded with:", response);
}

// here are all our commands that delete category information in some way
async function removeMicroserviceTables() {
    sendRequest({
        action: "dropCategoriesAndConnector"
    });
    const response = await waitResponse();
    console.log("Microservice responded with:", response);
}

async function removeCategoriesFromTable(tableName) {
    sendRequest({
        action: "removeCategoriesFromTable",
        body: { tableName }
    });
    const response = await waitResponse();
    console.log("Microservice responded with:", response);
}


async function removeCategory(categoryId) {
    sendRequest({
        action: "removeCategory",
        body: { categoryId }
    });
    const response = await waitResponse();
    console.log("Microservice responded with:", response);
}

async function removeCategoryFromItem(itemsTableName, itemNameColumn, categoryName, itemName) {
    sendRequest({
        action: "removeCategoryFromItem",
        body: { itemsTableName, itemNameColumn, categoryName, itemName }
    });
    const response = await waitResponse();
    console.log("\nMicroservice responded with: ", response);
}


async function runAll() {
    console.log("--- TEST 1: Show Categories ---");
    await showCategories();

    console.log("\n--- TEST 2: Add Category ---");
    await addCategory("Snacks", "Snack foods");

    console.log("\n--- TEST 3: Show Categories Again ---");
    await showCategories();
}

runAll();


runAll();





