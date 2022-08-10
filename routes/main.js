const e = require("express");

// The main.js file of your application
module.exports = function(app) {
    
    app.get("/",function(req, res) {
        //Use this if else statement to check if user is still logged in 
        if (req.session.username)
            res.render("index.html");
        else
            res.redirect("/login");
    }); 

    app.get("/login", function (req, res) {
        if (req.session.username)
            res.render("index.html");
        else
            res.render("login.html");
    });

    app.post('/login', (req, res) => {
        //Check if there is staff with same username and password in database
        let sqlquery = "SELECT * FROM staff WHERE username = ? AND password = ?";
        let record = [req.body.E_id, req.body.password];
        db.query(sqlquery, record, (err, result) => {
            if (err) {
                console.log(err);
                res.redirect("/");               
            }
            else
            {
                //Check if there is anything in result
                if (result.length != 0) {
                    //Create session
                    session = req.session;
                    //Add username and roleid 
                    session.username = req.body.E_id;
                    session.roleid = result[0].Role_id;
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

    app.get("/homepage",function(req, res) {
        if (req.session.username)
            res.render("homepage.html");
        else
            res.render("login.html");
        
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
      
      let sqlquery = "INSERT INTO Leave_ (Staff_id, LR_id, date_requested, start_date, end_date, status)" +
                      " VALUES (?,?,?,?,?,'Pending')";
      let temprecord = [session.roleid, req.body.requestreason, requestdate, req.body.startdate, req.body.enddate]

      // execute sql query
      db.query(sqlquery, temprecord, (err, result) => {
          if (err) {
            console.log(err);
            res.redirect("/addLeave");
          } 
          else {
            res.redirect("/allLeaves");
          }
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
    if(req.session.username) {
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
  });

}