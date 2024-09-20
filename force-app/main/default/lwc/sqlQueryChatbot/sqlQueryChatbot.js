import { LightningElement, track } from 'lwc';
import generateSQLQuery from '@salesforce/apex/SQLQueryController.generateSQLQuery';

export default class SqlQueryChatbot extends LightningElement {
    @track userPrompt = '';
    @track sqlQuery = '';
    @track error;
    @track isLoading = false;

    handlePromptChange(event) {
        this.userPrompt = event.target.value;
    }

    handleGenerateQuery() {
        if (!this.userPrompt) {
            this.error = 'Please enter a question.';
            return;
        }
        this.error = undefined;
        this.sqlQuery = '';
        this.isLoading = true;

        generateSQLQuery({ userPrompt: this.userPrompt })
            .then(result => {
                this.sqlQuery = result;
                this.isLoading = false;
            })
            .catch(error => {
                this.error = 'Error generating SQL query: ' + error.body.message;
                this.isLoading = false;
            });
    }
}