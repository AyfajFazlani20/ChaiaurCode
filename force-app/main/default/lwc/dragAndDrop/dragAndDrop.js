// employeeDragAndDrop.js
import { LightningElement, track } from 'lwc';

export default class EmployeeDragAndDrop extends LightningElement {
    @track employees = [
        { id: 1, name: 'John Doe', position: 'Software Engineer', salary: 85000 },
        { id: 2, name: 'Jane Smith', position: 'Product Manager', salary: 95000 },
        { id: 3, name: 'Mike Johnson', position: 'UX Designer', salary: 80000 },
        { id: 4, name: 'Sarah Williams', position: 'Data Analyst', salary: 75000 },
        { id: 5, name: 'Chris Brown', position: 'DevOps Engineer', salary: 90000 },
    ];

    @track transferredEmployees = [];

    handleDragStart(event) {
        event.dataTransfer.setData('text/plain', event.currentTarget.dataset.id);
    }

    allowDrop(event) {
        event.preventDefault();
    }

    handleDrop(event) {
        event.preventDefault();
        const employeeId = event.dataTransfer.getData('text');
        const draggedEmployee = this.employees.find(emp => emp.id === parseInt(employeeId, 10));
        
        if (draggedEmployee) {
            this.transferredEmployees = [...this.transferredEmployees, draggedEmployee];
            this.employees = this.employees.filter(emp => emp.id !== draggedEmployee.id);
        }
    }
}