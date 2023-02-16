// import and require modules
const mysql = require("mysql2");
const inquirer = require("inquirer");
const table = require("console.table");

//conection to database
const db = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: "pEJB3FpYcr4s",
    database: "employee_db",
  },
  console.log(`Connected to employee_db database.`)
);

// conecting and starting app
db.connect((err) => {
  if (err) throw err;
  console.log("\n Welcome to employee tracker\n");
  promptUser();
});

function promptUser() {
  inquirer
    .prompt({
      name: "options",
      type: "list",
      message: "Main menu",
      choices: [
        "View all the departments",
        "View all the roles",
        "view all the employees",
        "Add a new department",
        "Add a new role",
        "Add a new employee",
        "Update the role of an existing employee",
        // future features:
        // 'Update employee manager', 
        // 'View employee by manager',
        // 'view employees by department',
        // 'Delete demartments', 
        // 'Delete roles',
        // 'Delete employees', 
        // 'View the total utilized budget of a department'
        "Exit",
      ],
    })
    .then((answer) => {
      switch (answer.options) {
        case "View all the departments":
          viewallDept();
          break;
        case "View all the roles":
          viewAllRoles();
          break;
        case "view all the employees":
          viewallEmpl();
          break;
        case "Add a new department":
          addNewDep();
          break;
        case "Add a new role":
          addNewRole();
          break;
        case "Add a new employee":
          addNewEmpl();
          break;
        case "Update the role of an existing employee":
          updateEmpRol();
          break;
        case "Exit":
          // Finish the connection and exit the app.
          db.end();
          break;
      }
    });
}

// view all department
function viewallDept() {
    db.query(
      "SELECT department.department_name AS 'Department name', department.id AS 'Department ID' FROM department",
      function (err, result) {
        if (err) throw err;
        console.log("\n");
        console.table(result);
        promptUser();
      }
    );
}

function viewAllRoles() {
    db.query(
      "SELECT  role.id, role.role_title, role.salary, department.department_name FROM role INNER JOIN department ON role.department_id = department.id ORDER BY role.id ASC",
      function (err, result) {
        if (err) throw err;
        console.log("\n");
        console.table(result);
        promptUser();
      }
    );
}

function viewallEmpl() {
    db.query(
      "SELECT employee.id, employee.first_name, employee.last_name, role.role_title, role.salary, department.department_name ,employee.manager_id AS manager FROM employee, role, department WHERE department.id = role.department_id AND role.id = employee.role_id ORDER BY employee.id ASC",
      function (err, result) {
        if (err) throw err;
      // looking for employees with a manager_id and showin manager as name and last name of employee matching by the id
        for (let i= 0;i<result.length; i++) {
          if(result[i].manager) {
            var found =result.find (function(employee) {
              return result[i].manager === employee.id
            })
            result[i].manager = found.first_name + " " + found.last_name
          }
        }
      
        console.log("\n");
        console.table(result);
        promptUser()
      }
    );
}

function addNewDep() {
  inquirer
    .prompt({
      type: "input",
      message: "Please type the department name you want to add",
      name: "new_department",
    })
    .then((answer) => {
      let newDepartment = answer.new_department;
      db.query("INSERT INTO department(department_name) VALUES (?)",newDepartment,function (err, result) {
            if (err) throw err;
            console.log("\n");
            console.log(newDepartment + " " + "department created");
            console.log(result);
            viewallDept();
          }
        );
      });
}

// creating a department array to allow user to pick department name when adding new role
let departmentChoices = [];
function selectDepartment() {
     db.query("SELECT * FROM department", function (err, result) {
      if (err) throw err;
      for (var i = 0; i < result.length; i++) {
        departmentChoices.push(result[i].department_name);
      }
    });
  return departmentChoices;
}

function addNewRole() {
  inquirer
    .prompt([
      {
        type: "input",
        message: "Please type the role title you want to add",
        name: "title",
      },
      {
        type: "input",
        message: "What is the salary of the new role",
        name: "salary",
      },
      {
        type: "list",
        message: "To what department this new role belongs?",
        name: "department",
        choices: selectDepartment()
      },
    ])
    .then((answer) => {
      let newRole = answer.title;
      let newRoleSalary = answer.salary;
 
      //Find the matching id that matches the chosen department
      new Promise ((resolve) => {
        db.query("SELECT * FROM department", function (err, result) {
          resolve(result);
        });
      }).then((allDepartments) => {

        var chosenDepartment = allDepartments.find((department) => {
          return answer.department == department.department_name;
        });

        var departmentId = chosenDepartment.id;

        db.connect(function (err) {
        if (err) throw err;
        db.query(
          "INSERT INTO role SET ?",
          {
            role_title: newRole,
            salary: newRoleSalary,
            department_id: departmentId,
          },

          function (err, result) {
            if (err) throw err;
            console.log("\n");
            console.log("New" + " " + newRole + " " + "role had been created");
            console.table(result);
            viewAllRoles();
          }
        );
      });

        });
    });
  }

  // creating a manager array to allow user to pick a manager when adding new employee
