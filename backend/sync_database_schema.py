#!/usr/bin/env python3
"""
Script to compare and sync database schema from local to remote
Creates missing tables and adds missing columns without altering data
"""

import sys
import subprocess
from sqlalchemy import create_engine, text, inspect
from urllib.parse import quote_plus

# Local database configuration
LOCAL_DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'user': 'postgres',
    'password': '62579011',
    'database': 'juridence'
}

# Remote database configuration (via SSH)
REMOTE_SSH = "root@62.171.137.28"
REMOTE_PASS = "OJTn3IDq6umk6FagN"
REMOTE_DB_CONFIG = {
    'host': 'localhost',  # Accessed via SSH
    'port': 5432,
    'user': 'postgres',
    'password': '62579011',
    'database': 'juridence'
}

def create_db_url(config):
    """Create database URL from config"""
    password = quote_plus(config['password'])
    return f"postgresql://{config['user']}:{password}@{config['host']}:{config['port']}/{config['database']}"

def get_table_schema(engine, table_name):
    """Get full schema definition for a table"""
    inspector = inspect(engine)
    
    # Get columns
    columns = inspector.get_columns(table_name)
    
    # Get primary keys
    pk_constraint = inspector.get_pk_constraint(table_name)
    primary_keys = pk_constraint.get('constrained_columns', []) if pk_constraint else []
    
    # Get foreign keys
    foreign_keys = inspector.get_foreign_keys(table_name)
    
    # Get indexes
    indexes = inspector.get_indexes(table_name)
    
    # Get table comment
    try:
        with engine.connect() as conn:
            result = conn.execute(text(f"""
                SELECT obj_description('{table_name}'::regclass, 'pg_class')
            """))
            comment = result.scalar()
    except:
        comment = None
    
    return {
        'columns': columns,
        'primary_keys': primary_keys,
        'foreign_keys': foreign_keys,
        'indexes': indexes,
        'comment': comment
    }

def get_all_tables(engine):
    """Get list of all tables in database"""
    inspector = inspect(engine)
    return inspector.get_table_names()

def generate_create_table_sql(engine, table_name, schema):
    """Generate CREATE TABLE SQL statement"""
    columns = schema['columns']
    primary_keys = schema['primary_keys']
    
    sql_parts = []
    
    # Column definitions
    for col in columns:
        col_def = f'    "{col["name"]}" {col["type"]}'
        
        if not col.get('nullable', True):
            col_def += ' NOT NULL'
        
        if col.get('default') is not None:
            default = col['default']
            if isinstance(default, str) and not default.startswith("nextval"):
                col_def += f" DEFAULT {default}"
            elif default is not None:
                col_def += f" DEFAULT {default}"
        
        sql_parts.append(col_def)
    
    # Primary key constraint
    if primary_keys:
        pk_list = ', '.join([f'"{pk}"' for pk in primary_keys])
        sql_parts.append(f'    PRIMARY KEY ({pk_list})')
    
    # Foreign key constraints
    for fk in schema['foreign_keys']:
        fk_cols = ', '.join([f'"{col}"' for col in fk['constrained_columns']])
        ref_table = fk['referred_table']
        ref_cols = ', '.join([f'"{col}"' for col in fk['referred_columns']])
        sql_parts.append(f'    CONSTRAINT {fk["name"]} FOREIGN KEY ({fk_cols}) REFERENCES {ref_table} ({ref_cols})')
    
    create_sql = f"CREATE TABLE IF NOT EXISTS {table_name} (\n"
    create_sql += ",\n".join(sql_parts)
    create_sql += "\n);\n"
    
    # Add indexes (excluding primary key indexes)
    for idx in schema['indexes']:
        if not idx.get('unique', False) or idx['name'] not in [f'{table_name}_pkey']:
            idx_cols = ', '.join([f'"{col}"' for col in idx['column_names']])
            unique = 'UNIQUE ' if idx.get('unique', False) else ''
            create_sql += f"CREATE INDEX IF NOT EXISTS {idx['name']} ON {table_name} ({idx_cols});\n"
    
    return create_sql

