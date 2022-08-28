const e = require("express");

// The main.js file of your application
module.exports = function(app) {
    // GET login page
    app.get("/login", function (req, res) {
        req.session.username ? res.render("index.html") : res.render("login.html");
    });

    app.post('/login', (req, res) => {
        //Check if there is staff with same username and password in database
        let sqlquery = "SELECT * FROM Staff WHERE username = ? AND password = ?";
        let record = [req.body.E_id, req.body.password];
        db.query(sqlquery, record, (err, result) => {
            if (err) {
                console.log(err);
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
                console.log(req.session.roleid);
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
                    console.log(err);
                     res.redirect("/");
            }
                else
                    res.render("allClaims.html", { availableClaims: result });
            });
        }
        else
            res.redirect("/login");
    });

    app.post("/allClaims", function (req, res) {
        let buttonValue = req.body.claimButtons;
        if (buttonValue == 'New Claim' || buttonValue == 'Edit Claim') {
            let sqlquery = "SELECT Staff.Staff_id, Staff.Staff_name, Department.Department_name " +
                " From Staff" +
                " Join Department ON Staff.Dept_id = Department.Dept_id";
            // + " WHERE Staff_id = ?";
            db.query(sqlquery, (err, staffDetail) => {
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
                                        console.log(err); res.redirect("/allClaims");
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

    app.post("/editClaims", function (req, res) {
        const dateOfClaim = req.body.date + " 00:00:00";

        let date_ob = new Date();
        let date = date_ob.getDate();
        let month = date_ob.getMonth() + 1;
        let year = date_ob.getFullYear();
        let fullDate = year + "-" + month + "-" + date + " 00:00:00";
        // prints date & time in YYYY-MM-DD format
        console.log(fullDate);
        let values;
        console.log(req.body.newClaimButtons);
        let sqlquery = "UPDATE Claim SET CT_id = ?, date_submitted = ?, claim_amount = ?, date_of_claim = ?, status = ? " +
                       "WHERE claim_id = ?";

        if (req.body.newClaimButtons == "Submit Claim") {
            values = [req.body.claimType, fullDate, req.body.claimAmount, dateOfClaim, "Pending Approval", req.body.claim_id];
        }
        if (req.body.newClaimButtons == "Save as Draft") {
            values = [req.body.claimType, req.body.staffID, fullDate, req.body.claimAmount, dateOfClaim, "Saved As Draft", req.body.claim_id];
        }
        if (req.body.newClaimButtons == "Cancel") {
            res.redirect("/allClaims");
            return;
        }
        console.log(values);
        db.query(sqlquery, values, (err, result) => {
            if (err) {
                res.redirect("/");
                console.log(err);
            }
            else {
                res.redirect("/allClaims");
            }
        });
    });

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

    app.post("/feedback_submitted", function (req, res) {
        // saving data in database
        let sqlquery = "Insert into feedback (name, email, feedback) values (?,?,?)";
        let newrecord = [req.body.name, req.body.email, req.body.feedback];
        db.query(sqlquery, newrecord, (err, result) => {
            if (err) res.redirect("/");
            else {
                res.render("feedback.html", { text: "hi" });
            }
        });
    });

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

    app.post("/newClaims", function (req, res) {
        const dateOfClaim = req.body.date + " 00:00:00";

        let date_ob = new Date();
        let date = date_ob.getDate();
        let month = date_ob.getMonth() + 1;
        let year = date_ob.getFullYear();
        let fullDate = year + "-" + month + "-" + date + " 00:00:00";
        // prints date & time in YYYY-MM-DD format
        console.log(fullDate);
        let values;
        console.log(req.body.newClaimButtons);
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
        console.log(values);
        db.query(sqlquery, values, (err, result) => {
            if (err) {
                res.redirect("/");
                console.log(err);
            }
            else {
                res.redirect("/allClaims");
            }
        });
    });
}
    