import { LightningElement, track } from 'lwc';
import getTimesheetStatus from '@salesforce/apex/TimesheetDashboardController.getTimesheetStatus';
import checkMember from '@salesforce/apex/LogController.checkMember';
import USER_ID from '@salesforce/user/Id';


export default class AdminDashboardPage extends LightningElement {
    @track upToDateMembers = [];
    @track remainingMembers = [];
    @track selectedMonth = '6';
    @track flag = true;
    @track expectedMinutes;
    @track sortDirection = 'asc';
    @track sortedBy = 'FirstName';
    @track isMember=true  ;


    @track monthOptions = [
        { label: 'January', value: '1' },
        { label: 'February', value: '2' },
        { label: 'March', value: '3' },
        { label: 'April', value: '4' },
        { label: 'May', value: '5' },
        { label: 'June', value: '6' },
        { label: 'July', value: '7' },
        { label: 'August', value: '8' },
        { label: 'September', value: '9' },
        { label: 'October', value: '10' },
        { label: 'November', value: '11' },
        { label: 'December', value: '12' }
    ];

    holidays = [
        '2024-08-15',
        '2024-10-02',
        '2024-10-31',
        '2024-12-25'
    ];

    connectedCallback(){
        this.fetchTimesheetStatus('UpToDate');
        this.fetchTimesheetStatus('Remaining');
        this.checkMember() ;
    }

    handleMonthChange(event) {
        this.selectedMonth = event.detail.value;
    }

    fetchUpToDateMembers(event) {
        this.flag = true;
        this.template.querySelector('.card.up-to-date').classList.add('active');
        this.template.querySelector('.card.remaining').classList.remove('active');
        this.fetchTimesheetStatus('UpToDate');
    }

    fetchRemainingMembers(event) {
        this.flag = false;
        this.template.querySelector('.card.remaining').classList.add('active');
        this.template.querySelector('.card.up-to-date').classList.remove('active');
        this.fetchTimesheetStatus('Remaining');
    }

    fetchTimesheetStatus(listType) {
        const year = new Date().getFullYear();
        const month = this.selectedMonth;
        const startDate = new Date(Date.UTC(year, month - 1, 1));
        const endDate = new Date(Date.UTC(year, month, 0));

        const workingDays = this.calculateWorkingDays(startDate, endDate);
        this.expectedMinutes = workingDays * 8 * 60;

        getTimesheetStatus({ 
            StartDate: startDate.toISOString().split('T')[0], 
            EndDate: endDate.toISOString().split('T')[0], 
            WorkingDays: workingDays 
        })
        .then(result => {
            if (listType === 'UpToDate') {
                this.upToDateMembers = result.UpToDate;
            } else if (listType === 'Remaining') {
                this.remainingMembers = result.Remaining;
            }
            this.sortData(this.sortedBy, this.sortDirection);
        })
        .catch(error => {
            console.error('Error: ', error);
        });
    }

    calculateWorkingDays(startDate, endDate) {
        let count = 0;
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const dayOfWeek = currentDate.getDay();
            const dateStr = currentDate.toISOString().split('T')[0];
            if (dayOfWeek !== 0 && dayOfWeek !== 6 && !this.holidays.includes(dateStr)) { 
                count++;
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return count;
    }

    get monthName() {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return monthNames[this.selectedMonth - 1];
    }

    handlePreviousSelector() {
        if (this.selectedMonth > 1) {
            this.selectedMonth--;
        } else {
            this.selectedMonth = 12;
        }
        this.fetchTimesheetStatus('UpToDate');
        this.fetchTimesheetStatus('Remaining');
    }

    handleNextSelector() {
        if (this.selectedMonth < 12) {
            this.selectedMonth++;
        } else {
            this.selectedMonth = 1;
        }
        this.fetchTimesheetStatus('UpToDate');
        this.fetchTimesheetStatus('Remaining');
    }
    handleSort(event) {
        const field = event.currentTarget.dataset.field;
        const sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        this.sortDirection = sortDirection;
        this.sortedBy = field;
        this.sortData(field, sortDirection);

        this.updateSortClasses();
    }

    updateSortClasses() {
        const headers = this.template.querySelectorAll('th');
        headers.forEach(header => {
            header.classList.remove('sorted-asc', 'sorted-desc');
            if (header.dataset.field === this.sortedBy) {
                header.classList.add(this.sortDirection === 'asc' ? 'sorted-asc' : 'sorted-desc');
            }
        });
    }

    sortData(field, direction) {
        const parseData = (data) => {
            return data.map((item) => {
                const newItem = { ...item };
                if (!isNaN(newItem[field])) {
                    newItem[field] = Number(newItem[field]);
                }
                return newItem;
            });
        };

        const compare = (a, b) => {
            if (a[field] < b[field]) return direction === 'asc' ? -1 : 1;
            if (a[field] > b[field]) return direction === 'asc' ? 1 : -1;
            return 0;
        };

        if (this.flag) {
            this.upToDateMembers = [...parseData(this.upToDateMembers)].sort(compare);
        } else {
            this.remainingMembers = [...parseData(this.remainingMembers)].sort(compare);
        }
    }
    checkMember(){
        checkMember({userId : USER_ID})
        .then(result=>{
            this.isMember = result;
        }).catch(error=>{
            console.error(error);
        })
    }
}