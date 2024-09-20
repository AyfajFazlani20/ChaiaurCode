import { LightningElement, track, wire } from 'lwc';
import getActiveProjects from '@salesforce/apex/LogController.getActiveProjects';
import getActiveTasks from '@salesforce/apex/LogController.getActiveTasks';
import createLog from '@salesforce/apex/LogController.createLog' ;
import getLogsByDateAndUser from '@salesforce/apex/LogController.getLogsByDateAndUser';
import getUserProject from '@salesforce/apex/LogController.getUserProject';
import getLoggedInUserName from '@salesforce/apex/LogController.getLoggedInUserName';
import deleteRecordinTimesheet from '@salesforce/apex/LogController.deleteRecordinTimesheet'
import editCurrentLog from '@salesforce/apex/LogController.editCurrentLog';
import fetchLogData from '@salesforce/apex/LogController.fetchLogData'
import USER_ID from '@salesforce/user/Id';
import isGuest from "@salesforce/user/isGuest";
import basePath from "@salesforce/community/basePath";
import { refreshApex } from '@salesforce/apex';
import {NavigationMixin} from "lightning/navigation";
import ChartJs from '@salesforce/resourceUrl/ChartJs';
import { loadScript } from 'lightning/platformResourceLoader';
import getLogsByMonthAndUser from '@salesforce/apex/LogController.getLogsByMonthAndUser';
import createMultiRecords from '@salesforce/apex/LogController.createMultiRecords';
import checkManager from '@salesforce/apex/LogController.checkManager';
import checkSuperManager from '@salesforce/apex/LogController.checkSuperManager';
import checkManagerOrSuperManager from '@salesforce/apex/LogController.checkManagerOrSuperManager';
import checkMember from '@salesforce/apex/LogController.checkMember';
export default class TimesheetUserPage extends NavigationMixin(LightningElement) {
 flag=true;
    @track showModal = false
    @track logDetails;
    currentDate = new Date();
    selectedDate = null;
    showMessage = false;
    showError=false;
    showWarning=false ;
    warningMessage ;
    message;
    isCssLoaded = false;
    @track projectName ="Select Project";
    @track taskName ="Select Task";
    projectOptions=[];
    @track description='';
    @track timeSpent = '';
    @track currentYear;
    @track currentMonth;
    @track displayDate;
    @track loggedInUserName;
    @track isDropdownVisible = false;
    @track logs = [];
    wiredLogsResult;
    remainingTime = 480;
    totalTimeSpent =0;
    @track taskData = {};
    @track isChartJsInitialized = false;
    @track logss = [];
    @track totalMinutesByDate = {};
    @track daysInMonth = [];
    heading='Add Entry' ;
    @track values=["pune","mumbai"];
   @track totalConsumedHours;
   
   
    initialized = false;
    
/*startingg
*/
    @track isManager = false;
    @track isMember = false;
    @track isSuperManager=false;
    
    checkManager(){
        checkManager({userId : USER_ID})
        .then(result=>{
            this.isManager = result;
            console.log('Ismanager? : ',result);
        }).catch(error=>{
            console.error(error);
        })
    }

    checkSuperManager(){
        checkSuperManager({userId : USER_ID})
        .then(result=>{
            this.isSuperManager = result;
            console.log('IsSupermanager? : ',result);
        }).catch(error=>{
            console.error(error);
        })
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

    navigatetoadminpage(){
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/member-log-overview'
            }
    })}

    
    

