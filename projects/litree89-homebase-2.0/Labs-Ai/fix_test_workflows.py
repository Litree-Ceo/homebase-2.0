import re

file_path = 'lib/test-workflows.ts'

with open(file_path, 'r') as f:
    content = f.read()

# Replace 'http://localhost:3000...' with `${BASE_URL}...`
# We look for single quoted strings starting with http://localhost:3000
# and replace them with backtick strings using ${BASE_URL}
new_content = re.sub(r"'http://localhost:3000([^']*)'", r"`${BASE_URL}\1`", content)

with open(file_path, 'w') as f:
    f.write(new_content)

print("Successfully updated lib/test-workflows.ts")
