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
  uploadBulkGuestExcel,
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
  const [uploadModalType, setUploadModalType] = useState(null); // 'single' | 'bulk'
  const [selectedFile, setSelectedFile] = useState(null);
  const [filterName, setFilterName] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [filterShared, setFilterShared] = useState("");
  const [origin, setOrigin] = useState("");
  const [uploadedGuests, setUploadedGuests] = useState([]);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

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
      await updateGuest(editingGuest.invitation_id, form);
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
      const response = await uploadGuestExcel(selectedFile, origin);
      if (response?.data) {
        alert("Upload berhasil!");
        setUploadedGuests(response.data.data);
        setShowSuccessPopup(true);
      }
      fetchGuests();
      setUploadModalType(null);
      setSelectedFile(null);
    } catch (error) {
      alert("Upload failed");
      console.error(error);
    }
  };

  const handleBulkUploadExcel = async () => {
    if (!selectedFile || !origin) {
      alert("Pilih file dan asal undangan terlebih dahulu");
      return;
    }

    try {
      const response = await uploadBulkGuestExcel(selectedFile, origin);
      if (response?.data) {
        alert("Upload berhasil!");
        setUploadedGuests(response.data.data);
        setShowSuccessPopup(true);
      }
      fetchGuests();
      setUploadModalType(null);
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
    return `Assalamualaikum Wr. Wb.

Kepada Yth. 
Bapak/Ibu/Saudara/i
*${guest.guest_name}*
di tempat

Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara Pernikahan kami:

*Safana Salsabila Wicaksono*
Putri kelima Bpk. Sonny Wicaksono & Ibu Krissantiana

dengan

*Muhammad Fakhri Dwi Ariza*
Putra Kedua dari Alm. Bpk. Muhammad Janiarto Arie Koesoemo & Ibu Siti Zaleha

Yang Insya Allah akan dilaksanakan pada:
🗓️ Minggu, 31 Agustus 2025
🕰️ Akad: 07.30 - 09.30 WIB
🕰️ Resepsi: 10.30 - 13.00 WIB
📍 Graha Bhima Sakti, Pancoran, Jakarta Selatan

Undangan Digital dapat dilihat pada:
${guest.invitation_link}

Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan untuk hadir dan memberikan doa restu.

Demikian kami sampaikan, terima kasih.
Wassalamualaikum Warahmatullahi Wabarakaatuh.

Kami yang berbahagia,
*Safana & Fakhri*

Mohon maaf perihal undangan hanya dibagikan melalui pesan ini.`;
  };

  const generateInvitationMessageOrtu = (guest) => {
    return `Bismillahirrahmanirrahim
Assalamu’alaikum Warahmatullahi Wabarakatuh

Kepada Yth.
Bapak/Ibu/Saudara/i
*${guest.guest_name}*
di tempat

Dengan penuh rasa hormat dan kebahagiaan, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara Pernikahan Anak Kami:

*Safana Salsabila Wicaksono*
Putri kelima Bpk. Sonny Wicaksono & Ibu Krissantiana

dengan

*Muhammad Fakhri Dwi Ariza*
Putra kedua dari Alm. Bpk. Muhammad Janiarto Arie Koesoemo & Ibu Siti Zaleha

Yang Insya Allah akan dilaksanakan pada:
🗓️ Minggu, 31 Agustus 2025
🕰️ Akad: 07.30 – 09.30 WIB
🕰️ Resepsi: 10.30 – 13.00 WIB
📍 Graha Bhima Sakti, Pancoran, Jakarta Selatan

Undangan Digital dapat dilihat pada:
${guest.invitation_link}

Merupakan kebahagiaan serta kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.

🙏 Catatan khusus: Untuk GrabSquad, mohon maaf karena keterbatasan kapasitas, undangan ini hanya berlaku sesuai slot yang telah ditentukan. Terima kasih atas pengertian dan perhatiannya.

Terima kasih banyak atas perhatian Bapak/Ibu/Saudara/i.
Wassalamu’alaikum Warahmatullahi Wabarakatuh.

Kami yang berbahagia,
*Kel. Bpk. Sonny Wicaksono & Ibu Krissantiana*
*Kel. Alm. Bpk. Muhammad Janiarto Arie Koesoemo & Ibu Siti Zaleha*

Mohon maaf perihal undangan hanya dibagikan melalui pesan ini.`;
  };

  const copyInvitation = async (guest) => {
    const message = generateInvitationMessage(guest);
    try {
      await navigator.clipboard.writeText(message);
      shareInvitation(guest.invitation_id);
      alert("Invitation message copied to clipboard!");
      fetchGuests();
    } catch (err) {
      alert("Failed to copy!");
      console.error(err);
    }
  };

  const copyInvitationOrtu = async (guest) => {
    const message = generateInvitationMessageOrtu(guest);
    try {
      await navigator.clipboard.writeText(message);
      shareInvitation(guest.invitation_id);
      alert("Invitation message copied to clipboard!");
      fetchGuests();
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
        <Button variant="outlined" onClick={() => setUploadModalType("single")}>
          Upload Excel
        </Button>
        <Button variant="outlined" onClick={() => setUploadModalType("bulk")}>
          Bulk Upload Excel
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
        {/* Origin Filter */}
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
          <MenuItem value="Fakhri">Fakhri</MenuItem>
          <MenuItem value="Safana">Safana</MenuItem>
        </TextField>

        {/* Name Filter */}
        <TextField
          label="Name"
          variant="outlined"
          size="small"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
        />

        {/* Group Filter */}
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

        {/* Shared Filter */}
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

      {/* Add/Edit Guest Form */}
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

      {/* Upload Excel Modal */}
      <Dialog
        open={uploadModalType === "single"}
        onClose={() => setUploadModalType(null)}
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
              <MenuItem value="Fakhri">Fakhri</MenuItem>
              <MenuItem value="Safana">Safana</MenuItem>
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
          <Button onClick={() => setUploadModalType(null)}>Cancel</Button>
          <Button onClick={handleUploadExcel} variant="contained">
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Upload Excel Modal */}
      <Dialog
        open={uploadModalType === "bulk"}
        onClose={() => setUploadModalType(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Bulk Upload Excel</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Asal Undangan</InputLabel>
            <Select
              value={origin}
              label="Asal Undangan"
              onChange={(e) => setOrigin(e.target.value)}
            >
              <MenuItem value="Fakhri">Fakhri</MenuItem>
              <MenuItem value="Safana">Safana</MenuItem>
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
          <Button onClick={() => setUploadModalType(null)}>Cancel</Button>
          <Button onClick={handleBulkUploadExcel} variant="contained">
            Upload
          </Button>
        </DialogActions>
      </Dialog>
      {/* Guest Table */}
      <Table sx={{ mt: 4 }}>
        <TableHead>
          <TableRow>
            <TableCell>No.</TableCell>
            <TableCell>Guest Name</TableCell>
            <TableCell>Invitation Link</TableCell>
            <TableCell>Group</TableCell>
            <TableCell>Group Image</TableCell>
            <TableCell>Pax</TableCell>
            <TableCell>Action</TableCell>
            <TableCell>Shared?</TableCell>
            <TableCell>isAttending?</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredGuests.map((guest, index) => {
            const bgColor = guest.has_shared_invitation
              ? "white"
              : guest.origin === "Fakhri"
              ? "#E3F2FD"
              : guest.origin === "Safana"
              ? "#FCE4EC"
              : "white";

            return (
              <TableRow
                key={guest.id || index}
                sx={{ backgroundColor: bgColor }}
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell>{guest.guest_name}</TableCell>
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
                    size="small"
                    onClick={() => copyInvitationOrtu(guest)}
                    sx={{ mt: 1 }}
                  >
                    Copy Message ( GrabSquad )
                  </Button>
                </TableCell>
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
                            fetchGuests();
                          } catch (err) {
                            console.error("Failed to upload image:", err);
                            alert("Upload failed");
                          }
                        }
                      }}
                    />
                  </Box>
                </TableCell>
                <TableCell>{guest.pax_count}</TableCell>
                <TableCell>
                  <Button onClick={() => handleOpenModal(guest)}>Edit</Button>
                  <Button
                    color="error"
                    onClick={() => handleDelete(guest.invitation_id)}
                  >
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
      <Dialog
        open={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Upload Berhasil 🎉</DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            Total tamu yang berhasil ditambahkan:{" "}
            <strong>{uploadedGuests.length}</strong>
          </Typography>
          <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
            <ul>
              {uploadedGuests.map((guest, index) => (
                <li key={index}>
                  {guest.guest_name} — ID:{" "}
                  <strong>{guest.invitation_id}</strong>
                </li>
              ))}
            </ul>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowSuccessPopup(false)}
            variant="contained"
          >
            Tutup
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
