import { BASE_URL } from '../constants/config';
import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Stack
} from '@mui/material';
import {
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  AccessTime as TimeIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { useImageUpload } from '../hooks/useImageUpload';

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

interface EventCardProps {
  event: Event;
  onUpdate: () => void;
}

export function EventCard({ event, onUpdate }: EventCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: event.title,
    description: event.description || '',
    location: event.location || '',
    start_datetime: event.start_datetime,
    end_datetime: event.end_datetime || '',
    price: event.price || 0,
    contact_email: event.contact_email || '',
    contact_phone: event.contact_phone || '',
    website: event.website || '',
    image_url: event.image_url || ''
  });
  const [updating, setUpdating] = useState(false);
  const authToken = localStorage.getItem('authToken');
  
  const {
    uploadImage,
    uploading,
    error: uploadError,
    success: uploadSuccess,
    clearMessages
  } = useImageUpload(authToken || '');

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`${BASE_URL}/churches/${event.church_id}/events/${event.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.ok) {
        onUpdate(); // Refresh the events list
        setDeleteDialogOpen(false);
      } else {
        console.error('Failed to delete event');
      }
    } catch (err) {
      console.error('Error deleting event:', err);
    }
    setDeleting(false);
  };

  const handleUpdate = async () => {
    setUpdating(true);
    clearMessages();
    try {
      // Prepare submission data with proper datetime formatting
      const submissionData = {
        ...editForm,
        start_datetime: formatDateTimeForBackend(editForm.start_datetime),
        end_datetime: formatDateTimeForBackend(editForm.end_datetime)
      };

      const response = await fetch(`${BASE_URL}/churches/${event.church_id}/events/${event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(submissionData)
      });

      if (response.ok) {
        onUpdate(); // Refresh the events list
        setIsEditing(false);
      } else {
        console.error('Failed to update event');
      }
    } catch (err) {
      console.error('Error updating event:', err);
    }
    setUpdating(false);
  };

  const handleCancel = () => {
    setEditForm({
      title: event.title,
      description: event.description || '',
      location: event.location || '',
      start_datetime: event.start_datetime,
      end_datetime: event.end_datetime || '',
      price: event.price || 0,
      contact_email: event.contact_email || '',
      contact_phone: event.contact_phone || '',
      website: event.website || '',
      image_url: event.image_url || ''
    });
    setIsEditing(false);
    clearMessages();
  };

  const handleImageUpload = async (file: File) => {
    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      setEditForm(prev => ({ ...prev, image_url: imageUrl }));
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const utcDate = new Date(dateString); // still parses in UTC
  
      return utcDate.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.warn('Invalid date format:', dateString);
      return dateString;
    }
  };
  

  const formatDateTimeForInput = (dateString: string) => {
    if (!dateString) return '';
    try {
      // Convert UTC datetime string to local time for display in datetime-local input
      const utcDate = new Date(dateString);
      if (isNaN(utcDate.getTime())) return '';
      
      // Get local time components (automatically converts from UTC to local)
      const year = utcDate.getFullYear();
      const month = String(utcDate.getMonth() + 1).padStart(2, '0');
      const day = String(utcDate.getDate()).padStart(2, '0');
      const hours = String(utcDate.getHours()).padStart(2, '0');
      const minutes = String(utcDate.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      console.warn('Invalid date format:', dateString);
      return '';
    }
  };

  // Convert datetime-local string to proper UTC ISO string for backend storage
  const formatDateTimeForBackend = (dateTimeString: string) => {
    if (!dateTimeString) return '';
    try {
      // datetime-local format: "2025-07-30T14:00"
      // Create a Date object from the local datetime string
      // The browser will interpret this as local time
      const localDate = new Date(dateTimeString);
      
      if (isNaN(localDate.getTime())) {
        console.warn('Invalid date string:', dateTimeString);
        return '';
      }
      
      // Convert to proper UTC ISO string
      // This will automatically handle the timezone conversion
      // e.g., 10:00 PM Eastern becomes 2:00 AM UTC (next day)
      return localDate.toISOString();
    } catch (error) {
      console.warn('DateTime conversion error:', error, dateTimeString);
      return dateTimeString; // Return original if conversion fails
    }
  };

  return (
    <>
      <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          {!isEditing ? (
            // View Mode
            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* Event Image */}
              {event.image_url && (
                <Box
                  component="img"
                  src={event.image_url}
                  sx={{
                    width: 120,
                    height: 80,
                    objectFit: 'cover',
                    borderRadius: 1,
                    flexShrink: 0
                  }}
                />
              )}
              
              {/* Event Details */}
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                    {event.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small" color="primary" onClick={() => setIsEditing(true)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeleteDialogOpen(true)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                
                {event.description && (
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.4 }}>
                    {event.description}
                  </Typography>
                )}
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {formatDate(event.start_datetime)}
                    </Typography>
                  </Box>
                  
                  {event.location && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {event.location}
                      </Typography>
                    </Box>
                  )}
                  
                  {event.price !== undefined && event.price > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <MoneyIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        ${event.price}
                      </Typography>
                    </Box>
                  )}
                  
                  {event.price === 0 && (
                    <Chip label="Free" size="small" color="success" variant="outlined" />
                  )}
                </Box>
              </Box>
            </Box>
          ) : (
            // Edit Mode
            <Stack spacing={3}>
              {/* Upload Messages */}
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

              {/* Image Upload Section */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Event Image *
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  {editForm.image_url && (
                    <Box
                      component="img"
                      src={editForm.image_url}
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
                      {uploading ? 'Uploading...' : 'Upload New Image'}
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
                  value={editForm.image_url}
                  onChange={(e) => setEditForm(prev => ({ ...prev, image_url: e.target.value }))}
                  sx={{ mt: 1 }}
                />
              </Box>

              {/* Event Details Form */}
              <TextField
                fullWidth
                label="Event Title"
                required
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
              />
              
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
              />
              
              <TextField
                fullWidth
                label="Location"
                value={editForm.location}
                onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
              />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Start Date & Time"
                  type="datetime-local"
                  required
                  value={formatDateTimeForInput(editForm.start_datetime)}
                  onChange={(e) => setEditForm(prev => ({ ...prev, start_datetime: e.target.value }))}
                  sx={{ flex: 1 }}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="End Date & Time"
                  type="datetime-local"
                  value={editForm.end_datetime ? formatDateTimeForInput(editForm.end_datetime) : ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, end_datetime: e.target.value }))}
                  sx={{ flex: 1 }}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              
              <TextField
                fullWidth
                label="Price"
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
                value={editForm.price}
                onChange={(e) => setEditForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                helperText="Enter 0 for free events"
              />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Contact Email"
                  type="email"
                  value={editForm.contact_email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, contact_email: e.target.value }))}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Contact Phone"
                  value={editForm.contact_phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, contact_phone: e.target.value }))}
                  sx={{ flex: 1 }}
                />
              </Box>
              
              <TextField
                fullWidth
                label="Website"
                type="url"
                value={editForm.website}
                onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
              />
              
              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  startIcon={<CancelIcon />}
                  disabled={updating}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleUpdate}
                  startIcon={<SaveIcon />}
                  disabled={updating || !editForm.title || !editForm.image_url}
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{event.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            disabled={deleting}
            variant="contained"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
