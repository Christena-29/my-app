import sqlite3
import os
import json
from datetime import datetime

# Get the absolute path to the database file
DATABASE_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'jobapp.db')

def get_db_connection():
    """Create a connection to the SQLite database."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row  # This enables column access by name
    return conn

def init_db():
    """Initialize the database with tables based on the schema."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Create Employers Table (removing latitude and longitude columns)
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS employers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            company_name TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        
        # Create index on employers email
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_employers_email ON employers(email)')
        
        # Create Employees Table without the age CHECK constraint
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            dob DATE NOT NULL,
            education TEXT NOT NULL,  
            skills TEXT, -- Store skills as JSON array (["Python", "SQL"])
            experience INTEGER DEFAULT 0, 
            latitude REAL,  
            longitude REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        
        # Create index on employees email
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email)')
        
        # Create Jobs Table - UPDATED with time_slot field
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employer_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            salary TEXT,
            job_type TEXT DEFAULT 'Part-time',
            time_slot TEXT,
            latitude REAL,  
            longitude REAL,
            status TEXT DEFAULT 'open',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (employer_id) REFERENCES employers(id) ON DELETE CASCADE
        )
        ''')
        
        # Create index on jobs employer
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_jobs_employer ON jobs(employer_id)')
        
        # Create Applications Table - UPDATED to ensure cover_letter can be stored properly
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            job_id INTEGER NOT NULL,
            employee_id INTEGER NOT NULL,
            status TEXT DEFAULT 'waiting',
            cover_letter TEXT,
            applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
            FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
        )
        ''')
        
        # Create indexes for applications
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_applications_employee ON applications(employee_id)')
        
        # Create Chat Table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS chat (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER NOT NULL,
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
        )
        ''')
        
        # Create index for chat
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_chat_employee ON chat(employee_id)')
        
        conn.commit()
        conn.close()
        
        print(f"Database initialized successfully at {DATABASE_PATH}")
        return {"success": True, "message": "Database initialized successfully"}
    except Exception as e:
        print(f"Error initializing database: {e}")
        return {"success": False, "error": str(e)}

# Function to validate age is at least 18
def is_at_least_18(dob_str):
    """Check if a person is at least 18 years old based on their date of birth"""
    try:
        dob = datetime.strptime(dob_str, '%Y-%m-%d')
        today = datetime.today()
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        return age >= 18
    except ValueError:
        return False

# Modify the register_employer function to make latitude and longitude truly optional
def register_employer(name, email, password_hash, company_name):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # First check if the email already exists
        cursor.execute("SELECT id FROM employers WHERE email = ?", (email,))
        if cursor.fetchone():
            return {"success": False, "error": "Email already registered", "code": "EMAIL_EXISTS"}
        
        # Remove location parameters completely
        cursor.execute(
            "INSERT INTO employers (name, email, password_hash, company_name) VALUES (?, ?, ?, ?)",
            (name, email, password_hash, company_name)
        )
        
        employer_id = cursor.lastrowid
        conn.commit()
        
        return {
            "success": True,
            "user_id": employer_id,
            "message": "Employer registered successfully"
        }
    except sqlite3.IntegrityError as e:
        conn.rollback()
        error_msg = str(e)
        print(f"Database integrity error: {error_msg}")
        
        if "UNIQUE constraint" in error_msg:
            return {"success": False, "error": "Email already registered", "code": "EMAIL_EXISTS"}
        return {"success": False, "error": "Database constraint error", "code": "DB_CONSTRAINT"}
    except Exception as e:
        conn.rollback()
        print(f"Unexpected error: {e}")
        return {"success": False, "error": "An unexpected error occurred", "code": "UNKNOWN_ERROR"}
    finally:
        conn.close()

# Function to register an employee with detailed response
def register_employee(name, email, password_hash, dob, education, skills, experience=0, latitude=None, longitude=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check the age first
    if not is_at_least_18(dob):
        return {"success": False, "error": "You must be at least 18 years old to register", "code": "AGE_RESTRICTION"}
    
    # Ensure skills is a valid JSON string
    if isinstance(skills, list):
        skills = json.dumps(skills)
    elif not skills:
        skills = "[]"  # Default empty array
        
    try:
        # First check if the email already exists
        cursor.execute("SELECT id FROM employees WHERE email = ?", (email,))
        if cursor.fetchone():
            return {"success": False, "error": "Email already registered", "code": "EMAIL_EXISTS"}
        
        # Try to insert the new employee
        cursor.execute(
            '''INSERT INTO employees 
               (name, email, password_hash, dob, education, skills, experience, latitude, longitude) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (name, email, password_hash, dob, education, skills, experience, latitude, longitude)
        )
        
        employee_id = cursor.lastrowid
        conn.commit()
        
        return {
            "success": True,
            "user_id": employee_id,
            "message": "Employee registered successfully"
        }
    except sqlite3.IntegrityError as e:
        conn.rollback()
        error_msg = str(e)
        print(f"Database integrity error: {error_msg}")
        
        if "UNIQUE constraint" in error_msg:
            return {"success": False, "error": "Email already registered", "code": "EMAIL_EXISTS"}
        return {"success": False, "error": "Database constraint error", "code": "DB_CONSTRAINT"}
    except Exception as e:
        conn.rollback()
        print(f"Unexpected error: {e}")
        return {"success": False, "error": "An unexpected error occurred", "code": "UNKNOWN_ERROR"}
    finally:
        conn.close()

