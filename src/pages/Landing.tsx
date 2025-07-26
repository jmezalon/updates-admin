import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Church, Event, Campaign, AccountBalance, PhotoCamera } from '@mui/icons-material';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import adminWelcome from '../assets/admin-welcome.png';
import churchPageOne from '../assets/church-page1.png';
import churchPageTwo from '../assets/church-page2.png';

export function Landing() {
  const navigate = useNavigate();
  
  return (
    <Box sx={{ width: '100vw', minHeight: '100vh', bgcolor: 'background.default', overflowX: 'hidden' }}>
      <Navbar />
      {/* Add top padding to account for fixed navbar */}
      <Box sx={{ pt: 10, width: '100%' }}>
        {/* Hero Section */}
        <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h2" sx={{ fontWeight: 900, color: 'secondary.main', mb: 2 }}>
            Updates Admin Portal
          </Typography>
          <Typography variant="h5" sx={{ color: 'text.primary', mb: 4, maxWidth: '800px', mx: 'auto' }}>
            Powerful church management tools to connect with your community and grow your ministry.
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.primary', mb: 6, maxWidth: '700px', mx: 'auto', fontSize: '1.1rem' }}>
            <b>For Church Leaders:</b> Take control of your church's digital presence. Manage events, share announcements, customize your profile, and engage with your community—all from one comprehensive admin dashboard.
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            color="secondary" 
            sx={{ fontWeight: 700, px: 6, py: 2, fontSize: '1.1rem', mb: 8 }} 
            onClick={() => navigate('/enroll')}
          >
            Become a Church Admin
          </Button>
        </Container>

        {/* Admin Features Section */}
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary', mb: 2, textAlign: 'center' }}>
            What You Can Do as a Church Admin
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 6, textAlign: 'center', fontSize: '1.1rem' }}>
            Once approved, you'll have access to powerful tools to manage your church's digital presence
          </Typography>

          {/* Admin Features Grid */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
            gap: 4, 
            mb: 8 
          }}>
            <Paper elevation={3} sx={{ p: 4, height: '100%', borderTop: 4, borderColor: 'secondary.main' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Church sx={{ color: 'secondary.main', fontSize: 40, mr: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Enroll Your Church
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Register your church in our directory and connect with your community members.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Complete church profile setup<br/>
                • Manage church information and contact details<br/>
                • Connect with congregation members
              </Typography>
            </Paper>
            <Paper elevation={3} sx={{ p: 4, height: '100%', borderTop: 4, borderColor: 'primary.main' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PhotoCamera sx={{ color: 'primary.main', fontSize: 40, mr: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Profile Customization
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Customize your church's appearance with logos, banners, and mission statements.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Upload church logo and banner images<br/>
                • Set church mission and description<br/>
                • Customize church profile appearance
              </Typography>
            </Paper>
            <Paper elevation={3} sx={{ p: 4, height: '100%', borderTop: 4, borderColor: 'success.main' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Event sx={{ color: 'success.main', fontSize: 40, mr: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Events & Announcements
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Create and manage church events, services, and important announcements.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Schedule worship services and events<br/>
                • Post community announcements<br/>
                • Manage event details and attendance
              </Typography>
            </Paper>
            <Paper elevation={3} sx={{ p: 4, height: '100%', borderTop: 4, borderColor: 'info.main' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalance sx={{ color: 'info.main', fontSize: 40, mr: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Financial Information
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Manage donation information and financial transparency for your congregation.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Set up donation links and information<br/>
                • Provide financial transparency<br/>
                • Manage church financial details
              </Typography>
            </Paper>
            <Paper elevation={3} sx={{ p: 4, height: '100%', borderTop: 4, borderColor: 'warning.main' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Campaign sx={{ color: 'warning.main', fontSize: 40, mr: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Dashboard Control
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Access comprehensive admin dashboard with analytics and management tools.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • View church analytics and insights<br/>
                • Manage all church content from one place<br/>
                • Monitor engagement and activity
              </Typography>
            </Paper>
          </Box>

          {/* Admin Portal Screenshots Placeholder */}
          <Box sx={{ mb: 8 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 4, textAlign: 'center' }}>
              Admin Portal Preview
            </Typography>
            
            {/* Dashboard Screenshot Placeholder */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', mb: 6, gap: 4 }}>
              <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'secondary.main', mb: 2 }}>
                  Your Church Dashboard
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.primary', mb: 3, fontSize: '1.1rem', lineHeight: 1.6 }}>
                  Get a complete overview of your church's activity. View recent events, announcements, and manage all your church information from one intuitive dashboard designed for church leaders.
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                  🎛️ Comprehensive admin controls at your fingertips
                </Typography>
              </Box>
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <Box 
                  sx={{ 
                    width: 600, 
                    height: 400, 
                    borderRadius: 4, 
                    bgcolor: 'grey.100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 2,
                    borderColor: 'grey.300',
                    borderStyle: 'dashed'
                  }}
                >
                  <img 
                  src={adminWelcome} 
                  alt="admin welcome page" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    borderRadius: '16px'
                  }} 
                />
                </Box>
              </Box>
            </Box>

            {/* Event Management Screenshot Placeholder */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row-reverse' }, alignItems: 'center', mb: 6, gap: 4 }}>
              <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'success.main', mb: 2 }}>
                  Event Management Interface
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.primary', mb: 3, fontSize: '1.1rem', lineHeight: 1.6 }}>
                  Create and manage events with our user-friendly interface. Upload images, set schedules, add descriptions, and publish events that will appear instantly in the Updates app for your community.
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                  📅 Powerful event creation and management tools
                </Typography>
              </Box>
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <Box 
                  sx={{ 
                    width: 600, 
                    height: 400, 
                    borderRadius: 4, 
                    bgcolor: 'grey.100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 2,
                    borderColor: 'grey.300',
                    borderStyle: 'dashed'
                  }}
                >
                  <img 
                  src={churchPageTwo} 
                  alt="church page update first" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    borderRadius: '16px'
                  }} 
                />
                </Box>
              </Box>
            </Box>

            {/* Church Management Screenshot Placeholder */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 4 }}>
              <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
                  Church Management Interface
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.primary', mb: 3, fontSize: '1.1rem', lineHeight: 1.6 }}>
                  Manage your complete church profile with ease. Update church information, upload logos and banners, edit your mission statement, and customize how your church appears to the community.
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                  ⛪ Complete church profile and branding management
                </Typography>
              </Box>
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <Box 
                  sx={{ 
                    width: 600, 
                    height: 400, 
                    borderRadius: 4, 
                    bgcolor: 'grey.100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 2,
                    borderColor: 'grey.300',
                    borderStyle: 'dashed'
                  }}
                >
                  <img 
                  src={churchPageOne} 
                  alt="church page update second" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    borderRadius: '16px'
                  }} 
                />
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>

        {/* Call to Action Section */}
        <Box sx={{ bgcolor: 'secondary.main', py: 8, mt: 8, width: '100%' }}>
          <Container maxWidth="md" sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color: 'black', mb: 3 }}>
              Ready to Lead Your Church Online?
            </Typography>
            <Typography variant="h6" sx={{ color: 'black', mb: 2, opacity: 0.8 }}>
              Join church leaders already using Updates to manage their ministry and engage their community.
            </Typography>
            <Typography variant="body1" sx={{ color: 'black', mb: 4, opacity: 0.7, fontStyle: 'italic' }}>
              Start your enrollment process today - pastor approval required
            </Typography>
            <Button 
              variant="contained" 
              size="large" 
              sx={{ 
                bgcolor: 'white', 
                color: 'black', 
                fontWeight: 700, 
                px: 6, 
                py: 2, 
                fontSize: '1.1rem',
                '&:hover': { bgcolor: '#f5f5f5' }
              }} 
              onClick={() => navigate('/enroll')}
            >
              Apply to Become an Admin
            </Button>
          </Container>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
}
