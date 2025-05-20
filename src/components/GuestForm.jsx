import { useState, useEffect } from "react";
import { TextField, Button, Checkbox, FormControlLabel } from "@mui/material";

export default function GuestForm({ onSave, initialData = {}, onCancel }) {
  const [form, setForm] = useState({
    group_name: "",
    guest_name: "",
    partner: false,
    ...initialData,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
    >
      <TextField
        fullWidth
        name="group_name"
        label="Group"
        value={form.group_name}
        onChange={handleChange}
        margin="normal"
      />
      <TextField
        fullWidth
        name="guest_name"
        label="Guest Name"
        value={form.guest_name}
        onChange={handleChange}
        margin="normal"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={form.partner}
            onChange={() => setForm({ ...form, partner: !form.partner })}
          />
        }
        label="With Partner"
      />
      <Button type="submit" variant="contained" sx={{ mt: 2 }}>
        Save
      </Button>
      {onCancel && (
        <Button onClick={onCancel} sx={{ mt: 2, ml: 1 }}>
          Cancel
        </Button>
      )}
    </form>
  );
}
