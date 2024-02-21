let express = require("express");
let app = express();
let scheduleFuncs = require("./scheduleFuncs");
let port = process.env.PORT || 8080;
app.set("view engine", "ejs");
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));
app.use(express.static('views'));

app.get("/editSchedule",(req,res)=>{
        res.render("scheduleForm");
    
    });

app.post("/editSchedule",(req,res)=>{
    scheduleFuncs.scheduleReq(req.body).then((data)=>{
        res.render("scheduleForm");
    }).catch(err=>console.log(err));
  
    });
    
    app.get("/newEmployee",(req,res)=>{
        res.render("newEmployee",);
    });

    app.get("/createAccount",(req,res)=>{
        res.render("createAccount",);
    });

    
    app.get("/errorCreateAccount",(req,res)=>{
        res.render("errorCreateAccount",);
    });

    app.post("/createAccount",(req,res)=>{
        scheduleFuncs.createUser(req.body).then((data)=>{
            res.render("loginOrCreate");     
        }).catch(err=>{
            console.log(err);
            res.render("errorCreateAccount");
        })
        
    });


app.post("/newEmployee",(req,res)=>{
    scheduleFuncs.newWorker(req.body).then((data)=>{
        res.render("newEmployee",);
    }).catch(err=>console.log(err));
  
    });

    app.get("/findEmployee",(req,res)=>{
        res.render("findEmployee",);
    });

    app.post("/findEmployee", (req, res) => {
        scheduleFuncs.findEmployee(req.body).then((data) => {
            if (data) {
                const employeeToEdit = data[0].employees; 
                res.render("editEmployee", { workerToEdit: employeeToEdit });
            } 
        }).catch(err => {
          res.render("errorEmployee");
        });
    });
    

    app.post("/editEmployee", (req, res) => {
        scheduleFuncs.editEmployee(req.body).then((data) => {
            res.render("home");
        }).catch(err => console.log(err));
    });
 
    
    app.get("/currentSchedule",(req,res)=>{
        scheduleFuncs.makeSchedule().then((schedule)=>{
         res.render("finalSchedule",{data:schedule});
        })
     });

     app.get("/",(req,res)=>{
         res.render("loginOrCreate");
     });

     app.post("/",(req,res)=>{
        scheduleFuncs.validateCredentials(req.body).then((data)=>{
            console.log(scheduleFuncs.manager);
         res.redirect("/currentSchedule");
        }).catch((err)=>{
            res.render("errorLogin");  
        })
     });

     app.get("/newSchedule",(req,res)=>{
        scheduleFuncs.newSchedule();
        scheduleFuncs.makeSchedule().then((schedule)=>{
         res.render("finalSchedule",{data:schedule});
        })
     });

app.listen(port,()=>(console.log(`Standing by on port ${port}`)));