def generate_alter_table_sql(table_name, local_schema, remote_schema):
    """Generate ALTER TABLE SQL to add missing columns"""
    local_cols = {col['name']: col for col in local_schema['columns']}
    remote_cols = {col['name']: col for col in remote_schema['columns']}
    
    alter_statements = []
    
    # Find missing columns
    for col_name, col_def in local_cols.items():
        if col_name not in remote_cols:
            col_sql = f'ALTER TABLE {table_name} ADD COLUMN "{col_name}" {col_def["type"]}'
            
            if not col_def.get('nullable', True):
                col_sql += ' NOT NULL'
            
            # Only add DEFAULT if column is NOT NULL (to avoid data issues)
            if col_def.get('default') is not None and not col_def.get('nullable', True):
                default = col_def['default']
                if isinstance(default, str) and not default.startswith("nextval"):
                    col_sql += f" DEFAULT {default}"
                elif default is not None:
                    col_sql += f" DEFAULT {default}"
            
            alter_statements.append(col_sql + ';')
    
    return alter_statements

def execute_sql_on_remote(sql_statements):
    """Execute SQL statements on remote database via SSH"""
    sql_file = '/tmp/schema_sync.sql'
    
    with open(sql_file, 'w') as f:
        f.write("-- Database schema synchronization\n")
        f.write("BEGIN;\n\n")
        for stmt in sql_statements:
            f.write(stmt + "\n")
        f.write("\nCOMMIT;\n")
    
    # Upload file
    upload_cmd = f"sshpass -p '{REMOTE_PASS}' scp -o StrictHostKeyChecking=no {sql_file} {REMOTE_SSH}:/tmp/schema_sync.sql"
    result = subprocess.run(upload_cmd, shell=True, capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"❌ Failed to upload SQL file: {result.stderr}")
        return False
    
    # Execute SQL
    cmd = f"sshpass -p '{REMOTE_PASS}' ssh -o StrictHostKeyChecking=no {REMOTE_SSH} \"PGPASSWORD='{REMOTE_DB_CONFIG['password']}' psql -U {REMOTE_DB_CONFIG['user']} -d {REMOTE_DB_CONFIG['database']} -f /tmp/schema_sync.sql\""
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    
    # Clean up
    import os
    os.remove(sql_file)
    
    return result.returncode == 0, result.stdout, result.stderr

