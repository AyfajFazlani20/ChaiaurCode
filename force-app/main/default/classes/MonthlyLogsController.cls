public with sharing class MonthlyLogsController {
    @AuraEnabled(cacheable=true)
    public static List<UserLogWrapper> getMonthlyLogs(String selectedMonth) {
        try {
            List<String> dateParts = selectedMonth.split('-');
            Integer year = Integer.valueOf(dateParts[0]);
            Integer month = Integer.valueOf(dateParts[1]);

            Date monthStart = Date.newInstance(year, month, 1);
            Date monthEnd = monthStart.addMonths(1).addDays(-1);

            // Fetch Logs__c records with User names
            List<Logs__c> logs = [SELECT User__c, Mins__c, User__r.Name 
                                  FROM Logs__c 
                                  WHERE Date__c >= :monthStart AND Date__c <= :monthEnd];

            Map<Id, Decimal> userMinutesMap = new Map<Id, Decimal>();
            Map<Id, String> userNameMap = new Map<Id, String>();
            
            for (Logs__c log : logs) {
                if (log.Mins__c != null && log.Mins__c.isNumeric()) {
                    Decimal minutes = Decimal.valueOf(log.Mins__c);
                    Id userId = log.User__c;
                    userMinutesMap.put(userId, userMinutesMap.containsKey(userId) ? userMinutesMap.get(userId) + minutes : minutes);
                    if (!userNameMap.containsKey(userId)) {
                        userNameMap.put(userId, log.User__r.Name);
                    }
                }
            }

            List<UserLogWrapper> userLogs = new List<UserLogWrapper>();

            for (Id userId : userMinutesMap.keySet()) {
                Decimal totalMinutes = userMinutesMap.get(userId);
                Boolean isCorrect = totalMinutes >= 9600;
                String userName = userNameMap.get(userId);
                if (userName == null) {
                    userName = 'Unknown User';  // Fallback if name is not found
                }
                userLogs.add(new UserLogWrapper(userName, totalMinutes, isCorrect));
            }

            return userLogs;
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching monthly logs: ' + e.getMessage());
        }
    }

    public class UserLogWrapper {
        @AuraEnabled public String userName { get; set; }
        @AuraEnabled public Decimal totalMinutes { get; set; }
        @AuraEnabled public Boolean isCorrect { get; set; }

        public UserLogWrapper(String userName, Decimal totalMinutes, Boolean isCorrect) {
            this.userName = userName;
            this.totalMinutes = totalMinutes != null ? totalMinutes.setScale(2) : 0;
            this.isCorrect = isCorrect;
        }
    }
}