import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Alert,
  Stack,
  Avatar,
  Card,
  CardContent,
  IconButton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CloudUpload as CloudUploadIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { Navbar } from './Navbar';
import { useImageUpload } from '../hooks/useImageUpload';
import { BASE_URL } from '../constants/config';
import { EventCard } from './EventCard';
import { AnnouncementCard } from './AnnouncementCard';
import { DonationCard, AddDonationDialog } from './DonationCard';

interface Church {
  id: number;
  name: string;
  senior_pastor: string;
  pastor?: string;
  assistant_pastor?: string;
  senior_pastor_avatar?: string;
  pastor_avatar?: string;
  assistant_pastor_avatar?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  logo_url?: string;
  banner_url?: string;
  description?: string;
}

interface Event {
  id: number;
  church_id: number;
  title: string;
  description?: string;
  start_datetime: string;
  end_datetime?: string;
  location?: string;
  image_url?: string;
  price?: number;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
}

interface Announcement {
  id: number;
  church_id: number;
  title: string;
  description?: string;
  image_url?: string;
  posted_at: string;
  type: 'weekly' | 'special' | 'yearly' | 'general';
  subcategory?: string;
  start_time?: string;
  end_time?: string;
  recurrence_rule?: string;
  is_special: boolean;
}

interface Donation {
  id: number;
  church_id: number;
  method: string;
  contact_name?: string;
  contact_info: string;
  note?: string;
  created_at: string;
  updated_at: string;
}

interface ChurchDetailsProps {
  churchId: number;
  onBack: () => void;
}

