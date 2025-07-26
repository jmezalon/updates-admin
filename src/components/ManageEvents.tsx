import { BASE_URL } from '../constants/config';
import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Alert,
  Stack,
  IconButton,
  FormControlLabel,
  Checkbox,

  Divider
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Language as WebsiteIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import { useImageUpload } from '../hooks/useImageUpload';

interface ManageEventsProps {
  onBack: () => void;
  onEventCreated: (shouldShowChurch: boolean) => void;
}

interface EventFormData {
  title: string;
  description: string;
  location: string;
  start_datetime: string;
  end_datetime: string;
  image_url: string;
  price: string;
  contact_email: string;
  contact_phone: string;
  website: string;
}

const initialFormData: EventFormData = {
  title: '',
  description: '',
  location: '',
  start_datetime: '',
  end_datetime: '',
  image_url: '',
  price: '',
  contact_email: '',
  contact_phone: '',
  website: ''
};

export function ManageEvents({ onBack, onEventCreated }: ManageEventsProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<EventFormData>(initialFormData);
  const [createAnother, setCreateAnother] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const authToken = localStorage.getItem('authToken');
  
  // Use shared image upload hook
  const imageUpload = useImageUpload(authToken || '');
  const churchId = user?.churchAssignments?.[0]?.church_id;

  const handleInputChange = (field: keyof EventFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Event title is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Event description is required');
      return false;
    }
    if (!formData.image_url.trim()) {
      setError('Event image is required');
      return false;
    }
    if (!formData.location.trim()) {
      setError('Event location is required');
      return false;
    }
    if (!formData.start_datetime) {
      setError('Start date and time is required');
      return false;
    }
    if (!formData.end_datetime) {
      setError('End date and time is required');
      return false;
    }
    
    // Validate that end time is after start time
    const startDate = new Date(formData.start_datetime);
    const endDate = new Date(formData.end_datetime);
    if (endDate <= startDate) {
      setError('End date and time must be after start date and time');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!churchId) {
      setError('No church assignment found. Please contact your administrator.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${BASE_URL}/churches/${churchId}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          ...formData,
          price: formData.price ? parseFloat(formData.price) : 0
        })
      });

      if (response.ok) {
        await response.json();
        setSuccess(`Event "${formData.title}" created successfully!`);
        
        if (createAnother) {
          // Reset form for another event
          setFormData(initialFormData);
          setCreateAnother(false);
          
          // Clear success message after 3 seconds
          setTimeout(() => setSuccess(''), 3000);
        } else {
          // Navigate to church page to view events
          setTimeout(() => {
            onEventCreated(true);
          }, 1500);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create event');
      }
    } catch (err) {
      setError('Network error while creating event. Please try again.');
    }

    setLoading(false);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Clear any existing errors
    setError('');
    setSuccess('');
    imageUpload.clearMessages();

    // Use shared image upload utility
    const imageUrl = await imageUpload.uploadImage(file);
    if (imageUrl) {
      setFormData(prev => ({
        ...prev,
        image_url: imageUrl
      }));
    }
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setCreateAnother(false);
    setError('');
    setSuccess('');
  };

  return (
    <Box sx={{ width: '100vw', minHeight: '100vh', bgcolor: 'background.default', pb: 4 }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton onClick={onBack} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <EventIcon sx={{ mr: 2, color: 'secondary.main', fontSize: '2rem' }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'secondary.main' }}>
              Create New Event
            </Typography>
          </Box>
        </Box>

        {/* Error Messages */}
        {(error || imageUpload.error) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || imageUpload.error}
          </Alert>
        )}

        {/* Success Messages */}
        {(success || imageUpload.success) && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success || imageUpload.success}
          </Alert>
        )}

        {/* Event Form */}
        <Card sx={{ boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>
                {/* Basic Information */}
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'secondary.main' }}>
                    Basic Information
                  </Typography>
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="Event Title"
                      value={formData.title}
                      onChange={handleInputChange('title')}
                      required
                      placeholder="e.g., Sunday Service, Bible Study, Community Outreach"
                    />
                    <TextField
                      fullWidth
                      label="Description"
                      value={formData.description}
                      onChange={handleInputChange('description')}
                      required
                      multiline
                      rows={4}
                      placeholder="Describe your event, what to expect, who should attend..."
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        fullWidth
                        label="Event Image URL"
                        value={formData.image_url}
                        onChange={handleInputChange('image_url')}
                        required
                        placeholder="https://example.com/event-image.jpg"
                        helperText="Enter an image URL or upload an image below"
                      />
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Or upload from device:
                        </Typography>
                        <Button
                          variant="outlined"
                          component="label"
                          disabled={imageUpload.uploading}
                          startIcon={<CloudUploadIcon />}
                          sx={{ minWidth: 150 }}
                        >
                          {imageUpload.uploading ? 'Uploading...' : 'Upload Image'}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                          />
                        </Button>
                      </Box>
                      
                      {formData.image_url && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                            Image Preview:
                          </Typography>
                          <Box
                            component="img"
                            src={formData.image_url}
                            alt="Event preview"
                            sx={{
                              width: '100%',
                              maxWidth: 300,
                              height: 200,
                              objectFit: 'cover',
                              borderRadius: 2,
                              border: '1px solid',
                              borderColor: 'grey.300'
                            }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </Box>
                      )}
                    </Box>
                  </Stack>
                </Box>

                <Divider />

                {/* Date & Time */}
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'secondary.main' }}>
                    <TimeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Date & Time
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                    <TextField
                      fullWidth
                      label="Start Date & Time"
                      type="datetime-local"
                      value={formData.start_datetime}
                      onChange={handleInputChange('start_datetime')}
                      required
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      fullWidth
                      label="End Date & Time"
                      type="datetime-local"
                      value={formData.end_datetime}
                      onChange={handleInputChange('end_datetime')}
                      required
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>
                </Box>

                <Divider />

                {/* Location & Contact */}
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'secondary.main' }}>
                    <LocationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Location & Contact
                  </Typography>
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="Location"
                      value={formData.location}
                      onChange={handleInputChange('location')}
                      required
                      placeholder="e.g., Main Sanctuary, Fellowship Hall, 123 Church St"
                    />
                    <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                      <TextField
                        fullWidth
                        label="Contact Email"
                        type="email"
                        value={formData.contact_email}
                        onChange={handleInputChange('contact_email')}
                        placeholder="contact@church.com"
                        InputProps={{
                          startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Contact Phone"
                        value={formData.contact_phone}
                        onChange={handleInputChange('contact_phone')}
                        placeholder="(555) 123-4567"
                        InputProps={{
                          startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                      />
                    </Box>
                  </Stack>
                </Box>

                <Divider />

                {/* Additional Details */}
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'secondary.main' }}>
                    Additional Details
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                    <TextField
                      fullWidth
                      label="Price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange('price')}
                      placeholder="0.00"
                      helperText="Enter 0 for free events"
                      InputProps={{
                        startAdornment: <MoneyIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Website"
                      value={formData.website}
                      onChange={handleInputChange('website')}
                      placeholder="https://church.com/event-details"
                      InputProps={{
                        startAdornment: <WebsiteIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Box>
                </Box>

                <Divider />

                {/* Create Another Checkbox */}
                <Box sx={{ bgcolor: 'grey.50', p: 3, borderRadius: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={createAnother}
                        onChange={(e) => setCreateAnother(e.target.checked)}
                        color="secondary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          Create another event
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Keep this form open to quickly add multiple events
                        </Typography>
                      </Box>
                    }
                  />
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    disabled={loading}
                    size="large"
                  >
                    Clear Form
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="secondary"
                    startIcon={<SaveIcon />}
                    disabled={loading}
                    size="large"
                    sx={{ minWidth: 150 }}
                  >
                    {loading ? 'Creating...' : 'Create Event'}
                  </Button>
                </Box>
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
