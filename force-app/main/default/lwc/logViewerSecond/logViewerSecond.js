import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getLogsByProject from '@salesforce/apex/logViewerSecond.getLogsByProject';
import getTotalLogsCount from '@salesforce/apex/logViewerSecond.getTotalLogsCount';
import { loadScript } from 'lightning/platformResourceLoader';
import XLSX_RESOURCE from '@salesforce/resourceUrl/xlsx';
import getAllFilteredLogs from '@salesforce/apex/logViewerSecond.getAllFilteredLogs';

import getLogsByProjectwithoutpagination from '@salesforce/apex/LogViewerSecond.getLogsByProjectwithoutpagination';
import getProjectBillableStatus from '@salesforce/apex/LogViewerSecond.getProjectBillableStatus';

export default class LogViewer extends LightningElement {

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: 'sticky'
        });
        this.dispatchEvent(event);
    }
    @track currentYear = new Date().getFullYear().toString();
@track currentMonth = (new Date().getMonth() + 1).toString();
    totalMinutes;
    @track logs = [];
    @track logs1 = [];
    @track error;
    @track selectedProject = '';
    @track selectedMonth = '';
    @track startDate = '';
    @track endDate = '';
    @track selectedUser = '';
    @track selectedName = '';
    @track Message = '';
    @track showMessage = false;
    @track MessageExport = '';
    @track showMessageExport = false;
    @track isLoading = false;
    @track isMember=true  ;
     @track selectedYear = '';
     @track sortedBy = 'Date__c';  // Default sort field
