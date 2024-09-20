public with sharing class LogFetcherThird {
    @AuraEnabled(cacheable=true)
    public static List<Logs__c> getLogsByProject(String project, String month, String year, String startDate, String endDate, String userName, String name, Integer limitSize, Integer offset, String sortField, String sortDirection, String billableFilter) {
        String query = 'SELECT Id, Name, Owner.Name, Date__c, User__c, User__r.FirstName, User__r.LastName, Description__c, Mins__c, Project__c FROM Logs__c';
        Map<String, Boolean> projectBillableMap = new Map<String, Boolean>();
        for (ET_Project__c proj : [SELECT Name, isBillable__c FROM ET_Project__c]) {
            projectBillableMap.put(proj.Name, proj.isBillable__c);
        }
        List<String> conditions = new List<String>();

        if (String.isNotBlank(project)) {
            conditions.add('Project__c = :project');
        }
        if (String.isNotBlank(month)) {
            Integer monthValue = Integer.valueOf(month);
            conditions.add('CALENDAR_MONTH(Date__c) = :monthValue');
        }
        if (String.isNotBlank(year)) {
            Integer yearValue = Integer.valueOf(year);
            conditions.add('CALENDAR_YEAR(Date__c) = :yearValue');
        }
        if (String.isNotBlank(startDate) && String.isNotBlank(endDate)) {
            Date startDateValue = Date.valueOf(startDate);
            Date endDateValue = Date.valueOf(endDate);
            conditions.add('Date__c >= :startDateValue AND Date__c <= :endDateValue');
        }
        if (String.isNotBlank(userName)) {
            conditions.add('User__r.Name = :userName');
        }
        if (String.isNotBlank(name)) {
            conditions.add('Name = :name');
        }
        if (String.isNotBlank(billableFilter)) {
            Set<String> billableProjects = new Set<String>();
            for (String projName : projectBillableMap.keySet()) {
                if ((billableFilter == 'yes' && projectBillableMap.get(projName)) ||
                    (billableFilter == 'no' && !projectBillableMap.get(projName))) {
                    billableProjects.add(projName);
                }
            }
            conditions.add('Project__c IN :billableProjects');
        }

        if (!conditions.isEmpty()) {
            query += ' WHERE ' + String.join(conditions, ' AND ');
        }

        if (String.isNotBlank(sortField)) {
            switch on sortField {
                when 'OwnerName' {
                    query += ' ORDER BY User__r.FirstName ' + sortDirection;
                }
                when 'Project__c' {
                    query += ' ORDER BY Project__c ' + sortDirection;
                }
                when 'Name' {
                    query += ' ORDER BY Name ' + sortDirection;
                }
                when 'Mins__c' {
                    query += ' ORDER BY Integer.valueOf(Mins__c) ' + sortDirection;
                }
                when else {
                    query += ' ORDER BY ' + sortField + ' ' + sortDirection;
                }
            }
        } else {
            query += ' ORDER BY Date__c DESC';
        }

        query += ' LIMIT :limitSize OFFSET :offset';

        return Database.query(query);
    }

    @AuraEnabled(cacheable=true)
    public static Integer getTotalLogsCount(String project, String month, String year, String startDate, String endDate, String userName, String name) {
        String query = 'SELECT COUNT() FROM Logs__c';
        List<String> conditions = new List<String>();

        if (String.isNotBlank(project)) {
            conditions.add('Project__c = :project');
        }
        if (String.isNotBlank(month)) {
            Integer monthValue = Integer.valueOf(month);
            conditions.add('CALENDAR_MONTH(Date__c) = :monthValue');
        }
        if (String.isNotBlank(year)) {
            Integer yearValue = Integer.valueOf(year);
            conditions.add('CALENDAR_YEAR(Date__c) = :yearValue');
        }
        if (String.isNotBlank(startDate) && String.isNotBlank(endDate)) {
            Date startDateValue = Date.valueOf(startDate);
            Date endDateValue = Date.valueOf(endDate);
            conditions.add('Date__c >= :startDateValue AND Date__c <= :endDateValue');
        }
        if (String.isNotBlank(userName)) {
            conditions.add('User__r.Name = :userName');
        }
        if (String.isNotBlank(name)) {
            conditions.add('Name = :name');
        }

        if (!conditions.isEmpty()) {
            query += ' WHERE ' + String.join(conditions, ' AND ');
        }

        return Database.countQuery(query);
    }

    @AuraEnabled
    public static List<Logs__c> getAllFilteredLogs(String project, String month, String startDate, String endDate, String userName, String name) {
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
        if (String.isNotBlank(name)) {
            conditions.add('Name = :name');
        }

        if (!conditions.isEmpty()) {
            query += ' WHERE ' + String.join(conditions, ' AND ');
        }

        query += ' ORDER BY Date__c DESC';

        return Database.query(query);
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Logs__c> getLogsByProjectwithoutpagination(String project, String month, String year, String startDate, String endDate, String userName, String name, String sortField, String sortDirection, String billableFilter) {
        String query = 'SELECT Id, Name, Owner.Name, Date__c, User__c, User__r.FirstName, User__r.LastName, Description__c, Mins__c, Project__c FROM Logs__c';
        Map<String, Boolean> projectBillableMap = new Map<String, Boolean>();
        for (ET_Project__c proj : [SELECT Name, isBillable__c FROM ET_Project__c]) {
            projectBillableMap.put(proj.Name, proj.isBillable__c);
        }
        List<String> conditions = new List<String>();

        if (String.isNotBlank(project)) {
            conditions.add('Project__c = :project');
        }
        if (String.isNotBlank(month)) {
            Integer monthValue = Integer.valueOf(month);
            conditions.add('CALENDAR_MONTH(Date__c) = :monthValue');
        }
        if (String.isNotBlank(year)) {
            Integer yearValue = Integer.valueOf(year);
            conditions.add('CALENDAR_YEAR(Date__c) = :yearValue');
        }
        if (String.isNotBlank(startDate) && String.isNotBlank(endDate)) {
            Date startDateValue = Date.valueOf(startDate);
            Date endDateValue = Date.valueOf(endDate);
            conditions.add('Date__c >= :startDateValue AND Date__c <= :endDateValue');
        }
        if (String.isNotBlank(userName)) {
            conditions.add('User__r.Name = :userName');
        }
        if (String.isNotBlank(name)) {
            conditions.add('Name = :name');
        }
        if (String.isNotBlank(billableFilter)) {
            Set<String> billableProjects = new Set<String>();
            for (String projName : projectBillableMap.keySet()) {
                if ((billableFilter == 'yes' && projectBillableMap.get(projName)) ||
                    (billableFilter == 'no' && !projectBillableMap.get(projName))) {
                    billableProjects.add(projName);
                }
            }
            conditions.add('Project__c IN :billableProjects');
        }

        if (!conditions.isEmpty()) {
            query += ' WHERE ' + String.join(conditions, ' AND ');
        }

        if (String.isNotBlank(sortField)) {
            switch on sortField {
                when 'OwnerName' {
                    query += ' ORDER BY User__r.FirstName ' + sortDirection;
                }
                when 'Project__c' {
                    query += ' ORDER BY Project__c ' + sortDirection;
                }
                when 'Name' {
                    query += ' ORDER BY Name ' + sortDirection;
                }
                when else {
                    query += ' ORDER BY ' + sortField + ' ' + sortDirection;
                }
            }
        } else {
            query += ' ORDER BY Date__c DESC';
        }

        return Database.query(query);
    }

    @AuraEnabled(cacheable=true)
    public static Map<String, Boolean> getProjectBillableStatus() {
        Map<String, Boolean> projectBillableMap = new Map<String, Boolean>();
        for (ET_Project__c proj : [SELECT Name, isBillable__c FROM ET_Project__c]) {
            projectBillableMap.put(proj.Name, proj.isBillable__c);
        }
        return projectBillableMap;
    }
}