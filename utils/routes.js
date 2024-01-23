const Express = require("express");
const router = Express.Router();

const userController = require("../controllers/user.ctrl");
const foodyController = require("../controllers/foody.ctrl");
const roomController = require("../controllers/room.ctrl");
const complaintsController = require("../controllers/complaints.ctrl");
const PatientController = require("../controllers/health.ctrl");
const OutingController = require("../controllers/outing.ctrl");
const EmployeeController = require("../controllers/employee.ctrl");
const HostelConfigController = require("../controllers/hostelConfig.ctrl");
const stockController = require("../controllers/stocks.ctrl");
const AccountsController = require("../controllers/account.ctrl");

//app Routes
router.post("/login", userController.login);

router.post("/food_booking", foodyController.book);
router.post("/getCodes", foodyController.getCodes);
router.post("/checkcode", foodyController.checkCode);
router.post("/food_allocate", foodyController.food_booking_history);

//web App Routes
router.post("/web_login", userController.web_login);
router.get("/get_session", userController.get_session);
router.get("/users/:userId/campus/:campus_name", userController.users);
router.get("/logout/:userId", userController.logout);

//hostel Management
router.post("/onboard_users", userController.Hostel_Onboard_Request);
router.get("/get_all_users", userController.getAllUser);
router.post("/employee_onboard", userController.hostel_employee);
router.post("/profile_info", userController.profile_info);
router.post("/remove_user", userController.RemoveUser);

//room Management
router.post("/create_rooms", roomController.create_rooms);
router.get("/get_rooms", roomController.getRooms);
router.get("/get_student_room/:branch_id", roomController.get_student_room);
router.post("/assign_rooms", roomController.Assign_rooms);
router.delete("/delete_rooms/:id", roomController.delete_room);
router.post("/update_hostel/:id", roomController.update_room);

//Attendance Management
router.post("/get_student_by_room", roomController.Get_Student_By_Room);
router.post("/mark_attendance", roomController.Take_Attendance);
router.post("/get_attendence", roomController.Today_Attendance);
router.post("/update_attendence", roomController.updateAttandance);

//food menu
router.post("/create_food_menu", foodyController.create_food_menu);
router.get("/get_last_menu", foodyController.get_last_menu);
router.get("/get_all_menu", foodyController.get_all_menu);
router.get("/today_booking", foodyController.today_bookings);
router.post("/update_menu", foodyController.update_menu);
router.post("/delete_menu", foodyController.delete_menu);

//complaints
router.post("/create_complaint", complaintsController.create_complaint);
router.get("/get_complaints", complaintsController.get_complaints);
router.post("/update_complaint", complaintsController.update_complaint);
router.get(
  "/get_complaints_by_id/:id",
  complaintsController.get_complaints_by_id
);

//health
router.post("/add_patient", PatientController.add_patient);
router.get("/getAllPatient", PatientController.getAllPatient);

//outing
router.post("/add_outing", OutingController.add_outing);
router.get("/get_outing", OutingController.get_outing);
router.post("/approve_outing/:id", OutingController.approve_outing);

//employee
router.get("/getEmployee", EmployeeController.getEmployee);
router.post("/addEmployee", EmployeeController.addEmployee);
router.post("/updateEmployee", EmployeeController.updateEmployee);
router.post("/assignHostel", EmployeeController.assignHostel);
router.get("/checkEmployeeId/:employeeId", EmployeeController.checkEmployeeId);

//Hostel Config
router.get("/getAllConfigs", HostelConfigController.getAllConfigs);
router.post("/addConfig", HostelConfigController.addConfig);
router.get(
  "/get_config_by_type/:config_type",
  HostelConfigController.getConfigByType
);

//stock Managment
router.post("/add_stock", stockController.addStock);
router.post("/create_item", stockController.createItem);
router.get("/get_items", stockController.getItems);
router.get("/get_stock", stockController.getAllStocks);

//Accounts
router.post("/create_fine", AccountsController.createFine);
router.get("/get_fine/:branch_id", AccountsController.getFine);

module.exports = router;
