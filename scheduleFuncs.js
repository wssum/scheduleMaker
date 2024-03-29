const mongoose = require('mongoose');
const schema = mongoose.Schema;
const db = mongoose.createConnection('mongodb+srv://wssum:7895123Zz@wssumcluster.mtthdw5.mongodb.net/managerAccounts')
const managerSchema = new schema({
  userName: {
    unique:true,
    type:String
  },
  passWord:String,
  employees: [{name: String,
    _id: false,
  daysAvailable:[{name: String, 
    from: Number, 
    to: Number,
    _id: false}]}],
schedule: [{
    day: String,
    _id: false,
    opener: [{name: String,
      _id: false,
      daysAvailable:[{name: String,
        _id: false, 
        from: Number, 
        to: Number}]}],
    closer: [{name: String,
      _id: false,
      daysAvailable:[{name: String,
        _id: false,
        from: Number, 
        to: Number}]}],
    allAround: [{name: String,
      _id: false,
      daysAvailable:[{name: String, 
        _id: false,
        from: Number, 
        to: Number}]}],
    openersRequired: Number,
    closersRequired: Number,
    allAroundsRequired: Number,
    open: Number,
    close: Number
  }],
  currentSchedule:[{
    day: String,
    _id: false,
    opener: [{name: String,
      _id: false,
      daysAvailable:[{name: String,
        _id: false, 
        from: Number, 
        to: Number}]}],
    closer: [{name: String,
      _id: false,
      daysAvailable:[{name: String,
        _id: false,
        from: Number, 
        to: Number}]}],
    allAround: [{name: String,
      _id: false,
      daysAvailable:[{name: String, 
        _id: false,
        from: Number, 
        to: Number}]}],
    openersRequired: Number,
    closersRequired: Number,
    allAroundsRequired: Number,
    open: Number,
    close: Number
  }]
});

const Managers = db.model("Managers",managerSchema);

let manager;

function validateCredentials(credentials) {
  manager = credentials.user;
  return new Promise((resolve, reject) => {
    Managers.findOne({ userName: credentials.user }).then((userInfo) => {
      if (userInfo && userInfo.passWord === credentials.pw) {
        resolve(userInfo); 
      } else {
        reject('Invalid credentials'); 
      }
    }).catch(err => {
      console.log(err);
      reject(err); 
    });
  });
}

function createUser(userInfo) {
  return new Promise((resolve,reject)=>{
    try{
      if(userInfo.pw === userInfo.pw2)
      {
        let workDays = [
          {
            opener: [],
            closer: [],
            allAround: [],
            day: "Sunday",
            allAroundsRequired: userInfo.sunAllAroundsRequired,
            openersRequired: userInfo.sunOpenersRequired,
            closersRequired: userInfo.sunClosersRequired,
            open: userInfo.sunOpen,
            close: userInfo.sunClose,
          },
          {
            opener: [],
            closer: [],
            allAround: [],
            day: "Monday",
            allAroundsRequired: userInfo.monAllAroundsRequired,
            openersRequired: userInfo.monOpenersRequired,
            closersRequired: userInfo.monClosersRequired,
            open: userInfo.monOpen,
            close: userInfo.monClose,
          },
          {
            opener: [],
            closer: [],
            allAround: [],
            day: "Tuesday",
            allAroundsRequired: userInfo.tuesAllAroundsRequired,
            openersRequired: userInfo.tuesOpenersRequired,
            closersRequired: userInfo.tuesClosersRequired,
            open: userInfo.tuesOpen,
            close: userInfo.tuesClose,
          },
          {
            opener: [],
            closer: [],
            allAround: [],
            day: "Wednesday",
            allAroundsRequired: userInfo.wedAllAroundsRequired,
            openersRequired: userInfo.wedOpenersRequired,
            closersRequired: userInfo.wedClosersRequired,
            open: userInfo.wedOpen,
            close: userInfo.wedClose,
          },
          {
            opener: [],
            closer: [],
            allAround: [],
            day: "Thursday",
            allAroundsRequired: userInfo.thursAllAroundsRequired,
            openersRequired: userInfo.thursOpenersRequired,
            closersRequired: userInfo.thursClosersRequired,
            open: userInfo.thursOpen,
            close: userInfo.thursClose,
          },
          {
            opener: [],
            closer: [],
            allAround: [],
            day: "Friday",
            allAroundsRequired: userInfo.friAllAroundsRequired,
            openersRequired: userInfo.friOpenersRequired,
            closersRequired: userInfo.friClosersRequired,
            open: userInfo.friOpen,
            close: userInfo.friClose,
          },
          {
            opener: [],
            closer: [],
            allAround: [],
            day: "Saturday",
            allAroundsRequired: userInfo.satAllAroundsRequired,
            openersRequired: userInfo.satOpenersRequired,
            closersRequired: userInfo.satClosersRequired,
            open: userInfo.satOpen,
            close: userInfo.satClose,
          }
        ];
     
        Managers.create({
          userName: userInfo.user,
          passWord:userInfo.pw,
          employees:[],
          schedule: workDays,
          currentSchedule:[]
        }).then(manager => {
          console.log('Manager created:', manager);
        }).catch(error => {
          console.error('Error creating manager:', error);
        }); 
        resolve();
      }
      else{
        reject();
      }
    }catch(err)
    {
      reject(err);
    }
  })
}


