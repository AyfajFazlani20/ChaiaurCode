import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getLogsByProject from '@salesforce/apex/LogFetcher.getLogsByProject';
import getTotalLogsCount from '@salesforce/apex/LogFetcher.getTotalLogsCount';
import { loadScript } from 'lightning/platformResourceLoader';
import XLSX_RESOURCE from '@salesforce/resourceUrl/xlsx';
import getAllFilteredLogs from '@salesforce/apex/LogFetcher.getAllFilteredLogs';

export default class LogViewer extends LightningElement {
    @track isMonthDisabled = false;
    @track isDateRangeDisabled = false;
    @track logs = [];
    @track error;
    @track selectedProject = '';
    @track customErrorMessage = '';
    @track selectedMonth = '';
    @track startDate = '';
    @track endDate = '';
    @track selectedUser = '';
    @track Message = '';
    @track showMessage = false;
    @track isLoading = false;
    @track projects = [
        'AAPC', 'ACEP-AI Integration', 'ACEP -Squad 1', 'ACEP -Squad 2', 'ACEP -Squad 3',
        'ACEP -Squad 4', 'ACEP MJ CDP POC', 'AI Wizard', 'AI Wizard Training', 'AIUM',
        'ALA', 'ALA PIMA', 'APhA-QA', 'APhA -CMS', 'APhA -ETL', 'APhA UI/UX', 'BBC',
        'Blue Cypress-IT Admin', 'Brightfind', 'CASE MJ CDP POC', 'CHA', 'Cimatri',
        'Cimatri ACR', 'Cimatri-AI Maturity Model', 'EastWest Health', 'Elastik Teams',
        'Generic Component', 'HR', 'Ideal Time', 'Member Junction', 'Member Junction-ASM',
        'MJ App Training', 'MJ CDP Training', 'MOORE', 'Other', 'Plexcity', 'RAD', 'Rhythm',
        'Rhythm-Hubspot', 'Salesforce', 'Tasio', 'Tasio-AGU', 'Tonopalo'
    ];
    @track users = [
        'Aamir Ahmad', 'Akshay Ghadge', 'Aman Aafaque Ahmed', 'Anuradha Weldode', 'Apil Faterpenkar', 
        'Ayfaj Fazlani', 'Bhakti Shete', 'Deeksha Shrivastava', 'Harsh Sunwani', 'Harshal Dhamale', 
        'Hemant Jadhav', 'Hitesh Dhamecha', 'Hrishikesh Wagh', 'Janhavi Godbole', 'Megha Ghotkar', 
        'Mohit Sharma', 'Mousin Mulani', 'Navin Prasad', 'Nayan Kaslikar', 'Paresh Awashank', 
        'Prachi Madgaonkar', 'Ravindra Shivdas', 'Ritika Markandey', 'Ruturaj Maggirwar', 'Rutika Khaire', 
        'Sameep Sawant', 'Sanket Patil', 'Shraddha Deshmukh', 'Sonal Surve', 'Suvarna Deshpande', 
        'Suyash Muley', 'Sujay Mane', 'Vidushi Pawar', 'Vivek Alhat', 'Vaibhav Bhutkar', 'Yogini Thakur', 
        'Yogita Kadam'
    ];
    
    @track currentPage = 1;
    @track totalRecords = 0;
    @track pageSize = 100;
    totalPages = 0;

    connectedCallback() {
        this.loadLogs();
        this.loadTotalLogsCount();
        loadScript(this, XLSX_RESOURCE)
            .then(() => {
                console.log('xlsx library loaded successfully');
            })
            .catch(error => {
                console.error('Error loading xlsx library:', error);
                this.showToast('Error', 'Failed to load XLSX library', 'error');
            });
    }

    loadLogs() {
        this.isLoading = true;
        getLogsByProject({ 
            project: this.selectedProject === 'All' ? '' : this.selectedProject, 
            month: this.selectedMonth === 'All' ? '' : this.selectedMonth,
            startDate: this.startDate,
            endDate: this.endDate,
            userName: this.selectedUser === 'All' ? '' : this.selectedUser,
            limitSize: this.pageSize, 
            offset: (this.currentPage - 1) * this.pageSize 
        })
        .then(result => {
            this.logs = result.map(log => {
                return {
                    ...log,
                    OwnerName: log.User__r ? `${log.User__r.FirstName} ${log.User__r.LastName}` : '' // Concatenate FirstName and LastName
                };
            });
            this.error = undefined;
            this.isLoading = false;
        })
        .catch(error => {
            this.error = error;
            this.logs = undefined;
            this.isLoading = false;
            this.showToast('Error', 'Failed to fetch logs', 'error');
        });
    }
    
    loadTotalLogsCount() {
        getTotalLogsCount({ 
            project: this.selectedProject === 'All' ? '' : this.selectedProject,
            month: this.selectedMonth === 'All' ? '' : this.selectedMonth,
            startDate: this.startDate,
            endDate: this.endDate,
            userName: this.selectedUser === 'All' ? '' : this.selectedUser
        })
            .then(result => {
                this.totalRecords = result;
                this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
            })
            .catch(error => {
                this.showToast('Error', 'Failed to fetch total logs count', 'error');
            });
    }

