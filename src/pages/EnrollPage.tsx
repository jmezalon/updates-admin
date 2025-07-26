// React import not needed with JSX Transform
import { Box, Container, Typography, Button, Paper, Alert } from '@mui/material';
import { Email, CheckCircle, Person, Church } from '@mui/icons-material';
import { Navbar } from '../components/Navbar';

export function EnrollPage() {
  const contactEmail = 'jmezalon@gmail.com'; // Replace with your actual contact email
  
  const handleEmailClick = () => {
    const subject = encodeURIComponent('Church Admin Account Request - [Your Church Name]');
    const body = encodeURIComponent(`Dear Updates Team,

I am writing to request an admin account for our church to use the Updates platform.

Church Information:
- Church Name: [Your Church Name]
- Pastor Name: [Pastor's Full Name]
- My Name: [Your Full Name]
- My Role: [Your role at the church]
- Church Address: [Full Address]
- Contact Phone: [Phone Number]
- Church Website: [Website if applicable]

I have CC'd our pastor on this email as required. Pastor [Name], please reply to this email confirming your approval for me to manage our church's Updates account.

Thank you for your time and consideration.

Best regards,
[Your Name]
[Your Title/Role]
[Church Name]`);
    
    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <Box sx={{ width: '100vw', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="md" sx={{ pt: 15, pb: 8 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary', mb: 4, textAlign: 'center' }}>
          Enroll Your Church
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.primary', mb: 6, textAlign: 'center', fontSize: '1.1rem' }}>
          Ready to get your church connected with Updates? Follow our simple enrollment process to get started.
        </Typography>

        {/* Important Requirements Alert */}
        <Alert severity="info" sx={{ mb: 4, fontSize: '1rem' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            📋 Important Requirements:
          </Typography>
          <Typography variant="body2">
            • You must CC your church pastor in the enrollment email<br/>
            • The pastor must reply confirming approval before account creation<br/>
            • Only one admin account per church is initially provided
          </Typography>
        </Alert>

        {/* Enrollment Process Steps */}
        <Typography variant="h5" sx={{ fontWeight: 600, color: 'secondary.main', mb: 3, textAlign: 'center' }}>
          Enrollment Process
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 6 }}>
          {/* Step 1 */}
          <Paper elevation={2} sx={{ p: 3, borderLeft: 4, borderColor: 'secondary.main' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Email sx={{ color: 'secondary.main', mt: 0.5 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                  Step 1: Send Enrollment Email
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.primary', mb: 2, lineHeight: 1.6 }}>
                  Click the button below to send us an enrollment request email. The email template will include all necessary church information fields and will automatically CC your pastor.
                </Typography>
                <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600 }}>
                  ⚠️ You MUST CC your church pastor in this email
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Step 2 */}
          <Paper elevation={2} sx={{ p: 3, borderLeft: 4, borderColor: 'primary.main' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Person sx={{ color: 'primary.main', mt: 0.5 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                  Step 2: Pastor Approval Required
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.primary', mb: 2, lineHeight: 1.6 }}>
                  Your pastor must reply to the enrollment email confirming their approval for you to manage the church's Updates account. This ensures proper authorization.
                </Typography>
                <Typography variant="body2" sx={{ color: 'warning.main', fontWeight: 600 }}>
                  📧 No account will be created without pastor approval
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Step 3 */}
          <Paper elevation={2} sx={{ p: 3, borderLeft: 4, borderColor: 'success.main' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <CheckCircle sx={{ color: 'success.main', mt: 0.5 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                  Step 3: Account Creation & Access
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.primary', mb: 2, lineHeight: 1.6 }}>
                  Once we receive pastor approval, we'll create your admin account and send you login credentials via email. You can then log in and start managing your church's events and announcements.
                </Typography>
                <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
                  ✅ Full access to church management features
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Step 4 */}
          <Paper elevation={2} sx={{ p: 3, borderLeft: 4, borderColor: 'info.main' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Church sx={{ color: 'info.main', mt: 0.5 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                  Step 4: Church Enrollment & Management
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.primary', mb: 2, lineHeight: 1.6 }}>
                  After logging in, you'll complete your church's profile setup and can immediately start creating events, announcements, and managing your church's presence on the Updates platform.
                </Typography>
                <Typography variant="body2" sx={{ color: 'info.main', fontWeight: 600 }}>
                  🏛️ Your church will be live on the Updates app
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Call to Action */}
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 3 }}>
            Ready to Get Started?
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            color="secondary" 
            startIcon={<Email />}
            sx={{ 
              fontWeight: 700, 
              px: 6, 
              py: 2, 
              fontSize: '1.1rem',
              mb: 3
            }} 
            onClick={handleEmailClick}
          >
            Send Enrollment Email
          </Button>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
            This will open your email client with a pre-filled template
          </Typography>
        </Box>

        {/* Contact Information */}
        <Box sx={{ mt: 6, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 2, textAlign: 'center' }}>
            Questions?
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.primary', textAlign: 'center' }}>
            If you have any questions about the enrollment process, please contact us at{' '}
            <Typography component="span" sx={{ fontWeight: 600, color: 'secondary.main' }}>
              {contactEmail}
            </Typography>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
