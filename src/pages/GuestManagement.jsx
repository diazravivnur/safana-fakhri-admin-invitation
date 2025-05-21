import { useEffect, useState } from "react";
import {
  getGuests,
  createGuest,
  updateGuest,
  deleteGuest,
} from "../api/guestApi";
import GuestForm from "../components/GuestForm";
import {
  Container,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

export default function GuestManagement() {
  const [guests, setGuests] = useState([]);
  const [editingGuest, setEditingGuest] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchGuests = async () => {
    const res = await getGuests();
    setGuests(res.data);
  };

  const handleSave = async (form) => {
    if (editingGuest) {
      await updateGuest(editingGuest.id, form);
    } else {
      await createGuest(form);
    }
    handleCloseModal();
    fetchGuests();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      await deleteGuest(id);
      fetchGuests();
    }
  };
  const handleOpenModal = (guest = null) => {
    setEditingGuest(guest);
    setShowForm(true);
  };

  const handleCloseModal = () => {
    setShowForm(false);
    setEditingGuest(null);
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Guest Management
      </Typography>
      <Button variant="contained" onClick={() => handleOpenModal()}>
        Add Guest
      </Button>

      <Dialog
        open={showForm}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{editingGuest ? "Edit Guest" : "Add Guest"}</DialogTitle>
        <DialogContent>
          <GuestForm
            initialData={editingGuest}
            onSave={handleSave}
            onCancel={handleCloseModal}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Close</Button>
        </DialogActions>
      </Dialog>

      <Table sx={{ mt: 4 }}>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Group</TableCell>
            <TableCell>Guest Name</TableCell>
            <TableCell>Partner</TableCell>
            <TableCell>Invitation Link</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {guests.map((guest) => (
            <TableRow key={guest.id}>
              <TableCell>{guest.id}</TableCell>
              <TableCell>{guest.group_name}</TableCell>
              <TableCell>{guest.guest_name}</TableCell>
              <TableCell>{guest.partner ? "Yes" : "No"}</TableCell>
              <TableCell>
                <a
                  href={guest.invitation_link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {guest.invitation_link}
                </a>
              </TableCell>
              <TableCell>
                <Button onClick={() => handleOpenModal(guest)}>Edit</Button>
                <Button color="error" onClick={() => handleDelete(guest.id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
}
