/**
 * Created by Adelchi on 01/04/2022.
 * Purpose : (Support Utility Bar Element for Service Console.)
 */


@SuppressWarnings('ApexDocValidation')
public with sharing class platformEventPublisher {

    /**
 * Purpose : ()
 * @param (sObjId) ( Current Record Id being unloaded )
 * @param (parameter name) (Do the same for each additional parameter)
 * @return (String message including email data to be pushed to the UI)
 */
    @AuraEnabled
    public static String checkDraftEmails (String sObjId) {

        List<EmailMessage> emailDraftList = [SELECT Id , Status , Subject , FromName FROM EmailMessage WHERE ParentId = :sObjId AND Status = '5'];
        Integer counter = 0;
        String msgFinal = '';
        String msgPartial = '';
        if (emailDraftList.size() > 0) {
            for (Integer i = 0; i < emailDraftList.size(); i++) {
                counter++;
                msgPartial = +'Subject : ' + emailDraftList[i].Subject + '\nFrom : ' + emailDraftList[i].FromName + '\n';
            }
            msgFinal += 'You have ' + counter + ' Email Draft left\n' + msgPartial;
            return msgFinal;
        } else {
            return msgFinal;
        }
    }


    /**
 * Purpose : ()
 * @param (sObjId) ( Current Record Id Subject to be unloaded )
 * @param (parameter name) (Do the same for each additional parameter)
 * @return (description of the return value)
 */
//    @AuraEnabled
//    public static void alertDraftEmail (String cNr , String sObjId , String subj) {
//        System.debug('apex method has been fired');
//
//        String uId = UserInfo.getUserId();
//        List<draftEmailSaved__e> draftsEvents = new List<draftEmailSaved__e>();
//        draftEmailSaved__e evt = new draftEmailSaved__e();
//        evt.caseNumber__c = cNr;
//        evt.caseRecordId__c = sObjId;
//        evt.Subject__c = subj;
//        evt.userId__c = uId;
//        draftsEvents.add(evt);
//        // Call method to publish events
//        List<Database.SaveResult> results = EventBus.publish(draftsEvents);
//        // Inspect publishing result for each event
//        for (Database.SaveResult sr : results) {
//            if (sr.isSuccess()) {
//                System.debug('Successfully published event.');
//            } else {
//                for (Database.Error err : sr.getErrors()) {
//                    System.debug('Error returned: ' +
//                            err.getStatusCode() +
//                            ' - ' +
//                            err.getMessage());
//                }
//            }
//        }
//    }

    @AuraEnabled
    public static void publishCaseViewing (String caseNr , String recId , String userName) {
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
                for (Database.Error err : sr.getErrors()) {
                    System.debug('Error returned: ' +
                            err.getStatusCode() +
                            ' - ' +
                            err.getMessage());
                }
            }
        }
    }
    @AuraEnabled
    public static void unPublishCaseViewing (String caseNr , String recId , String userName) {
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
                System.debug('Successfully un-published event.');
            } else {
                for (Database.Error err : sr.getErrors()) {
                    System.debug('Error returned: ' +
                            err.getStatusCode() +
                            ' - ' +
                            err.getMessage());
                }
            }
        }
    }
    @AuraEnabled
    public static String fetchUser () {
        String name = UserInfo.getName();
        System.debug('username    ' + name);
        return name;
    }
    @AuraEnabled
    public static String getCaseNumber (String Id) {
        Case c = [SELECT CaseNumber FROM Case WHERE Id = :Id];
        return c.CaseNumber;
    }
}
