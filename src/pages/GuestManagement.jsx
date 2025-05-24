import { useEffect, useState } from "react";
import {
  getGuests,
  createGuest,
  updateGuest,
  deleteGuest,
  uploadGuestExcel,
  shareInvitation,
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
  Box,
  TextField,
  MenuItem,
} from "@mui/material";
import GuestStats from "../components/GuestStats";

export default function GuestManagement() {
  const [guests, setGuests] = useState([]);
  const [editingGuest, setEditingGuest] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filterName, setFilterName] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [filters, setFilters] = useState({
    guest_name: "",
    group_name: "",
    partner: "",
    has_shared_invitation: "",
  });
  const [filterPartner, setFilterPartner] = useState("");
  const [filterShared, setFilterShared] = useState("");
  const fetchGuests = async () => {
    const res = await getGuests();
    setGuests(res.data);
  };
  const resetFilters = () => {
    setFilterName("");
    setFilterGroup("");
    setFilterPartner("");
    setFilterShared("");
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

  const handleUploadExcel = async () => {
    if (!selectedFile) return;

    try {
      await uploadGuestExcel(selectedFile); // ← use centralized API
      fetchGuests();
      setShowUploadModal(false);
      setSelectedFile(null);
    } catch (error) {
      alert("Upload failed");
      console.error(error);
    }
  };

  const generateInvitationMessage = (guest) => {
    return `Assalamu'alaikum Wr. Wb

    Yth. ${guest.guest_name}

    Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i, teman sekaligus sahabat, untuk menghadiri acara kami :

    ${guest.invitation_link}

    Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan untuk hadir dan memberikan doa restu.

    Mohon maaf perihal undangan hanya di bagikan melalui pesan ini. Terima kasih banyak atas perhatiannya.

    Link Map:
    https://maps.app.goo.gl/1Dp2T1z38gyVYK5LA

    Wassalamu'alaikum Wr. Wb.
    Terima Kasih.`;
  };

  const copyInvitation = async (guest) => {
    const message = generateInvitationMessage(guest);
    try {
      await navigator.clipboard.writeText(message);
      shareInvitation(guest.id);
      alert("Invitation message copied to clipboard!");
      fetchGuests(); // refresh to reflect has_shared_invitation
    } catch (err) {
      alert("Failed to copy!");
      console.error(err);
    }
  };

  const filteredGuests = guests.filter((guest) => {
    const matchesName = guest.guest_name
      .toLowerCase()
      .includes(filterName.toLowerCase());

    const matchesGroup = !filterGroup || guest.group_name === filterGroup;

    const matchesPartner =
      filterPartner === ""
        ? true
        : (guest.partner ?? false) === (filterPartner === "true");

    const matchesShared =
      filterShared === ""
        ? true
        : (guest.has_shared_invitation ?? false) === (filterShared === "true");

    return matchesName && matchesGroup && matchesPartner && matchesShared;
  });

  useEffect(() => {
    fetchGuests();
  }, []);

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Guest Management
      </Typography>

      <GuestStats
        totalInvitees={guests.length}
        attendedInvitees={guests.filter((g) => g.has_attended).length}
        totalPax={guests.reduce((sum, g) => sum + (g.total_pax || 0), 0)}
        attendedPax={guests.reduce((sum, g) => sum + (g.attended_pax || 0), 0)}
      />

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Button variant="contained" onClick={() => handleOpenModal()}>
          Add Guest
        </Button>
        <Button variant="outlined" onClick={() => setShowUploadModal(true)}>
          Upload Excel
        </Button>
      </Box>

      {/* Filter Section */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
        <TextField
          label="Name"
          variant="outlined"
          size="small"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
        />

        <TextField
          label="Group"
          variant="outlined"
          size="small"
          select
          value={filterGroup}
          onChange={(e) => setFilterGroup(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          {[...new Set(guests.map((g) => g.group_name))]
            .filter(Boolean)
            .map((group) => (
              <MenuItem key={group} value={group}>
                {group}
              </MenuItem>
            ))}
        </TextField>

        <TextField
          label="Partner"
          variant="outlined"
          size="small"
          select
          value={filterPartner}
          onChange={(e) => setFilterPartner(e.target.value)}
          sx={{ minWidth: 130 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="true">Yes</MenuItem>
          <MenuItem value="false">No</MenuItem>
        </TextField>

        <TextField
          label="Shared?"
          variant="outlined"
          size="small"
          select
          value={filterShared}
          onChange={(e) => setFilterShared(e.target.value)}
          sx={{ minWidth: 130 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="true">Yes</MenuItem>
          <MenuItem value="false">No</MenuItem>
        </TextField>

        <Button variant="outlined" color="secondary" onClick={resetFilters}>
          Reset Filters
        </Button>
      </Box>
      {/* Modal for Add/Edit Guest */}
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

      {/* Modal for Upload Excel */}
      <Dialog
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Upload Excel File</DialogTitle>
        <DialogContent>
          <input
            type="file"
            accept=".xlsx"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            style={{ marginTop: "1rem" }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUploadModal(false)}>Cancel</Button>
          <Button onClick={handleUploadExcel} variant="contained">
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Guest Table */}
      <Table sx={{ mt: 4 }}>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Group</TableCell>
            <TableCell>Guest Name</TableCell>
            <TableCell>Partner</TableCell>
            <TableCell>Invitation Link</TableCell>
            <TableCell>Action</TableCell>
            <TableCell>Shared?</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredGuests.map((guest) => (
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
                <br />
                <Button
                  size="small"
                  onClick={() => copyInvitation(guest)}
                  sx={{ mt: 1 }}
                >
                  Copy Message
                </Button>
              </TableCell>
              <TableCell>
                <Button onClick={() => handleOpenModal(guest)}>Edit</Button>
                <Button color="error" onClick={() => handleDelete(guest.id)}>
                  Delete
                </Button>
              </TableCell>
              <TableCell>
                {guest.has_shared_invitation ? "Yes" : "No"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
}
