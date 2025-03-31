/**
 * API service for making requests to the backend
 */

const API_URL = 'http://localhost:5000/api';

/**
 * Test the backend connection
 * @returns {Promise<boolean>} True if connection is successful
 */
export const testBackendConnection = async () => {
  try {
    const response = await fetch(`${API_URL}/test`);
    const data = await response.json();
    
    if (data.status === 'success') {
      console.log('Backend connection successful!');
      return true;
    } else {
      console.error('Backend connection error:', data.message);
      return false;
    }
  } catch (error) {
    console.error('Failed to connect to backend:', error);
    return false;
  }
};

/**
 * Register a new user
 * @param {Object} userData User registration data
 * @returns {Promise<Object>} Registration response
 */
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return await response.json();
  } catch (error) {
    console.error('Registration error:', error);
    return { status: 'error', message: error.message };
  }
};

/**
 * Login a user (employee or employer)
 * @param {Object} userData User credentials
 * @returns {Promise<Object>} Login response
 */
export const loginUser = async (userData) => {
  try {
    console.log("Sending login request with data:", userData);
    
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    
    // Add logging to see what the API returns
    console.log('Login response:', data);
    
    // Make sure userType is correctly set in the returned data
    if (data.status === 'success') {
      // Use the userType from the request if the API doesn't return it
      data.userType = data.userType || userData.userType;
    }
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    return { 
      status: 'error', 
      message: 'Unable to connect to server. Please try again later.' 
    };
  }
};

/**
 * Get all jobs
 * @returns {Promise<Array>} List of jobs
 */
export const getAllJobs = async () => {
  try {
    const response = await fetch(`${API_URL}/jobs`);
    const data = await response.json();
    
    // Add debugging to see what data we're getting
    console.log('Jobs API response:', data);
    
    // Ensure we always return an array even if the API fails
    if (data && data.status === 'success' && Array.isArray(data.jobs)) {
      return data.jobs;
    } else {
      console.warn('getAllJobs: Invalid response format or no jobs found');
      return [];
    }
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
};

/**
 * Get nearby jobs based on location
 * @param {number} latitude User's latitude
 * @param {number} longitude User's longitude
 * @param {number} radius Search radius in kilometers (default: 10)
 * @returns {Promise<Object>} Nearby jobs
 */
export const getNearbyJobs = async (latitude, longitude, radius = 10) => {
  try {
    const response = await fetch(`${API_URL}/jobs/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching nearby jobs:', error);
    return { status: 'error', message: error.message, jobs: [] };
  }
};

/**
 * Get nearby talent based on location
 * @param {number} latitude Employer's latitude
 * @param {number} longitude Employer's longitude
 * @param {number} radius Search radius in kilometers (default: 10)
 * @returns {Promise<Object>} Nearby talent (employees)
 */
export const getNearbyTalent = async (latitude, longitude, radius = 10) => {
  try {
    const response = await fetch(`${API_URL}/employees/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching nearby talent:', error);
    return { status: 'error', message: error.message, talent: [] };
  }
};

/**
 * Create a new job
 * @param {Object} jobData Job details
 * @returns {Promise<Object>} Job creation response
 */
export const createJob = async (jobData) => {
  try {
    console.log("Creating job with data:", jobData); // Log the job data being sent
    
    const response = await fetch(`${API_URL}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(jobData),
    });
    return await response.json();
  } catch (error) {
    console.error('Error creating job:', error);
    return { status: 'error', message: error.message };
  }
};

/**
 * Apply for a job
 * @param {number} jobId - The ID of the job
 * @param {number} employeeId - The ID of the employee
 * @param {string} coverLetter - The cover letter for the application
 * @returns {Promise<Object>} - Response with status and message
 */
export const applyForJob = async (jobId, employeeId, coverLetter = '') => {
  try {
    const response = await fetch(`${API_URL}/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ 
        employee_id: employeeId,
        cover_letter: coverLetter 
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error applying for job:', error);
    return { status: 'error', message: error.message };
  }
};

/**
 * Get all jobs posted by an employer
 * @param {number} employerId Employer ID
 * @returns {Promise<Array>} List of jobs posted by the employer
 */
export const getEmployerJobs = async (employerId) => {
  try {
    const response = await fetch(`${API_URL}/employers/${employerId}/jobs`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });
    const data = await response.json();
    
    console.log('Employer jobs response:', data);
    
    if (data.status === 'success' && Array.isArray(data.jobs)) {
      return data.jobs;
    }
    return [];
  } catch (error) {
    console.error('Error fetching employer jobs:', error);
    return [];
  }
};

/**
 * Get job applications for an employer
 * @param {number} employerId Employer ID
 * @returns {Promise<Array>} List of applications received by the employer
 */
export const getEmployerApplications = async (employerId) => {
  try {
    const response = await fetch(`${API_URL}/employers/${employerId}/applications`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });
    const data = await response.json();
    return data.status === 'success' ? data.applications : [];
  } catch (error) {
    console.error('Error fetching employer applications:', error);
    return [];
  }
};

/**
 * Get applications submitted by an employee
 * @param {number} employeeId Employee ID
 * @returns {Promise<Array>} List of applications submitted by the employee
 */
export const getEmployeeApplications = async (employeeId) => {
  try {
    const response = await fetch(`${API_URL}/employees/${employeeId}/applications`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });
    const data = await response.json();
    
    console.log('Employee applications response:', data);
    
    if (data.status === 'success' && Array.isArray(data.applications)) {
      return data.applications;
    }
    return [];
  } catch (error) {
    console.error('Error fetching employee applications:', error);
    return [];
  }
};

