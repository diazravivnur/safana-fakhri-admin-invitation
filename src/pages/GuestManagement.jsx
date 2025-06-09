import { useEffect, useState } from "react";
import {
  getGuests,
  createGuest,
  updateGuest,
  deleteGuest,
  uploadGuestExcel,
  shareInvitation,
  uploadGroupImage,
  shareGroupLink,
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
  Select,
  FormControl,
  InputLabel,
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
    has_shared_invitation: "",
  });
  const [filterShared, setFilterShared] = useState("");
  const [origin, setOrigin] = useState("");

  const fetchGuests = async () => {
    const res = await getGuests();
    setGuests(res.data);
  };
  const resetFilters = () => {
    setFilterName("");
    setFilterGroup("");
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
    if (!selectedFile || !origin) {
      alert("Pilih file dan asal undangan terlebih dahulu");
      return;
    }

    try {
      await uploadGuestExcel(selectedFile, origin); // ← use centralized API
      fetchGuests();
      setShowUploadModal(false);
      setSelectedFile(null);
    } catch (error) {
      alert("Upload failed");
      console.error(error);
    }
  };

  const handleCopyGroupLink = async (groupName) => {
    const link = generateGroupLink(groupName);
    try {
      await navigator.clipboard.writeText(link);
      await shareGroupLink(groupName); // calls separated API logic
      alert("Group link copied & marked as shared!");
      // Optionally refresh data or update state here
    } catch (error) {
      console.log(error);
      alert("Failed to copy or share group link.");
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

  const generateInvitationGroupMessage = (groupName) => {
    return `Assalamu'alaikum Wr. Wb

    Yth. ${groupName}

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

  const copyGroupInvitation = async (groupName) => {
    console.log(123, groupName);
    const message = generateInvitationMessage(groupName);
    try {
      await navigator.clipboard.writeText(message);
      shareGroupLink(groupName);
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

    const matchesShared =
      filterShared === ""
        ? true
        : (guest.has_shared_invitation ?? false) === (filterShared === "true");

    const matchesOrigin =
      origin === ""
        ? true
        : guest.origin?.toLowerCase() === origin.toLowerCase();

    return matchesName && matchesGroup && matchesShared && matchesOrigin;
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
        totalInvitees={guests.reduce((sum, g) => sum + (g.pax_count || 0), 0)}
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
          label="Origin"
          variant="outlined"
          size="small"
          select
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          sx={{ minWidth: 130 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="diaz">Diaz</MenuItem>
          <MenuItem value="wulan">Wulan</MenuItem>
        </TextField>
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
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Asal Undangan</InputLabel>
            <Select
              value={origin}
              label="Asal Undangan"
              onChange={(e) => setOrigin(e.target.value)}
            >
              <MenuItem value="diaz">Diaz</MenuItem>
              <MenuItem value="wulan">Wulan</MenuItem>
            </Select>
          </FormControl>

          <input
            type="file"
            accept=".xlsx"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            style={{ marginTop: "1.5rem" }}
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
            <TableCell>No.</TableCell>
            <TableCell>Group</TableCell>
            <TableCell>Group Image</TableCell>
            <TableCell>Guest Name</TableCell>
            {/* <TableCell>QR</TableCell> */}
            <TableCell>Pax</TableCell>
            <TableCell>Invitation Link</TableCell>
            <TableCell>Action</TableCell>
            <TableCell>Shared?</TableCell>
            <TableCell>isAttending?</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredGuests.map((guest, index) => {
            const bgColor = guest.has_shared_invitation
              ? "white"
              : guest.origin === "diaz"
              ? "#E3F2FD" // Soft blue
              : guest.origin === "wulan"
              ? "#FCE4EC" // Soft pink
              : "white";

            return (
              <TableRow
                key={guest.id || index}
                sx={{ backgroundColor: bgColor }}
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell>{guest.group_name}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: 1,
                      overflow: "hidden",
                      cursor: "pointer",
                      border: "1px solid #ccc",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#fafafa",
                    }}
                    onClick={() =>
                      document
                        .getElementById(`upload-image-${guest.group_name}`)
                        ?.click()
                    }
                  >
                    {guest.image ? (
                      <img
                        src={guest.image}
                        alt="Group"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <Typography variant="caption" color="textSecondary">
                        No Image
                      </Typography>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      id={`upload-image-${guest.group_name}`}
                      style={{ display: "none" }}
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          try {
                            await uploadGroupImage(file, guest.group_name);
                            fetchGuests(); // refresh UI
                          } catch (err) {
                            console.error("Failed to upload image:", err);
                            alert("Upload failed");
                          }
                        }
                      }}
                    />
                  </Box>
                </TableCell>
                <TableCell>{guest.guest_name}</TableCell>
                {/* <TableCell>
                  {guest.qr_code_image ? (
                    <img
                      src={guest.qr_code_image}
                      alt="QR Code"
                      className="w-24 h-24 object-contain"
                    />
                  ) : (
                    "No QR"
                  )}
                </TableCell> */}
                <TableCell>{guest.pax_count}</TableCell> {/* NEW */}
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
                  <Button
                    onClick={() => copyGroupInvitation(guest.group_name)}
                    sx={{ mt: 1 }}
                    size="small"
                    className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm"
                  >
                    Copy Group Link
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
                <TableCell>
                  {guest.is_attending === null &&
                  guest.check_in_time === null ? (
                    <Typography variant="body2">Not responded</Typography>
                  ) : (
                    <Box>
                      <Typography variant="body2">
                        Attending: {guest.is_attending ? "Yes" : "No"}
                      </Typography>
                      <Typography variant="body2">
                        Check-in:{" "}
                        {guest.check_in_time
                          ? new Date(guest.check_in_time).toLocaleString()
                          : "Not yet"}
                      </Typography>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Container>
  );
}
