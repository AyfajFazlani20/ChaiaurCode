import { LightningElement, track } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import createMultiRecords from '@salesforce/apex/MultipleRecordCreateController.createMultiRecords';
import USER_ID from '@salesforce/user/Id';

export default class MultiDateLogger extends LightningElement {
    @track currentDate = new Date();
    @track selectedDates = [];
    @track projectName = 'Select Project';
    @track taskName = 'Select Task';
    @track timeSpent = '';
    @track description = '';
    @track showMessage = false;
    @track showWarning = false;
    @track showError = false;
    @track message = '';
    @track warningMessage = '';

    weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    projectOptions = [
        { label: 'Select Project', value: 'Select Project' },
        { label: 'Project 1', value: 'Project 1' },
        { label: 'Project 2', value: 'Project 2' }
    ];

    taskOptions = [
        { label: 'Select Task', value: 'Select Task' },
        { label: 'Task 1', value: 'Task 1' },
        { label: 'Task 2', value: 'Task 2' }
    ];

    get monthYear() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const month = months[this.currentDate.getMonth()];
        const year = this.currentDate.getFullYear();
        return `${month} ${year}`;
    }

    get calendarDays() {
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const days = [];

        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push({ date: '', dayOfMonth: '', className: 'empty' });
        }

        for (let i = 1; i <= lastDay.getDate(); i++) {
            const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), i);
            const dateString = this.formatDateToYYYYMMDD(date);
            let className = 'day';
            if (this.selectedDates.includes(dateString)) {
                className += ' selected-day';
            }
            if (date.toDateString() === new Date().toDateString()) {
                className += ' today';
            }
            days.push({ date: dateString, dayOfMonth: i, className });
        }

        return days;
    }

    prevMonth() {
        this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    }

    nextMonth() {
        this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    }

    handleDateClick(event) {
        const selectedDate = new Date(event.currentTarget.dataset.date);
        const dateString = this.formatDateToYYYYMMDD(selectedDate);

        if (selectedDate > new Date()) {
            this.showWarning = true;
            this.warningMessage = "You can't log hours for future dates";
            setTimeout(() => {
                this.showWarning = false;
            }, 2000);
            return;
        }

        const index = this.selectedDates.indexOf(dateString);
        if (index > -1) {
            this.selectedDates.splice(index, 1);
            event.currentTarget.classList.remove('selected-day');
        } else {
            this.selectedDates.push(dateString);
            event.currentTarget.classList.add('selected-day');
        }

        console.log('Selected dates:', this.selectedDates);
    }

    formatDateToYYYYMMDD(date) {
        return date.toISOString().split('T')[0];
    }

    handleProjectChange(event) {
        this.projectName = event.detail.value;
    }

    handleTaskChange(event) {
        this.taskName = event.detail.value;
    }

    handleTimeSpentChange(event) {
        this.timeSpent = event.detail.value;
    }

    handleDescriptionChange(event) {
        this.description = event.detail.value;
    }

    MultisaveLog() {
        if (this.selectedDates.length === 0) {
            this.showError = true;
            this.message = "Please select at least one date";
            setTimeout(() => {
                this.showError = false;
            }, 2000);
            return;
        }

        if (this.projectName === "Select Project") {
            this.showError = true;
            this.message = "Please select a project";
            setTimeout(() => {
                this.showError = false;
            }, 2000);
            return;
        }

        if (this.taskName === "Select Task") {
            this.showError = true;
            this.message = "Please select a task";
            setTimeout(() => {
                this.showError = false;
            }, 2000);
            return;
        }

        if (this.timeSpent === '') {
            this.showError = true;
            this.message = "Please enter time spent";
            setTimeout(() => {
                this.showError = false;
            }, 2000);
            return;
        }

        createMultiRecords({ 
            selectedDates: this.selectedDates,
            Name: this.taskName,
            Project: this.projectName,
            Description: this.description,
            Mins: this.timeSpent,
            userId: USER_ID 
        })
        .then(result => {
            console.log('Records created successfully:', result);
            this.showMessage = true;
            this.message = "Multiple Date Entries created successfully";
            this.timeSpent = '';
            this.description = '';
            this.taskName = 'Select Task';
            this.projectName = 'Select Project';
            this.selectedDates = [];
            this.clearSelectedDatesUI();
            setTimeout(() => {
                this.showMessage = false;
            }, 2000);
        })
        .catch(error => {
            console.error('Error creating records:', error);
            this.showError = true;
            this.message = "An error occurred while saving the logs";
            setTimeout(() => {
                this.showError = false;
            }, 2000);
        });
    }

    clearSelectedDatesUI() {
        const allDays = this.template.querySelectorAll('.days div');
        allDays.forEach(day => {
            day.classList.remove('selected-day');
        });
    }
}