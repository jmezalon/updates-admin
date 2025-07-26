import { BASE_URL } from '../constants/config';
import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Stack,
  Divider,
  IconButton
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Save as SaveIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Campaign as CampaignIcon
} from '@mui/icons-material';
import { useImageUpload } from '../hooks/useImageUpload';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  churchAssignments?: Array<{ church_id: number; church_name: string }>;
}

interface ManageAnnouncementsProps {
  user: User;
  onBack: () => void;
}

export function ManageAnnouncements({ user, onBack }: ManageAnnouncementsProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    type: 'weekly',
    subcategory: '',
    start_time: '',
    end_time: '',
    recurrence_rule: '',
    is_special: false,
    posted_at: new Date().toISOString().slice(0, 16),
    day: 0 // Default to Sunday
  });
  
  const [createAnother, setCreateAnother] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  
  const authToken = localStorage.getItem('authToken');
  
  const {
    uploadImage,
    uploading,
    error: uploadError,
    success: uploadSuccess,
    clearMessages
  } = useImageUpload(authToken || '');

  const handleImageUpload = async (file: File) => {
    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      setFormData(prev => ({ ...prev, image_url: imageUrl }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');
    clearMessages();

    try {
      // Get the user's church assignment
      const churchId = user.churchAssignments?.[0]?.church_id;
      if (!churchId) {
        setSubmitError('No church assignment found');
        return;
      }

      const response = await fetch(`${BASE_URL}/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ ...formData, church_id: churchId })
      });

      if (response.ok) {
        setSubmitSuccess('Announcement created successfully!');
        
        if (createAnother) {
          // Reset form for another announcement
          setFormData({
            title: '',
            description: '',
            image_url: '',
            type: 'weekly',
            subcategory: '',
            start_time: '',
            end_time: '',
            recurrence_rule: '',
            is_special: false,
            posted_at: new Date().toISOString().slice(0, 16),
            day: 0 // Default to Sunday
          });
        } else {
          // Navigate back to church details after a short delay
          setTimeout(() => {
            onBack();
          }, 2000);
        }
      } else {
        const errorData = await response.json();
        setSubmitError(errorData.error || 'Failed to create announcement');
      }
    } catch (err) {
      setSubmitError('Network error. Please try again.');
      console.error('Error creating announcement:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateTimeForInput = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      return '';
    }
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
            <CampaignIcon sx={{ mr: 2, color: 'error.main', fontSize: '2rem' }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
              Create New Announcement
            </Typography>
          </Box>
        </Box>

        <Card>
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                {/* Success/Error Messages */}
                {submitError && (
                  <Alert severity="error" onClose={() => setSubmitError('')}>
                    {submitError}
                  </Alert>
                )}
                {submitSuccess && (
                  <Alert severity="success" onClose={() => setSubmitSuccess('')}>
                    {submitSuccess}
                  </Alert>
                )}
                {uploadError && (
                  <Alert severity="error" onClose={clearMessages}>
                    {uploadError}
                  </Alert>
                )}
                {uploadSuccess && (
                  <Alert severity="success" onClose={clearMessages}>
                    {uploadSuccess}
                  </Alert>
                )}

                {/* Announcement Image */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Announcement Image
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    {formData.image_url && (
                      <Box
                        component="img"
                        src={formData.image_url}
                        sx={{
                          width: 120,
                          height: 80,
                          objectFit: 'cover',
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                      />
                    )}
                    <Box>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<CloudUploadIcon />}
                        disabled={uploading}
                        sx={{ mb: 1 }}
                      >
                        {uploading ? 'Uploading...' : 'Upload Image'}
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file);
                          }}
                        />
                      </Button>
                      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                        Or paste image URL below
                      </Typography>
                    </Box>
                  </Box>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="https://example.com/image.jpg"
                    value={formData.image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                    sx={{ mt: 1 }}
                  />
                </Box>

                {/* Basic Information */}
                <TextField
                  fullWidth
                  label="Announcement Title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
                
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />

                {/* Announcement Type and Category */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControl sx={{ flex: 1 }}>
                    <InputLabel>Announcement Type</InputLabel>
                    <Select
                      value={formData.type}
                      label="Announcement Type"
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    >
                      <MenuItem value="weekly">Weekly (Recurring)</MenuItem>
                      <MenuItem value="special">Special Event</MenuItem>
                      <MenuItem value="yearly">Yearly (Annual)</MenuItem>
                      <MenuItem value="general">General</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <TextField
                    label="Category"
                    placeholder="e.g., Service, Bible Study, Prayer"
                    value={formData.subcategory}
                    onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                    sx={{ flex: 1 }}
                  />
                </Box>

                {/* Day Selector for Weekly Announcements */}
                {formData.type === 'weekly' && (
                  <FormControl fullWidth>
                    <InputLabel>Day of Week</InputLabel>
                    <Select
                      value={formData.day}
                      label="Day of Week"
                      onChange={(e) => setFormData(prev => ({ ...prev, day: Number(e.target.value) }))}
                    >
                      <MenuItem value={0}>Sunday</MenuItem>
                      <MenuItem value={1}>Monday</MenuItem>
                      <MenuItem value={2}>Tuesday</MenuItem>
                      <MenuItem value={3}>Wednesday</MenuItem>
                      <MenuItem value={4}>Thursday</MenuItem>
                      <MenuItem value={5}>Friday</MenuItem>
                      <MenuItem value={6}>Saturday</MenuItem>
                    </Select>
                  </FormControl>
                )}

                {/* Special Announcement Checkbox */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.is_special}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_special: e.target.checked }))}
                    />
                  }
                  label="Mark as Special Announcement (will be highlighted)"
                />

                <Divider />

                {/* Timing Information */}
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Timing Information
                </Typography>

                <TextField
                  fullWidth
                  label="Posted Date & Time"
                  type="datetime-local"
                  required
                  value={formatDateTimeForInput(formData.posted_at)}
                  onChange={(e) => setFormData(prev => ({ ...prev, posted_at: e.target.value }))}
                  helperText="When this announcement should be published"
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Start Time"
                    placeholder="e.g., 10:00 AM, 7:00 PM"
                    value={formData.start_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                    sx={{ flex: 1 }}
                    helperText="Service/event start time"
                  />
                  <TextField
                    label="End Time"
                    placeholder="e.g., 12:00 PM, 9:00 PM"
                    value={formData.end_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                    sx={{ flex: 1 }}
                    helperText="Service/event end time"
                  />
                </Box>

                {(formData.type === 'weekly' || formData.type === 'yearly') && (
                  <TextField
                    fullWidth
                    label="Recurrence Rule"
                    placeholder="e.g., Every Sunday, First Sunday of month, Every December"
                    value={formData.recurrence_rule}
                    onChange={(e) => setFormData(prev => ({ ...prev, recurrence_rule: e.target.value }))}
                    helperText="Describe when this announcement repeats"
                  />
                )}

                <Divider />

                {/* Create Another Checkbox */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={createAnother}
                      onChange={(e) => setCreateAnother(e.target.checked)}
                    />
                  }
                  label="Create another announcement after saving"
                />

                {/* Submit Button */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={createAnother ? <AddIcon /> : <SaveIcon />}
                    disabled={submitting || !formData.title}
                    sx={{ minWidth: 200 }}
                  >
                    {submitting ? 'Creating...' : createAnother ? 'Create & Add Another' : 'Create Announcement'}
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
