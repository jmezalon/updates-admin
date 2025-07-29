import { Box, Typography, Container, Link } from '@mui/material';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        py: 3,
        mt: 'auto',
        width: '100%'
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2
          }}
        >
          {/* Left side - App info */}
          <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'secondary.main', mb: 1 }}>
              Updates Admin Portal
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Manage your church's events, announcements, and donations
            </Typography>
          </Box>

          {/* Right side - Copyright and links */}
          <Box sx={{ textAlign: { xs: 'center', md: 'right' } }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              © {currentYear} Updates. All rights reserved.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'center', md: 'flex-end' } }}>
              <Link
                href="mailto:max.mezalon@gmail.com"
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'primary.main',
                    textDecoration: 'underline'
                  }
                }}
              >
                Support
              </Link>
              <Link
                href="https://updates-backend-api-beebc8cc747c.herokuapp.com/privacy-policy"
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'primary.main',
                    textDecoration: 'underline'
                  }
                }}
              >
                Privacy
              </Link>
              <Link
                href="/terms.html"
                variant="body2"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: 'text.secondary',
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'primary.main',
                    textDecoration: 'underline'
                  }
                }}
              >
                Terms
              </Link>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
