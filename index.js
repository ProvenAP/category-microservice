const db = require("./db");
const express = require("express"); //express will be our server


const app = express();

//this line ensures that all json data that is received gets parsed into data that our program can read
app.use(express.json());

// create categories table
db.serialize(() => {
    db.run(`
     CREATE TABLES IF NOT EXISTS categories ( 
      category_id INTEGER PRIMARY KEY AUTOINCREMENT,
      ctgry_name TEXT NOT NULL,
      description TEXT
      )
    `);
});


// create item_id for user given table
// this will create a duplicate table of the users so that the item_id
// can be added as a primary key.
// once this is done, we swap our new table with the old and delete the old one.


//get the table name

//make the new table from the old one
// INSERT INTO ? ?
// where the first ? is the user given value of their table in a database and the
// second is the autoincremented value of the item_id

db.serialize(() => {

db.run("DROP TABLE ${tableName");
db.run("ALTER TABLE our duplicate RENAME TO ${tableName}");

//additionally to the last section, check if the connector table has been created
// if it hasn't, then make it
db.run(`
    CREATE TABLE IF NOT EXISTS connector (
    category_id INTEGER,
    item_id INTEGER,
    FOREIGN KEY (category_id) REFERENCES categories(category_id),
    FOREIGN KEY (item_id) REFERENCES ${tableName}(item_id)
    )
`);
});





// list all current categories in the category table

//create a new category (includes description)

// add a category to an item
// desc: in connector, create a row which contains the item_id and category_id


//remove category to an item
//desc: remove the row in which item_id and category_id both match up with the user request


//update category name

//update category description

//remove categories from table
//desc: remove the column from the user table and all connections in the connector table that match with item_id's from that table

//delete all categories
//desc: completely clear out the categories table