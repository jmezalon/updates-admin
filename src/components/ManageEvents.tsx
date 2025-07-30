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
  
  // Format local date for datetime-local input (avoids UTC conversion issues)
  const formatLocalDateTimeForInput = (date: Date) => {
    if (!date || isNaN(date.getTime())) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Convert datetime-local string to ISO string preserving local timezone
  const formatDateTimeForBackend = (dateTimeString: string) => {
    if (!dateTimeString) return '';
    try {
      // datetime-local format: "2025-07-30T14:00"
      // Create a Date object from the local datetime string
      const localDate = new Date(dateTimeString);
      
      // The issue is that toISOString() converts to UTC, shifting the time
      // Instead, we want to preserve the local time as entered by the user
      // So we'll create an ISO string that represents the local time as UTC
      const year = localDate.getFullYear();
      const month = String(localDate.getMonth() + 1).padStart(2, '0');
      const day = String(localDate.getDate()).padStart(2, '0');
      const hours = String(localDate.getHours()).padStart(2, '0');
      const minutes = String(localDate.getMinutes()).padStart(2, '0');
      const seconds = String(localDate.getSeconds()).padStart(2, '0');
      
      // Return as ISO string but treat the local time as if it were UTC
      // This preserves the time the user entered
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`;
    } catch (error) {
      console.warn('DateTime conversion error:', error, dateTimeString);
      return dateTimeString; // Return original if conversion fails
    }
  };

  const [formData, setFormData] = useState<EventFormData>({
    ...initialFormData,
    start_datetime: formatLocalDateTimeForInput(new Date()),
    end_datetime: ''
  });
  const [createAnother, setCreateAnother] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const authToken = localStorage.getItem('authToken');
  
  // Use shared image upload hook
  const imageUpload = useImageUpload(authToken || '');
  const churchId = user?.churchAssignments?.[0]?.church_id;



  // Clear field-specific error when user starts typing
  const clearFieldError = (fieldName: string) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors(prev => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
    }
  };

  const handleInputChange = (field: keyof EventFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    // Clear errors when user starts typing
    if (error) setError('');
    clearFieldError(field);
  };

  // Client-side validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Event title is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Event description is required';
    }
    
    if (!formData.image_url.trim()) {
      errors.image_url = 'Event image is required';
    }
    
    if (!formData.location.trim()) {
      errors.location = 'Event location is required';
    }
    
    if (!formData.start_datetime) {
      errors.start_datetime = 'Start date and time is required';
    }
    
    if (!formData.end_datetime) {
      errors.end_datetime = 'End date and time is required';
    }
    
    // Validate that end time is after start time
    if (formData.start_datetime && formData.end_datetime) {
      const startDate = new Date(formData.start_datetime);
      const endDate = new Date(formData.end_datetime);
      if (endDate <= startDate) {
        errors.end_datetime = 'End date and time must be after start date and time';
      }
    }
    
    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      errors.contact_email = 'Please enter a valid email address';
    }
    
    if (formData.price && (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0)) {
      errors.price = 'Price must be a valid number greater than or equal to 0';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    setSuccess('');
    setFieldErrors({});
    imageUpload.clearMessages();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    if (!churchId) {
      setError('No church assignment found. Please contact your administrator.');
      return;
    }

    setLoading(true);

    try {
      // Prepare submission data with proper datetime formatting
      const submissionData = {
        ...formData,
        start_datetime: formatDateTimeForBackend(formData.start_datetime),
        end_datetime: formatDateTimeForBackend(formData.end_datetime),
        price: formData.price ? parseFloat(formData.price) : 0
      };

      const response = await fetch(`${BASE_URL}/churches/${churchId}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(submissionData)
      });

      if (response.ok) {
        await response.json();
        setSuccess(`Event "${formData.title}" created successfully!`);
        
        if (createAnother) {
          // Reset form for another event
          setFormData({
            ...initialFormData,
            start_datetime: formatLocalDateTimeForInput(new Date()),
            end_datetime: ''
          });
          imageUpload.clearMessages();
          setTimeout(() => setSuccess(''), 3000);
        } else {
          // Navigate back after showing success message
          setTimeout(() => {
            onEventCreated(true);
            onBack();
          }, 2000);
        }
      } else {
        const errorData = await response.json();
        
        // Handle validation errors from backend
        if (response.status === 400 && errorData.details) {
          // If backend provides field-specific errors
          const backendErrors: Record<string, string> = {};
          if (Array.isArray(errorData.details)) {
            errorData.details.forEach((detail: any) => {
              if (detail.field && detail.message) {
                backendErrors[detail.field] = detail.message;
              }
            });
          }
          setFieldErrors(backendErrors);
          setError('Please fix the validation errors below.');
        } else {
          // Generic error handling
          setError(
            errorData.error || 
            errorData.message || 
            'Failed to create event. Please check your input and try again.'
          );
        }
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      console.error('Error creating event:', err);
    } finally {
      setLoading(false);
    }
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
    setFormData({
      ...initialFormData,
      start_datetime: formatLocalDateTimeForInput(new Date()),
      end_datetime: ''
    });
    setError('');
    setSuccess('');
    setFieldErrors({});
    imageUpload.clearMessages();
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
                      helperText={fieldErrors.title || "Give your event a clear, descriptive title"}
                      error={!!fieldErrors.title}
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
                      helperText={fieldErrors.description || "Provide details about your event"}
                      error={!!fieldErrors.description}
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        fullWidth
                        label="Event Image URL"
                        value={formData.image_url}
                        onChange={handleInputChange('image_url')}
                        required
                        placeholder="https://example.com/event-image.jpg"
                        helperText={fieldErrors.image_url || "Enter an image URL or upload an image below"}
                        error={!!fieldErrors.image_url}
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
                      slotProps={{
                        inputLabel: { shrink: true }
                      }}
                      helperText={fieldErrors.start_datetime || "When the event starts (local time)"}
                      error={!!fieldErrors.start_datetime}
                    />
                    <TextField
                      fullWidth
                      label="End Date & Time"
                      type="datetime-local"
                      value={formData.end_datetime}
                      onChange={handleInputChange('end_datetime')}
                      required
                      slotProps={{
                        inputLabel: { shrink: true }
                      }}
                      helperText={fieldErrors.end_datetime || "When the event ends (local time)"}
                      error={!!fieldErrors.end_datetime}
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
                      helperText={fieldErrors.location || "Where the event will take place"}
                      error={!!fieldErrors.location}
                    />
                    <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                      <TextField
                        fullWidth
                        label="Contact Email"
                        type="email"
                        value={formData.contact_email}
                        onChange={handleInputChange('contact_email')}
                        placeholder="contact@church.com"
                        helperText={fieldErrors.contact_email || "Optional contact email for the event"}
                        error={!!fieldErrors.contact_email}
                        slotProps={{
                          input: {
                            startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                          }
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Contact Phone"
                        value={formData.contact_phone}
                        onChange={handleInputChange('contact_phone')}
                        placeholder="(555) 123-4567"
                        helperText={fieldErrors.contact_phone || "Optional contact phone for the event"}
                        error={!!fieldErrors.contact_phone}
                        slotProps={{
                          input: {
                            startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                          }
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
                      helperText={fieldErrors.price || "Enter 0 for free events"}
                      error={!!fieldErrors.price}
                      slotProps={{
                        input: {
                          startAdornment: <MoneyIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        }
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Website"
                      value={formData.website}
                      onChange={handleInputChange('website')}
                      placeholder="https://church.com/event-details"
                      helperText={fieldErrors.website || "Optional website link for more event details"}
                      error={!!fieldErrors.website}
                      slotProps={{
                        input: {
                          startAdornment: <WebsiteIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        }
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
