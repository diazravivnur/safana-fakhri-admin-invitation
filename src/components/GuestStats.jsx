import { Box, Typography, useTheme } from "@mui/material";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function GuestStats({
  totalInvitees,
  attendedInvitees,
  totalPax,
  attendedPax,
}) {
  const theme = useTheme();

  const inviteePercent = totalInvitees
    ? Math.round((attendedInvitees / totalInvitees) * 100)
    : 0;
  const paxPercent = totalPax ? Math.round((attendedPax / totalPax) * 100) : 0;

  return (
    <Box
      sx={{
        display: "flex",
        gap: 4,
        mb: 4,
        justifyContent: "center",
        flexWrap: "wrap",
      }}
    >
      {/* Invitee Progress */}
      <Box sx={{ textAlign: "center" }}>
        <Box sx={{ width: 120, height: 120, mx: "auto" }}>
          <CircularProgressbar
            value={inviteePercent}
            text={`${inviteePercent}%`}
            styles={buildStyles({
              pathColor: theme.palette.primary.main,
              textColor: theme.palette.text.primary,
              trailColor: "#e0e0e0",
            })}
          />
        </Box>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {attendedInvitees} / {totalInvitees} Invitees
        </Typography>
      </Box>

      {/* PAX Progress */}
      <Box sx={{ textAlign: "center" }}>
        <Box sx={{ width: 120, height: 120, mx: "auto" }}>
          <CircularProgressbar
            value={paxPercent}
            text={`${paxPercent}%`}
            styles={buildStyles({
              pathColor: theme.palette.success.main,
              textColor: theme.palette.text.primary,
              trailColor: "#e0e0e0",
            })}
          />
        </Box>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {attendedPax} / {totalPax} PAX
        </Typography>
      </Box>
    </Box>
  );
}
