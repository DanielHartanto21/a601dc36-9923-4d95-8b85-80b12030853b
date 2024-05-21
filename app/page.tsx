"use client"; // Ensures the component is treated as a client component
import { useEffect, useState } from "react";
import axios from "axios";
import { Employee as EmployeeType } from "./employee";
import './global.css';
type SortByType = "firstName" | "lastName" | "position";

export default function Home() {
  const [employees, setEmployees] = useState<EmployeeType[]>([]);
  const [newEmployee, setNewEmployee] = useState<EmployeeType>({
    _id: "",
    firstName: "",
    lastName: "",
    position: "",
    phone: "",
    email: "",
  });

  const [editedEmployees, setEditedEmployees] = useState<EmployeeType[]>([]);
  const [showAddEmployeeForm, setShowAddEmployeeForm] = useState(false);
  const [sortBy, setSortBy] = useState<SortByType>("firstName");
  const [sortOrder, setSortOrder] = useState("asc");

  const sortEmployees = () => {
    const sortedEmployees = [...employees];
    sortedEmployees.sort((a, b) => {
      if (sortOrder === "asc") {
        return a[sortBy].localeCompare(b[sortBy]);
      } else {
        return b[sortBy].localeCompare(a[sortBy]);
      }
    });
    setEmployees(sortedEmployees);
  };

  useEffect(() => {
    sortEmployees();
  }, [sortBy, sortOrder]);

  const fetchEmployees = async () => {
    const res = await axios.get("/api");
    setEmployees(res.data.employees);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isDuplicateEmail = (email: string, excludeId: string = "") => {
    return employees.some(emp => emp.email === email && emp._id !== excludeId);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    employee: EmployeeType
  ) => {
    const { name, value } = e.target;
    const updatedEmployees = employees.map((emp) =>
      emp._id === employee._id ? { ...emp, [name]: value } : emp
    );
    setEmployees(updatedEmployees);

    const updatedEmployee = { ...employee, [name]: value };
    const index = editedEmployees.findIndex((emp) => emp._id === employee._id);

    if (index !== -1) {
      setEditedEmployees(editedEmployees.map((emp, i) => (i === index ? updatedEmployee : emp)));
    } else {
      setEditedEmployees([...editedEmployees, updatedEmployee]);
    }
  };

  const handleAddEmployee = async () => {
    if (
      !newEmployee.firstName ||
      !newEmployee.lastName ||
      !newEmployee.position ||
      !newEmployee.phone ||
      !newEmployee.email
    ) {
      alert("Please fill all fields before adding.");
      return;
    }

    if (!validateEmail(newEmployee.email)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (isDuplicateEmail(newEmployee.email)) {
      alert("Email is already in use.");
      return;
    }

    await axios.post("/api", [newEmployee]);
    fetchEmployees();
    setNewEmployee({
      _id: "",
      firstName: "",
      lastName: "",
      position: "",
      phone: "",
      email: "",
    });
    setShowAddEmployeeForm(false);
  };

  const handleSaveChanges = async () => {
    for (let emp of editedEmployees) {
      if (!validateEmail(emp.email)) {
        alert(`Invalid email format for ${emp.firstName} ${emp.lastName}.`);
        return;
      }
      if (isDuplicateEmail(emp.email, emp._id)) {
        alert(`Duplicate email found for ${emp.firstName} ${emp.lastName}.`);
        return;
      }
    }

    await axios.put("/api", editedEmployees);
    setEditedEmployees([]);
    fetchEmployees();
  };

  return (
    <div>
      <h1>Employees</h1>
      <button onClick={handleSaveChanges}>Save Changes</button>
      <button onClick={() => setShowAddEmployeeForm(!showAddEmployeeForm)}>
        {showAddEmployeeForm ? "Cancel" : "Add Employee"}
      </button>
      {showAddEmployeeForm && (
        <div>
          <h2>Add New Employee</h2>
          <table>
            <td>
              <input
                type="text"
                placeholder="First Name"
                value={newEmployee.firstName}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, firstName: e.target.value })
                }
              />

            </td>
            <td>
              <input
                type="text"
                placeholder="Last Name"
                value={newEmployee.lastName}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, lastName: e.target.value })
                }
              />
            </td>
            <td>
              <input
                type="text"
                placeholder="Position"
                value={newEmployee.position}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, position: e.target.value })
                }
              />
            </td>
            <td>
              <input
                type="text"
                placeholder="Phone"
                value={newEmployee.phone}
                onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
              />
            </td>
            <td>
              <input
                type="text"
                placeholder="Email"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
              />
            </td>
            <td>

              <button onClick={handleAddEmployee}>Add Employee</button>
            </td>
          </table>
        </div>
      )}
      <table>
        <thead>
          <tr>
            <th>
              First Name
              <button onClick={() => setSortBy("firstName")}>
                {sortBy === "firstName" ? "▲" : "▼"}
              </button>
            </th>
            <th>
              Last Name
              <button onClick={() => setSortBy("lastName")}>
                {sortBy === "lastName" ? "▲" : "▼"}
              </button>
            </th>
            <th>
              Position
              <button onClick={() => setSortBy("position")}>
                {sortBy === "position" ? "▲" : "▼"}
              </button>
            </th>
            <th>Phone</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee._id}>
              <td>
                <input
                  type="text"
                  name="firstName"
                  value={employee.firstName}
                  onChange={(e) => handleInputChange(e, employee)}
                />
              </td>
              <td>
                <input
                  type="text"
                  name="lastName"
                  value={employee.lastName}
                  onChange={(e) => handleInputChange(e, employee)}
                />
              </td>
              <td>
                <input
                  type="text"
                  name="position"
                  value={employee.position}
                  onChange={(e) => handleInputChange(e, employee)}
                />
              </td>
              <td>
                <input
                  type="text"
                  name="phone"
                  value={employee.phone}
                  onChange={(e) => handleInputChange(e, employee)}
                />
              </td>
              <td>
                <input
                  type="text"
                  name="email"
                  value={employee.email}
                  onChange={(e) => handleInputChange(e, employee)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
