import { LightningElement, track } from 'lwc';
import getMonthlyLogs from '@salesforce/apex/MonthlyLogsController.getMonthlyLogs';

export default class MonthlyLogs extends LightningElement {
    @track selectedMonth = '';
    @track userLogs = [];
    @track error;

    connectedCallback() {
        // Set the initial month to the current month
        const today = new Date();
        this.selectedMonth = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
        this.fetchLogs();
    }

    handleMonthChange(event) {
        this.selectedMonth = event.target.value;
        this.fetchLogs();
    }

    fetchLogs() {
        getMonthlyLogs({ selectedMonth: this.selectedMonth })
            .then(result => {
                console.log('Raw result from Apex:', JSON.parse(JSON.stringify(result)));
                if (result.length === 0) {
                    this.error = 'No logs found for the selected month.';
                    this.userLogs = [];
                } else {
                    this.userLogs = result.map(log => ({
                        userName: log.userName,
                        totalMinutes: log.totalMinutes.toFixed(2),
                        status: log.isCorrect ? 'Correct' : 'Incorrect',
                        rowClass: log.isCorrect ? '' : 'slds-is-selected'
                    }));
                    console.log('Processed userLogs:', JSON.parse(JSON.stringify(this.userLogs)));
                    this.error = undefined;
                }
            })
            .catch(error => {
                this.userLogs = [];
                this.error = error.body.message;
            });
    }
}