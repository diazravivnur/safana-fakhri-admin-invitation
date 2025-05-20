import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Typography,
} from "@mui/material";

const GuestTable = () => {
  const [guests, setGuests] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/wedding/v1/guests")
      .then((res) => setGuests(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <Paper sx={{ p: 3, mt: 4 }}>
      <Typography variant="h6">Daftar Tamu</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nama</TableCell>
            <TableCell>Group</TableCell>
            <TableCell>Partner</TableCell>
            <TableCell>Link Undangan</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {guests.map((guest) => (
            <TableRow key={guest.id}>
              <TableCell>{guest.guest_name}</TableCell>
              <TableCell>{guest.group_name}</TableCell>
              <TableCell>{guest.partner ? "Ya" : "Tidak"}</TableCell>
              <TableCell>
                <a
                  href={guest.invitation_link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {guest.invitation_link}
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default GuestTable;