/*worker arg is for the worker in questions to see
  if the worker is available. workDay is to see if 
  that certain workDay is within the workers available
  days.*/
function whichShift(worker, workDay) {
  let shift = null;
  worker.daysAvailable.forEach((shiftDay) => {
      if (shiftDay.name.toLowerCase() === workDay.day.toLowerCase()) {
        /*Checks to see if worker should be an opener, closer or an all around
          which may also be used as a backup opener or closer. */
          if (shiftDay.from <= workDay.open && shiftDay.to < workDay.close) {
              if(workDay.opener.length < workDay.openersRequired)
              {
                  shift = "O";
              }
          } else if (shiftDay.from > workDay.open && shiftDay.to >= workDay.close) {
              if(workDay.closer.length < workDay.closersRequired)
              {
                  shift = "C";
              }

          } else if (shiftDay.from <= workDay.open && shiftDay.to >= workDay.close) {
              if(workDay.allAround.length < workDay.allAroundsRequired)
              {
                  shift = "A";
              }
              else if(workDay.closer.length < workDay.closersRequired)
              {
                  shift = "C";
              }
              else if(workDay.opener.length < workDay.openersRequired)
              {
                  shift = "O";
              }
          }
      }
  });
  return shift;
}

/*Takes the employee data of a manager and the schedule
  data of the manager and merges them together to make
  a schedule. */
function makeSchedule() {
  return Managers.findOne({ userName:  manager })
    .then(data => {
      let schedule = data.schedule;
      const workers = data.employees;
      /*Outter forEach loop controls which day is operated on
        and inner forEach loop goes over all the workers to
        see if they are available.*/
      schedule.forEach(date => {
        workers.forEach(worker => {
          const isAvailable = worker.daysAvailable.some(workerDay => workerDay.name.toLowerCase() === date.day.toLowerCase());
          
          if (isAvailable) {
            /*Below checks to see if the current worker could be an opener, closer or allarounder
              as well as checking to see if the worker has already been enlisted in the schedule yet.*/
            if ((whichShift(worker,date)== "A") && date.allAround.length < date.allAroundsRequired) {
                if(!date.allAround.some(workMan=>workMan.name === worker.name)&&
                !date.opener.some(workMan=>workMan.name === worker.name)&&
                !date.closer.some(workMan=>workMan.name === worker.name))
                {
                    date.allAround.push(worker);
                }
            }
            if ((whichShift(worker,date)== "O") && (date.opener.length < date.openersRequired)) {
              if(!date.allAround.some(workMan=>workMan.name === worker.name)&&
              !date.opener.some(workMan=>workMan.name === worker.name)&&
              !date.closer.some(workMan=>workMan.name === worker.name))
                {
                    date.opener.push(worker);  
                }
            } else if ((whichShift(worker,date)== "C") && (date.closer.length < date.closersRequired)) {
              if(!date.allAround.some(workMan=>workMan.name === worker.name)&&
              !date.opener.some(workMan=>workMan.name === worker.name)&&
              !date.closer.some(workMan=>workMan.name === worker.name))
                {
                    date.closer.push(worker);
                }
            }
            else if((date.allAround.length >=1)&&(date.opener.length === 0)&&(whichShift(worker,date)== "O"))
            {
              if(!date.allAround.some(workMan=>workMan.name === worker.name)&&
              !date.opener.some(workMan=>workMan.name === worker.name)&&
              !date.closer.some(workMan=>workMan.name === worker.name))
                {
                    date.opener.push(worker);  
                }
            }
            else if((date.allAround.length >=1)&&(date.opener.length === 0)&&(whichShift(worker,date)== "C"))
            {
              if(!date.allAround.some(workMan=>workMan.name === worker.name)&&
              !date.opener.some(workMan=>workMan.name === worker.name)&&
              !date.closer.some(workMan=>workMan.name === worker.name))
                {
                    date.closer.push(worker);
                }
            }
        }  
        });
      });
 
      Managers.updateOne({userName: manager}, {$set:{currentSchedule:schedule}})
  .then(result => console.log(result))
  .catch(error => console.log(error));
      return schedule;
    })
    .catch(error => {
      throw error;
    });
}


