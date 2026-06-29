const fs = require('fs');
const schemaPath = "C:\\Users\\UMANG\\.gemini\\antigravity-ide\\scratch\\luxury-jewelry-platform\\backend\\prisma\\schema.prisma";

let content = fs.readFileSync(schemaPath, 'utf8');

// Replace provider
content = content.replace('provider = "mysql"', 'provider = "sqlite"');

// Remove @db.* annotations (e.g. @db.Text, @db.Decimal(12, 2), @db.VarChar(100))
content = content.replace(/@db\.[a-zA-Z]+(?:\([^)]*\))?/g, '');

fs.writeFileSync(schemaPath, content, 'utf8');
console.log("Schema converted to SQLite successfully!");
