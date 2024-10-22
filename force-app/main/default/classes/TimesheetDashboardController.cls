public class TimesheetDashboardController {
    @AuraEnabled(cacheable=true)
    public static  Map<String, List<Map<String, Object>>> getTimesheetStatus(Date StartDate, Date EndDate, Integer WorkingDays) {
        Map<String, List<Map<String, Object>>> result = new Map<String, List<Map<String, Object>>>();
        List<Map<String, Object>> upToDateMembers = new List<Map<String, Object>>();
        List<Map<String, Object>> remainingMembers = new List<Map<String, Object>>();
        
        List<Logs__c> timesheetData = [
            SELECT User__c, Mins__c, Project__c 
            FROM Logs__c 
            WHERE Date__c >= :StartDate AND Date__c <= :EndDate
        ];
        
        Map<String, Boolean> projectBillableMap = new Map<String, Boolean>();
        for (ET_Project__c proj : [SELECT Name, isBillable__c FROM ET_Project__c]) {
            projectBillableMap.put(proj.Name, proj.isBillable__c);
        }
        
        Integer expectedMinutes = WorkingDays * 8 * 60; // Calculate expected minutes
        
        Map<Id, Integer> userBillableMinutes = new Map<Id, Integer>();
        Map<Id, Integer> userNonBillableMinutes = new Map<Id, Integer>();
        
        for (Logs__c log : timesheetData) {
            if (log.Mins__c != null && log.Project__c != null) {
                Integer mins = Integer.valueOf(log.Mins__c);
                Boolean isBillable = projectBillableMap.get(log.Project__c) != null ? projectBillableMap.get(log.Project__c) : false;
                
                if (isBillable) {
                
                    if (userBillableMinutes.containsKey(log.User__c)) {
                        userBillableMinutes.put(log.User__c, userBillableMinutes.get(log.User__c) + mins);
                    } else {
                        userBillableMinutes.put(log.User__c, mins);
                    }
                } else {
    
                    if (userNonBillableMinutes.containsKey(log.User__c)) {
                        userNonBillableMinutes.put(log.User__c, userNonBillableMinutes.get(log.User__c) + mins);
                    } else {
                        userNonBillableMinutes.put(log.User__c, mins);
                    }
                }
            }
        }
        
        List<User> allUsers = [SELECT Id, FirstName, LastName FROM User WHERE IsActive = TRUE AND ProfileId = '00e2w000004wQ2R' ORDER BY FirstName];
        
        for (User u : allUsers) {
            Integer totalBillableMinutes = userBillableMinutes.containsKey(u.Id) ? userBillableMinutes.get(u.Id) : 0;
            Integer totalNonBillableMinutes = userNonBillableMinutes.containsKey(u.Id) ? userNonBillableMinutes.get(u.Id) : 0;
            Integer totalMinutes = totalBillableMinutes + totalNonBillableMinutes;
            
            Map<String, Object> userMap = new Map<String, Object>{
                'Id' => u.Id,
                'FirstName' => u.FirstName,
                'LastName' => u.LastName,
                'TotalMinutes' => totalMinutes,
                'BillableMinutes' => totalBillableMinutes,
                'NonBillableMinutes' => totalNonBillableMinutes
            };
            
            if (totalMinutes >= expectedMinutes) {
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