async function scheduleReq(daysOfWork)
{
  try{
    let workDays = [
      {
          opener: [],
          closer: [],
          allAround: [],
          day: "Sunday",
          allAroundsRequired: daysOfWork.sunAllAroundsRequired,
          openersRequired: daysOfWork.sunOpenersRequired,
          closersRequired: daysOfWork.sunClosersRequired,
          open: daysOfWork.sunOpen,
          close: daysOfWork.sunClose,
      },{
          opener: [],
          closer: [],
          allAround: [],
          day: "Monday",
          allAroundsRequired: daysOfWork.monAllAroundsRequired,
          openersRequired: daysOfWork.monOpenersRequired,
          closersRequired: daysOfWork.monClosersRequired,
          open: daysOfWork.monOpen,
          close: daysOfWork.monClose,
      },
      {
          opener: [],
          closer: [],
          allAround: [],
          day: "Tuesday",
          allAroundsRequired: daysOfWork.tuesAllAroundsRequired,
          openersRequired: daysOfWork.tuesOpenersRequired,
          closersRequired: daysOfWork.tuesClosersRequired,
          open: daysOfWork.tuesOpen,
          close: daysOfWork.tuesClose,
      },{
          opener: [],
          closer: [],
          allAround: [],
          day: "Wednesday",
          allAroundsRequired: daysOfWork.wedAllAroundsRequired,
          openersRequired: daysOfWork.wedOpenersRequired,
          closersRequired: daysOfWork.wedClosersRequired,
          open: daysOfWork.wedOpen,
          close: daysOfWork.wedClose,
      },{
          opener: [],
          closer: [],
          allAround: [],
          day: "Thursday",
          allAroundsRequired: daysOfWork.thursAllAroundsRequired,
          openersRequired: daysOfWork.thursOpenersRequired,
          closersRequired: daysOfWork.thursClosersRequired,
          open: daysOfWork.thursOpen,
          close: daysOfWork.thursClose,
      },{
          opener: [],
          closer: [],
          allAround: [],
          day: "Friday",
          allAroundsRequired: daysOfWork.friAllAroundsRequired,
          openersRequired: daysOfWork.friOpenersRequired,
          closersRequired: daysOfWork.friClosersRequired,
          open: daysOfWork.friOpen,
          close: daysOfWork.friClose,
      },{
          opener: [],
          closer: [],
          allAround: [],
          day: "Saturday",
          allAroundsRequired: daysOfWork.satAllAroundsRequired,
          openersRequired: daysOfWork.satOpenersRequired,
          closersRequired: daysOfWork.satClosersRequired,
          open: daysOfWork.satOpen,
          close: daysOfWork.satClose,
      }]; 
 const data = await Managers.updateOne({userName: manager},{$set:{schedule:workDays}});
 console.log(data);
  }
  catch(err){
    console.log(err);
  }      
}

 async function newWorker(employ) {
  try {
    let availability = [
      {name: "Monday", from: employ.monAvailFrom, to: employ.monAvailTo},
      {name: "Tuesday", from: employ.tuesAvailFrom, to: employ.tuesAvailTo},
      {name: "Wednesday", from: employ.wedAvailFrom, to: employ.wedAvailTo},
      {name: "Thursday", from: employ.thursAvailFrom, to: employ.thursAvailTo},
      {name: "Friday", from: employ.friAvailFrom, to: employ.friAvailTo},
      {name: "Saturday", from: employ.satAvailFrom, to: employ.satAvailTo},
      {name: "Sunday", from: employ.sunAvailFrom, to: employ.sunAvailTo}
    ];
    let daysAvailable = availability.filter(day => day.from && day.to);
    let newEmployee = {
      name: employ.empName,
      daysAvailable
    };
    const data = await Managers.updateOne({userName:  manager}, {$push: {employees: newEmployee}});
    console.log(data); 
  } catch (err) {
    console.log(err); 
  }
}

