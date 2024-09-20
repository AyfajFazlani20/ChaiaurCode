public class TimesheetDashboardController {
	@AuraEnabled(cacheable=true)
    public static  Map<String, List<Map<String, Object>>> getTimesheetStatus(Date StartDate, Date EndDate, Integer WorkingDays) {
        Map<String, List<Map<String, Object>>> result = new Map<String, List<Map<String, Object>>>();
        List<Map<String, Object>> upToDateMembers = new List<Map<String, Object>>();
        List<Map<String, Object>> remainingMembers = new List<Map<String, Object>>();
        
        List<Logs__c> timesheetData = [
            SELECT User__c, Mins__c
            FROM Logs__c
            WHERE Date__c >= :StartDate AND Date__c <= :EndDate
        ];
        
        Integer expectedMinutes = WorkingDays * 8 * 60; 

        Map<Id, Integer> userMinutes = new Map<Id, Integer>();
        for (Logs__c log : timesheetData) {
            if (log.Mins__c != null) {
                Integer mins = Integer.valueOf(log.Mins__c);
                if (userMinutes.containsKey(log.User__c)) {
                    userMinutes.put(log.User__c, userMinutes.get(log.User__c) + mins);
                } else {
                    userMinutes.put(log.User__c, mins);
                }
            }
        }
        
        List<User> allUsers = [SELECT Id, FirstName, LastName FROM User WHERE IsActive = TRUE AND ProfileId = '00e2w000004wQ2R' ORDER BY FirstName];
        
        for (User u : allUsers) {
            Map<String, Object> userMap = new Map<String, Object>{
                'Id' => u.Id,
                'FirstName' => u.FirstName,
                'LastName' => u.LastName,
                'TotalMinutes' => userMinutes.containsKey(u.Id) ? userMinutes.get(u.Id) : 0
            };
            if (userMinutes.containsKey(u.Id) && userMinutes.get(u.Id) >= expectedMinutes) {
                upToDateMembers.add(userMap);
            } else {
                remainingMembers.add(userMap);
            }
        }
        
        result.put('UpToDate', upToDateMembers);
        result.put('Remaining', remainingMembers);
        
        return result;
    }
 
}