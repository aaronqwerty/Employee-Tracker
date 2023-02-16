INSERT INTO department (department_name)
VALUES  ("engineering"),
        ("finances"),
        ("legal"),
        ("marketing"),
        ("sales");


INSERT INTO role (role_title, salary, department_id)
VALUES  ("engineer", 150000, 1),
        ("softwarwe engineer", 120000, 1),
        ("account manager", 160000, 2),
        ("accountant", 125000, 2),
        ("legal team lead", 250000, 3),
        ("lawyer", 190000, 3),
        ("content marketing", 80000, 4),
        ("events", 95000, 4),
        ("sales sdr", 100000, 5),
        ("salesperson", 80000, 5);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES  ("Aaron", "Yellow", 1, NULL),
        ("Bob", "Brown", 2, 1),
        ("Charlie", "White", 3, NULL),
        ("Devon", "Black", 4, 3),
        ("Emma", "Green", 5, NULL),
        ("Fred", "Brown", 6, 5),
        ("Gizelle", "Blue", 7, NULL),
        ("Howard", "Orange", 8, 7);


SELECT * FROM department;
SELECT * FROM role;
SELECT * FROM employee;