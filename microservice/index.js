const db = require("./db");
const fs = require("fs");
const path = require("path");


// these are the paths to the json files we will use to communicate
const reqFile = path.join(__dirname, "requests", "request.json");
const resFile = path.join(__dirname, "requests", "response.json");

// this function will let us write a response to the json file
function writeResponse(obj) {
    fs.writeFileSync(resFile, JSON.stringify(obj, null, 2));   
    console.log("Microservice response:", obj);
}

// creates the categories table before starting anything else
db.serialize(() => {
    db.run(`
     CREATE TABLE IF NOT EXISTS categories ( 
      category_id INTEGER PRIMARY KEY AUTOINCREMENT,
      ctgry_name TEXT NOT NULL,
      description TEXT
      )
    `);
});


// this function is used when adding item_id to a user table, if it is their first table created with the microservice
// then a connector table will be built to match ids for the items and categories
function createConnector(tableName, callback) {

    const sql = `
        CREATE TABLE IF NOT EXISTS connector (
        category_id INTEGER,
        item_id INTEGER,
        FOREIGN KEY (category_id) REFERENCES categories(category_id),
        FOREIGN KEY (item_id) REFERENCES ${tableName}(item_id)
        )
    `;

    db.run(sql, [], (err) => {
        if (err) return callback({ ok: false, error: err.message });
        callback({ ok: true, message: "Connector table ready." });
    });
}



//this function will insert the item_id column into a user given table
// it does this by creating a duplicate of the table with this primary key, dropping the old ne, and replacing it with our new one
function prepareUserTable(tableName, callback) {
    console.log("Preparing user table:", tableName);

    db.serialize(() => {
        db.all(`PRAGMA table_info(${tableName})`, [], (err, cols) => {
            if (err || cols.length === 0) {
                return callback({ ok: false, error: "Table not found: " + tableName });
            }

            const oldCols = cols.map(c => c.name);
            const colList = oldCols.join(", ");
            const newTable = tableName + "_new";
            const createSQL = `
                CREATE TABLE ${newTable} (
                    item_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    ${oldCols.map(c => `${c} TEXT`).join(", ")}
                )
            `;
            db.run(createSQL, [], (err) => {
                if (err) return callback({ ok: false, error: err.message });
                // Copy data
                db.run(
                    `INSERT INTO ${newTable} (${colList}) SELECT ${colList} FROM ${tableName}`,
                    [],
                    (err) => {
                        if (err) return callback({ ok: false, error: err.message });
                        // Drop the old table
                        db.run(`DROP TABLE ${tableName}`, [], (err) => {
                            if (err) return callback({ ok: false, error: err.message });
                            // Rename new → original name
                            db.run(
                                `ALTER TABLE ${newTable} RENAME TO ${tableName}`,
                                [],
                                (err) => {
                                    if (err) return callback({ ok: false, error: err.message });
                                    createConnector(tableName, (res) => {
                                        if (!res.ok) return callback(res);
                                        callback({
                                            ok: true,
                                            message: `item_id added to table '${tableName}'`
                                        });
                                    });
                                }
                            );
                        });
                    }
                );
            });
        });
    });
}

function showCategories(callback) {
    const sql = "SELECT * FROM categories";

    db.all(sql, [], (err, rows) => {
        if (err) {
            return callback({ ok: false, error: err.message });
        }
        // Return the categories as a response
        callback({ ok: true, categories: rows });
    });
}



function addCategory(categoryName, description, callback) {
    const sql = `
        INSERT INTO categories (ctgry_name, description)
        VALUES (?, ?)
    `;
    
    db.run(sql, [categoryName, description], function (err) {
        if (err) {
            return callback({ ok: false, error: err.message });
        }
        callback({ ok: true, message: `Category '${categoryName}' added with ID ${this.lastID}` });
    });
}

function addItemToCategory(categoryId, itemId, callback) {
    const sql = `
        INSERT INTO connector (category_id, item_id)
        VALUES (?, ?)
    `;
    db.run(sql, [categoryId, itemId], function (err) {
        if (err) {
            return callback({ ok: false, error: err.message });
        }
        callback({ ok: true, message: `Item ${itemId} added to category ${categoryId}` });
    });
}

function showUserTable(tableName, itemNameColumn, callback) {
    db.all(`PRAGMA table_info(${tableName})`, [], (err, columns) => {
        if (err) return callback({ ok: false, error: err.message });

        console.log("\nTable Structure:");
        console.table(columns.map(c => ({ Column: c.name, Type: c.type })));

        const sql = `
            SELECT i.item_id, i.${itemNameColumn}, 
                COALESCE(GROUP_CONCAT(c.ctgry_name), 'No categories') AS categories
            FROM ${tableName} i
            LEFT JOIN connector con ON con.item_id = i.item_id
            LEFT JOIN categories c ON con.category_id = c.category_id
            GROUP BY i.item_id;
        `;

        db.all(sql, [], (err, rows) => {
            if (err) return callback({ ok: false, error: err.message });

            console.log("\nItems and Their Categories:");
            if (rows.length === 0) {
                console.log("No items found or no categories assigned.");
            } else {
                console.table(rows.map(row => ({
                    ItemID: row.item_id,
                    ItemName: row[itemNameColumn],
                    Categories: row.categories
                })));
            }
            callback({ ok: true });
        });
    });
}

function removeCategoryFromItem(itemsTableName, categoryName, itemName, callback) {
    const sql = `
        DELETE FROM connector
        WHERE item_id = (SELECT item_id FROM ${itemsTableName} WHERE item_name = ?)
        AND category_id = (SELECT category_id FROM categories WHERE ctgry_name = ?);
    `;

    db.run(sql, [itemName, categoryName], (err) => {
        if (err) {
            return callback({ ok: false, error: `Error removing category from item: ${err.message}` });
        }
        callback({ ok: true, message: "Category removed successfully." });
    });
}
















// This watches request.json for incoming requests
fs.watchFile(reqFile, { interval: 500 }, () => {
    if (!fs.existsSync(reqFile)) return;

    const raw = fs.readFileSync(reqFile, "utf-8").trim();
    if (!raw) return;

    let reqObj;
    try {
        reqObj = JSON.parse(raw);
    } catch (e) {
        writeResponse({ ok: false, error: "Invalid JSON in request file" });
        return;
    }

    if (reqObj.action === "prepareUserTable" && reqObj.body?.tableName) {
        prepareUserTable(reqObj.body.tableName, writeResponse);
    } else if (reqObj.action === "addCategory" && reqObj.body?.categoryName && reqObj.body?.description) {
        addCategory(reqObj.body.categoryName, reqObj.body.description, writeResponse);
    } else if (reqObj.action === "showCategories") {
        showCategories(writeResponse);
    } else if (reqObj.action === "addItemToCategory" && reqObj.body?.categoryId && reqObj.body?.itemId) {
        addItemToCategory(reqObj.body.categoryId, reqObj.body.itemId, writeResponse);
    } else if (reqObj.action === "showUserTable" && reqObj.body?.tableName && reqObj.body?.itemNameColumn) {
        showUserTable(reqObj.body.tableName, reqObj.body.itemNameColumn, writeResponse);
    } else if (reqObj.action === "removeCategoryFromItem" && reqObj.body?.categoryName && reqObj.body?.itemName) {
        removeCategoryFromItem(reqObj.body.categoryName, reqObj.body.itemName, writeResponse);
    } else {
        writeResponse({ ok: false, error: "Unknown action or missing parameters" });
    }
});

console.log("Microservice running… watching request.json");




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