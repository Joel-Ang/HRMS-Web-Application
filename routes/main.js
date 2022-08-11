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
                    //Add username, staffid and roleid 
                    session.username = req.body.E_id;
                    session.roleid = result[0].Role_id;
                    session.staffid = result[0].Staff_id;
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

    app.get("/allLeaves", function (req, res) {
        if (req.session.username) {
            let sqlquery = "SELECT Staff.Staff_name, Department.Department_name, Leave_Reason.reason, Leave_.date_requested, Leave_.start_date, Leave_.end_date, Leave_.status" +
                            " FROM Leave_" +
                            " JOIN Staff ON Leave_.Staff_id = Staff.Staff_id" +
                            " JOIN Department ON Staff.Dept_id = Department.Dept_id" +
                            " JOIN Leave_Reason ON Leave_.LR_id = Leave_Reason.LR_id" +
                            " WHERE Staff_name = 'John Tan'";

            db.query(sqlquery, (err, result) => {
                if (err) res.redirect("/");
                else {
                    res.render("allLeaves.html", { availableLeaves: result });
                }
            });
        }
        else
            res.redirect("/login");
    });

    app.get("/addLeave",function(req, res) {
        if (req.session.username)
            res.render("addLeave.html");
        else
            res.redirect("/login");
    });

    app.post("/addLeave", function (req, res) {
        // leave_id (auto), Staff_id, LR_id, date_requested, start_date, end_date, status (pending by default)
        let sqlquery = "INSERT INTO Leave_ (Staff_id, LR_id, date_requested, start_date, end_date, status)" +
                        " VALUES (2,?,?,?,?,'Pending')";
        let temprecord = [req.body.requestreason, req.body.requestdate, req.body.startdate, req.body.enddate]
        // let newrecord = [req.body.name, req.body.department, req.body.requestdate, req.body.requestreason, req.body.startdate, req.body.enddate];

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
    })

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
        if (buttonValue == 'New Claim') {
            let sqlquery = "SELECT Staff.Staff_id, Staff.Staff_name, Department.Department_name " +
                " From Staff" +
                " Join Department ON Staff.Dept_id = Department.Dept_id";
            // + " WHERE Staff_id = ?";
            db.query(sqlquery, (err, staffDetail) => {
                if (err) res.redirect("/");
                else {
                    let sqlclaimquery = "Select * from Claim_type";
                    db.query(sqlclaimquery, (err, claimType) => {
                        if (err) res.redirect("/");
                        else {
                            console.log(claimType[0]);
                            res.render('newClaim.html', { staffDetails: staffDetail, claimTypes: claimType });
                        }
                    });

                }
            });
        }
        else if (buttonValue == 'Edit Claim') {
            //res.render('editClaim.html');
        }
        else if (buttonValue == 'Delete Claim') {

        }
        else {
            res.render("allClaims.html");
        }

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
        if (req.body.newClaimButtons == "Cancel"){
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