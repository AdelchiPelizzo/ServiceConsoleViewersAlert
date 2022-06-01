/**
 * Created by Adelchi on 30/05/2022.
 * Purpose : (Write a succinct description of this class here.)
 */


public with sharing class ConsoleUtility {

    /**
 * Purpose : (Support Check for Draft Email left when closing tab on Case Console.)
 * @param (parameter sObjId) (Case Id of the tab being closed)
 * @return (message with email draft value if draft email exist or just empty string if email draft don't exist)
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



}
