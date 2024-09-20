public with sharing class MultipleRecordCreateController {
    @AuraEnabled
    public static List<Logs__c> createMultiRecords(List<String> selectedDates, String Name, String Project, String Description, String Mins, Id userId) {
        List<Logs__c> recordsToCreate = new List<Logs__c>();

        for (String dateStr : selectedDates) {
            Date dateOfCalendar = Date.valueOf(dateStr);
            Logs__c record = new Logs__c(
                Name = Name,
                Project__c = Project,
                Description__c = Description,
                Mins__c = Mins,
                Date__c = dateOfCalendar,
                User__c = userId
            );
            recordsToCreate.add(record);
        }

        if (!recordsToCreate.isEmpty()) {
            insert recordsToCreate;
        }

        return recordsToCreate;
    }

    // Add other methods as needed, such as fetching logs for a month
}