function findEmployee(empName) {
  return new Promise((resolve, reject) => {
    Managers.aggregate([
      {
        $match: {
          "userName":  manager
        }
      },
      {
        $unwind: "$employees"
      },
      {
        $match: {
          "employees.name": empName.workerName 
        }
      },
      {
        $project: {
          _id: 0,
          employees: 1
        }
      }
    ])
    .then(results => {
      console.log(results);
      resolve(results);
    })
    .catch(err => {
      console.error(err);
      reject(err);
    });
  });
}

/*Takes an employee object and adds up all
  the differences of their availability 
  together. */
function availabilities(emp)
{
  let totalAvailability = 0;
  emp.daysAvailable.forEach((available)=>{
   totalAvailability = totalAvailability + (available.to - available.from);
  })
  return totalAvailability;
}


/*This function is used to randomize the list of employees so
  that when make a new schedule it'll be a different order in 
  which who gets assigned to each shift next.*/
function newSchedule() {
  Managers.find({userName:  manager},{ _id: 0,employees: 1 }).then((listOfWorkers) => {
    if (listOfWorkers.length > 0 && listOfWorkers[0].employees) {
      let employees = listOfWorkers[0].employees; 
      
      /*Organizes in asscending order so that those with
        a more scaled down availability will get first
        choices since they can only work on certain days.*/
      for (let i = 0; i < employees.length; i++) {
        for (let a = 0; a < employees.length; a++) {
          if (availabilities(employees[i]) < availabilities(employees[a])) {
            let dummy = employees[i];
            employees[i] = employees[a];
            employees[a] = dummy;
          }
        }
      }
      /*Randomizes the order of the first half of the array of
        employees so those with lower availabilites will be assigned
        more randomly to the schedule.*/
      for (let i = Math.floor(employees.length / 2); i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [employees[i], employees[j]] = [employees[j], employees[i]];
      }

/*Using the midpoint those with the most availability
  will also get shuffled so that their assignment of 
  shifts will be more random. */
let midPoint = Math.floor(employees.length / 2);
for (let i = employees.length - 1; i > midPoint; i--) {
  let j = Math.floor(Math.random() * (i - midPoint + 1)) + midPoint;
  [employees[i], employees[j]] = [employees[j], employees[i]];
}

      Managers.updateOne({userName:  manager}, {$set: {employees: employees}})
        .then(updateResult => {
          console.log('Update success:', updateResult);
        })
        .catch(err => {
          console.error('Error updating employees:', err);
        });
    } else {
      console.log('Manager not found or no employees array in the document');
    }
  }).catch(err => {
    console.log('Error fetching manager and employees:', err);
  });
}


async function editEmployee(empToEdit) {
  let availability = [
    {name: "Monday", from: empToEdit.monAvailFrom, to: empToEdit.monAvailTo},
    {name: "Tuesday", from: empToEdit.tuesAvailFrom, to: empToEdit.tuesAvailTo},
    {name: "Wednesday", from: empToEdit.wedAvailFrom, to: empToEdit.wedAvailTo},
    {name: "Thursday", from: empToEdit.thursAvailFrom, to: empToEdit.thursAvailTo},
    {name: "Friday", from: empToEdit.friAvailFrom, to: empToEdit.friAvailTo},
    {name: "Saturday", from: empToEdit.satAvailFrom, to: empToEdit.satAvailTo},
    {name: "Sunday", from: empToEdit.sunAvailFrom, to: empToEdit.sunAvailTo}
  ];

  const daysAvailable = availability.filter(day => day.from && day.to);

  if(!empToEdit.deleteOrNot){
    try {
      await Managers.updateOne(
        { userName:  manager, "employees.name": empToEdit.empName },
        { $set: { "employees.$.daysAvailable": daysAvailable } }
      );
    } catch (err) {
      console.error("Error updating employee:", err);
    }
  }else{
    try {
      await Managers.updateOne(
        { userName: manager },
        { $pull: { "employees": { "name": empToEdit.empName } } }      
      );
    } catch (err) {
      console.error("Error updating employee:", err);
    }
  }

}

async function currentSchedule() {
  let scheduleData = await Managers.findOne({ userName: manager}, { currentSchedule: true});
  const currentPlan = scheduleData.currentSchedule;
  console.log(currentPlan);
  return currentPlan;
}


module.exports ={ validateCredentials,currentSchedule,createUser, manager,makeSchedule,whichShift,Managers,newWorker,scheduleReq,newSchedule,findEmployee,editEmployee};

