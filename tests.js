// this will contain our test cases

const db = require("./db");
const axios = require("./axios");
//axios is used to make our http request in javascript



// if no database exists in this, create one
//backticks are used since this is a multiline string
db.serialize(() => {
db.run(`    
    CREATE TABLE IF NOT EXISTS test_sample (
        ingredient_id INTEGER PRIMARY KEY AUTOINCREMENT, 
        ingredient_name TEXT NOT NULL
    )`);

    const ingredients = ['lettuce, orange, carrot, seaweed, milk'];

    ingredients.forEach(name => {
        db.run("INSERT INTO test_sample (ingredient_name) VALUES (?)", [name]);
    });
});

async function runTests() {

//send a call to index.js to create a column in test_sample for categories

//send a message to index.js and receive a display of the categories table

//add a category called "orange" with the description of "color of the ingredient" to the category table


//add both carrot and orange to the orange category


//show the user database and show a table in which each item id is shown with its categories

};




