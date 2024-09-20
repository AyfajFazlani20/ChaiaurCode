public with sharing class LogController {

    
    @AuraEnabled
    public static boolean checkManager(Id userId){
        List<User> a =  [SELECT Id,Designation__c FROM User WHERE Id = :userId and Designation__c ='Manager'];
        if(a.size()>0){
            return true;
        }
        return false;
        
    }
    
    @AuraEnabled
    public static boolean checkMember(Id userId){
        List<User> a =  [SELECT Id,Designation__c FROM User WHERE Id = :userId and Designation__c ='Member'];
        if(a.size()>0){
            return true;
        }
        return false;
        
    }
    
    @AuraEnabled
    public static boolean checkSuperManager(Id userId){
        List<User> a =  [SELECT Id,Designation__c FROM User WHERE Id = :userId and Designation__c ='Super Manager'];
        if(a.size()>0){
            return true;
        }
        return false;
        
    }
    
    @AuraEnabled
    public static boolean checkManagerOrSuperManager(Id userId){
        List<User> a =  [SELECT Id,Designation__c FROM User WHERE Id = :userId and (Designation__c ='Super Manager' or Designation__c ='Manager')];
        if(a.size()>0){
            return true;
        }
        return false;
        
    }
    
     @AuraEnabled
    public static boolean checkManagerOrMember(Id userId){
        List<User> a =  [SELECT Id,Designation__c FROM User WHERE Id = :userId and (Designation__c ='Member' or Designation__c ='Manager')];
        if(a.size()>0){
            return true;
        }
        return false;
        
    }
    
    @AuraEnabled
    public static void createLog(String Name, String Project,String Description, String Mins, Date CalendarDate ,Id userId) {
        try {
           
            Logs__c newLog = new Logs__c();
            newLog.Name = Name;
            newLog.Project__c = Project;
            newLog.Description__c=Description;
            newLog.Mins__c = Mins;
            newLog.Date__c = CalendarDate;
            newLog.User__c = userId;

            insert newLog;

        } catch(Exception e) {
            System.debug('Error creating Log record: ' + e.getMessage());
            throw e;
        }
    }

    @AuraEnabled(cacheable=true)
public static List<Logs__c> getLogsByDateAndUser(Date selectedDate, Id userId) {
    List<Logs__c> records = [SELECT Id, Name, Project__c, Mins__c, Description__c, Date__c FROM Logs__c WHERE Date__c = :selectedDate AND User__c = :userId];
    return records;
}

    @AuraEnabled(cacheable=true)
    public static List<Logs__c> getLogsByMonthAndUser(Integer month, Integer year, Id userId) {
        // Filter logs by month and year
        Date startDate = Date.newInstance(year, month, 1);
        Date endDate = startDate.addMonths(1).addDays(-1);
        List<Logs__c> records = [SELECT Id, Name, Project__c, Mins__c, Date__c 
                                  FROM Logs__c 
                                  WHERE Date__c >= :startDate AND Date__c <= :endDate 
                                        AND User__c = :userId];
        return records;
    }

@AuraEnabled
public static void deleteRecordinTimesheet(String recordId) {
    try {
        Logs__c recordToDelete = [SELECT Id FROM Logs__c WHERE Id = :recordId LIMIT 1];
        delete recordToDelete;
    } catch (Exception e) {
        throw new AuraHandledException('Error deleting record: ' + e.getMessage());
    }
}

@AuraEnabled(cacheable=true)
public static User getLoggedInUserName(Id userId){
    try {
        return [SELECT Id, Name, FirstName, LastName FROM User WHERE Id =: userId LIMIT 1];
    } catch (Exception e) {
        throw new AuraHandledException(e.getMessage());
    }
}

@AuraEnabled(cacheable=true)
    public static String getUserProject(String userId) {
        List<String> projectOptions = new List<String>();
        User u = [SELECT Project__c FROM User WHERE Id = :userId];
        if(u != null && u.Project__c != null) {
            projectOptions = u.Project__c.split(',');
        }
        return JSON.serialize(projectOptions);
    }

    @AuraEnabled
    public static void editCurrentLog(String Name, String Description, String Project, String Mins, Date CalendarDate ,Id userId, Id recordId){
        try {
            Logs__c log = [SELECT Id, Name, Description__c, Project__c, Mins__c, Date__c FROM Logs__c WHERE Id =: recordId LIMIT 1];

            log.Name = Name;
            log.Description__c = Description;
            log.Project__c = Project;
            log.Mins__c = Mins;

            UPDATE log;
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static Logs__c fetchLogData(Id recordId){
        try {
            return [SELECT Id, Name, Project__c, Mins__c, Description__c FROM Logs__c WHERE Id =: recordId LIMIT 1];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }



               
    @AuraEnabled
public static void createMultiRecords(List<String> selectedDates, String Name, String Project, String Description ,String Mins, Id userId) {
    List<Logs__c> recordsToCreate = new List<Logs__c>();

    for (String dateStr : selectedDates) {
        Date dateofcalendar = Date.valueOf(dateStr);
        Logs__c record = new Logs__c();
        record.Name = Name;
        record.Project__c = Project;
        record.Description__c=Description;
        record.Mins__c = String.valueOf(Mins);
        record.Date__c = dateofcalendar;
        record.User__c = userId;
        
        recordsToCreate.add(record);
    }

    if (!recordsToCreate.isEmpty()) {
        insert recordsToCreate;
    }
}

}