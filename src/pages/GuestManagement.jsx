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
    setShowForm(false);
    setEditingGuest(null);
    fetchGuests();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      await deleteGuest(id);
      fetchGuests();
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Guest Management
      </Typography>
      <Button variant="contained" onClick={() => setShowForm(true)}>
        Add Guest
      </Button>

      {showForm && (
        <GuestForm
          initialData={editingGuest}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingGuest(null);
          }}
        />
      )}

      <Table sx={{ mt: 4 }}>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Group</TableCell>
            <TableCell>Guest Name</TableCell>
            <TableCell>Partner</TableCell>
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
                <Button
                  onClick={() => {
                    setEditingGuest(guest);
                    setShowForm(true);
                  }}
                >
                  Edit
                </Button>
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
