from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import database as db
from werkzeug.security import generate_password_hash, check_password_hash
import json
import jwt
import datetime
import os

# Create Flask application
app = Flask(__name__, 
            static_folder='../build',  # Path to React build folder relative to this file
            static_url_path='')
CORS(app)  # Enable Cross-Origin Resource Sharing for all routes

# Configuration
app.config['SECRET_KEY'] = 'your-secret-key-here'  # Change in production
app.config['JWT_EXPIRATION'] = 24 * 60 * 60  # 24 hours in seconds

# Helper function for creating JWT tokens
def create_token(user_id, user_type):
    return jwt.encode({
        'user_id': user_id,
        'user_type': user_type,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(seconds=app.config['JWT_EXPIRATION'])
    }, app.config['SECRET_KEY'])

# Initialize the database when the app starts
with app.app_context():
    db.init_db()

# Serve React App at root path
@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

# Serve React static files
@app.route('/<path:path>')
def static_proxy(path):
    file_path = os.path.join(app.static_folder, path)
    if os.path.isfile(file_path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

# Test endpoint to verify the connection
@app.route('/api/test', methods=['GET'])
def test_connection():
    try:
        connection_status = db.test_connection()
        if isinstance(connection_status, dict) and 'error' in connection_status:
            return jsonify({'status': 'error', 'message': connection_status['error']}), 500
        return jsonify({'status': 'success', 'message': 'Database connection successful'}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# Authentication endpoints
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data:
        return jsonify({'status': 'error', 'message': 'No data provided'}), 400
    
    # Check required fields
    required_fields = ['name', 'email', 'password', 'userType']
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({'status': 'error', 'message': f'Missing fields: {", ".join(missing_fields)}'}), 400
    
    # Store password directly without hashing
    password = data['password']
    
    if data['userType'] == 'employer':
        # Additional required fields for employer
        if 'companyName' not in data:
            return jsonify({'status': 'error', 'message': 'Missing company name'}), 400
        
        result = db.register_employer(
            data['name'],
            data['email'],
            password,  # Use password directly
            data['companyName'],
            data.get('latitude'),
            data.get('longitude')
        )
    elif data['userType'] == 'employee':
        # Additional required fields for employee
        for field in ['dob', 'education']:
            if field not in data:
                return jsonify({'status': 'error', 'message': f'Missing field: {field}'}), 400
        
        # Convert skills from JSON string if needed
        skills = data.get('skills', [])
        if isinstance(skills, str):
            try:
                skills = json.loads(skills)
            except json.JSONDecodeError:
                return jsonify({'status': 'error', 'message': 'Invalid skills format'}), 400
        
        result = db.register_employee(
            data['name'],
            data['email'],
            password,  # Use password directly
            data['dob'],
            data['education'],
            skills,
            data.get('experience', 0),
            data.get('latitude'),
            data.get('longitude')
        )
    else:
        return jsonify({'status': 'error', 'message': 'Invalid user type'}), 400
    
    # Check if registration was successful
    if isinstance(result, dict) and 'error' in result:
        return jsonify({'status': 'error', 'message': result['error']}), 400
    
    # Return success response
    return jsonify({
        'status': 'success',
        'message': f'{data["userType"].capitalize()} registered successfully',
        'userId': result
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data:
        return jsonify({'status': 'error', 'message': 'No data provided'}), 400
    
    # Check required fields
    required_fields = ['email', 'password', 'userType']
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({'status': 'error', 'message': f'Missing fields: {", ".join(missing_fields)}'}), 400
    
    # Get user based on user type
    user = None
    if data['userType'] == 'employer':
        user = db.get_employer_by_email(data['email'])
    elif data['userType'] == 'employee':
        user = db.get_employee_by_email(data['email'])
    else:
        return jsonify({'status': 'error', 'message': 'Invalid user type'}), 400
    
    # Debug output
    print(f"User found: {user is not None}")
    
    # Check if user exists
    if not user:
        return jsonify({'status': 'error', 'message': 'Invalid credentials'}), 401
    
    # Simple direct password verification (without hashing)
    # This is NOT secure for production but will work for development across systems
    if user['password_hash'] != data['password']:
        print("Password verification failed")
        return jsonify({'status': 'error', 'message': 'Invalid credentials'}), 401
    
    # If we get here, authentication succeeded
    print("Password verification successful")
    
    # Generate token
    token = create_token(user['id'], data['userType'])
    
    # Build response data
    response_data = {
        'status': 'success',
        'message': 'Login successful',
        'token': token,
        'userId': user['id'],
        'userType': data['userType'],
        'name': user['name'],
    }
    
    # Add user type specific data
    if data['userType'] == 'employer' and 'company_name' in user:
        response_data['companyName'] = user['company_name']
    elif data['userType'] == 'employee':
        if 'skills' in user and user['skills']:
            try:
                response_data['skills'] = json.loads(user['skills'])
            except:
                response_data['skills'] = []
        if 'education' in user:
            response_data['education'] = user['education']
    
    return jsonify(response_data), 200

@app.route('/api/employer/login', methods=['POST'])
def employer_login():
    # Get request data
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'status': 'error', 'message': 'Missing email or password'}), 400
    
    # Get credentials
    email = data.get('email')
    password = data.get('password')
    
    # Check if employer exists
    employer = db.get_employer_by_email(email)
    if not employer:
        return jsonify({'status': 'error', 'message': 'Invalid email or password'}), 401
    
    # Direct password verification
    if employer['password_hash'] != password:
        return jsonify({'status': 'error', 'message': 'Invalid email or password'}), 401
    
    # Generate token
    token = create_token(employer['id'], 'employer')
    
    return jsonify({
        'status': 'success',
        'message': 'Login successful',
        'token': token,
        'userId': employer['id'],
        'name': employer['name'],
        'companyName': employer['company_name']  # Return the company name
    }), 200

# Job related endpoints - These would need authentication middleware in production
@app.route('/api/jobs', methods=['GET'])
def get_all_jobs():
    # Get jobs from database
    result = db.get_all_jobs()
    
    if not result['success']:
        return jsonify({'status': 'error', 'message': result['error']}), 400
    
    return jsonify({
        'status': 'success',
        'jobs': result['jobs']
    }), 200

@app.route('/api/jobs/nearby', methods=['GET'])
def get_nearby_jobs():
    try:
        latitude = float(request.args.get('lat', 0))
        longitude = float(request.args.get('lng', 0))
        radius = float(request.args.get('radius', 10))  # Default 10km radius
    except ValueError:
        return jsonify({'status': 'error', 'message': 'Invalid location parameters'}), 400
    
    jobs = db.get_nearby_jobs(latitude, longitude, radius)
    return jsonify({'status': 'success', 'jobs': jobs}), 200

@app.route('/api/jobs', methods=['POST'])
def create_job():
    data = request.get_json()
    
    if not data:
        return jsonify({'status': 'error', 'message': 'No data provided'}), 400
    
    # Check required fields
    required_fields = ['employer_id', 'title', 'description']
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({'status': 'error', 'message': f'Missing fields: {", ".join(missing_fields)}'}), 400
    
    # Add time_slot to job creation
    result = db.create_job(
        data['employer_id'],
        data['title'],
        data['description'],
        data.get('salary'),
        'Part-time',  # Default job type
        data.get('time_slot'),  # Add time_slot parameter
        data.get('latitude'),
        data.get('longitude')
    )
    
    if not result['success']:
        return jsonify({'status': 'error', 'message': result['error']}), 400
    
    return jsonify({
        'status': 'success',
        'message': 'Job created successfully',
        'jobId': result['job_id']
    }), 201

@app.route('/api/jobs/<int:job_id>', methods=['GET'])
def get_job(job_id):
    result = db.get_job_by_id(job_id)
    
    if not result['success']:
        return jsonify({'status': 'error', 'message': result['error']}), 404
    
    return jsonify({
        'status': 'success',
        'job': result['job']
    }), 200

@app.route('/api/jobs/<int:job_id>/apply', methods=['POST'])
def apply_for_job_route(job_id):
    data = request.get_json()
    
    if not data or 'employee_id' not in data:
        return jsonify({'status': 'error', 'message': 'Employee ID is required'}), 400
    
    employee_id = data['employee_id']
    cover_letter = data.get('cover_letter', '')  # Get cover letter if provided
    
    result = db.apply_for_job(job_id, employee_id, cover_letter)
    
    if not result['success']:
        return jsonify({'status': 'error', 'message': result['error']}), 400
    
    return jsonify({
        'status': 'success',
        'message': 'Application submitted successfully',
        'applicationId': result['application_id']
    }), 201

# Add these new routes to your app.py file

# Get jobs posted by a specific employer
@app.route('/api/employers/<int:employer_id>/jobs', methods=['GET'])
def get_employer_jobs(employer_id):
    # Verify employer exists
    conn = db.get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT id FROM employers WHERE id = ?', (employer_id,))
    employer = cursor.fetchone()
    conn.close()
    
    if not employer:
        return jsonify({'status': 'error', 'message': 'Employer not found'}), 404
    
    # Get jobs from database
    result = db.get_employer_jobs(employer_id)
    
    if not result['success']:
        return jsonify({'status': 'error', 'message': result['error']}), 400
    
    return jsonify({
        'status': 'success',
        'jobs': result['jobs']
    }), 200

# Get applications received by an employer
@app.route('/api/employers/<int:employer_id>/applications', methods=['GET'])
def get_employer_applications(employer_id):
    # Verify employer exists
    conn = db.get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT id FROM employers WHERE id = ?', (employer_id,))
    employer = cursor.fetchone()
    conn.close()
    
    if not employer:
        return jsonify({'status': 'error', 'message': 'Employer not found'}), 404
    
    # Get all job IDs for this employer
    conn = db.get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT id FROM jobs WHERE employer_id = ?', (employer_id,))
    job_ids = [row['id'] for row in cursor.fetchall()]
    conn.close()
    
    if not job_ids:
        return jsonify({
            'status': 'success',
            'applications': []
        }), 200
    
    # Get applications for all jobs
    applications = []
    for job_id in job_ids:
        result = db.get_job_applications(job_id)
        if result['success']:
            # Add job title to each application
            conn = db.get_db_connection()
            cursor = conn.cursor()
            cursor.execute('SELECT title FROM jobs WHERE id = ?', (job_id,))
            job = cursor.fetchone()
            conn.close()
            
            job_title = job['title'] if job else 'Unknown Job'
            for app in result['applications']:
                app['job_title'] = job_title
                applications.append(app)
    
    return jsonify({
        'status': 'success',
        'applications': applications
    }), 200

# Get applications submitted by an employee
@app.route('/api/employees/<int:employee_id>/applications', methods=['GET'])
def get_employee_applications(employee_id):
    # Verify employee exists
    conn = db.get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT id FROM employees WHERE id = ?', (employee_id,))
    employee = cursor.fetchone()
    conn.close()
    
    if not employee:
        return jsonify({'status': 'error', 'message': 'Employee not found'}), 404
    
    # Get applications from database
    result = db.get_employee_applications(employee_id)
    
    if not result['success']:
        return jsonify({'status': 'error', 'message': result['error']}), 400
    
    # Enhance application data with job and company information
    enhanced_applications = []
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    for app in result['applications']:
        # Get job title and employer info
        cursor.execute('''
            SELECT j.title, e.company_name
            FROM jobs j
            JOIN employers e ON j.employer_id = e.id
            WHERE j.id = ?
        ''', (app['job_id'],))
        
        job_info = cursor.fetchone()
        if job_info:
            app['job_title'] = job_info['title']
            app['company_name'] = job_info['company_name']
        else:
            app['job_title'] = 'Unknown Job'
            app['company_name'] = 'Unknown Company'
        
        enhanced_applications.append(app)
    
    conn.close()
    
    return jsonify({
        'status': 'success',
        'applications': enhanced_applications
    }), 200

@app.route('/api/applications/<int:application_id>/status', methods=['PUT'])
def update_application_status_route(application_id):
    data = request.get_json()
    
    if not data or 'status' not in data:
        return jsonify({'status': 'error', 'message': 'New status is required'}), 400
    
    new_status = data['status']
    
    # Ensure the status is valid
    if new_status not in ['waiting', 'accepted', 'rejected']:
        return jsonify({'status': 'error', 'message': 'Invalid status. Must be: waiting, accepted, or rejected'}), 400
    
    # Get current application status
    conn = db.get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT status FROM applications WHERE id = ?', (application_id,))
    application = cursor.fetchone()
    conn.close()
    
    if not application:
        return jsonify({'status': 'error', 'message': 'Application not found'}), 404
    
    current_status = application['status']
    
    # If application is already accepted or rejected, prevent status change
    if current_status in ['accepted', 'rejected']:
        return jsonify({
            'status': 'error', 
            'message': f'Cannot change status of an application that has already been {current_status}'
        }), 400
    
    result = db.update_application_status(application_id, new_status)
    
    if not result['success']:
        return jsonify({'status': 'error', 'message': result['error']}), 400
    
    return jsonify({
        'status': 'success',
        'message': result['message']
    }), 200

@app.route('/api/applications/<int:application_id>', methods=['GET'])
def get_application_details(application_id):
    # Get application from database
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Get application with employee and job information
        cursor.execute('''
            SELECT a.*, e.name, e.email, e.education, e.skills, e.experience,
                   j.title as job_title, j.description as job_description,
                   emp.company_name
            FROM applications a
            JOIN employees e ON a.employee_id = e.id
            JOIN jobs j ON a.job_id = j.id
            JOIN employers emp ON j.employer_id = emp.id
            WHERE a.id = ?
        ''', (application_id,))
        
        application = cursor.fetchone()
        
        if not application:
            return jsonify({
                'status': 'error', 
                'message': 'Application not found'
            }), 404
        
        # Convert to dictionary
        app_dict = dict(application)
        
        # Parse skills JSON if present
        if app_dict.get('skills'):
            try:
                app_dict['skills'] = json.loads(app_dict['skills'])
            except:
                app_dict['skills'] = []
        
        return jsonify({
            'status': 'success',
            'application': app_dict
        }), 200
        
    except Exception as e:
        print(f"Error fetching application details: {e}")
        return jsonify({
            'status': 'error', 
            'message': f'An error occurred: {str(e)}'
        }), 500
    finally:
        conn.close()

@app.route('/api/employers/<int:employer_id>', methods=['GET'])
def get_employer_details(employer_id):
    # Get employer from database
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Get employer details
        cursor.execute('SELECT id, name, email, company_name FROM employers WHERE id = ?', (employer_id,))
        employer = cursor.fetchone()
        
        if not employer:
            return jsonify({'status': 'error', 'message': 'Employer not found'}), 404
        
        return jsonify({
            'status': 'success',
            'employer': dict(employer)
        }), 200
    except Exception as e:
        print(f"Error fetching employer details: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/jobs/<int:job_id>', methods=['DELETE'])
def delete_job_route(job_id):
    """Delete a job and all its applications"""
    # Get employer ID from request
    data = request.get_json()
    
    if not data or 'employer_id' not in data:
        return jsonify({'status': 'error', 'message': 'Employer ID is required'}), 400
    
    employer_id = data['employer_id']
    
    # Debug info
    print(f"Deleting job {job_id} for employer {employer_id}")
    
    # Call the database function
    result = db.delete_job(job_id, employer_id)
    
    if not result['success']:
        # Handle different error cases
        if result.get('code') == 'UNAUTHORIZED':
            return jsonify({'status': 'error', 'message': result['error']}), 403
        elif result.get('code') == 'JOB_NOT_FOUND':
            return jsonify({'status': 'error', 'message': result['error']}), 404
        return jsonify({'status': 'error', 'message': result['error']}), 400
    
    return jsonify({
        'status': 'success',
        'message': result['message'],
        'applicationsDeleted': result.get('applications_deleted', 0)
    }), 200

# Run the application
if __name__ == '__main__':
    app.run(debug=True, port=5000)

def update_application_status(application_id, new_status):
    """Update the status of a job application"""
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check if application exists and get its current status
        cursor.execute('SELECT id, status FROM applications WHERE id = ?', (application_id,))
        application = cursor.fetchone()
        
        if not application:
            return {
                "success": False, 
                "error": "Application not found", 
                "code": "APPLICATION_NOT_FOUND"
            }
        
        # If application is already accepted or rejected, prevent status change
        current_status = application['status']
        if current_status in ['accepted', 'rejected']:
            return {
                "success": False,
                "error": f"Cannot change status of an application that has already been {current_status}",
                "code": "STATUS_LOCKED"
            }
        
        # Update the application status
        cursor.execute(
            'UPDATE applications SET status = ? WHERE id = ?',
            (new_status, application_id)
        )
        
        conn.commit()
        
        # Return success response
        return {
            "success": True,
            "message": f"Application status updated to {new_status}"
        }
    except Exception as e:
        conn.rollback()
        print(f"Error updating application status: {e}")
        return {"success": False, "error": str(e), "code": "DB_ERROR"}
    finally:
        conn.close()