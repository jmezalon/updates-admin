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
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CloudUpload as CloudUploadIcon,
  Campaign as CampaignIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { useImageUpload } from '../hooks/useImageUpload';

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
  day?: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
}

interface AnnouncementCardProps {
  announcement: Announcement;
  authToken: string;
  onUpdate: (updatedAnnouncement: Announcement) => void;
  onDelete: (announcementId: number) => void;
}

export function AnnouncementCard({ announcement, authToken, onUpdate, onDelete }: AnnouncementCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state for editing
  const [editForm, setEditForm] = useState({
    title: announcement.title,
    description: announcement.description || '',
    image_url: announcement.image_url || '',
    type: announcement.type,
    subcategory: announcement.subcategory || '',
    start_time: announcement.start_time || '',
    end_time: announcement.end_time || '',
    recurrence_rule: announcement.recurrence_rule || '',
    is_special: announcement.is_special,
    day: announcement.day ?? 0 // Default to Sunday if not set
  });

  const imageUpload = useImageUpload(authToken);

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (error) {
      return dateString;
    }
  };

  const formatTimeForDisplay = (timeString: string) => {
    if (!timeString) return '';
    try {
      // If it's already in a good format (like "8:00 AM"), return as is
      if (timeString.match(/^\d{1,2}:\d{2}\s?(AM|PM)$/i)) {
        return timeString;
      }
      
      // If it's an ISO datetime string, convert to 12-hour format
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
      }
      
      // Return as-is if we can't parse it
      return timeString;
    } catch (error) {
      console.warn('Invalid time format:', timeString);
      return timeString;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'weekly': return 'primary';
      case 'special': return 'error';
      case 'yearly': return 'warning';
      default: return 'default';
    }
  };

  const getDayName = (day?: number) => {
    if (day === undefined || day === null) return null;
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day] || null;
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      title: announcement.title,
      description: announcement.description || '',
      image_url: announcement.image_url || '',
      type: announcement.type,
      subcategory: announcement.subcategory || '',
      start_time: announcement.start_time || '',
      end_time: announcement.end_time || '',
      recurrence_rule: announcement.recurrence_rule || '',
      is_special: announcement.is_special,
      day: announcement.day ?? 0 // Default to Sunday if not set
    });
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    if (!editForm.title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError('');

    const submissionData = {
      ...editForm,
      start_time: editForm.start_time, // Send time strings directly as entered
      end_time: editForm.end_time, // Send time strings directly as entered
    };

    try {
      const response = await fetch(`${BASE_URL}/announcements/${announcement.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(submissionData)
      });

      if (response.ok) {
        const updatedAnnouncement = await response.json();
        onUpdate(updatedAnnouncement);
        setIsEditing(false);
        setSuccess('Announcement updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update announcement');
      }
    } catch (err) {
      setError('Network error while updating announcement');
    }

    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/announcements/${announcement.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        onDelete(announcement.id);
        setDeleteDialogOpen(false);
      } else {
        setError('Failed to delete announcement');
      }
    } catch (err) {
      setError('Network error while deleting announcement');
    }
    setLoading(false);
  };

  const handleImageUpload = async (file: File) => {
    const imageUrl = await imageUpload.uploadImage(file);
    if (imageUrl) {
      setEditForm(prev => ({
        ...prev,
        image_url: imageUrl
      }));
    }
  };

  if (isEditing) {
    return (
      <Card sx={{ mb: 2, border: '2px solid', borderColor: 'primary.main' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
            Edit Announcement
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Stack spacing={2}>
            <TextField
              label="Title"
              value={editForm.title}
              onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
              required
              fullWidth
            />

            <TextField
              label="Description"
              value={editForm.description}
              onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={3}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={editForm.type}
                label="Type"
                onChange={(e) => setEditForm(prev => ({ ...prev, type: e.target.value as any }))}
              >
                <MenuItem value="general">General</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="special">Special</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </Select>
            </FormControl>

            {/* Day Selector for Weekly Announcements */}
            {editForm.type === 'weekly' && (
              <FormControl fullWidth>
                <InputLabel>Day of Week</InputLabel>
                <Select
                  value={editForm.day}
                  label="Day of Week"
                  onChange={(e) => setEditForm(prev => ({ ...prev, day: Number(e.target.value) }))}
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

            <TextField
              label="Subcategory"
              value={editForm.subcategory}
              onChange={(e) => setEditForm(prev => ({ ...prev, subcategory: e.target.value }))}
              fullWidth
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Start Time"
                value={formatTimeForDisplay(editForm.start_time)}
                onChange={(e) => setEditForm(prev => ({ ...prev, start_time: e.target.value }))}
                placeholder="e.g., 8:00 AM"
                helperText="Enter time in 12-hour format (e.g., 8:00 AM, 12:30 PM)"
                slotProps={{
                  inputLabel: { shrink: true }
                }}
                fullWidth
              />
              <TextField
                label="End Time"
                value={formatTimeForDisplay(editForm.end_time)}
                onChange={(e) => setEditForm(prev => ({ ...prev, end_time: e.target.value }))}
                placeholder="e.g., 10:00 AM"
                helperText="Enter time in 12-hour format (e.g., 8:00 AM, 12:30 PM)"
                slotProps={{
                  inputLabel: { shrink: true }
                }}
                fullWidth
              />
            </Box>

            <TextField
              label="Recurrence Rule"
              value={editForm.recurrence_rule}
              onChange={(e) => setEditForm(prev => ({ ...prev, recurrence_rule: e.target.value }))}
              placeholder="e.g., FREQ=WEEKLY;BYDAY=SU"
              fullWidth
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={editForm.is_special}
                  onChange={(e) => setEditForm(prev => ({ ...prev, is_special: e.target.checked }))}
                />
              }
              label="Special Announcement"
            />

            {/* Image Upload */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Announcement Image
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Image URL"
                  value={editForm.image_url}
                  onChange={(e) => setEditForm(prev => ({ ...prev, image_url: e.target.value }))}
                  fullWidth
                />
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  disabled={imageUpload.uploading}
                >
                  {imageUpload.uploading ? 'Uploading...' : 'Upload from Device'}
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
                {imageUpload.error && (
                  <Alert severity="error">{imageUpload.error}</Alert>
                )}
                {editForm.image_url && (
                  <Box sx={{ mt: 2 }}>
                    <img
                      src={editForm.image_url}
                      alt="Preview"
                      style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  </Box>
                )}
              </Stack>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={loading || !editForm.title.trim()}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CampaignIcon sx={{ color: 'error.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {announcement.title}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton onClick={handleEdit} size="small" color="primary">
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => setDeleteDialogOpen(true)} size="small" color="error">
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip
              label={announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}
              color={getTypeColor(announcement.type) as any}
              size="small"
            />
            {announcement.type === 'weekly' && getDayName(announcement.day) && (
              <Chip 
                label={getDayName(announcement.day)} 
                color="primary" 
                variant="outlined" 
                size="small" 
              />
            )}
            {announcement.is_special ? (
              <Chip label="Special" color="error" size="small" />
            ) : null}
            {announcement.subcategory ? (
              <Chip label={announcement.subcategory} variant="outlined" size="small" />
            ) : null}
          </Box>

          {announcement.description && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              {announcement.description}
            </Typography>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TimeIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Posted: {formatDateTime(announcement.posted_at)}
              </Typography>
            </Box>
          </Box>

          {(announcement.start_time || announcement.end_time) && (
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              {announcement.start_time && (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  <strong>Start:</strong> {formatTimeForDisplay(announcement.start_time)}
                </Typography>
              )}
              {announcement.end_time && (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  <strong>End:</strong> {formatTimeForDisplay(announcement.end_time)}
                </Typography>
              )}
            </Box>
          )}

          {announcement.recurrence_rule && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              <strong>Recurrence:</strong> {announcement.recurrence_rule}
            </Typography>
          )}

          {announcement.image_url && (
            <Box sx={{ mt: 2 }}>
              <img
                src={announcement.image_url}
                alt={announcement.title}
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '200px', 
                  objectFit: 'cover', 
                  borderRadius: '8px' 
                }}
              />
            </Box>
          )}

          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Announcement</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{announcement.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
