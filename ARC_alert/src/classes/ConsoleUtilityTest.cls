/**
 * Created by Adelchi on 30/05/2022.
 * Purpose : (Write a succinct description of this class here.)
 */


@IsTest
private class ConsoleUtilityTest {

    public static Case c = new Case(
            Status = 'New',
            Origin = 'Email',
            Subject = 'Test'

    );

    public static Case cDraft = new Case(
            Status = 'New',
            Origin = 'Email',
            Subject = 'Test'

    );

    public static EmailMessage newEmailMessage = new EmailMessage(
            FromAddress = 'test@abc.org',
            ToAddress = 'hello@670ocglw7xhomi4oyr5yw2zvf.8kp7yeag.8.case.salesforce.com',
            Subject = 'Test email',
            TextBody = '23456 ',
            Status = '3'
    );

    public static EmailMessage newEmailMessageDraft = new EmailMessage(
            FromAddress = 'test@abc.org',
            ToAddress = 'hello@670ocglw7xhomi4oyr5yw2zvf.8kp7yeag.8.case.salesforce.com',
            Subject = 'Test email',
            TextBody = '23456 ',
            Status = '5'
    );

    public static void generateEmails(String caseId, String caseIdDraft){
        newEmailMessage.ParentId = caseId;
        newEmailMessageDraft.ParentId = caseIdDraft;
        insert newEmailMessage;
        insert newEmailMessageDraft;
    }

    @IsTest

    static void testBehavior () {
        insert c;
        insert cDraft;
        generateEmails(c.Id, cDraft.Id);

        System.assert( ConsoleUtility.checkDraftEmails(c.Id) != null);
        System.assert( ConsoleUtility.checkDraftEmails(cDraft.Id) != null);
    }
}
