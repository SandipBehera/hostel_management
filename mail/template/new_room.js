const connection = require("../../utils/database");

exports.RoomAssigend = async (studentName, HostelName, RoomNo, callback) => {
  const Auth = req.session.Auth;
  const connect = await connection(Auth);
  const query = `SELECT * FROM hms_rooms WHERE id = ${HostelName}`;
  const query2 = `SELECT * FROM hms_users WHERE userId = ?`;

  connect.query(query, (err, result) => {
    if (err) {
      console.log(err);
      callback(err, null);
    } else {
      connect.query(query2, [studentName], (err, result2) => {
        if (err) {
          console.log(err);
          callback(err, null);
        } else {
          console.log(result2[0].email);
          const content = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="text-align: center;">Room Assigned</h1>
        <p>Dear ${result2[0].name},</p>

        <p>We are pleased to inform you that a room has been assigned to you for your upcoming <strong>[event/program/meeting]</strong> scheduled on <strong>[date]</strong>.</p>

        <h3>Room Details:</h3>
        <ul>
            <li><strong>Hostel Name:</strong> ${result[0].hostel_name}</li>
            <li><strong>Room Number:</strong> ${RoomNo}</li>
        </ul>

        <p>Please find below additional information regarding the room and the event:</p>
        <ul>
            <li><strong>Room Description:</strong> [Description of the Room]</li>
            <li><strong>Event Details:</strong> [Brief Description or Agenda of the Event]</li>
        </ul>

        <p>If you have any questions or require further assistance regarding the room assignment or the event, please feel free to contact us at <a href="mailto:[Contact Email]">[Contact Email]</a> or [Contact Phone Number].</p>

        <p>We look forward to hosting you and ensuring that your event runs smoothly.</p>

        <p>Best regards,<br>
        HMS Admin</p>
    </div>
    `;
          callback(null, content);
        }
      });
      connect.end();
    }
  });
};
