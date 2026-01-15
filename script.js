// AngularJS App Configuration
const app = angular.module('budgetWalaApp', []);

// Configuration - Update with your backend API URL
const API_BASE_URL = 'http://127.0.0.1:8000/customer';

// Auth Controller
app.controller('AuthController', ['$scope', '$timeout', '$interval', function($scope, $timeout, $interval) {
    
    // Initialize scope variables
    $scope.currentForm = 'login';
    $scope.loading = false;
    $scope.alert = { show: false, message: '', type: '' };
    $scope.currentSlide = 0;
    
    // Password visibility toggles
    $scope.showLoginPassword = false;
    $scope.showRegPassword = false;
    $scope.showNewPassword = false;
    
    // Form data models
    $scope.loginData = {
        email: '',
        password: ''
    };
    
    $scope.registerData = {
        name: '',
        email: '',
        password: '',
        type: '',
        phone: '',
        telegram_chat_id: ''
    };
    
    $scope.forgotData = {
        email: ''
    };
    
    $scope.otpData = {
        otp: '',
        new_password: ''
    };
    
    // Reset token storage
    $scope.resetToken = '';
    
    // Slideshow functionality
    $scope.setSlide = function(index) {
        $scope.currentSlide = index;
    };
    
    // Auto-advance slideshow every 4 seconds
    $interval(function() {
        $scope.currentSlide = ($scope.currentSlide + 1) % 4;
    }, 4000);
    
    // Welcome screen transition
    $timeout(function() {
        const welcomeScreen = document.getElementById('welcomeScreen');
        const authScreen = document.getElementById('authScreen');
        
        welcomeScreen.classList.add('hide');
        
        $timeout(function() {
            welcomeScreen.style.display = 'none';
            authScreen.classList.add('show');
        }, 300);
    }, 500);
    
    // Form switching
    $scope.switchForm = function(formName) {
        $scope.currentForm = formName;
        $scope.alert.show = false;
    };
    
    // Alert functions
    function showAlert(message, type) {
        $scope.alert = {
            show: true,
            message: message,
            type: type
        };
        
        $timeout(function() {
            $scope.alert.show = false;
        }, 4000);
    }
    
    // ============================================
    // LOGIN FUNCTION
    // ============================================
    $scope.login = function() {
        $scope.loading = true;
        
        fetch(`${API_BASE_URL}/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify($scope.loginData)
        })
        .then(response => response.json())
        .then(data => {
            $scope.$apply(function() {
                $scope.loading = false;
                console.log(data)
                if (data.access) {
                    localStorage.setItem('access', data.access);
                    localStorage.setItem('refresh', data.refresh);
                    localStorage.setItem('customer', JSON.stringify(data.customer));
                    
                    
                    
                    $timeout(function() {
                        showAlert('Login successful! Redirecting...', 'success');
                        window.location.href = 'http://127.0.0.1:5500/new/dashboard/dashboard.html';
                    }, 100);
                } else {
                    showAlert(data.message || 'Login failed. Please try again.', 'error');
                }
            });
        })
        .catch(error => {
            console.error('Login error:', error);
            $scope.$apply(function() {
                $scope.loading = false;
                showAlert('Network error. Please check your connection.', 'error');
            });
        });
    };
    
    // ============================================
    // REGISTER FUNCTION
    // ============================================
    $scope.register = function() {
        $scope.loading = true;
        
        fetch(`${API_BASE_URL}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify($scope.registerData)
        })
        .then(response => response.json())
        .then(data => {
            $scope.$apply(function() {
                $scope.loading = false;
                
                if (data.token) {
                    localStorage.setItem('reset_token', data.reset_token);
                    localStorage.setItem('user', JSON.stringify(data));
                    
                    showAlert('Registration successful! Redirecting...', 'success');
                    
                    $timeout(function() {
                        window.location.href = 'dashboard.html';
                    }, 1500);
                } else {
                    showAlert(data.message || 'Registration failed. Please try again.', 'error');
                }
            });
        })
        .catch(error => {
            console.error('Registration error:', error);
            $scope.$apply(function() {
                $scope.loading = false;
                showAlert('Network error. Please check your connection.', 'error');
            });
        });
    };
    
    // ============================================
    // STEP 1: FORGOT PASSWORD - SEND OTP TO TELEGRAM
    // ============================================
    $scope.forgotPassword = function() {
        $scope.loading = true;
        
        fetch(`${API_BASE_URL}/forgot-password/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                email: $scope.forgotData.email 
            })
        })
        .then(response => response.json())
        .then(data => {
            $scope.$apply(function() {
                $scope.loading = false;
                showAlert('OTP sent to your Telegram!', 'success');
                $scope.currentForm = 'otp';
            });
        })
        .catch(error => {
            console.error('Forgot password error:', error);
            $scope.$apply(function() {
                $scope.loading = false;
                showAlert('Failed to send OTP. Please try again.', 'error');
            });
        });
    };
    
    // ============================================
    // STEP 2: VERIFY OTP - GET RESET TOKEN
    // ============================================
    $scope.verifyOTPStep = function() {
        if ($scope.otpData.otp.length !== 6) {
            showAlert('Please enter a valid 6-digit OTP', 'error');
            return;
        }
        
        $scope.loading = true;
        
        fetch(`${API_BASE_URL}/verify-otp/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: $scope.forgotData.email,
                otp: $scope.otpData.otp
            })
        })
        .then(response => response.json())
        .then(data => {
            $scope.$apply(function() {
                $scope.loading = false;
                
                if (data.reset_token) {
                    // Store the reset token
                    $scope.resetToken = data.reset_token;
                    showAlert('OTP verified! Now set your new password.', 'success');
                    // Move to reset password form
                    $scope.currentForm = 'resetPassword';
                } else {
                    showAlert(data.message || 'Invalid OTP. Please try again.', 'error');
                }
            });
        })
        .catch(error => {
            console.error('OTP verification error:', error);
            $scope.$apply(function() {
                $scope.loading = false;
                showAlert('Invalid OTP or network error.', 'error');
            });
        });
    };
    
    // ============================================
    // STEP 3: RESET PASSWORD WITH TOKEN
    // ============================================
    $scope.resetPassword = function() {
        if (!$scope.otpData.new_password) {
            showAlert('Please enter a new password', 'error');
            return;
        }
        
        if ($scope.otpData.new_password.length < 3) {
            showAlert('Password must be at least 3 characters', 'error');
            return;
        }
        
        $scope.loading = true;
        
        fetch(`${API_BASE_URL}/reset-password/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: $scope.forgotData.email,
                reset_token: $scope.resetToken,
                new_password: $scope.otpData.new_password
            })
        })
        .then(response => response.json())
        .then(data => {
            $scope.$apply(function() {
                $scope.loading = false;
                showAlert('Password reset successful! Please login with your new password.', 'success');
                
                // Clear all form data
                $scope.otpData = { otp: '', new_password: '' };
                $scope.forgotData = { email: '' };
                $scope.resetToken = '';
                
                // Redirect to login after 2 seconds
                $timeout(function() {
                    $scope.currentForm = 'login';
                }, 2000);
            });
        })
        .catch(error => {
            console.error('Reset password error:', error);
            $scope.$apply(function() {
                $scope.loading = false;
                showAlert('Failed to reset password. Please try again.', 'error');
            });
        });
    };
    
    // ============================================
    // CHECK IF USER IS ALREADY LOGGED IN
    // ============================================
    const token = localStorage.getItem('access');
    if (token) {
        // User already logged in, redirect to dashboard
        window.location.href = 'dashboard/dashboard.html';
    }
    else {
        // If no token, show login form
        $scope.currentForm = 'login';
    }
}]);