/*e
*/

  
    taskOptions = [
    { label: 'Analysis', value: 'Analysis' },
    { label: 'Code Review', value: 'Code Review' },
    { label: 'Create Charts', value: 'Create Charts' },
    { label: 'DB Activity', value: 'DB Activity' },
    { label: 'Data Migration', value: 'Data Migration' },
    { label: 'Design', value: 'Design' },
    { label: 'Development', value: 'Development' },
    { label: 'Documentation', value: 'Documentation' },
    { label: 'DSM', value: 'DSM' },
    { label: 'Explore Data', value: 'Explore Data' },
    { label: 'Holiday', value: 'Holiday' },
    { label: 'HR Accounts', value: 'HR Accounts' },
    { label: 'HR General', value: 'HR General' },
    { label: 'HR Project Delivery', value: 'HR Project Delivery' },
    { label: 'IT Support and others', value: 'IT Support and others' },
    { label: 'Idle Time', value: 'Idle Time' },
    { label: 'Learning', value: 'Learning' },
    { label: 'Leave', value: 'Leave' },
    { label: 'Meeting (Internal Discussion)', value: 'Meeting (Internal Discussion)' },
    { label: 'Meeting', value: 'Meeting'},
    { label: 'POC', value: 'POC' },
    { label: 'Project Discussion', value: 'Project Discussion' },
    { label: 'Project Huddle', value: 'Project Huddle' },
    { label: 'Sprint Management', value: 'Sprint Management' },
    { label: 'Story Creation', value: 'Story Creation' },
    { label: 'Tech Discussion', value: 'Tech Discussion' },
    { label: 'Testing', value: 'Testing' },
    { label: 'Unit Testing', value: 'Unit Testing' }
];


    actions = [
        { label: 'Delete', name: 'delete' },
        { label: 'Edit', name: 'edit'}
    ];
 
    columns = [
        { label: 'Name', fieldName: 'Name', cellAttributes:{
             class:{fieldName:'nameColor'}
        }},
        { label: 'Project', fieldName: 'Project__c' , cellAttributes:{
             class:{fieldName:'projectColor'}
        }},
        { label: 'Description', fieldName: 'Description__c', type: 'text'},
        { label: 'Minutes', fieldName: 'Mins__c', type: 'number', cellAttributes:{
             class:{fieldName:'minutesColor'}
        }},
        { label: 'Date', fieldName: 'Date__c', type: 'date', cellAttributes:{
             class:{fieldName:'dateColor'}
        }},
        { label: '', type: 'action', typeAttributes: { rowActions: this.actions } }
    ];

    connectedCallback() {
        // Initialize selectedDate with today's date
        this.selectedDate = new Date();
        this.displayDate=this.formatDateToDayMonth(this.selectedDate);
        console.log('User Id:', USER_ID);  //user id fetched
        this.fetchLogs();  //fetch logs of selected date
        const currentDate = new Date();
        this.currentYear = currentDate.getFullYear();
        this.currentMonth = currentDate.getMonth() + 1; // Month is zero-based
        this.fetchLogsForMonth(this.currentYear, this.currentMonth);  //fetch logs of selected month


        /*s */
        this.checkManager();
        this.checkSuperManager();
        this.checkMember();


    }

    renderedCallback() {
        // if (this.initialized) {
        //     return;
        // }
        // this.initialized = true;
        // let listId = this.template.querySelector('datalist').id;
        // this.template.querySelector("input").setAttribute("list", listId);

        if (this.isChartJsInitialized) {
            return;
        }
        this.isChartJsInitialized = true;

        Promise.all([
            loadScript(this, ChartJs)
        ])
        .then(() => {
            // Chart.js library loaded
            console.log('lib loaded');
            
            this.renderPieChart();
        })
        .catch(error => {
            console.log('Error loading Chart.js');
            console.error(error);
        });
    }
   

    @wire(getLoggedInUserName,{userId : USER_ID})
    wiredLoggedInUser({error, data}){
        if(data){
            this.loggedInUserName = data.Name;
        }
        else if(error){
            console.error('Erorr Fetching LoggedIn User Name', error);
        }
    }

    @wire(getLogsByDateAndUser, { selectedDate: '$formattedSelectedDate', userId: USER_ID })
    wiredLogs(result) {
        this.wiredLogsResult = result;
        if (result.data) {
            
            this.logs = result.data;
            this.calculateTaskData();
            
        } else if (result.error) {
            console.error("An error occured", result.error);
            this.logs = undefined;
        }
    }

    @wire(getUserProject, { userId: USER_ID })
    wiredUserProject({ error, data }) {
        if (data) {
            
            this.projectOptions = JSON.parse(data).map(option => ({
                label: option,
                value: option
            }));
        } else if (error) {
            console.error("Error fetching projects",error);
        }
    }


    toggleDropdown() {
        this.isDropdownVisible = !this.isDropdownVisible; //boolean logic for visibility
    }

    get monthYear() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const month = months[this.currentDate.getMonth()];
        const year = this.currentDate.getFullYear();
        return `${month} ${year}`;
    }

    prevMonth() {
        if (this.currentMonth === 1) {
            this.currentYear--;
            this.currentMonth = 12;
        } else {
            this.currentMonth--;
        }
       this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
        this.fetchLogsForMonth(this.currentYear, this.currentMonth);
    }

    nextMonth() {
        if (this.currentMonth === 12) {
            this.currentYear++;
            this.currentMonth = 1;
        } else {
            this.currentMonth++;
        }
       this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() +1, 1);
        this.fetchLogsForMonth(this.currentYear, this.currentMonth);
    }
    

    handleDateClick(event) {
        
        const selectedDate = new Date(event.currentTarget.dataset.date);
        this.displayDate=this.formatDateToDayMonth(selectedDate);
        console.log('Selected date:', selectedDate);
        this.selectedDate = selectedDate;
        if(this.selectedDate > new Date()){
           
            this.showWarning = true;
            this.warningMessage="You cant log hours for future dates" ;
            setTimeout(() => {
                 this.showWarning = false;
            }, 2000);
          this.selectedDate=new Date();
          return ;
        }
    
        // Remove the 'current-day' class from all elements
        const allDays = this.template.querySelectorAll('.days div');
        allDays.forEach(day => {
            day.classList.remove('current-day');
        });
    
        // Add the 'current-day' class to the clicked date element
        event.currentTarget.classList.add('current-day');
    }

    

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

     formatDateToDayMonth(date) {
        const options = { day: 'numeric', month: 'long' };
        return date.toLocaleDateString('en-US', options);
    }
    
   
    get formattedSelectedDate() {
         return this.selectedDate ? this.formatDate(this.selectedDate) : null;
    }

     // Method to fetch logs for the selected month
     fetchLogsForMonth(year, month) {
        getLogsByMonthAndUser({ year: year, month: month, userId: USER_ID })
            .then(result => {
                this.logss = result;
                this.calculateTotalMinutesByDate();
                this.generateCalendarDays(year, month);
            })
            .catch(error => {
                console.error("Error fetching logs for selected month", error);
            });
    }

    // Method to calculate total minutes for each date
    calculateTotalMinutesByDate() {
        this.totalMinutesByDate = {};
        this.logss.forEach(log => {
            const dateKey = new Date(log.Date__c).toISOString().split('T')[0];
            if (!this.totalMinutesByDate[dateKey]) {
                this.totalMinutesByDate[dateKey] = 0;
            }
            this.totalMinutesByDate[dateKey] += parseInt(log.Mins__c);
        });
    }

    // Method to generate calendar days for the selected month
    generateCalendarDays(year, month) {
        const daysInMonth = [];
        const daysInMonthCount = new Date(year, month, 0).getDate();
        const firstDay = new Date(year, month - 1, 1).getDay(); // Get the weekday index of the first day of the month
        let currentWeekday = 0;

        const companyHolidays = [
            '2024-08-15', // 15th August 2024
            '2024-10-02', // 2nd October 2024
            '2024-10-31', // 31st October 2024
            '2024-12-25'  // 25th December 2024
        ];

        // Add empty divs for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            daysInMonth.push({ date: null, value: '', classes: 'other-month' });
            currentWeekday++;
        }


        const today = new Date().toISOString().split('T')[0];
        
        // Add days for the selected month
        for (let i = 1; i <= daysInMonthCount; i++) {
            const date = new Date(Date.UTC(year, month - 1, i)).toISOString().split('T')[0];
            const totalMinutes = this.totalMinutesByDate[date] || 0;
            let classes;
            
            const dayOfWeek = new Date(year, month - 1, i).getDay();
    
            if (companyHolidays.includes(date)) {
                classes = 'holiday-yellow';
            } else if (dayOfWeek === 0 || dayOfWeek === 6) {
                classes = 'weekend-grey';
            } else if (date < today) {
                classes = totalMinutes < 480 ? 'color-red' : 'color-green';
            } else {
                classes = '';
            }
            daysInMonth.push({ date: date, value: i, classes: classes });
            currentWeekday++;
        }
  
        // Add empty divs for remaining days in the last week
        while (currentWeekday % 7 !== 0) {
            daysInMonth.push({ date: null, value: '', classes: 'other-month' });
            currentWeekday++;
        }

        this.daysInMonth = daysInMonth;
    }

    handleTaskChange(event) {
        this.taskName = event.target.value;
    }
    setSelectedTask(projectValue) {
        this.taskName = projectValue;
        this.template.querySelector('select[data-id="projectSelect"]').value = projectValue;
        }
    handleProjectChange(event) {
        this.projectName = event.target.value;
        console.log('Projectname:',this.projectName);
        }
    
    handleDescriptionChange(event){
        this.description=event.target.value;
    }
    handleTimeChange(event) {
        this.timeSpent = event.target.value;
    }

    saveLog(event) {
        if(this.projectName=="Select Project"){
            this.showError = true;
            this.message = "Fill Project"

            setTimeout(() => {
                 this.showError = false;
            }, 1000);
            return;
            
        }
        if(this.taskName=="Select Task"){
            this.showError = true;
            this.message = "Fill Task"

            setTimeout(() => {
                 this.showError = false;
            }, 1000);
            return;
        }
         
         if(this.timeSpent==''){
            this.showError = true;
            this.message = "Fill Time "

            setTimeout(() => {
                 this.showError = false;
            }, 1000);
            return;
        }
        if(this.timeSpent >480){
            this.showError = true;
            this.message = "Exceeding minutes for a day "

            setTimeout(() => {
                 this.showError = false;
            }, 1000);
            return;
        }

        const utcDate = new Date(Date.UTC(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), this.selectedDate.getDate()));

        
        createLog({
            Name: this.taskName,
            Project: this.projectName,
            Description : this.description,
            Mins: this.timeSpent,
            CalendarDate: utcDate.toISOString().split('T')[0] ,// Format selectedDate as YYYY-MM-DD
            userId: USER_ID
        })
        .then(result => {
            this.showMessage = true;
            this.message = "log created successfully"
            this.fetchLogsForMonth(this.currentYear, this.currentMonth);
            
            

            setTimeout(() => {
                 this.showMessage = false;
            }, 1000);
            console.log('Log record created successfully:', result);
            this.timeSpent = '';
            this.description='';
            this.setSelectedTask("Select Task");
            return refreshApex(this.wiredLogsResult);
        })
        .catch(error => {
            console.error('Error creating Log record:', error);
            // Handle error appropriately
        });
    }


    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        
        if (actionName === 'delete') {
            this.handleDelete(row);
        } 
        else if(actionName === 'edit'){
            this.handleEdit(row);
        }else {
            console.log('Error while deleting the record');
        }
    }

    handleEdit(row){

        fetchLogData({recordId : row.Id})
        .then((data)=>{
            this.logDetails = data;
            this.taskName = this.logDetails.Name;
            this.description = this.logDetails.Description__c;
            this.projectName = this.logDetails.Project__c;
            this.timeSpent = this.logDetails.Mins__c;
            this.showModal = true;
        })
        .catch((error)=>{
            console.error("Error fetching current log details", error);
        })
    }

    handleEditLog(event){
        event.preventDefault();
        const logId = event.target.dataset.id;
        const utcDate = new Date(Date.UTC(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), this.selectedDate.getDate()));
        
        editCurrentLog({ 
            Name: this.taskName,
            Description : this.description,
            Project: this.projectName,
            Mins: this.timeSpent,
            CalendarDate: utcDate.toISOString().split('T')[0] ,
            userId: USER_ID,
            recordId : logId
        })
        .then((data)=>{
            this.showModal = false;
            this.showMessage = true;
            this.message = "log edited successfully";

            setTimeout(() => {
                this.showMessage = false;
            }, 1000);
            return refreshApex(this.wiredLogsResult);
        })
        .catch((error)=>{
            console.error("An error occured while editing the log", error);
        })
    }

    handleCancel(){
        this.showModal = false;
    }

    async handleDelete(row) {
        try {
            const result = confirm("Do you want to Delete?");
            if(!result) return;
            await deleteRecordinTimesheet({ recordId: row.Id });
            this.fetchLogsForMonth(this.currentYear, this.currentMonth);
            
          this.showMessage = true;
          this.message = "log deleted successfully"

          setTimeout(() => {
            this.showMessage = false;
        }, 1000);
        return refreshApex(this.wiredLogsResult);
            
    
        } catch (error) {
            console.error('Error deleting record: ', error);
        }
    }
    
    //below-code-for-pie-chart
  

    calculateTaskData(){
        this.taskData = {}; //arr for all tasks
        //iterating-to-check-if-task-name-already-exists
        this.logs.forEach(log=>{
            if(!this.taskData[log.Name]){
                this.taskData[log.Name] = 0;
            }
            //adding-mins-to-task
            this.taskData[log.Name] += parseFloat(log.Mins__c);
        })

        if(this.isChartJsInitialized){
            this.renderPieChart();
        }
    }

    fetchLogs(){
        return refreshApex(this.wiredLogsResult);
    }
    @track filledHours;
    getFilledHours(){
        this.filledHours=`Filled Hours: ${Math.floor(this.totalConsumedHours / 60)}h ${this.totalConsumedHours % 60}m`;
    }
    renderPieChart() {
        const ctx = this.template.querySelector('canvas')?.getContext('2d');
    
        if (this.chartInstance) {
            this.chartInstance.destroy();
        }
        
        const totalAvailableHours = 8 * 60; 
    
        
        const taskNames = Object.keys(this.taskData);
        const taskHours = Object.values(this.taskData);
        this.totalConsumedHours = taskHours.reduce((total, hours) => total + hours, 0);
        this.getFilledHours();
        // Remaining hours
        const remainingHours = Math.max(totalAvailableHours - this.totalConsumedHours, 0);
    
        // Colors for tasks
        const taskColors = this.generateColors(taskNames?.length);
    
        
        const colors = [...taskColors, '#F9F6F7','Green']; 
    
        
        const data = [...taskHours, remainingHours];
       
        const labels = [...taskNames,`Remaining Hours: ${Math.floor(remainingHours / 60)}h ${remainingHours % 60}m` ];

        this.chartInstance =new window.Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                }]
            },
            options: {
                
                responsive: true,
                title: {
                    display: true,
                    text: "Working Hours"
                  },
                  
            }
        });
        
    }
    
    
    generateColors(count) {
        const colors = [];
        for (let i = 0; i < count; i++) {
            colors.push(this.getRandomColor());
        }
        return colors;
    }
    
    
    getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }


    get isGuest() {
        return isGuest;
    }

    get logoutLink() {
        const sitePrefix = basePath.replace("/", "");
        const siteUrl = 'https://elastikteams7.my.site.com/Logmyhours';
        return `${siteUrl}/${sitePrefix}vforcesite/secur/logout.jsp`;
    } 


    showCalendar = false; // Initial state
    @track startDate;
    @track endDate;
    @track selectedDates = [];
    // handleStartDateChange(event) {
    //     console.log('Current Date' ,this.currentDate) ;
    //     console.log('Event target value ki value' ,event.target.value) ;
    //     if(event.target.value > this.currentDate)
    //     {
    //         console.log('inside future date') ;
    //         this.showWarning = true;
    //         this.warningMessage="You cant log hours for future dates" ;
    //         setTimeout(() => {
    //              this.showWarning = false;
    //         }, 2000);
    //         return ;
    //     }
    //     this.startDate = event.target.value;
    // }

    handleStartDateChange(event) {
        // console.log('Current Date', this.currentDate);
        // console.log('Event target value ki value', event.target.value);
    
        // Convert event.target.value to a Date object
        const selectedDate = new Date(event.target.value);
    
        // Check if selectedDate is greater than currentDate
        if (selectedDate > new Date()) {
            this.startDate = '';
            console.log('inside future date');
            this.showWarning = true;
            this.warningMessage = "You can't log hours for future dates";
            setTimeout(() => {
                this.showWarning = false;
            }, 2000);
           
            return;
        }else{
            this.startDate = event.target.value;

        }
    
        
    }
    
    handleEndDateChange(event) {
        if(event.target.value> new Date())
        {
            this.showWarning = true;
            this.warningMessage="You cant log hours for future dates" ;
            setTimeout(() => {
                 this.showWarning = false;
            }, 2000);
            return ;
        }
        this.endDate = event.target.value;
    }
  
 
    handleSelectDates() {
        if(!this.startDate || !this.endDate)
        {
            // console.log("Select both start and end dates") ;
            this.showError = true;
            this.message = "Select both start and end dates"

            setTimeout(() => {
                 this.showError = false;
            }, 1000);

            return false;
        }
     
        const start = new Date(this.startDate);

        const end = new Date(this.endDate);
        const dates = [];
        if(start > end) 
        {
            // console.log("Start date cant be greater than End date");
            this.showError = true;
            this.message = "Start date cant be greater than End date"

            setTimeout(() => {
                 this.showError = false;
            }, 1000);
            return false;
        }
        while (start <= end) {
           
            dates.push(start.toISOString()); 
            start.setDate(start.getDate() + 1);

        }

        this.selectedDates = this.filterWeekends(dates);;
        console.log('Selected Dates:', this.selectedDates);
        return true ;
    }

    filterWeekends(dates) {
        return dates.filter(dateStr => {
            const date = new Date(dateStr);
            const day = date.getUTCDay();
            return day !== 0 && day !== 6; // 0 is Sunday, 6 is Saturday
        });
    }


    handleToggleChange(event) {
        this.showCalendar = event.target.checked;
        if(this.showCalendar)
        {
            this.heading='Add Multiple Entries' ;
        }else{
            this.heading='Add Entry' ;
        }
    }

    @wire(getActiveProjects)
    wiredProjects({ data, error }) {
        console.log('inside activeprojects')
        if (data) {
            console.log('ho');
            // Map project data to the desired format for the select options
            this.projectOptions = data.map(proj => {
                return { label: proj.Name, value: proj.Name };
            });
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.projectOptions = [];
        }
    }

    @wire(getActiveTasks)
    wiredTasks({ data, error }){
        if (data) {
            console.log('ho');
            // Map project data to the desired format for the select options
            this.taskOptions = data.map(task => {
                return { label: task.Name, value: task.Name };
            });
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.taskOptions = [];
        }
    }

    MultisaveLog() {
        

        if((new Date(this.endDate)) > new Date())
        {
            this.showWarning = true;
            this.warningMessage="You cant log hours for future dates" ;
            setTimeout(() => {
                 this.showWarning = false;
            }, 2000);
          return ;
        }
          


        if(this.projectName=="Select Project"){
            this.showError = true;
            this.message = "Fill Project"

            setTimeout(() => {
                 this.showError = false;
            }, 2000);
            return;
            
        }

        

        if(this.taskName=="Select Task"){
            this.showError = true;
            this.message = "Fill Task"

            setTimeout(() => {
                 this.showError = false;
            }, 2000);
            return;
        }
         
         if(this.timeSpent==''){
            this.showError = true;
            this.message = "Fill Time "

            setTimeout(() => {
                 this.showError = false;
            }, 2000);
            return;
        }
        const res= this.handleSelectDates() ;
        if(res===true)
        { 
            
           createMultiRecords({ selectedDates: this.selectedDates,  Name: this.taskName,  Project: this.projectName,  Description : this.description, Mins: this.timeSpent,userId: USER_ID })
               .then(result => {
                 
                   console.log('Records created successfully:', result);
                   this.fetchLogsForMonth(this.currentYear, this.currentMonth);
                   this.showMessage = true;
                    this.message = "Multiple Date Entries created successfully" ;
                    this.timeSpent = '';
                    this.description='';
                    this.setSelectedTask("Select Task");
                  setTimeout(() => {
                 this.showMessage = false;
            }, 1000);

                   return refreshApex(this.wiredLogsResult);
               })
               .catch(error => {
                   // Handle error
                   console.error('Error creating records:', error);
               });
       }
   }
 
}