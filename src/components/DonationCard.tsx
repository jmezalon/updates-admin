import { useState } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Alert
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

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

interface DonationCardProps {
  donation: Donation;
  onDelete: (donationId: number) => void;
  onUpdate?: (donation: Donation) => void;
}

interface AddDonationDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (donationData: Partial<Donation>) => void;
  churchId: number;
}

// Payment method configurations with colors and icons
const PAYMENT_METHODS = {
  'Cash App': { color: '#00D632', icon: '$', bgColor: '#E8F5E8' },
  'Zelle': { color: '#6D1ED4', icon: 'Z', bgColor: '#F0E8FF' },
  'Venmo': { color: '#3D95CE', icon: 'V', bgColor: '#E8F4FF' },
  'PayPal': { color: '#0070BA', icon: 'P', bgColor: '#E8F2FF' },
  'Bank Transfer': { color: '#666666', icon: 'B', bgColor: '#F5F5F5' },
  'Other': { color: '#FF6B35', icon: '?', bgColor: '#FFF0E8' }
};

const getPaymentMethodStyle = (method: string) => {
  return PAYMENT_METHODS[method as keyof typeof PAYMENT_METHODS] || PAYMENT_METHODS['Other'];
};

export function DonationCard({ donation, onDelete, onUpdate }: DonationCardProps) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(donation);
  const [saving, setSaving] = useState(false);

  const paymentStyle = getPaymentMethodStyle(donation.method);

  const handleEdit = () => {
    setEditing(true);
    setFormData(donation);
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData(donation);
  };

  const handleSave = async () => {
    if (!onUpdate) return;
    
    setSaving(true);
    try {
      await onUpdate(formData);
      setEditing(false);
    } catch (error) {
      console.error('Error updating donation:', error);
    }
    setSaving(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this donation method?')) {
      onDelete(donation.id);
    }
  };

  if (editing) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              select
              label="Payment Method"
              value={formData.method}
              onChange={(e) => setFormData(prev => ({ ...prev, method: e.target.value }))}
              fullWidth
            >
              {Object.keys(PAYMENT_METHODS).map((method) => (
                <MenuItem key={method} value={method}>
                  {method}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              label="Contact Name"
              value={formData.contact_name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
              fullWidth
            />
            
            <TextField
              label="Contact Info"
              value={formData.contact_info}
              onChange={(e) => setFormData(prev => ({ ...prev, contact_info: e.target.value }))}
              fullWidth
              required
              placeholder="e.g., $churchname, phone number, email"
            />
            
            <TextField
              label="Note"
              value={formData.note || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
              fullWidth
              multiline
              rows={2}
              placeholder="Additional instructions for donors"
            />
            
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saving || !formData.contact_info}
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
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 2, border: `2px solid ${paymentStyle.color}20` }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Payment Method Icon */}
          <Avatar
            sx={{
              bgcolor: paymentStyle.color,
              color: 'white',
              width: 50,
              height: 50,
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}
          >
            {paymentStyle.icon}
          </Avatar>
          
          {/* Payment Details */}
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip
                label={donation.method}
                sx={{
                  bgcolor: paymentStyle.bgColor,
                  color: paymentStyle.color,
                  fontWeight: 600
                }}
                size="small"
              />
              {donation.contact_name && (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  • {donation.contact_name}
                </Typography>
              )}
            </Box>
            
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {donation.contact_info}
            </Typography>
            
            {donation.note && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {donation.note}
              </Typography>
            )}
          </Box>
          
          {/* Action Buttons */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={handleEdit}
              sx={{ color: 'primary.main' }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleDelete}
              sx={{ color: 'error.main' }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export function AddDonationDialog({ open, onClose, onAdd, churchId }: AddDonationDialogProps) {
  const [formData, setFormData] = useState({
    method: 'Cash App',
    contact_name: '',
    contact_info: '',
    note: ''
  });
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async () => {
    if (!formData.contact_info.trim()) {
      setError('Contact info is required');
      return;
    }

    setAdding(true);
    setError('');
    
    try {
      await onAdd({
        ...formData,
        church_id: churchId,
        contact_name: formData.contact_name || undefined,
        note: formData.note || undefined
      });
      
      // Reset form
      setFormData({
        method: 'Cash App',
        contact_name: '',
        contact_info: '',
        note: ''
      });
      onClose();
    } catch (err) {
      setError('Failed to add donation method');
    }
    
    setAdding(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Donation Method</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          
          <TextField
            select
            label="Payment Method"
            value={formData.method}
            onChange={(e) => setFormData(prev => ({ ...prev, method: e.target.value }))}
            fullWidth
          >
            {Object.keys(PAYMENT_METHODS).map((method) => (
              <MenuItem key={method} value={method}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar
                    sx={{
                      bgcolor: getPaymentMethodStyle(method).color,
                      color: 'white',
                      width: 24,
                      height: 24,
                      fontSize: '0.8rem'
                    }}
                  >
                    {getPaymentMethodStyle(method).icon}
                  </Avatar>
                  {method}
                </Box>
              </MenuItem>
            ))}
          </TextField>
          
          <TextField
            label="Contact Name"
            value={formData.contact_name}
            onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
            fullWidth
            placeholder="e.g., Church Name"
          />
          
          <TextField
            label="Contact Info"
            value={formData.contact_info}
            onChange={(e) => setFormData(prev => ({ ...prev, contact_info: e.target.value }))}
            fullWidth
            required
            placeholder="e.g., $churchname, phone number, email"
          />
          
          <TextField
            label="Note"
            value={formData.note}
            onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
            fullWidth
            multiline
            rows={2}
            placeholder="Additional instructions for donors"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={adding}>
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          disabled={adding || !formData.contact_info.trim()}
        >
          {adding ? 'Adding...' : 'Add Donation Method'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
