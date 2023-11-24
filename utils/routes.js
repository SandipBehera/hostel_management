const Express = require("express");
const router = Express.Router();

const userController = require("../controllers/user.ctrl");
const foodyController = require("../controllers/foody.ctrl");
const roomController = require("../controllers/room.ctrl");
//app Routes
router.post("/login", userController.login);

router.post("/food_booking", foodyController.book);
router.post("/getCodes", foodyController.getCodes);
router.post("/checkcode", foodyController.checkCode);

//web App Routes
router.post("/web_login", userController.web_login);
router.get("/users/:userId", userController.users);
router.get("/logout/:userId", userController.logout);

//hostel Management
router.post("/onboard_users", userController.Hostel_Onboard_Request);
router.get("/get_all_users", userController.getAllUser);

//room Management
router.post("/create_rooms", roomController.create_rooms);
router.get("/get_rooms", roomController.getRooms);
router.post("/assign_rooms", roomController.Assign_rooms);

//Attendance Management
router.post("/get_student_by_room", roomController.Get_Student_By_Room);
router.post("/mark_attendance", roomController.Take_Attendance);

module.exports = router;
