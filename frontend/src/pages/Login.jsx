import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5001/api/auth/login', {
        email,
        password
      });

      const { token, user } = response.data;

      // Store token and user in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect to dashboard
      navigate('/dashboard');
      window.location.reload(); // Reload to update auth state
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
    padding: '20px'
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
    padding: '40px',
    maxWidth: '400px',
    width: '100%'
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '30px'
  };

  const logoStyle = {
    fontSize: '32px',
    fontWeight: '800',
    color: '#2C3E50',
    marginBottom: '10px'
  };

  const titleStyle = {
    fontSize: '24px',
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: '8px'
  };

  const subtitleStyle = {
    fontSize: '14px',
    color: '#757575',
    fontWeight: '500'
  };

  const formGroupStyle = {
    marginBottom: '20px'
  };

  const labelStyle = {
    fontSize: '13px',
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: '8px',
    display: 'block',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 15px',
    border: '2px solid #E8EAED',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    color: '#2C3E50',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box'
  };

  const passwordContainerStyle = {
    position: 'relative'
  };

  const togglePasswordStyle = {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#757575',
    fontSize: '18px',
    padding: '5px'
  };

  const buttonStyle = {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginTop: '10px'
  };

  const errorStyle = {
    background: 'rgba(231, 76, 60, 0.1)',
    color: '#E74C3C',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '13px',
    fontWeight: '600',
    borderLeft: '4px solid #E74C3C'
  };

  const infoStyle = {
    background: 'rgba(255, 213, 79, 0.1)',
    color: '#2C3E50',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '12px',
    fontWeight: '600',
    borderLeft: '4px solid #FFD54F'
  };

  const footerStyle = {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '12px',
    color: '#757575'
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={logoStyle}>CAPWELL</div>
          <div style={titleStyle}>6S Audit System</div>
          <div style={subtitleStyle}>Digital Audit Management Platform</div>
        </div>

        {/* Info Box */}
        <div style={infoStyle}>
          Use your @capwell.co.ke email to login
        </div>

        {/* Error Message */}
        {error && <div style={errorStyle}>{error}</div>}

        {/* Form */}
        <form onSubmit={handleLogin}>
          {/* Email */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@capwell.co.ke"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = '#FFD54F')}
              onBlur={(e) => (e.target.style.borderColor = '#E8EAED')}
              required
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>Password</label>
            <div style={passwordContainerStyle}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#FFD54F')}
                onBlur={(e) => (e.target.style.borderColor = '#E8EAED')}
                required
                disabled={loading}
              />
              <button
                type="button"
                style={togglePasswordStyle}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            style={buttonStyle}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 5px 20px rgba(44, 62, 80, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Footer */}
        <div style={footerStyle}>
          CAPWELL INDUSTRIES LIMITED
          <br />
          Confidential - Authorized Users Only
        </div>
      </div>
    </div>
  );
};

export default Login;