var managerChoices = [];
function selectManager () {
        db.query("SELECT CONCAT(employee.first_name, ' ', employee.last_name) AS manager FROM employee where manager_id IS NULL", function (err, result){
            if(err) throw err
            for (var i=0; i< result.length; i++){
                managerChoices.push(result[i].manager)
            }
        });
    return managerChoices;
    }

// creating a  role array to allow user to pick a role when adding new employee
var roleChoices = [];
function selectRole () {
  db.query("SELECT * FROM role", function (err, result) {
    if (err) throw err;
 
    for (var i = 0; i < result.length; i++) {
      roleChoices.push(result[i].role_title);
    }
  });
return roleChoices;
}

function addNewEmpl () {
  inquirer
    .prompt([
      {
        type: "input",
        message: "Employee first name:",
        name: "firstNAme"
      },
      {
        type: "input",
        message: "Employee last name:",
        name: "lastName"
      },
      {
        type: "list",
        message: "What role does this employee has?",
        name: "role",
        choices: selectRole()
      },
      {
        type: "list",
        message: "Who is the manager of this employee?",
        name: "manager",
        choices: selectManager()
      },
    ])
    .then ((answer) => {
      let newNAme = answer.firstNAme;
      let newLastNAme = answer.lastName;
      console.log(answer);
    
      // find the role_id that matches the chosen role
      new Promise ((resolve) => {
      db.query("SELECT * FROM role", function (err,result) {
        resolve(result);
      });
      }).then((allRoles) => {
      var chosenRol = allRoles.find((role) => {
        return answer.role == role.role_title;
      });
      var roleId = chosenRol.id;

    //  employee id matching employee name (first name and last name) 
     new Promise ((resolve) => {
      db.query ("SELECT employee.id, CONCAT(employee.first_name, ' ', employee.last_name) AS manager FROM employee where manager_id IS NULL", function (err,result) {
        resolve(result);  
        console.log(result)
        });
      }).then((allManagers) => {
        var chosenManager = allManagers.find ((employee) => {
          return answer.manager == employee.manager;
        }); 

        var managerId = chosenManager.id;
  
        db.connect (function (err) {
        if (err) throw err;
        db.query("INSERT INTO employee SET ?",
          {
            first_name: newNAme,
            last_name: newLastNAme,
            role_id: roleId,
            manager_id: managerId
          },

          function (err, result) {
            if(err) throw err;
            console.log("New employee created")
            console.table(result);
            viewallEmpl();
          }
        );
      });
    });
  });
   }
)}

function updateEmpRol () {
  db.query(
    "SELECT employee.last_name, role.role_title FROM employee JOIN role ON employee.role_id = role.id", 
    function (err,result) {
      if(err) throw err;

    inquirer
    .prompt ([
        {
          type:'list',
          message: 'last name of employee you want to update:',
          name: 'surname',
          choices: function () {
            // last name array for user to chose employee last name to update the role
            var lastName = [];
            for (var i=0; i<result.length; i++) {
              lastName.push(result[i].last_name);
            }
            return lastName;
          }
        },
        {
          type:'list',
          message: 'what is the employee new role?',
          name: 'role',
          choices: selectRole ()
        }
        
      ])
      .then((answer) => {
       var lastName = answer.surname

       new Promise ((resolve) => {
        db.query("SELECT * FROM role", function (err,result) {
          resolve(result);
          });
        })

        .then((allRoles) => {
        var chosenRol = allRoles.find((role) => {
          return answer.role == role.role_title;
        });

        var roleId = chosenRol.id;

        db.connect(function(err) {
          if(err) throw err;
          db.query(
            "UPDATE employee SET ? WHERE ?",
              [{
                role_id: roleId,
              },
              {  
                last_name: lastName
              }],
              
            function(err,result) {
              if (err) throw err;
              console.table(result);
              viewallEmpl()
              }
          )
          })
        });
      });
    }
  )}
