import re

schema_path = r"C:\Users\UMANG\.gemini\antigravity-ide\scratch\luxury-jewelry-platform\backend\prisma\schema.prisma"

with open(schema_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace provider
content = content.replace('provider = "mysql"', 'provider = "sqlite"')

# Remove @db.* annotations (e.g. @db.Text, @db.Decimal(12, 2), @db.VarChar(100))
content = re.sub(r'@db\.[a-zA-Z]+(?:\([^)]*\))?', '', content)

with open(schema_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Schema converted to SQLite successfully!")