export function ChurchDetails({ churchId, onBack }: ChurchDetailsProps) {
  const [church, setChurch] = useState<Church | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [donationsLoading, setDonationsLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addDonationOpen, setAddDonationOpen] = useState(false);
  // Form state
  const [formData, setFormData] = useState<Partial<Church>>({});

  const authToken = localStorage.getItem('authToken');
  
  // Use shared image upload hook
  const imageUpload = useImageUpload(authToken || '');

  useEffect(() => {
    loadChurchDetails();
    loadEvents();
    loadAnnouncements();
    loadDonations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [churchId]);

  const loadChurchDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/churches/${churchId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.ok) {
        const churchData = await response.json();
        setChurch(churchData);
        setFormData(churchData);
      } else {
        setError('Failed to load church details');
      }
    } catch (err) {
      setError('Network error while loading church details');
    }
    setLoading(false);
  };

  const loadEvents = async () => {
    setEventsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/churches/${churchId}/events`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.ok) {
        const eventsData = await response.json();
        setEvents(eventsData);
      } else {
        console.error('Failed to load events');
      }
    } catch (err) {
      console.error('Network error while loading events:', err);
    }
    setEventsLoading(false);
  };

  const loadAnnouncements = async () => {
    setAnnouncementsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/announcements?church_id=${churchId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.ok) {
        const announcementsData = await response.json();
        setAnnouncements(announcementsData);
      } else {
        console.error('Failed to load announcements');
      }
    } catch (err) {
      console.error('Network error while loading announcements:', err);
    }
    setAnnouncementsLoading(false);
  };

  const loadDonations = async () => {
    setDonationsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/churches/${churchId}/donations`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.ok) {
        const donationsData = await response.json();
        setDonations(donationsData);
      } else {
        console.error('Failed to load donations');
      }
    } catch (err) {
      console.error('Network error while loading donations:', err);
    }
    setDonationsLoading(false);
  };

  const handleAnnouncementUpdate = (updatedAnnouncement: Announcement) => {
    setAnnouncements(prev => 
      prev.map(announcement => 
        announcement.id === updatedAnnouncement.id ? updatedAnnouncement : announcement
      )
    );
  };

  const handleAnnouncementDelete = (announcementId: number) => {
    setAnnouncements(prev => prev.filter(announcement => announcement.id !== announcementId));
  };

  const handleDonationDelete = async (donationId: number) => {
    try {
      const response = await fetch(`${BASE_URL}/churches/${churchId}/donations/${donationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.ok) {
        setDonations(prev => prev.filter(donation => donation.id !== donationId));
      } else {
        console.error('Failed to delete donation');
      }
    } catch (err) {
      console.error('Network error while deleting donation:', err);
    }
  };

  const handleDonationAdd = async (donationData: Partial<Donation>) => {
    try {
      const response = await fetch(`${BASE_URL}/churches/${churchId}/donations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(donationData)
      });

      if (response.ok) {
        const newDonation = await response.json();
        setDonations(prev => [...prev, newDonation]);
      } else {
        throw new Error('Failed to add donation');
      }
    } catch (err) {
      console.error('Network error while adding donation:', err);
      throw err;
    }
  };

  const handleDonationUpdate = async (updatedDonation: Donation) => {
    try {
      const response = await fetch(`${BASE_URL}/churches/${churchId}/donations/${updatedDonation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(updatedDonation)
      });

      if (response.ok) {
        const updated = await response.json();
        setDonations(prev => 
          prev.map(donation => 
            donation.id === updated.id ? updated : donation
          )
        );
      } else {
        throw new Error('Failed to update donation');
      }
    } catch (err) {
      console.error('Network error while updating donation:', err);
      throw err;
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData(church || {});
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    
    try {
      const response = await fetch(`${BASE_URL}/churches/${churchId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedChurch = await response.json();
        setChurch(updatedChurch);
        setFormData(updatedChurch);
        setEditing(false);
        setSuccess('Church details updated successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update church details');
      }
    } catch (err) {
      setError('Network error while updating church details');
    }
    setSaving(false);
  };

  const handleInputChange = (field: keyof Church, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (file: File, field: keyof Church) => {
    if (!file) return;
    
    // Clear any existing errors
    setError('');
    setSuccess('');
    imageUpload.clearMessages();
    
    // Use shared image upload utility
    const imageUrl = await imageUpload.uploadImage(file);
    if (imageUrl) {
      handleInputChange(field, imageUrl);
    }
  };

  const ImageUploadField = ({ label, field, value, placeholder }: { 
    label: string; 
    field: keyof Church; 
    value: string; 
    placeholder: string;
  }) => (
    <Stack spacing={2}>
      <TextField
        fullWidth
        label={label}
        value={editing ? (value || '') : (value || '')}
        onChange={(e) => handleInputChange(field, e.target.value)}
        disabled={!editing}
        placeholder={placeholder}
      />
      {editing && (
        <Button
          variant="outlined"
          component="label"
          startIcon={<CloudUploadIcon />}
          disabled={imageUpload.uploading}
          sx={{ alignSelf: 'flex-start' }}
        >
          {imageUpload.uploading ? 'Uploading...' : 'Upload Image'}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file, field);
            }}
          />
        </Button>
      )}
    </Stack>
  );

  if (loading) {
    return (
      <Box sx={{ width: '100vw', minHeight: '100vh', bgcolor: 'background.default' }}>
        <Navbar />
        <Box sx={{ pt: 10, width: '100%' }}>
          <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" sx={{ textAlign: 'center' }}>
              Loading church details...
            </Typography>
          </Container>
        </Box>
      </Box>
    );
  }

  if (!church) {
    return (
      <Box sx={{ width: '100vw', minHeight: '100vh', bgcolor: 'background.default' }}>
        <Navbar />
        <Box sx={{ pt: 10, width: '100%' }}>
          <Container maxWidth="lg" sx={{ py: 4 }}>
            <Alert severity="error">Church not found</Alert>
          </Container>
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ width: '100vw', minHeight: '100vh', bgcolor: 'background.default' }}>
        <Navbar />
        <Box sx={{ pt: 10, width: '100%' }}>
          <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <IconButton onClick={onBack} sx={{ mr: 2 }}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'secondary.main', flexGrow: 1 }}>
                {church.name}
              </Typography>
              {!editing ? (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                  sx={{ ml: 2 }}
                >
                  Edit Details
                </Button>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </Box>

          {/* Alerts */}
          {(error || imageUpload.error) && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => { setError(''); imageUpload.clearMessages(); }}>
              {error || imageUpload.error}
            </Alert>
          )}
          {(success || imageUpload.success) && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success || imageUpload.success}
            </Alert>
          )}

          {/* Church Banner with Logo Overlay */}
          <Card sx={{ mb: 4, position: 'relative' }}>
            <Box
              sx={{
                height: 200,
                backgroundImage: church.banner_url ? `url(${church.banner_url})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                position: 'relative'
              }}
            >
              {!church.banner_url && (
                <Typography variant="h6" sx={{ opacity: 0.8 }}>
                  Church Banner
                </Typography>
              )}
              
              {/* Church Logo Overlay */}
              <Avatar
                src={church.logo_url}
                sx={{
                  width: 140,
                  height: 140,
                  position: 'absolute',
                  bottom: -60, // Half the height to create overlay effect
                  left: '10%',
                  transform: 'translateX(-50%)',
                  border: '4px solid white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  fontSize: '2rem',
                  bgcolor: 'background.paper'
                }}
              >
                {church.name?.charAt(0)}
              </Avatar>
            </Box>
            
            {/* Add spacing for the overlapping logo */}
            <Box sx={{ height: 60 }} />
            
            {editing && (
              <CardContent>
                <Stack spacing={3}>
                  <ImageUploadField
                    label="Banner Image URL"
                    field="banner_url"
                    value={formData.banner_url || ''}
                    placeholder="https://example.com/banner.jpg"
                  />
                  <ImageUploadField
                    label="Logo URL"
                    field="logo_url"
                    value={formData.logo_url || ''}
                    placeholder="https://example.com/logo.jpg"
                  />
                </Stack>
              </CardContent>
            )}
          </Card>

          {/* Church Details */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 600, color: 'secondary.main', mb: 3 }}>
                Church Information
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Basic Info Row */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <TextField
                    label="Church Name"
                    value={editing ? (formData.name || '') : church.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!editing}
                    sx={{ flex: 1, minWidth: 250 }}
                  />
                </Box>

                {/* Address */}
                <TextField
                  fullWidth
                  label="Address"
                  value={editing ? (formData.address || '') : (church.address || '')}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  disabled={!editing}
                />
                
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <TextField
                    label="City"
                    value={editing ? (formData.city || '') : (church.city || '')}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    disabled={!editing}
                    sx={{ flex: 1, minWidth: 150 }}
                  />
                  <TextField
                    label="State"
                    value={editing ? (formData.state || '') : (church.state || '')}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    disabled={!editing}
                    sx={{ flex: 1, minWidth: 100 }}
                  />
                  <TextField
                    label="ZIP Code"
                    value={editing ? (formData.zip || '') : (church.zip || '')}
                    onChange={(e) => handleInputChange('zip', e.target.value)}
                    disabled={!editing}
                    sx={{ flex: 1, minWidth: 100 }}
                  />
                </Box>

                {/* Contact Info */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <TextField
                    label="Contact Email"
                    type="email"
                    value={editing ? (formData.contact_email || '') : (church.contact_email || '')}
                    onChange={(e) => handleInputChange('contact_email', e.target.value)}
                    disabled={!editing}
                    sx={{ flex: 1, minWidth: 250 }}
                  />
                  <TextField
                    label="Contact Phone"
                    value={editing ? (formData.contact_phone || '') : (church.contact_phone || '')}
                    onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                    disabled={!editing}
                    sx={{ flex: 1, minWidth: 200 }}
                  />
                </Box>

                {/* Website */}
                <TextField
                  fullWidth
                  label="Website"
                  value={editing ? (formData.website || '') : (church.website || '')}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  disabled={!editing}
                  placeholder="https://yourchurch.com"
                />

                {/* Description */}
                <TextField
                  fullWidth
                  label="Church Description"
                  multiline
                  rows={3}
                  value={editing ? (formData.description || '') : (church.description || '')}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  disabled={!editing}
                  placeholder="Tell us about your church community..."
                />
              </Box>
            </CardContent>
          </Card>

          {/* Leadership */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 600, color: 'secondary.main', mb: 3 }}>
                Church Leadership
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'space-around' }}>
                {/* Senior Pastor */}
                <Box sx={{ flex: 1, minWidth: 250, textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>
                    <Avatar
                      src={church.senior_pastor_avatar}
                      sx={{ width: 80, height: 80, mx: 'auto', mb: 1 }}
                    >
                      {church.senior_pastor?.charAt(0)}
                    </Avatar>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                      Senior Pastor
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    label="Senior Pastor Name"
                    value={editing ? (formData.senior_pastor || '') : church.senior_pastor}
                    onChange={(e) => handleInputChange('senior_pastor', e.target.value)}
                    disabled={!editing}
                    sx={{ mb: 2 }}
                  />
                  {editing ? (
                    <ImageUploadField
                      label="Senior Pastor Avatar URL"
                      field="senior_pastor_avatar"
                      value={formData.senior_pastor_avatar || ''}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  ) : (
                    <TextField
                      fullWidth
                      label="Senior Pastor Avatar URL"
                      value={church.senior_pastor_avatar || ''}
                      disabled
                      placeholder="https://example.com/avatar.jpg"
                    />
                  )}
                </Box>

                {/* Pastor */}
                <Box sx={{ flex: 1, minWidth: 250, textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>
                    <Avatar
                      src={church.pastor_avatar}
                      sx={{ width: 80, height: 80, mx: 'auto', mb: 1 }}
                    >
                      {church.pastor?.charAt(0)}
                    </Avatar>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                      Pastor
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    label="Pastor Name"
                    value={editing ? (formData.pastor || '') : (church.pastor || '')}
                    onChange={(e) => handleInputChange('pastor', e.target.value)}
                    disabled={!editing}
                    sx={{ mb: 2 }}
                  />
                  {editing ? (
                    <ImageUploadField
                      label="Pastor Avatar URL"
                      field="pastor_avatar"
                      value={formData.pastor_avatar || ''}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  ) : (
                    <TextField
                      fullWidth
                      label="Pastor Avatar URL"
                      value={church.pastor_avatar || ''}
                      disabled
                      placeholder="https://example.com/avatar.jpg"
                    />
                  )}
                </Box>

                {/* Assistant Pastor */}
                <Box sx={{ flex: 1, minWidth: 250, textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>
                    <Avatar
                      src={church.assistant_pastor_avatar}
                      sx={{ width: 80, height: 80, mx: 'auto', mb: 1 }}
                    >
                      {church.assistant_pastor?.charAt(0)}
                    </Avatar>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                      Assistant Pastor
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    label="Assistant Pastor Name"
                    value={editing ? (formData.assistant_pastor || '') : (church.assistant_pastor || '')}
                    onChange={(e) => handleInputChange('assistant_pastor', e.target.value)}
                    disabled={!editing}
                    sx={{ mb: 2 }}
                  />
                  {editing ? (
                    <ImageUploadField
                      label="Assistant Pastor Avatar URL"
                      field="assistant_pastor_avatar"
                      value={formData.assistant_pastor_avatar || ''}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  ) : (
                    <TextField
                      fullWidth
                      label="Assistant Pastor Avatar URL"
                      value={church.assistant_pastor_avatar || ''}
                      disabled
                      placeholder="https://example.com/avatar.jpg"
                    />
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Donations Management Section */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'success.main' }}>
                  💰 Donations
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {donations.length} payment method{donations.length !== 1 ? 's' : ''} available
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => setAddDonationOpen(true)}
                    sx={{ bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}
                  >
                    Add Method
                  </Button>
                </Box>
              </Box>

              {donationsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <Typography>Loading donation methods...</Typography>
                </Box>
              ) : donations.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
                    No donation methods set up yet.
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Add payment methods like Cash App, Zelle, or others to help members donate easily.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {donations.map((donation) => (
                    <DonationCard
                      key={donation.id}
                      donation={donation}
                      onDelete={handleDonationDelete}
                      onUpdate={handleDonationUpdate}
                    />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Events and Announcements Grid Layout */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: '3fr 2fr' }, 
            gap: 4, 
            mb: 4 
          }}>
            {/* Events Management Section */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                    📅 Events
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {events.length} event{events.length !== 1 ? 's' : ''} created
                  </Typography>
                </Box>

                {eventsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <Typography>Loading events...</Typography>
                  </Box>
                ) : events.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
                      No events created yet.
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Use the "Manage Events" button in your dashboard to create your first event.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {events.map((event) => (
                      <EventCard key={event.id} event={event} onUpdate={loadEvents} />
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Announcements Management Section */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'error.main' }}>
                    📢 Announcements
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {announcements.length} announcement{announcements.length !== 1 ? 's' : ''} created
                  </Typography>
                </Box>

                {announcementsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <Typography>Loading announcements...</Typography>
                  </Box>
                ) : announcements.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
                      No announcements created yet.
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Use the "Manage Announcements" button in your dashboard to create your first announcement.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {announcements.map((announcement) => (
                      <AnnouncementCard 
                        key={announcement.id} 
                        announcement={announcement} 
                        authToken={authToken || ''}
                        onUpdate={handleAnnouncementUpdate}
                        onDelete={handleAnnouncementDelete}
                      />
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
          </Container>
        </Box>
      </Box>

      {/* Add Donation Dialog */}
      <AddDonationDialog
        open={addDonationOpen}
        onClose={() => setAddDonationOpen(false)}
        onAdd={handleDonationAdd}
        churchId={churchId}
      />
    </>
  );
}
