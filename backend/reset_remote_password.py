#!/usr/bin/env python3
"""
Reset password for user on remote database
"""

import subprocess
from passlib.context import CryptContext

REMOTE_SSH = "root@62.171.137.28"
REMOTE_PASS = "OJTn3IDq6umk6FagN"

# Generate password hash
pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
password = 'Codelake1990@'
hashed_password = pwd_context.hash(password)

print(f"🔐 Generating password hash...")
print(f"Password: {password}")
print(f"Hash: {hashed_password[:50]}...")

# Update password on remote database
sql = f"UPDATE users SET hashed_password = '{hashed_password}' WHERE email = 'sukaissa@gmail.com';"

sql_file = '/tmp/reset_password.sql'
with open(sql_file, 'w') as f:
    f.write(sql)

# Upload and execute
print(f"\n📤 Updating password on remote database...")
upload_cmd = f"sshpass -p '{REMOTE_PASS}' scp -o StrictHostKeyChecking=no {sql_file} {REMOTE_SSH}:/tmp/reset_password.sql"
result = subprocess.run(upload_cmd, shell=True, capture_output=True, text=True)

if result.returncode != 0:
    print(f"❌ Failed to upload: {result.stderr}")
    exit(1)

cmd = f"sshpass -p '{REMOTE_PASS}' ssh -o StrictHostKeyChecking=no {REMOTE_SSH} \"PGPASSWORD='62579011' psql -U postgres -d juridence -f /tmp/reset_password.sql 2>&1\""
result = subprocess.run(cmd, shell=True, capture_output=True, text=True)

print(result.stdout)
if result.stderr and 'ERROR' in result.stderr:
    print("Errors:", result.stderr)

import os
os.remove(sql_file)

print("\n✅ Password reset completed!")