# Function to get employer by email for authentication
def get_employer_by_email(email):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM employers WHERE email = ?", (email,))
    employer = cursor.fetchone()
    
    conn.close()
    
    if employer:
        return dict(employer)  # Convert from Row to dict
    return None

# Function to get employee by email for authentication
def get_employee_by_email(email):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM employees WHERE email = ?", (email,))
    employee = cursor.fetchone()
    
    conn.close()
    
    if employee:
        # Parse skills from JSON
        result = dict(employee)
        if result["skills"]:
            try:
                result["skills"] = json.loads(result["skills"])
            except json.JSONDecodeError:
                result["skills"] = []
        return result
    return None

# Function to create a job listing with detailed response
def create_job(employer_id, title, description, salary=None, job_type='Part-time', time_slot=None, latitude=None, longitude=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # First verify the employer exists
        cursor.execute("SELECT id FROM employers WHERE id = ?", (employer_id,))
        if not cursor.fetchone():
            return {"success": False, "error": "Employer not found", "code": "EMPLOYER_NOT_FOUND"}
        
        cursor.execute(
            '''INSERT INTO jobs 
               (employer_id, title, description, salary, job_type, time_slot, latitude, longitude) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
            (employer_id, title, description, salary, job_type, time_slot, latitude, longitude)
        )
        
        job_id = cursor.lastrowid
        conn.commit()
        
        return {
            "success": True, 
            "job_id": job_id, 
            "message": "Job posted successfully"
        }
    except sqlite3.IntegrityError as e:
        conn.rollback()
        error_msg = str(e)
        print(f"Database integrity error: {error_msg}")
        
        if "FOREIGN KEY constraint failed" in error_msg:
            return {"success": False, "error": "Employer does not exist", "code": "EMPLOYER_NOT_FOUND"}
        return {"success": False, "error": "Database constraint error", "code": "DB_CONSTRAINT"}
    except Exception as e:
        conn.rollback()
        print(f"Unexpected error: {e}")
        return {"success": False, "error": "An unexpected error occurred", "code": "UNKNOWN_ERROR"}
    finally:
        conn.close()

# Function to get all open jobs with detailed company and employer info
def get_all_jobs():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            SELECT j.*, e.name AS employer_name, e.company_name
            FROM jobs j
            JOIN employers e ON j.employer_id = e.id
            WHERE j.status = 'open'
            ORDER BY j.created_at DESC
        ''')
        
        jobs = cursor.fetchall()
        
        # Convert to list of dictionaries
        result = []
        for job in jobs:
            job_dict = dict(job)
            # Format dates for JSON
            if 'created_at' in job_dict:
                job_dict['created_at'] = job_dict['created_at']
            result.append(job_dict)
            
        return {"success": True, "jobs": result}
    except Exception as e:
        print(f"Error fetching jobs: {e}")
        return {"success": False, "error": str(e), "jobs": []}
    finally:
        conn.close()

# Function to get details of a specific job
def get_job_by_id(job_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            SELECT j.*, e.name AS employer_name, e.company_name
            FROM jobs j
            JOIN employers e ON j.employer_id = e.id
            WHERE j.id = ?
        ''', (job_id,))
        
        job = cursor.fetchone()
        if not job:
            return {"success": False, "error": "Job not found", "code": "JOB_NOT_FOUND"}
        
        return {"success": True, "job": dict(job)}
    except Exception as e:
        print(f"Error fetching job: {e}")
        return {"success": False, "error": str(e)}
    finally:
        conn.close()

# Function to apply for a job with detailed response
def apply_for_job(job_id, employee_id, cover_letter=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check if the job exists and is open
        cursor.execute("SELECT status FROM jobs WHERE id = ?", (job_id,))
        job = cursor.fetchone()
        if not job:
            return {"success": False, "error": "Job not found", "code": "JOB_NOT_FOUND"}
        if job["status"] != "open":
            return {"success": False, "error": "This job is no longer accepting applications", "code": "JOB_CLOSED"}
            
        # Check if the employee exists
        cursor.execute("SELECT id FROM employees WHERE id = ?", (employee_id,))
        if not cursor.fetchone():
            return {"success": False, "error": "Employee not found", "code": "EMPLOYEE_NOT_FOUND"}
        
        # Check if already applied
        cursor.execute(
            "SELECT id FROM applications WHERE job_id = ? AND employee_id = ?",
            (job_id, employee_id)
        )
        if cursor.fetchone():
            return {"success": False, "error": "You have already applied for this job", "code": "ALREADY_APPLIED"}
        
        # Insert the application with cover letter
        cursor.execute(
            "INSERT INTO applications (job_id, employee_id, cover_letter) VALUES (?, ?, ?)",
            (job_id, employee_id, cover_letter)
        )
        
        application_id = cursor.lastrowid
        conn.commit()
        
        return {
            "success": True, 
            "application_id": application_id,
            "message": "Application submitted successfully"
        }
    except sqlite3.IntegrityError as e:
        conn.rollback()
        error_msg = str(e)
        print(f"Database integrity error: {error_msg}")
        
        if "FOREIGN KEY constraint failed" in error_msg:
            return {"success": False, "error": "Invalid job or employee ID", "code": "INVALID_REFERENCE"}
        return {"success": False, "error": "Database constraint error", "code": "DB_CONSTRAINT"}
    except Exception as e:
        conn.rollback()
        print(f"Unexpected error: {e}")
        return {"success": False, "error": "An unexpected error occurred", "code": "UNKNOWN_ERROR"}
    finally:
        conn.close()

# Function to update application status with detailed response
def update_application_status(application_id, new_status):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if new_status not in ['waiting', 'accepted', 'rejected']:
        return {"success": False, "error": "Invalid status. Must be: waiting, accepted, or rejected", "code": "INVALID_STATUS"}
    
    try:
        # Check if the application exists
        cursor.execute("SELECT id FROM applications WHERE id = ?", (application_id,))
        if not cursor.fetchone():
            return {"success": False, "error": "Application not found", "code": "APPLICATION_NOT_FOUND"}
        
        cursor.execute(
            "UPDATE applications SET status = ? WHERE id = ?",
            (new_status, application_id)
        )
        
        conn.commit()
        
        if cursor.rowcount > 0:
            return {"success": True, "message": f"Application status updated to {new_status}"}
        else:
            return {"success": False, "error": "Application status not updated", "code": "UPDATE_FAILED"}
    except Exception as e:
        conn.rollback()
        print(f"Error updating application status: {e}")
        return {"success": False, "error": "An unexpected error occurred", "code": "UNKNOWN_ERROR"}
    finally:
        conn.close()

# Function to get employer's posted jobs
def get_employer_jobs(employer_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check if the employer exists
        cursor.execute("SELECT id FROM employers WHERE id = ?", (employer_id,))
        if not cursor.fetchone():
            return {"success": False, "error": "Employer not found", "code": "EMPLOYER_NOT_FOUND"}
        
        cursor.execute('''
            SELECT * FROM jobs
            WHERE employer_id = ?
            ORDER BY created_at DESC
        ''', (employer_id,))
        
        jobs = cursor.fetchall()
        
        return {
            "success": True, 
            "jobs": [dict(job) for job in jobs]
        }
    except Exception as e:
        print(f"Error fetching employer jobs: {e}")
        return {"success": False, "error": str(e), "jobs": []}
    finally:
        conn.close()

# Function to get applications for a specific job
def get_job_applications(job_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check if the job exists
        cursor.execute("SELECT id FROM jobs WHERE id = ?", (job_id,))
        if not cursor.fetchone():
            return {"success": False, "error": "Job not found", "code": "JOB_NOT_FOUND"}
        
        cursor.execute('''
            SELECT a.*, e.name, e.email, e.education, e.skills, e.experience
            FROM applications a
            JOIN employees e ON a.employee_id = e.id
            WHERE a.job_id = ?
            ORDER BY a.applied_at DESC
        ''', (job_id,))
        
        applications = cursor.fetchall()
        
        # Parse skills JSON for each application
        result = []
        for app in applications:
            app_dict = dict(app)
            if app_dict["skills"]:
                try:
                    app_dict["skills"] = json.loads(app_dict["skills"])
                except json.JSONDecodeError:
                    app_dict["skills"] = []
            result.append(app_dict)
        
        return {
            "success": True, 
            "applications": result
        }
    except Exception as e:
        print(f"Error fetching job applications: {e}")
        return {"success": False, "error": str(e), "applications": []}
    finally:
        conn.close()

# Function to get all applications submitted by an employee
def get_employee_applications(employee_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check if the employee exists
        cursor.execute("SELECT id FROM employees WHERE id = ?", (employee_id,))
        if not cursor.fetchone():
            return {"success": False, "error": "Employee not found", "code": "EMPLOYEE_NOT_FOUND"}
        
        # Join with jobs table to get job title and time_slot
        cursor.execute('''
            SELECT a.*, j.title AS job_title, j.time_slot, e.company_name 
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            JOIN employers e ON j.employer_id = e.id
            WHERE a.employee_id = ?
            ORDER BY a.applied_at DESC
        ''', (employee_id,))
        
        applications = cursor.fetchall()
        
        # Convert to list of dictionaries
        result = []
        for app in applications:
            app_dict = dict(app)
            result.append(app_dict)
        
        conn.close()
        return result
    except Exception as e:
        print(f"Error fetching employee applications: {e}")
        conn.close()
        return []
    finally:
        if conn:
            conn.close()

# Function to add a chat entry for employee questions and answers
def save_chat_qa(employee_id, question, answer):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check if the employee exists
        cursor.execute("SELECT id FROM employees WHERE id = ?", (employee_id,))
        if not cursor.fetchone():
            return {"success": False, "error": "Employee not found", "code": "EMPLOYEE_NOT_FOUND"}
        
        cursor.execute(
            "INSERT INTO chat (employee_id, question, answer) VALUES (?, ?, ?)",
            (employee_id, question, answer)
        )
        
        chat_id = cursor.lastrowid
        conn.commit()
        
        return {
            "success": True,
            "chat_id": chat_id,
            "message": "Chat entry saved successfully"
        }
    except Exception as e:
        conn.rollback()
        print(f"Error saving chat QA: {e}")
        return {"success": False, "error": "An unexpected error occurred", "code": "UNKNOWN_ERROR"}
    finally:
        conn.close()

# Function to get an employee's chat history
def get_employee_chat_history(employee_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check if the employee exists
        cursor.execute("SELECT id FROM employees WHERE id = ?", (employee_id,))
        if not cursor.fetchone():
            return {"success": False, "error": "Employee not found", "code": "EMPLOYEE_NOT_FOUND"}
        
        cursor.execute('''
            SELECT * FROM chat
            WHERE employee_id = ?
            ORDER BY created_at ASC
        ''', (employee_id,))
        
        chat_history = cursor.fetchall()
        
        return {
            "success": True, 
            "chat_history": [dict(entry) for entry in chat_history]
        }
    except Exception as e:
        print(f"Error fetching chat history: {e}")
        return {"success": False, "error": str(e), "chat_history": []}
    finally:
        conn.close()

# Function to test database connection
def test_connection():
    """Test the database connection and verify tables exist"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if main tables exist by querying sqlite_master
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('employers', 'employees', 'jobs', 'applications')")
        tables = cursor.fetchall()
        table_names = [table['name'] for table in tables]
        
        expected_tables = ['employers', 'employees', 'jobs', 'applications']
        missing_tables = [table for table in expected_tables if table not in table_names]
        
        if missing_tables:
            return {
                "success": False, 
                "error": f"Database is missing tables: {', '.join(missing_tables)}",
                "initialized": False
            }
        
        conn.close()
        return {
            "success": True,
            "message": "Database connection successful and schema verified",
            "initialized": True
        }
    except Exception as e:
        print(f"Database connection error: {e}")
        return {
            "success": False,
            "error": str(e),
            "initialized": False
        }

def delete_job(job_id, employer_id):
    """Delete a job posting and all related applications
    
    Args:
        job_id (int): ID of the job to delete
        employer_id (int): ID of the employer (for verification)
        
    Returns:
        dict: Result of the operation
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Print debug info
        print(f"Attempting to delete job {job_id} for employer {employer_id}")
        
        # First verify the job exists and belongs to this employer
        cursor.execute("SELECT employer_id FROM jobs WHERE id = ?", (job_id,))
        job = cursor.fetchone()
        
        if not job:
            print(f"Job {job_id} not found")
            return {"success": False, "error": "Job not found", "code": "JOB_NOT_FOUND"}
        
        db_employer_id = job['employer_id']
        print(f"Job belongs to employer: {db_employer_id}, requesting employer: {employer_id}")
        
        if int(db_employer_id) != int(employer_id):
            print(f"Unauthorized: job {job_id} belongs to employer {db_employer_id}, not {employer_id}")
            return {"success": False, "error": "You don't have permission to delete this job", "code": "UNAUTHORIZED"}
        
        # Begin transaction - we'll delete applications first, then the job
        cursor.execute("BEGIN TRANSACTION")
        
        # Delete all applications for this job
        cursor.execute("DELETE FROM applications WHERE job_id = ?", (job_id,))
        applications_deleted = cursor.rowcount
        print(f"Deleted {applications_deleted} applications for job {job_id}")
        
        # Delete the job
        cursor.execute("DELETE FROM jobs WHERE id = ?", (job_id,))
        
        # Commit the transaction
        conn.commit()
        print(f"Successfully deleted job {job_id}")
        
        return {
            "success": True, 
            "message": "Job and all related applications deleted successfully",
            "applications_deleted": applications_deleted
        }
    except Exception as e:
        # Roll back on error
        conn.rollback()
        print(f"Error deleting job {job_id}: {e}")
        return {"success": False, "error": str(e), "code": "DB_ERROR"}
    finally:
        conn.close()

if __name__ == "__main__":
    # Initialize the database when this script is run directly
    result = init_db()
    if result["success"]:
        print(f"Database initialized successfully at {DATABASE_PATH}")
    else:
        print(f"Failed to initialize database: {result['error']}")