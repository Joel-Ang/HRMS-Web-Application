const e = require("express");

// The main.js file of your application
module.exports = function(app) {
    //GET login page
    app.get("/login", function (req, res) {
        req.session.username ? res.render("index.html") : res.render("login.html");
    });

    app.post('/login', (req, res) => {
        //Check if there is staff with same username and password in database
        let sqlquery = "SELECT * FROM Staff WHERE username = ? AND password = ?";
        let record = [req.body.E_id, req.body.password];
        db.query(sqlquery, record, (err, result) => {
            if (err) {
                res.redirect("/");               
            }
            else {
                //Check if there is anything in result
                if (result.length != 0) {
                    //Create session
                    session = req.session;
                    //Add username, staffid and roleid 
                    session.username = req.body.E_id;
                    session.roleid = result[0].Role_id;
                    session.staffid = result[0].Staff_id;
                    session.loginTime = new Date();
                    res.redirect("/");
                }
                else {
                    res.redirect("/login"/*, {error: "Incorrect username or password"}*/);
                }
            }
        });
    })
    
    //GET logout page
    app.get('/logout', (req, res) => {
        //Removes session when logging out
        req.session.destroy();
        res.redirect('/');
    });

    // GET index
    app.get("/",function(req, res) {
      // Use this if else statement to check if user is still logged in 
      if (req.session.username) {
        // select username and name
        let sqlquery = "SELECT Staff_name, username FROM Staff WHERE username = ?";

        db.query(sqlquery, req.session.username, (err, result) => {
          if (err) {
            res.redirect("/");               
          }
          else {
              //loginTime.setDate(loginTime.getDate() - 1);
              res.render("index.html", { results: result});
          }
        });
      }
      else
          res.redirect("/login");
    }); 

    // GET Register page
    app.get("/register", function (req, res) {
        if (req.session.username) { 
            //check if roles are admin
            if (req.session.roleid == 1) {
                let sqldepartmentquery = "Select * from department";
                let sqlrolequery = "Select * from role";
                db.query(sqldepartmentquery, (err, departmentResult) => {
                    if (err) res.redirect("/");
                    else {
                        db.query(sqlrolequery, (err, roleResult) => {
                            if (err) res.redirect("/");
                            else {
                                res.render("register.html", { availableDepartment: departmentResult, availableRole: roleResult });
                            }
                        });
                    }
                });
            }
            else
                res.redirect("/");
        }
        else
            res.redirect("/login");
    });

    //POST Register page
    app.post("/registered", function (req, res) {
        // saving data in database
        let sqlquery = "Insert into staff (Dept_id, Role_id, Staff_name, email, address, username, password) values (?,?,?,?,?,?,?)";
        let newrecord = [req.body.dept, req.body.role, req.body.name, req.body.email, req.body.address, req.body.username, req.body.password];
        db.query(sqlquery, newrecord, (err, result) => {
            if (err) res.redirect("/");
            else {
                res.send("Record: " + req.body.dept + " " + req.body.role + " " + req.body.name + " " + req.body.email + " " + req.body.address + " " + req.body.username + " " + req.body.password);
            }
        });
    });

    // GET allLeaves page
    app.get("/allLeaves", function (req, res) {
      if (req.session.username) {
          let sqlquery =  " SELECT Leave_.Leave_id, Staff.Staff_name, Department.Department_name, Leave_Reason.reason, Leave_.date_requested, Leave_.start_date, Leave_.end_date, Leave_.status" +
                          " FROM Leave_" +
                          " JOIN Staff ON Leave_.Staff_id = Staff.Staff_id" +
                          " JOIN Department ON Staff.Dept_id = Department.Dept_id" +
                          " JOIN Leave_Reason ON Leave_.LR_id = Leave_Reason.LR_id" +
                          " WHERE username = ?";

          db.query(sqlquery, req.session.username, (err, result) => {
              if (err) res.redirect("/");
              else {
                res.render("allLeaves.html", { availableLeaves: result });
              }
          });
      }
      else
        res.redirect("/login");
    });

    // GET addLeave page
    app.get("/addLeave",function(req, res) {
        if (req.session.username) {
            let sqlquery = "SELECT Staff_name FROM Staff WHERE username = ?";
            
            db.query(sqlquery, req.session.username, (err, result) => {
                if (err) res.redirect("/allLeaves");
                else {
                    res.render("addLeave.html", { name: result });
                }
            });
        }
        else
            res.redirect("/login");
    });

    // POST addLeave page
    app.post("/addLeave", function (req, res) {
        if (req.session.username) {
            // set request date to today's date
            const requestdate = new Date();
            
            var statusVal;
            if (req.body.newLeaveBtn == 'Submit') statusVal = 'Pending';
            else if (req.body.newLeaveBtn == 'Save as draft') statusVal = 'Saved as Draft';

            let sqlquery = "INSERT INTO Leave_ (Staff_id, LR_id, date_requested, start_date, end_date, status) VALUES (?,?,?,?,?,?)";
            let temprecord = [session.roleid, req.body.requestreason, requestdate, req.body.startdate, req.body.enddate, statusVal]

            // execute sql query
            db.query(sqlquery, temprecord, (err, result) => {
                (err) ? res.redirect("/addLeave") : res.redirect("/allLeaves");
            });
        }

        else
            res.redirect("/login");
    })

    // GET deleteleave
    app.get("/deleteLeave", function (req, res) {
        if (req.session.username) {
            let sqlquery = "DELETE FROM Leave_ WHERE Leave_id = ?";

            db.query(sqlquery, req.query.id, (err, result) => {
                res.redirect("/allLeaves");
            });
        }

        else 
            res.redirect("/login");
    });

    // GET editLeave page
    app.get("/editLeave", function (req, res) {
      if (req.session.username) {
          let sqlquery =  " SELECT Leave_.Leave_id, Staff.Staff_name, Department.Department_name, Leave_Reason.reason, Leave_.date_requested, Leave_.start_date, Leave_.end_date, Leave_.status" +
                          " FROM Leave_" +
                          " JOIN Staff ON Leave_.Staff_id = Staff.Staff_id" +
                          " JOIN Department ON Staff.Dept_id = Department.Dept_id" +
                          " JOIN Leave_Reason ON Leave_.LR_id = Leave_Reason.LR_id" +
                          " WHERE Leave_id = ?";

          db.query(sqlquery, req.query.id, (err, result) => {
              if (err) {
                  res.redirect("/allLeaves");
              }
              else {
                  res.render("editLeave.html", { availableLeaves: result });
              }
          });
      }

      else 
          res.redirect("/login");
    });

    app.post("/editLeave", function (req, res) {
        if (req.session.username) {
            let updateLeave = "UPDATE Leave_ SET LR_id = ?, start_date = ?, end_date = ? WHERE Leave_id = ?";
            var leaveParam = [req.body.requestreason, req.body.startdate, req.body.enddate, req.body.leaveid]

            db.query(updateLeave, leaveParam, function (err, result) {
                if (err) {
                    res.redirect("/allLeaves");
                }
                else {
                    res.redirect("/allLeaves");
                }
            })
        }

        else
            res.redirect("/login");
    })
    
    //POST Register page
    app.post("/registered", function (req, res) {
        // saving data in database
        let sqlquery = "Insert into staff (Dept_id, Role_id, Staff_name, email, address, username, password) values (?,?,?,?,?,?,?)";
        let newrecord = [req.body.dept, req.body.role, req.body.name, req.body.email, req.body.address, req.body.username, req.body.password];
        db.query(sqlquery, newrecord, (err, result) => {
            if (err) res.redirect("/");
            else {
                res.send("Record: " + req.body.dept + " " + req.body.role + " " + req.body.name + " " + req.body.email + " " + req.body.address + " " + req.body.username + " " + req.body.password);
            }
        });
    });

    //GET Claims Page
    app.get("/allClaims", function (req, res) {
        if (req.session.username){
            let sqlquery = "SELECT Claim.claim_id, DATE_FORMAT(Claim.date_submitted, '%D-%M-%Y') AS date_submitted, DATE_FORMAT(Claim.date_of_claim, '%D-%M-%Y') AS date_of_claim, Claim_Type.type, Claim.claim_amount, Claim.status" +
                " FROM Claim" +
                " JOIN Staff ON Claim.Staff_id = Staff.Staff_id" +
                " JOIN Claim_Type ON Claim.CT_id = Claim_Type.CT_id" +
                " WHERE Staff.Staff_id = ?";
            let staffid = [req.session.staffid];
            db.query(sqlquery, staffid, (err, result) => {
                if (err)
                {
                    res.redirect("/");
                }
                else
                    res.render("allClaims.html", { availableClaims: result });
            });
        }
        else
            res.redirect("/login");
    });

    //POST All Claims Page
    app.post("/allClaims", function (req, res) {
        let buttonValue = req.body.claimButtons;
        if (buttonValue == 'New Claim' || buttonValue == 'Edit Claim') {
            let sqlquery = "SELECT Staff.Staff_id, Staff.Staff_name, Department.Department_name " +
                " From Staff" +
                " Join Department ON Staff.Dept_id = Department.Dept_id" +
                " WHERE Staff_id = ?";
            let staffid = [req.session.staffid];
            db.query(sqlquery, staffid, (err, staffDetail) => {
                if (err) res.redirect("/allClaims");
                else {
                    let sqlclaimquery = "Select * from Claim_type";
                    db.query(sqlclaimquery, (err, claimType) => {
                        if (err) res.redirect("/allClaims");
                        else {
                            if (buttonValue == 'New Claim') {
                                res.render('newClaim.html', { staffDetails: staffDetail, claimTypes: claimType });
                            }
                            if (buttonValue == 'Edit Claim') {
                                let sqlclaimdetailquery = "SELECT Claim.claim_id, DATE_FORMAT(Claim.date_of_claim, '%Y-%m-%d') AS date_of_claim, Claim.CT_id, Claim.claim_amount " +
                                                          "FROM Claim " + 
                                                          "WHERE Claim.claim_id = ?";
                                let claimsid = [req.body.checkbox[0]];
                                db.query(sqlclaimdetailquery, claimsid, (err, claimDetail,) => {
                                    if (err) {
                                        res.redirect("/allClaims");
                                    }
                                    else {
                                        res.render('editClaim.html', { staffDetails: staffDetail, claimTypes: claimType, claimDetails: claimDetail })
                                    }
                                });
                                
                            }
                        }
                    });
                }
            });
        }
        else if (buttonValue == 'Delete Claim') {
            //Get all checked checkboxes
            let claimsid = req.body.checkbox;
            let sqlquery = "DELETE FROM Claim WHERE Claim_id = ? and Staff_id = ? " 
            //Loop Through claimsid to delete selected claims
            for (let i in claimsid) {
                let newrecord = [claimsid[parseInt(i)], req.session.staffid];
                db.query(sqlquery, newrecord, (err, result) => {
                    if (err) {
                        res.redirect("/");
                    }
                });
            }
            res.redirect("/allClaims");
            
        }
        else {
            res.redirect("/allClaims");
        }   

    });

    //POST Edit Claims Page
    app.post("/editClaims", function (req, res) {
        const dateOfClaim = req.body.date + " 00:00:00";

        let date_ob = new Date();
        let date = date_ob.getDate();
        let month = date_ob.getMonth() + 1;
        let year = date_ob.getFullYear();
        let fullDate = year + "-" + month + "-" + date + " 00:00:00";
        let values;
        let sqlquery = "UPDATE Claim SET CT_id = ?, date_submitted = ?, claim_amount = ?, date_of_claim = ?, status = ? " +
                       "WHERE claim_id = ?";

        if (req.body.newClaimButtons == "Submit Claim") {
            values = [req.body.claimType, fullDate, req.body.claimAmount, dateOfClaim, "Pending Approval", req.body.claim_id];
        }
        if (req.body.newClaimButtons == "Save as Draft") {
            values = [req.body.claimType, fullDate, req.body.claimAmount, dateOfClaim, "Saved As Draft", req.body.claim_id];
        }
        db.query(sqlquery, values, (err, result) => {
            if (err) {
                res.redirect("/allClaims");
            }
            else {
                res.redirect("/allClaims");
            }
        });
    });

    //GET feedback page
    app.get("/feedback", function (req, res) {

        if (req.session.username) {
            let sqlquery = "Select * FROM staff WHERE Staff_id = ?";
            let staffid = [req.session.staffid];

            db.query(sqlquery, staffid, (err, result) => {
                if (err) {
                    res.redirect("/");
                }
                else
                    res.render("feedback.html", { staffDetails: result });
            });
        }
        else
            res.render("login.html");

    });

    //POST Feedback Submitted Page
    app.post("/feedback_submitted", function (req, res) {
        // saving data in database
        if (req.session.username) {
            let sqlquery = "Insert into feedback (name, email, feedback) values (?,?,?)";
            let newrecord = [req.body.name, req.body.email, req.body.feedback];
            db.query(sqlquery, newrecord, (err, result) => {
                if (err) res.redirect("/");
                else {
                    let messages = "Feedback has been submitted";
                    res.redirect("/feedback");
                }
            });
        }
        else
            res.render("login.html");
    });

    //GET All Feedbacks Page
    app.get("/allFeedbacks", function (req, res) {

        if (req.session.username) {
            let sqlquery = "Select * FROM feedback";

            db.query(sqlquery, (err, result) => {
                if (err) {
                    res.redirect("/");
                }
                else
                    res.render("allFeedbacks.html", { allFeedbacks: result });
            });
        }
        else
            res.render("login.html");

    });

    //GET Delete Feedback Page
    app.get("/deleteFeedback", function (req, res) {
        if (req.session.username) {
            let sqlquery = "DELETE FROM Feedback WHERE Feedback_id = ?";

            db.query(sqlquery, req.query.id, (err, result) => {
                res.redirect("/allFeedbacks");
            });
        }

        else
            res.redirect("/login");
    });

    //POST New Claims Page
    app.post("/newClaims", function (req, res) {
        const dateOfClaim = req.body.date + " 00:00:00";

        let date_ob = new Date();
        let date = date_ob.getDate();
        let month = date_ob.getMonth() + 1;
        let year = date_ob.getFullYear();
        let fullDate = year + "-" + month + "-" + date + " 00:00:00";
        let values;
        let sqlquery = "INSERT INTO Claim (CT_id, Staff_id, date_submitted, claim_amount, date_of_claim, status) values (?,?,?,?,?,?)";

        if (req.body.newClaimButtons == "Submit Claim") {
            values = [req.body.claimType, req.body.staffID, fullDate, req.body.claimAmount, dateOfClaim, "Pending Approval"];
        }
        if (req.body.newClaimButtons == "Save as Draft") {
            values = [req.body.claimType, req.body.staffID, fullDate, req.body.claimAmount, dateOfClaim, "Saved As Draft"];
        }
        if (req.body.newClaimButtons == "Cancel") {
            res.redirect("/allClaims");
            return;
        }
        db.query(sqlquery, values, (err, result) => {
            if (err) {
                res.redirect("/");
            }
            else {
                res.redirect("/allClaims");
            }
        });
    });

    //GET timetracker page
    app.get("/timetracker",function(req, res) {
      if (req.session.username) {
        let sqlquery = "SELECT Staff_id, Staff_name FROM Staff";
        
        db.query(sqlquery, (err, result) => {
          if (err) {
            res.redirect("/");
          }
          else {
              res.render("timetracker.html", { staffs: result });
          }
        });

      }
      else
          res.render("login.html");
    });

    //POST timetracked page
    app.post("/timetracked", function (req, res) {
        let sqlquery, newrecord;

        // Clock in button pressed
        if (req.body.clockBtn == 'Clock In') {
          sqlquery = "INSERT INTO Punch_Card (Staff_id, date, clock_in_time, clock_out_time, break_hours) VALUES (?,?,?,?,?)";
          newrecord = [req.body.staffName, new Date(), new Date(), "0000-00-00 00:00:00", 1];
        }

        // Clock out button pressed
        else if (req.body.clockBtn == 'Clock Out') {
          sqlquery = "UPDATE Punch_Card SET clock_out_time = ? WHERE clock_out_time = ? AND Staff_id = ?";
          newrecord = [new Date(), "0000-00-00 00:00:00", req.body.staffName];
        }

        db.query(sqlquery, newrecord, (err, result) => {
            if (err) {
              res.redirect("/timetracker");
            }
            else {
              res.redirect("/timetracker");
            }
        });
    });

    //GET allpayslips page
    app.get("/allPayslips", function (req, res) {

        if (req.session.username) {
            let values = [req.session.staffid];
            sqlquery2 = "SELECT DISTINCT(DATE_FORMAT(date, '%m %Y')) AS Date FROM punch_card WHERE Staff_id = ? ORDER BY date ASC"
            db.query(sqlquery2, values, (err, DDLDates) => {
                if (err) {
                    res.redirect("/");
                }
                else {
                    res.render("allPayslips.html", { allPunchCards: [], allDropdownDates: DDLDates });
                }
            });
        }
        else
            res.render("login.html");

    });
    //POST All Payslips Page
    app.post("/allPayslips", function (req, res) {

        if (req.session.username) {
            let MY = req.body.DDLDates.trim().split(/\s+/);
            let values = [req.session.staffid, MY[0], MY[1]];
            let sqlquery1 = "Select PC_id, date, CAST(clock_in_time AS TIME) AS CIT, CAST(clock_out_time AS TIME) AS COT, break_hours, TIMEDIFF(clock_out_time,clock_in_time) AS TotalHours " +
                "FROM punch_card " +
                "WHERE staff_id = ? AND MONTH(date) = ? AND YEAR(date) = ? " +
                "ORDER BY date ASC";
            db.query(sqlquery1, values, (err, PCDates) => {
                if (err) {
                    res.redirect("/");
                }
                else {
                    sqlquery2 = "SELECT DISTINCT(DATE_FORMAT(date, '%m %Y')) AS Date FROM punch_card WHERE Staff_id = ? ORDER BY date ASC"
                    db.query(sqlquery2, values, (err, DDLDates) => {
                        if (err) {
                            res.redirect("/");
                        }
                        else {
                            let sqlquery3 = "Select SEC_TO_TIME(sum(TIME_TO_SEC(clock_out_time) - TIME_TO_SEC(clock_in_time))) as TotalTimeDiff, SUM(break_hours) AS TotalBreakHours,  from punch_card where MONTH(date) = ?"
                            res.render("allPayslips.html", { allPunchCards: PCDates, allDropdownDates: DDLDates });
                        }
                    });
                }
            });
        }
        else
            res.render("login.html");

    });

    // GET about us page
    app.get("/aboutus", function (req, res) {
        req.session.username ? res.render("aboutus.html") : res.render("login.html");
    });
}
    