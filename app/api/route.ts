
import ConnectMongoDB from "../db/db";
import { NextResponse } from "next/server";
import Employee from "../model/employee";

ConnectMongoDB();

export async function GET() {
  const employees = await Employee.find({});
  return NextResponse.json({
    employees
  })
}
export async function POST(request: Request) {
  const data = await request.json();
  if (!Array.isArray(data)) {
    return NextResponse.json({
      error: "Request body must be an array of employee objects",
    }, {
      status: 400,
    });
  }
  const employeesData = data.map(item => {
    const { _id, ...rest } = item;
    return rest;
  });
  const employees = employeesData.map(item => new Employee(item));
  const addData = await Promise.all(employees.map(employee => employee.save()));
  return NextResponse.json({
    addData,
  })
}
export async function PUT(request: Request) {
  const data = await request.json();
  if (!Array.isArray(data)) {
    return NextResponse.json(
      {
        error: "Request body must be an array of employee update objects",
      },
      {
        status: 400,
      }
    );
  }

  const results = await Promise.all(data.map(async (item) => {
    if (!item._id) {
      return {
        error: "Each update object must contain a valid _id",
        status: 400,
      };
    }

    try {
      const updatedEmployee = await Employee.findByIdAndUpdate(item._id, item, {
        new: true,
        runValidators: true,
      });

      if (!updatedEmployee) {
        return {
          error: `Employee with id ${item._id} not found`,
          status: 404,
        };
      }

      return {
        status: 200,
        updatedEmployee,
      };
    } catch (error) {
      return {
        error: "Error changing the data",
        status: 500,
      };
    }
  }));

  const successfulUpdates = results.filter(result => result.status === 200);
  const errors = results.filter(result => result.status !== 200);

  return NextResponse.json({
    successfulUpdates,
    errors,
  });
}