@track sortDirection = 'desc';  // Default sort direction
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
        'Aamir Ahmad', 'Akshay Ghadge', 'Aman Ahmed', 'Anuradha Weldode', 'Apil Faterpenkar', 
        'Ayfaj Fazlani', 'Bhakti Shete', 'Deeksha Shrivastava', 'Harsh Sunwani', 'Harshal Dhamale', 
        'Hemant Jadhav', 'Hitesh Dhamecha', 'Hrishikesh Wagh', 'Janhavi Godbole', 'Megha Ghotkar', 
        'Mohit Sharma', 'Mousin Mulani', 'Navin Prasad', 'Nayan Kaslikar', 'Paresh Awashank', 
        'Prachi Madgaonkar', 'Ravindra Shivdas', 'Ritika Markandey', 'Ruturaj Maggirwar', 'Rutika Khaire', 
        'Sameep Sawant', 'Sanket Patil', 'Shradhha Deshmukh', 'Sonal Surve', 'Suvarna Deshpande', 
        'Suyash Muley', 'Sujay Mane', 'Vidushi Pawar', 'Vivek Alhat', 'Vaibhav Bhutkar', 'Yogini Thakur', 
        'Yogita Kadam'
    ];
    @track names = [
        'Analysis', 'Code Review', 'Create Charts', 'DB Activity', 'Data Migration',
        'Design', 'Development', 'Documentation', 'DSM', 'Explore Data',
        'Holiday', 'HR Accounts', 'HR General', 'HR Project Delivery',
        'IT Support and others', 'Learning', 'Leave', 'Meeting (Internal Discussion)',
        'POC', 'Project Discussion', 'Project Huddle', 'Sprint Management',
        'Story Creation', 'Tech Discussion', 'Testing', 'Unit Testing'
    ];
    @track billableFilter = 'All';
    @track projectBillableMap = {}; 
    
    get today() {
        return new Date().toISOString().split('T')[0];
    }

    get yearOptions() {
        const currentYear = new Date().getFullYear();
        const years = [
            { label: currentYear.toString(), value: currentYear.toString() },
            { label: '2024', value: '2024' },
            { label: '2025', value: '2025' },
        ];
        return [{ label: 'All', value: 'All' }, ...years];
    }

    // Add this method
    handleYearChange(event) {
        this.selectedYear = event.target.value;
        this.resetFilters();
    }
    
    @track currentPage = 1;
    @track totalRecords = 0;
    @track pageSize = 100;
    @track pageS = 800;
    totalPages = 0;

    connectedCallback() {
        this.selectedYear = this.currentYear;
    this.selectedMonth = this.currentMonth;
    this.loadProjectBillableStatus();
        this.loadLogs();
        this.loadTotalLogsCount();
        this.loadTotalMinutes();
        this.checkMember() ;
        loadScript(this, XLSX_RESOURCE)
            .then(() => {
                console.log('xlsx library loaded successfully');
            })
            .catch(error => {
                console.error('Error loading xlsx library:', error);
                this.showToast('Error', 'Failed to load XLSX library', 'error');
            });
    }


    loadProjectBillableStatus() {
        getProjectBillableStatus()
            .then(result => {
                this.projectBillableMap = result;
                this.loadTotalMinutes();
            })
            .catch(error => {
                console.error('Error loading project billable status:', error);
                this.showToast('Error', 'Failed to load project billable status', 'error');
            });
    }

  
    loadLogs() {
        this.isLoading = true;
        getLogsByProject({ 
            project: this.selectedProject === 'All' ? '' : this.selectedProject, 
            month: this.selectedMonth === 'All' ? '' : this.selectedMonth,
            year: this.selectedYear === 'All' ? '' : this.selectedYear,
            startDate: this.startDate,
            endDate: this.endDate,
            userName: this.selectedUser === 'All' ? '' : this.selectedUser,
            name: this.selectedName === 'All' ? '' : this.selectedName,
            limitSize: this.pageSize, 
            offset: (this.currentPage - 1) * this.pageSize,
            sortField: this.sortedBy,
            sortDirection: this.sortDirection,
            billableFilter: this.billableFilter === 'All' ? '' : this.billableFilter
        })
        .then(result => {
            this.logs = result.map(log => {
                return {
                    ...log,
                    OwnerName: log.User__r ? `${log.User__r.FirstName} ${log.User__r.LastName}` : '',
                    Mins__c: parseInt(log.Mins__c, 10) || 0
                };
            });
            //this.totalMinutes = result.totalMinutes;
           
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
   

    loadTotalMinutes() {
        this.isLoading = true;
        getLogsByProjectwithoutpagination({ 
            project: this.selectedProject === 'All' ? '' : this.selectedProject, 
            month: this.selectedMonth === 'All' ? '' : this.selectedMonth,
            year: this.selectedYear === 'All' ? '' : this.selectedYear,
            startDate: this.startDate,
            endDate: this.endDate,
            userName: this.selectedUser === 'All' ? '' : this.selectedUser,
            name: this.selectedName === 'All' ? '' : this.selectedName,
            sortField: this.sortedBy,
            sortDirection: this.sortDirection,
            billableFilter: this.billableFilter === 'All' ? '' : this.billableFilter
        })
        .then(result => {
            this.logs1 = result.map(log1 => ({
                ...log1,
                OwnerName: log1.User__r ? `${log1.User__r.FirstName} ${log1.User__r.LastName}` : '',
                Mins__c: log1.Mins__c ? parseInt(log1.Mins__c, 10) : 0
            }));

            this.totalMinutes = this.logs1.reduce((sum, log1) => {
                const isBillable = this.projectBillableMap[log1.Project__c];
                if (this.billableFilter === 'All' ||
                    (this.billableFilter === 'yes' && isBillable) ||
                    (this.billableFilter === 'no' && !isBillable)) {
                    return sum + log1.Mins__c;
                }
                return sum;
            }, 0);

            console.log('Total minutes:', this.totalMinutes);
            this.error = undefined;
            this.isLoading = false;
        })
        .catch(error => {
            this.error = error;
            this.isLoading = false;
            this.showToast('Error', 'Failed to fetch total minutes', 'error');
        });
    }
    loadTotalLogsCount() {
        getTotalLogsCount({ 
            project: this.selectedProject === 'All' ? '' : this.selectedProject,
            month: this.selectedMonth === 'All' ? '' : this.selectedMonth,
            year: this.selectedYear === 'All' ? '' : this.selectedYear,
            startDate: this.startDate,
            endDate: this.endDate,
            userName: this.selectedUser === 'All' ? '' : this.selectedUser,
            name: this.selectedName === 'All' ? '' : this.selectedName
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
        this.selectedProject = event.target.value;
        this.resetFilters();
    }

    handleMonthChange(event) {
        this.selectedMonth = event.target.value;
        this.resetFilters();
    }
ismessage=false;
    handleStartDateChange(event) {
    let selectedDate = new Date(event.target.value);
    let today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day for accurate comparison

    if (selectedDate > today) {
        this.ismessage = true;
            setTimeout(() => {
                this.ismessage = false;
            }, 2000);
        event.target.value = this.today;
        this.startDate = this.today;
    } else {
        this.startDate = event.target.value;

    }
    this.validateDateRange();
    this.resetFilters();
}

handleEndDateChange(event) {
    let selectedDate = new Date(event.target.value);
    let today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day for accurate comparison

    if (selectedDate > today) {
        this.ismessage = true;
            setTimeout(() => {
                this.ismessage = false;
            }, 2000);
        event.target.value = this.today;
        this.endDate = this.today;
    } else {
        this.endDate = event.target.value;
    }
    this.validateDateRange();
    this.resetFilters();
}

    validateDateRange() {
        if (this.startDate && this.endDate && this.startDate > this.endDate) {
            this.Message = 'Start date cannot be greater than end date.';
            this.showMessage = true;
            setTimeout(() => {
                this.showMessage = false;
            }, 3000);
        } else {
            this.showMessage = false;
            this.Message = '';
        }
    }

    handleUserChange(event) {
        this.selectedUser = event.target.value;
        this.resetFilters();
    }

    handleNameChange(event) {
        this.selectedName = event.target.value;
        this.resetFilters();
    }

    resetFilters() {
        this.currentPage = 1;
        this.loadLogs();
        this.loadTotalLogsCount();
       
        this.loadTotalMinutes();
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
            year: this.selectedYear === 'All' ? '' : this.selectedYear,
            startDate: this.startDate,
            endDate: this.endDate,
            userName: this.selectedUser === 'All' ? '' : this.selectedUser,
            name: this.selectedName === 'All' ? '' : this.selectedName
        })
        .then(result => {
            if (!result || result.length === 0) {
                this.showToast('Warning', 'No logs to export.', 'warning');
                this.isLoading = false;
                return;
            }
    
            // Sort the result array by user's name in ascending order
            result.sort((a, b) => {
                const nameA = a.User__r ? `${a.User__r.FirstName} ${a.User__r.LastName}` : '';
                const nameB = b.User__r ? `${b.User__r.FirstName} ${b.User__r.LastName}` : '';
                return nameA.localeCompare(nameB);
            });
    
            const headers = ['Task', 'Date', 'User', 'Description', 'Minutes', 'Project'];
            const workbook = XLSX.utils.book_new();
            const chunkSize = 10000;
    
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
            this.MessageExport = 'Excel download is Successful';
            this.showMessageExport = true;
            setTimeout(() => {
                this.showMessageExport = false;
            }, 3000);
        })
        .catch(error => {
            console.error('Error exporting logs:', error);
            this.showToast('Error', 'Failed to export logs', 'error');
            this.isLoading = false;
        });
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

    get nameOptions() {
        return [{ label: 'All', value: 'All' }, ...this.names.map(name => ({ label: name, value: name }))];
    }

    get columns() {
        return [
            { label: 'User', fieldName: 'OwnerName' , sortable: true, sortedBy: 'OwnerName'},
            { label: 'Project', fieldName: 'Project__c' ,sortable: true },
            { label: 'Task', fieldName: 'Name' ,sortable: true},
            { label: 'Date', fieldName: 'Date__c', type: 'date' ,sortable: true  },
            { 
                label: 'Minutes', 
                fieldName: 'Mins__c', 
                type: 'number', 
                typeAttributes: { 
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                },
                cellAttributes: { alignment: 'left' },
                initialWidth: 120 ,
                // sortable: true
            },
            { label: 'Description', fieldName: 'Description__c' }, 
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
        this.resetFilters();
    }

    clearAllFilters() {
        this.selectedProject = 'All';
        this.selectedMonth = 'All';
    this.selectedYear = 'All';
        this.startDate = '';
        this.endDate = '';
        this.selectedUser = 'All';
        this.selectedName = 'All';
        
        // Reset the comboboxes
        const comboboxes = this.template.querySelectorAll('lightning-combobox');
        comboboxes.forEach(combobox => {
            combobox.value = 'All';
        });
    
        // Reset the date inputs
        const dateInputs = this.template.querySelectorAll('lightning-input[type="date"]');
        dateInputs.forEach(input => {
            input.value = '';
        });
    
        this.resetFilters();
        this.showToast('Success', 'All filters have been cleared', 'success');
    }


    handleSort(event) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        this.sortedBy = sortedBy;
        this.sortDirection = sortDirection;
        this.loadLogs();  // Reload logs with new sorting
    }
    checkMember(){
        checkMember({userId : USER_ID})
        .then(result=>{
            this.isMember = result;
            console.log('IsMember? : ',result);
        }).catch(error=>{
            console.error(error);
        })
    }
    handleBillableFilterChange(event) {
        this.billableFilter = event.target.value;
        this.resetFilters();
    }

    get billableFilterOptions() {
        return [
            { label: 'All', value: 'All' },
            { label: 'Billable', value: 'yes' },
            { label: 'Non-Billable', value: 'no' }
        ];
    }
    


    
    
}
