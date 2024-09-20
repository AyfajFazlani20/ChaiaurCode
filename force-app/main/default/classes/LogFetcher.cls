public with sharing class LogFetcher {
    @AuraEnabled(cacheable=true)
    public static List<Logs__c> getLogsByProject(String project, String month, String startDate, String endDate, String userName, Integer limitSize, Integer offset ,String sortField, String sortDirection) {
        String query = 'SELECT Id, Name, Owner.Name, Date__c, User__c, User__r.FirstName, User__r.LastName, Description__c, Mins__c, Project__c FROM Logs__c';
        List<String> conditions = new List<String>();

        if (String.isNotBlank(project)) {
            conditions.add('Project__c = :project');
        }
        if (String.isNotBlank(month)) {
            Integer monthValue = Integer.valueOf(month);
            conditions.add('CALENDAR_MONTH(Date__c) = :monthValue');
        }
        if (String.isNotBlank(startDate) && String.isNotBlank(endDate)) {
            Date startDateValue = Date.valueOf(startDate);
            Date endDateValue = Date.valueOf(endDate);
            conditions.add('Date__c >= :startDateValue AND Date__c <= :endDateValue');
        }
        if (String.isNotBlank(userName)) {
            conditions.add('User__r.Name = :userName');
        }

        if (!conditions.isEmpty()) {
            query += ' WHERE ' + String.join(conditions, ' AND ');
        }

        // query += ' ORDER BY Date__c DESC LIMIT :limitSize OFFSET :offset';
        if (String.isNotBlank(sortField)) {
            query += ' ORDER BY ' + sortField + ' ' + sortDirection;
        } else {
            query += ' ORDER BY Date__c DESC';
        }
    
        query += ' LIMIT :limitSize OFFSET :offset';

        return Database.query(query);
    }

    @AuraEnabled(cacheable=true)
    public static Integer getTotalLogsCount(String project, String month, String startDate, String endDate, String userName) {
        String query = 'SELECT COUNT() FROM Logs__c';
        List<String> conditions = new List<String>();

        if (String.isNotBlank(project)) {
            conditions.add('Project__c = :project');
        }
        if (String.isNotBlank(month)) {
            Integer monthValue = Integer.valueOf(month);
            conditions.add('CALENDAR_MONTH(Date__c) = :monthValue');
        }
        if (String.isNotBlank(startDate) && String.isNotBlank(endDate)) {
            Date startDateValue = Date.valueOf(startDate);
            Date endDateValue = Date.valueOf(endDate);
            conditions.add('Date__c >= :startDateValue AND Date__c <= :endDateValue');
        }
        if (String.isNotBlank(userName)) {
            conditions.add('User__r.Name = :userName');
        }

        if (!conditions.isEmpty()) {
            query += ' WHERE ' + String.join(conditions, ' AND ');
        }

        return Database.countQuery(query);
    }

    @AuraEnabled
public static List<Logs__c> getAllFilteredLogs(String project, String month, String startDate, String endDate, String userName) {
    String query = 'SELECT Id, Name, Owner.Name, Date__c, User__c, User__r.FirstName, User__r.LastName, Description__c, Mins__c, Project__c FROM Logs__c';
    List<String> conditions = new List<String>();

    if (String.isNotBlank(project)) {
        conditions.add('Project__c = :project');
    }
    if (String.isNotBlank(month)) {
        Integer monthValue = Integer.valueOf(month);
        conditions.add('CALENDAR_MONTH(Date__c) = :monthValue');
    }
    if (String.isNotBlank(startDate) && String.isNotBlank(endDate)) {
        Date startDateValue = Date.valueOf(startDate);
        Date endDateValue = Date.valueOf(endDate);
        conditions.add('Date__c >= :startDateValue AND Date__c <= :endDateValue');
    }
    if (String.isNotBlank(userName)) {
        conditions.add('User__r.Name = :userName');
    }

    if (!conditions.isEmpty()) {
        query += ' WHERE ' + String.join(conditions, ' AND ');
    }

    query += ' ORDER BY Date__c DESC';

    return Database.query(query);
}
}