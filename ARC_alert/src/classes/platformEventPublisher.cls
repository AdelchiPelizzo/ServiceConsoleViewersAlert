/**
 * Created by Adelchi on 01/04/2022.
 * Purpose : (Write a succinct description of this class here.)
 */


public with sharing class platformEventPublisher {
    /**
 * Purpose : (Write a succinct description of this method here.)
 * @param (parameter name) (Describe the first parameter here)
 * @param (parameter name) (Do the same for each additional parameter)
 * @return (description of the return value)
 */
    @AuraEnabled
    public static void publishCaseViewing(String caseNr, String recId, String userName){
        String uId = UserInfo.getUserId();
        System.debug(caseNr);
        System.debug(recId);
        System.debug(userName);
        System.debug(uId);
        List<caseRecordIsBeingViewed__e> caseEvents = new List<caseRecordIsBeingViewed__e>();
            caseRecordIsBeingViewed__e evt = new caseRecordIsBeingViewed__e();
            evt.caseNumber__c = caseNr;
            evt.recordId__c = recId;
            evt.viewerName__c = userName;
            evt.viewerId__c = uId;
            caseEvents.add(evt);
        // Call method to publish events
        List<Database.SaveResult> results = EventBus.publish(caseEvents);
        // Inspect publishing result for each event
        for (Database.SaveResult sr : results) {
            if (sr.isSuccess()) {
                System.debug('Successfully published event.');
            } else {
                for(Database.Error err : sr.getErrors()) {
                    System.debug('Error returned: ' +
                            err.getStatusCode() +
                            ' - ' +
                            err.getMessage());
                }
            }
        }
    }
    @AuraEnabled
    public static void unPublishCaseViewing(String caseNr, String recId, String userName){
        String uId = UserInfo.getUserId();
        System.debug(caseNr);
        System.debug(recId);
        System.debug(userName);
        System.debug(uId);
        List<caseRecordIsNotViewed__e> caseEvents = new List<caseRecordIsNotViewed__e>();
        caseRecordIsNotViewed__e evt = new caseRecordIsNotViewed__e();
            evt.caseNumber__c = caseNr;
            evt.recordId__c = recId;
            evt.viewerName__c = userName;
            evt.viewerId__c = uId;
            caseEvents.add(evt);
        // Call method to publish events
        List<Database.SaveResult> results = EventBus.publish(caseEvents);
        // Inspect publishing result for each event
        for (Database.SaveResult sr : results) {
            if (sr.isSuccess()) {
                System.debug('Successfully published event.');
            } else {
                for(Database.Error err : sr.getErrors()) {
                    System.debug('Error returned: ' +
                            err.getStatusCode() +
                            ' - ' +
                            err.getMessage());
                }
            }
        }
    }
    @AuraEnabled
    public static String fetchUser(){
        String name = UserInfo.getName();
        return name;
    }
    @AuraEnabled
    public static String getCaseNumber(String Id){
        Case c = [SELECT CaseNumber FROM Case WHERE Id =: Id];
        return c.CaseNumber;
    }
}
