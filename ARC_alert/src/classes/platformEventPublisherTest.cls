/**
 * Created by Adelchi on 24/04/2022.
 * Purpose : (Write a succinct description of this class here.)
 */


@IsTest
private class platformEventPublisherTest {

    public static Account acc = new Account(
            Name = 'tesAccount',
            Country__c = 'US'
    );

    public static Contact ct = new Contact();

    public static Case c = new Case();

    public static Profile getProf(){
        Profile p = [SELECT Id FROM Profile WHERE Name='Standard User'];
        return p;
    }

    public static User u = new User(
            Alias = 'standt',
            Email='standarduser@testorg.com',
            EmailEncodingKey='UTF-8',
            LastName='Testing',
            LanguageLocaleKey='en_US',
            LocaleSidKey='en_US',
            ProfileId = getProf().Id,
            TimeZoneSidKey='America/Los_Angeles',
            UserName='stand@test.test'
    );

    public static void generateTestRecords(){
        insert acc;
        ct.LastName = 'testLastName';
        ct.Email = 'testLastName@test.test';
        ct.AccountId = acc.Id;
        insert ct;
        c.Origin =  'Phone';
        c.ContactId =  ct.Id;
        c.Status =  'New';
        insert c;
        insert u;
    }


    @IsTest
    static void testBehavior () {
        generateTestRecords();
        System.RunAs(u){
            String csNr = [SELECT CaseNumber from Case WHERE Id =: c.Id].CaseNumber;
            platformEventPublisher.publishCaseViewing(csNr, c.Id, u.Username);
            platformEventPublisher.unPublishCaseViewing(csNr, c.Id, u.Username);
            platformEventPublisher.fetchUser();
            platformEventPublisher.getCaseNumber(c.Id);
        }
    }
}