    handleProjectChange(event) {
        this.selectedProject = event.detail.value;
        this.resetFilters();
    }

    handleMonthChange(event) {
        this.selectedMonth = event.detail.value;
        this.resetFilters();
    }
    handleStartDateChange(event) {
        this.startDate = event.target.value;
        this.validateDateRange();
        this.resetFilters();
    }

    handleEndDateChange(event) {
        this.endDate = event.target.value;
        this.validateDateRange();
        this.resetFilters();
    }
    // validateDateRange() {
    //     if (this.startDate && this.endDate && this.startDate > this.endDate) {
    //         this.customErrorMessage = 'Start date cannot be greater than end date.';
    //     } else {
    //         this.customErrorMessage = '';
    //     }
    // }
    validateDateRange() {
        if (this.startDate && this.endDate && this.startDate > this.endDate) {
            this.Message = 'Start date cannot be greater than end date.';
            this.showMessage = true;
            setTimeout(() => {
                 this.showMessage=false;
            }, 3000);
        } else {
            this.showMessage = false;
            this.Message = '';
        }
    }

    // handleStartDateChange(event) {
    //     this.startDate = event.target.value;
    //     this.resetFilters();
    // }

    // handleEndDateChange(event) {
    //     this.endDate = event.target.value;
    //     this.resetFilters();
    // }

    handleUserChange(event) {
        this.selectedUser = event.detail.value;
        this.resetFilters();
    }

    resetFilters() {
        this.currentPage = 1;
        this.loadLogs();
        this.loadTotalLogsCount();
    }

    handlePreviousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.loadLogs();
        }
    }

    handleNextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.loadLogs();
        }
    }

    
    exportToExcel() {
        if (typeof XLSX === 'undefined') {
            this.showToast('Error', 'XLSX library not loaded. Please try again.', 'error');
            return;
        }
    
        this.isLoading = true;
        getAllFilteredLogs({
            project: this.selectedProject === 'All' ? '' : this.selectedProject,
            month: this.selectedMonth === 'All' ? '' : this.selectedMonth,
            startDate: this.startDate,
            endDate: this.endDate,
            userName: this.selectedUser === 'All' ? '' : this.selectedUser
        })
        .then(result => {
            if (!result || result.length === 0) {
                this.showToast('Warning', 'No logs to export.', 'warning');
                this.isLoading = false;
                return;
            }
    
            const headers = ['Name', 'Date', 'User', 'Description', 'Minutes', 'Project'];
            const workbook = XLSX.utils.book_new();
            const chunkSize = 10000; // Adjust this value based on performance
    
            for (let i = 0; i < result.length; i += chunkSize) {
                const chunk = result.slice(i, i + chunkSize);
                const rows = chunk.map(log => [
                    log.Name,
                    log.Date__c,
                    log.User__r ? `${log.User__r.FirstName} ${log.User__r.LastName}` : '',
                    log.Description__c,
                    log.Mins__c,
                    log.Project__c
                ]);
    
                const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
                XLSX.utils.book_append_sheet(workbook, worksheet, `Logs_${Math.floor(i / chunkSize) + 1}`);
            }
    
            XLSX.writeFile(workbook, 'Logs.xlsx');
            this.showToast('Success', 'Logs exported successfully', 'success');
            this.isLoading = false;
        })
        .catch(error => {
            console.error('Error exporting logs:', error);
            this.showToast('Error', 'Failed to export logs', 'error');
            this.isLoading = false;
        });
    }
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(event);
    }

    get projectOptions() {
        return [{ label: 'All', value: 'All' }, ...this.projects.map(project => ({ label: project, value: project }))];
    }

    get monthOptions() {
        return [
            { label: 'All', value: 'All' },
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
    }

    get userOptions() {
        return [{ label: 'All', value: 'All' }, ...this.users.map(user => ({ label: user, value: user }))];
    }

    get columns() {
        return [
            // { label: 'No.', fieldName: 'number', type: 'number' }, 
            { label: 'Name', fieldName: 'Name' },
            { label: 'Date', fieldName: 'Date__c', type: 'date' },
            { label: 'User', fieldName: 'OwnerName' },
            { label: 'Description', fieldName: 'Description__c' },
            { label: 'Minutes', fieldName: 'Mins__c', type: 'number' },
            { label: 'Project', fieldName: 'Project__c' }
        ];
    }

    get isPreviousButtonDisabled() {
        return this.currentPage <= 1;
    }

    get isNextButtonDisabled() {
        return this.currentPage >= this.totalPages;
    }
    clearDateFilters() {
        this.startDate = '';
        this.endDate = '';
        // this.customErrorMessage = ''; 
        this.resetFilters();
    }
    
}
