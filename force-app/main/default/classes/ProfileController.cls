public with sharing class ProfileController {
    @AuraEnabled(cacheable = true) 
    public static List<Team_Member__c> getMembers(){
        try {
            List<Team_Member__c> team1 = [SELECT Name, Email__c ,photo__c FROM Team_Member__c WHERE checkbox__c =: TRUE ORDER BY Index__c DESC LIMIT 1];
            if(team1.size() == 0){
                List<Team_Member__c> teamZ =  [SELECT Name, Email__c ,photo__c FROM Team_Member__c WHERE Index__c =:40];
                return teamZ;
            }
            else{
                return team1;
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable = true) 
    public static List<Team_Member__c> getnextMembers(){
        try {
            List<Team_Member__c> team2 =  [SELECT Name, Email__c ,photo__c FROM Team_Member__c WHERE checkbox__c =: FALSE ORDER BY Index__c LIMIT 4];
            if(team2.size() < 4){ 
                
                Integer Start = 4 - team2.size();
                
                List<Team_Member__c> ringList = [SELECT Name, Email__c ,photo__c FROM Team_Member__c ORDER BY Index__c LIMIT :Start];

                team2.addAll(ringList);

                return team2;
            }
            return team2;
            
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
}