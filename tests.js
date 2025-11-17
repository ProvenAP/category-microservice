// this file will contain our test cases
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const db = require("./microservice/db");


// if no database exists in this, create one
// backticks are used since this is a multiline string

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


//these are functions that can be used as needed by users

// firstly, here are all the functions that will show you information about your tables

async function showUserTableWithCategories() {
    sendRequest({
        action: "showUserTable",
        body: {
            tableName: "test_sample",
            itemNameColumn: "ingredient_name" 
        }
    });

    const response = await waitResponse();
    console.log("\nMicroservice responded: ", response);
}

async function showCategories() {
    sendRequest({
        action: "showCategories"
    });

    const response = await waitResponse();
    console.log("Microservice responded with categories:", response);
}

// here are all the functions that work on adding


async function addCategoriesColumn() {
    sendRequest({
        action: "prepareUserTable",
        body: { tableName: "test_sample" }
    });

    const response = await waitResponse();
    console.log("\nMicroservice response: ", response);
}


async function addCategory() {
    sendRequest({
        action: "addCategory",
        body: {
            categoryName: "Green",
            description: "Foods that are primarily the color Green"
        }
    });

    const response = await waitResponse();
    console.log("Microservice responded:", response);
}

async function addItemToCategory() {
    sendRequest({
        action: "addItemToCategory",
        body: {
            categoryId: 2,
            itemId: 3 
        }
    });

    const response = await waitResponse();
    console.log("Microservice responded with:", response);
}

// here are all our commands that delete in some way
async function removeMicroserviceTables() {
    sendRequest({
        action: "dropCategoriesAndConnector"

    });
    const response = await waitResponse();
    console.log("Microservice responded with:", response);
}

async function removeCategoriesFromTable() {
    sendRequest({
        action: "removeCategoriesFromTable",
        body: {
            tableName: "test_sample"
        }
    });

    const response = await waitResponse();
    console.log("Microservice responded with:", response);
}


async function removeCategory() {
    sendRequest({
        action: "removeCategory",
        body: {
            categoryId: 1
        }
    });

    const response = await waitResponse();
    console.log("Microservice responded with:", response);
}

async function removeCategoryFromItem() {
    sendRequest({
        action: "removeCategoryFromItem",  
        body: {
            itemsTableName: "test_sample",
            itemNameColumn: "ingredient_name",
            categoryName: "Orange", 
            itemName: "carrot"       
        }
    });

    const response = await waitResponse();
    console.log("\nMicroservice responded with: ", response);
}




async function runAll() {
    
}

runAll();





