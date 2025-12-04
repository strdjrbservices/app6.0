import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Paper,
    Box,
    Typography,
    TextField,
    Button,
    Stack,
    Alert,
    Avatar,
    Checkbox,
    FormControlLabel,
    Grid,
    Link as MuiLink,
    InputAdornment,
    IconButton,
    CircularProgress
} from '@mui/material';
import { LockOutlined, Visibility, VisibilityOff, PersonOutline } from '@mui/icons-material';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Replace with your actual backend endpoint
            const response = await fetch('https://strdjrbservices1.pythonanywhere.com/api/token/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                // Assuming the backend returns a token upon successful login
                const data = await response.json();
                localStorage.setItem('authToken', data.access); // Store the token
                localStorage.setItem('username', username); // Store the username
                onLogin();
                navigate('/'); // Redirect to home page
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Invalid username or password');
            }
        } catch (err) {
            setError('Login failed. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(-45deg, #000000ff, #a960f3ff, #23a6d5, #f03800ff)',
                backgroundSize: '400% 400%',
                animation: 'gradient 15s ease infinite',
                '@keyframes gradient': {
                    '0%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                    '100%': { backgroundPosition: '0% 50%' },
                },
            }}
        >
            <Paper elevation={12} sx={{ p: 4, width: '100%', maxWidth: 420, borderRadius: '12px', backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
                        {/* <LockOutlined fontSize="large" /> */}
                    </Avatar>
                    <Typography component="h1" variant="h5" fontWeight="bold">
                        DJRB Review
                    </Typography>
                    <Box component="form" onSubmit={handleLogin} sx={{ mt: 3, width: '100%' }}>
                        <Stack spacing={2}>
                            {error && <Alert severity="error" variant="filled">{error}</Alert>}
                            <TextField
                                label="Username"
                                variant="outlined"
                                fullWidth
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                autoFocus
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><PersonOutline /></InputAdornment>,
                                }}
                            />
                            <TextField
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                variant="outlined"
                                fullWidth
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><LockOutlined /></InputAdornment>,
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={() => setShowPassword(!showPassword)}
                                                onMouseDown={(e) => e.preventDefault()}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <Grid container alignItems="center" justifyContent="space-between">
                                <Grid item>
                                    <FormControlLabel control={<Checkbox value="remember" color="primary" />} label="Remember me" />
                                </Grid>
                                <Grid item>
                                    <MuiLink href="#" variant="body2">Forgot password?</MuiLink>
                                </Grid>
                            </Grid>
                            <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 2, py: 1.5, fontWeight: 'bold' }}>
                                {loading ? <CircularProgress size={26} color="inherit" /> : 'Log In'}
                            </Button>
                        </Stack>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default Login;