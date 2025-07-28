import { useState } from 'react';
import { BASE_URL } from '../constants/config';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  TextField,
  Alert
} from '@mui/material';
import { Navbar } from './Navbar';
import { useAuth } from '../auth/AuthContext';

export function ChurchEnrollment() {
  const { user, refreshUser } = useAuth();
  const [churchName, setChurchName] = useState('');
  const [pastorName, setPastorName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const authToken = localStorage.getItem('authToken');
      
      // Submit church enrollment using new API endpoint
      const response = await fetch(`${BASE_URL}/enrollment/submit-church`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          churchName,
          pastorName,
          address,
          city,
          state,
          zip,
          contactEmail,
          contactPhone,
          website,
          description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit church enrollment');
      }

      const result = await response.json();
      console.log('Church enrollment submitted successfully:', result);

      // Refresh user data to reflect updated enrollment status
      await refreshUser();

      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to submit church enrollment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100vw', minHeight: '100vh', bgcolor: 'background.default', overflowX: 'hidden' }}>
      <Navbar />
      <Box sx={{ pt: 10, width: '100%' }}>
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary', mb: 2, textAlign: 'center' }}>
            Enroll Your Church
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.primary', mb: 6, textAlign: 'center' }}>
            Welcome {user?.name}! Let's get your church set up in the Updates system.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Card sx={{ p: 4 }}>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'secondary.main', mb: 4 }}>
                  Church Information
                </Typography>
                
                {/* Row 1: Church Name and Pastor Name */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                  <TextField
                    fullWidth
                    label="Church Name"
                    value={churchName}
                    onChange={(e) => setChurchName(e.target.value)}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Senior Pastor Name"
                    value={pastorName}
                    onChange={(e) => setPastorName(e.target.value)}
                    required
                  />
                </Box>
                
                {/* Row 2: Address */}
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </Box>
                
                {/* Row 3: City, State, ZIP */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                  <TextField
                    fullWidth
                    label="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                  <TextField
                    fullWidth
                    label="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                  <TextField
                    fullWidth
                    label="ZIP Code"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                  />
                </Box>
                
                {/* Row 4: Contact Email and Phone */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                  <TextField
                    fullWidth
                    label="Contact Email"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                  <TextField
                    fullWidth
                    label="Contact Phone"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </Box>
                
                {/* Row 5: Website */}
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourchurch.com"
                  />
                </Box>
                
                {/* Row 6: Description */}
                <Box sx={{ mb: 4 }}>
                  <TextField
                    fullWidth
                    label="Church Description"
                    multiline
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell us about your church community..."
                  />
                </Box>
                
                {/* Submit Button */}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="secondary"
                  size="large"
                  disabled={loading}
                  sx={{ fontWeight: 600, py: 2 }}
                >
                  {loading ? 'Submitting Request...' : 'Submit Church Enrollment'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </Box>
  );
}