/**
 * Get a specific job by ID
 * @param {number} jobId Job ID to retrieve
 * @returns {Promise<Object>} Job details
 */
export const getJobById = async (jobId) => {
  try {
    const response = await fetch(`${API_URL}/jobs/${jobId}`);
    const data = await response.json();
    return data; // Return the whole response object
  } catch (error) {
    console.error('Error fetching job details:', error);
    return { status: 'error', message: 'Failed to fetch job details' };
  }
};

/**
 * Update the status of a job application
 * @param {number} applicationId Application ID
 * @param {string} newStatus New status ('waiting', 'accepted', 'rejected')
 * @returns {Promise<Object>} Update status response
 */
export const updateApplicationStatus = async (applicationId, newStatus) => {
  try {
    const response = await fetch(`${API_URL}/applications/${applicationId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ 
        status: newStatus 
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error updating application status:', error);
    return { status: 'error', message: error.message };
  }
};

/**
 * Get details of a specific application
 * @param {number} applicationId Application ID
 * @returns {Promise<Object>} Application details
 */
export const getApplicationDetails = async (applicationId) => {
  try {
    const response = await fetch(`${API_URL}/applications/${applicationId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching application details:', error);
    return { status: 'error', message: 'Failed to fetch application details' };
  }
};

/**
 * Get employer details
 * @param {number} employerId The ID of the employer to fetch
 * @returns {Promise<Object>} Employer details
 */
export const getEmployerDetails = async (employerId) => {
  try {
    const response = await fetch(`${API_URL}/employers/${employerId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching employer details:', error);
    return { status: 'error', message: 'Failed to fetch employer details' };
  }
};

/**
 * Delete a job posting and its associated applications
 * @param {number} jobId Job ID to delete
 * @param {number} employerId Employer ID for verification
 * @returns {Promise<Object>} Delete result
 */
export const deleteJob = async (jobId, employerId) => {
  try {
    console.log(`Sending delete request for job ${jobId}, employer ${employerId}`);
    
    const response = await fetch(`${API_URL}/jobs/${jobId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ employer_id: employerId }),
    });
    
    const data = await response.json();
    console.log('Delete response data:', data);
    return data;
  } catch (error) {
    console.error('Error deleting job:', error);
    return { status: 'error', message: error.message };
  }
};

/**
 * Get employer profile
 * @param {string} employerId 
 * @returns {Promise} The employer profile data
 */
export const getEmployerProfile = async (employerId) => {
  try {
    const response = await fetch(`${API_URL}/employers/${employerId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching employer profile:', error);
    return { status: 'error', message: 'Failed to fetch profile' };
  }
};

/**
 * Update employer profile
 * @param {string} employerId 
 * @param {Object} profileData 
 * @returns {Promise} Result of the update operation
 */
export const updateEmployerProfile = async (employerId, profileData) => {
  try {
    const response = await fetch(`${API_URL}/employers/${employerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(profileData)
    });
    return await response.json();
  } catch (error) {
    console.error('Error updating employer profile:', error);
    return { status: 'error', message: 'Failed to update profile' };
  }
};

/**
 * Get employee profile
 * @param {string} employeeId 
 * @returns {Promise} The employee profile data
 */
export const getEmployeeProfile = async (employeeId) => {
  try {
    const response = await fetch(`${API_URL}/employees/${employeeId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching employee profile:', error);
    return { status: 'error', message: 'Failed to fetch profile' };
  }
};

/**
 * Update employee profile
 * @param {string} employeeId 
 * @param {Object} profileData 
 * @returns {Promise} Result of the update operation
 */
export const updateEmployeeProfile = async (employeeId, profileData) => {
  try {
    const response = await fetch(`${API_URL}/employees/${employeeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(profileData)
    });
    return await response.json();
  } catch (error) {
    console.error('Error updating employee profile:', error);
    return { status: 'error', message: 'Failed to update profile' };
  }
};

/**
 * Update user password
 * @param {string} userId 
 * @param {string} userType - 'employee' or 'employer' 
 * @param {Object} passwordData - {currentPassword, newPassword}
 * @returns {Promise} Result of the password update
 */
export const updatePassword = async (userId, userType, passwordData) => {
  try {
    const response = await fetch(`${API_URL}/${userType}s/${userId}/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(passwordData)
    });
    return await response.json();
  } catch (error) {
    console.error('Error updating password:', error);
    return { status: 'error', message: 'Failed to update password' };
  }
};