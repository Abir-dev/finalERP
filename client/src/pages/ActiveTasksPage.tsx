import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Dummy data (copy from SiteDashboard for now)
const tasks = [
  {
    id: "TASK-2",
    name: "Steel Structure",
    project: "Main Building",
    assignedTo: "Jane Smith",
    startDate: "2024-01-16",
    dueDate: "2024-02-15",
    status: "In Progress",
    progress: 75,
    phase: "Structure",
  },
  {
    id: "TASK-3",
    name: "Roofing Installation",
    project: "Main Building",
    assignedTo: "Mike Johnson",
    startDate: "2024-02-01",
    dueDate: "2024-02-28",
    status: "In Progress",
    progress: 45,
    phase: "Roofing",
  },
];

const ActiveTasksPage = () => {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Active Tasks</CardTitle>
          <CardDescription>All currently active tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="p-2 text-left">Task Name</th>
                <th className="p-2 text-left">Assigned To</th>
                <th className="p-2 text-left">Progress</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-t">
                  <td className="p-2">{task.name}</td>
                  <td className="p-2">{task.assignedTo}</td>
                  <td className="p-2">{task.progress}%</td>
                  <td className="p-2">
                    <Button size="sm" variant="outline" onClick={() => navigate(`/active-tasks/${task.id}`)}>
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActiveTasksPage; 