def sync_schemas():
    """Main function to sync database schemas"""
    print("🔄 Starting database schema synchronization...")
    
    # Connect to local database
    local_url = create_db_url(LOCAL_DB_CONFIG)
    print(f"📥 Connecting to local database: {LOCAL_DB_CONFIG['host']}:{LOCAL_DB_CONFIG['database']}")
    local_engine = create_engine(local_url)
    
    # Connect to remote database via SSH tunnel (we'll use direct SQL execution instead)
    print(f"📤 Preparing remote database connection: {REMOTE_SSH}")
    
    try:
        # Get all tables from local database
        print("\n📊 Analyzing local database schema...")
        local_tables = get_all_tables(local_engine)
        print(f"✅ Found {len(local_tables)} tables in local database")
        
        # Get all tables from remote database
        print("\n📊 Analyzing remote database schema...")
        get_remote_tables_cmd = f"sshpass -p '{REMOTE_PASS}' ssh -o StrictHostKeyChecking=no {REMOTE_SSH} \"PGPASSWORD='{REMOTE_DB_CONFIG['password']}' psql -U {REMOTE_DB_CONFIG['user']} -d {REMOTE_DB_CONFIG['database']} -t -c 'SELECT tablename FROM pg_tables WHERE schemaname = \\\'public\\\';'\""
        result = subprocess.run(get_remote_tables_cmd, shell=True, capture_output=True, text=True)
        remote_tables = [t.strip() for t in result.stdout.strip().split('\n') if t.strip()]
        print(f"✅ Found {len(remote_tables)} tables in remote database")
        
        # Find missing tables
        missing_tables = set(local_tables) - set(remote_tables)
        existing_tables = set(local_tables) & set(remote_tables)
        
        print(f"\n📋 Analysis:")
        print(f"   - Missing tables: {len(missing_tables)}")
        print(f"   - Existing tables: {len(existing_tables)}")
        
        sql_statements = []
        
        # Create missing tables
        if missing_tables:
            print(f"\n🔨 Creating {len(missing_tables)} missing tables...")
            for table_name in missing_tables:
                print(f"   Creating table: {table_name}")
                schema = get_table_schema(local_engine, table_name)
                create_sql = generate_create_table_sql(local_engine, table_name, schema)
                sql_statements.append(create_sql)
        
        # Update existing tables (add missing columns)
        if existing_tables:
            print(f"\n🔧 Checking {len(existing_tables)} existing tables for missing columns...")
            
            # We need to get remote schema via SQL queries
            for table_name in existing_tables:
                print(f"   Checking table: {table_name}")
                local_schema = get_table_schema(local_engine, table_name)
                
                # Get remote columns via SQL
                get_remote_cols_cmd = f"sshpass -p '{REMOTE_PASS}' ssh -o StrictHostKeyChecking=no {REMOTE_SSH} \"PGPASSWORD='{REMOTE_DB_CONFIG['password']}' psql -U {REMOTE_DB_CONFIG['user']} -d {REMOTE_DB_CONFIG['database']} -t -c \\\"SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = \\\'{table_name}\\\' ORDER BY ordinal_position;\\\"\""
                result = subprocess.run(get_remote_cols_cmd, shell=True, capture_output=True, text=True)
                
                remote_col_names = set()
                if result.stdout:
                    for line in result.stdout.strip().split('\n'):
                        if line.strip():
                            parts = line.strip().split('|')
                            if parts:
                                remote_col_names.add(parts[0].strip())
                
                # Find missing columns
                local_col_names = {col['name'] for col in local_schema['columns']}
                missing_cols = local_col_names - remote_col_names
                
                if missing_cols:
                    print(f"      Found {len(missing_cols)} missing columns: {', '.join(missing_cols)}")
                    for col_name in missing_cols:
                        col_def = next(col for col in local_schema['columns'] if col['name'] == col_name)
                        col_sql = f'ALTER TABLE {table_name} ADD COLUMN IF NOT EXISTS "{col_name}" {col_def["type"]}'
                        
                        # Only add NOT NULL if there's a default or if we're sure it's safe
                        if not col_def.get('nullable', True) and col_def.get('default') is not None:
                            col_sql += ' NOT NULL'
                            default = col_def['default']
                            if isinstance(default, str) and not default.startswith("nextval"):
                                col_sql += f" DEFAULT {default}"
                            elif default is not None:
                                col_sql += f" DEFAULT {default}"
                        elif col_def.get('nullable', True):
                            col_sql += ' NULL'
                        
                        sql_statements.append(col_sql + ';')
        
        # Execute all SQL statements
        if sql_statements:
            print(f"\n📤 Executing {len(sql_statements)} SQL statements on remote database...")
            success, stdout, stderr = execute_sql_on_remote(sql_statements)
            
            if success:
                print("✅ Schema synchronization completed successfully!")
                if stdout:
                    print(stdout)
            else:
                print("⚠️  Schema synchronization completed with warnings:")
                if stderr:
                    print(stderr)
                if stdout:
                    print(stdout)
        else:
            print("\n✅ No schema changes needed. Local and remote schemas are in sync!")
        
    except Exception as e:
        print(f"\n❌ Schema synchronization failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    sync_schemas()

