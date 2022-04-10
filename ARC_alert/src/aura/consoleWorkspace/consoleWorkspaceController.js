/**
 * Created by Adelchi on 01/04/2022.
 */

({
    onInit : function(component, event, helper) {
        let existingEvents = component.get("v.evtInfo");
        let userId = $A.get("$SObjectType.CurrentUser.Id");
        let workspaceAPI = component.find("workspace");
        let recordId = component.get("v.recordId");
        const empApi = component.find('empApi');
        const channel = component.find('channel').get('v.value');
        const channelu = component.find('channelU').get('v.value');
        const replayId = -1;
        let getUserName = component.get("c.fetchUser");
        getUserName.setCallback(this, function(response){
            let status = response.getState();
            if(status === "SUCCESS") {
                component.set("v.userName", response.getReturnValue());
            }
        });

        empApi.subscribe(channelu, replayId, $A.getCallback(eventReceived => {
            // console.log('Received event unsubscription '+ JSON.stringify(eventReceived));
            for(let i = 0; i < existingEvents.length; i++){
                if(existingEvents[i].data.payload.recordId__c == eventReceived.data.payload.recordId__c &&  existingEvents[i].data.payload.viewerId__c == eventReceived.data.payload.viewerId__c){
                    existingEvents.pop(existingEvents[i]);
                    component.set("v.evtInfo", existingEvents);
                    console.log("existingEvents.length unsub "+i+' '+existingEvents.length);
                }
                if (eventReceived.data.payload.viewerId__c != userId && existingEvents[i].data.payload.recordId__c == eventReceived.data.payload.recordId__c && existingEvents[i].data.payload.viewerId__c == eventReceived.data.payload.viewerId__c){

                    let toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        "title": 'This Case nr '+ existingEvents[i].data.payload.caseNumber__c,
                        "message": 'Is no more viewed  by '+existingEvents[i].data.payload.viewerName__c,
                        "mode": "sticky"
                    });
                    toastEvent.fire();
                }
            }
        }))
            .then(subscription => {
                component.set('v.subscriptionU', subscription);
            });
        empApi.subscribe(channel, replayId, $A.getCallback(eventReceived => {
            existingEvents.push(eventReceived);
            let eventsUpdated = existingEvents;
            component.set("v.evtInfo", existingEvents);
            let eventInfo = eventReceived;
            let csNum = eventInfo.data.payload.caseNumber__c;
            let usNam = eventInfo.data.payload.viewerName__c;
            let recId = eventInfo.data.payload.recordId__c;
            let usrId = eventInfo.data.payload.viewerId__c;
            if(existingEvents.length === 0){
                existingEvents.push(JSON.stringify(eventReceived));
            }else{
                for(let i = 0; i < existingEvents[i].length; i++){
                    if( eventReceived.data.payload.recordId__c != recId || existingEvents[i].data.payload.viewerId__c != userId){
                        existingEvents.push(JSON.stringify(eventReceived));
                        //         let toastEvent = $A.get("e.force:showToast");
                        //         toastEvent.setParams({
                        //             "title": '230 Alert! This '+objName+' nr '+csNum,
                        //             "message": 'Is currently being opened by '+usNam,
                        //             "mode": "sticky"
                        //         });
                        //         toastEvent.fire();
                        //
                    }
                }
            }
            console.log("existingEvents.length sub"+existingEvents.length);


            // if(recordId == c && userId != usrId){
            // let toastEvent = $A.get("e.force:showToast");
            // toastEvent.setParams({
            //     "title": 'Alert! This '+objName+' nr '+csNum,
            //     "message": 'Is currently being opened by '+usNam,
            //     "mode": "sticky"
            // });
            // toastEvent.fire();

            // }
        }))
            .then(subscription => {
                // Subscription response received.
                // We haven't received an event yet.
                console.log('Subscription request sent to: ', subscription.channel);
                // Save subscription to unsubscribe later
                component.set('v.subscription', subscription);
                $A.enqueueAction(getUserName);
            });

        let tabInfo = [];
        workspaceAPI.getAllTabInfo().then(function(result){
            // console.log("workspaceAPI"+ JSON.stringify(result));
            tabInfo = result;
            for(let i = 0; i < tabInfo.length; i++){
                // console.log(tabInfo[i]);
                // console.log(tabInfo[i].recordId);
                // console.log(tabInfo[i].tabId);
            }
        }).catch(function(error) {
            console.log(error);
        });
        // workspaceAPI.getFocusedTabInfo().then(function(result){
            // console.log("focused tab info "+ JSON.stringify(result));
            // tabInfo = result;
            // for(let i = 0; i < tabInfo.length; i++){
            //     console.log(tabInfo[i]);
            //     console.log(tabInfo[i].recordId);
            //     console.log(tabInfo[i].tabId);
            // }
        // }).catch(function(error) {
        //     console.log(error);
        // });
        // // workspaceAPI.openTab({
        // //     url: '#/sObject/001R0000003HgssIAC/view',
        // //     focus: true
        // // });
    },

    onTabFocused : function(component, event, helper) {
        console.log("Tab Focused");
        var focusedTabId = event.getParam('currentTabId');
        console.log("Tab Focused"+focusedTabId);
        var workspaceAPI = component.find("workspace");
        workspaceAPI.getTabInfo({
            tabId : focusedTabId
        }).then(function(response) {
            console.log("response "+response);
            component.set("v.tabFocus",  response);
            console.log("focuse component onFocus" +JSON.stringify(response));

        }).catch(function(error) {
            console.log(error);
        });
    },

    onTabClosed : function(component, event, helper) {
        console.log("Tab closed: " +event.getParam('tabId'));
        let focusRecord = component.get("v.tabFocus");
        let checkOpenedRecords = component.get("v.evtInfo");
        let userId = $A.get("$SObjectType.CurrentUser.Id");
        let tId = event.getParam("tabId");
        let workspaceAPI = component.find("workspace");
        let recordId;
        let getCaseNr = component.get("c.getCaseNumber");
        let UserName = component.get("v.userName");
        let unPublishEvent = component.get("c.unPublishCaseViewing");
        // workspaceAPI.getTabInfo({tabId: tId}).then((result) => {
            // console.log(JSON.stringify(result));
            // alert(JSON.stringify(focusRecord));
            recordId = focusRecord.pageReference.attributes.recordId;
            // recordId = result.pageReference.attributes.recordId;
            // component.set("v.recordId", recordId);
            getCaseNr.setParams({
                "Id" : recordId
            });
        // });
        let objName = component.get("v.sObjectName");
        const empApi = component.find('empApi');
        // Get the channel from the input box
        const channel = component.find('channelU').get('v.value');
        // Replay option to get new events
        const replayId = -1;

        let csNr;
        let usName;
        // getUserName.setCallback(this, function(response){
        //     let status = response.getState();
        //     if(status === "SUCCESS") {
        //         usName = response.getReturnValue();
        //     }
        // });
        getCaseNr.setCallback(this, function(response){
            let status = response.getState();
            if(status === "SUCCESS"){
                csNr = response.getReturnValue();
                unPublishEvent.setParams({
                    "caseNr" : csNr,
                    "recId" : recordId,
                    "userName" : UserName,
                    "usId" : userId
                });
                $A.enqueueAction(unPublishEvent);
                // let existingEvents = component.get("v.evtInfo");
                // for(let i = 0; i < existingEvents.length; i++){
                //     // console.log(existingEvents[i].data.payload.caseNumber__c);
                //     console.log(i+ " Case nr "+ existingEvents[i].data.payload.caseNumber__c);
                //     console.log(i+ " record Id "+ component.get("v.recordId"));
                //     console.log(i+" user Name "+existingEvents[i].data.payload.viewerName__c);
                //     console.log(i+" user Id "+userId);
                //     let rId = component.get("v.recordId");
                    // let objN = component.get("v.SObjectName");
                    // console.log(existingEvents[i].data.payload.viewerName__c);
                    // console.log("checking existing cases already opened ..."+checkOpenedRecords[i].data.payload.recordId__c+" ..."+recordId);
                    // console.log("checking existing cases already opened ..."+checkOpenedRecords[i].data.payload.viewerId__c+"..."+userId);
                    // console.log("checking existing cases already opened ..."+ (o.data.payload.recordId__c == recordId ));
                    // console.log("checking existing cases already opened ..."+ (o.data.payload.viewerId__c != userId));
                    // if( existingEvents[i].data.payload.recordId__c == rId && existingEvents[i].data.payload.viewerId__c != userId ){
                        // let toastEvent = $A.get("e.force:showToast");
                        // toastEvent.setParams({
                        //     "title": 'This Case Nr '+existingEvents[i].data.payload.caseNumber__c,
                        //     "message": 'Is no more being opened by '+existingEvents[i].data.payload.viewerName__c,
                        //     "mode": "sticky"
                        // });
                        // toastEvent.fire()
                        // console.log("passing data of cases opened ...");
                        // alert('Alert! This record '+existingEvents[i].data.payload.caseNumber__c+' Is currently being opened by '+eventReceived.data.payload.viewerName__);

                    // }
                    // if( existingEvents[i].data.payload.recordId__c == recordId && existingEvents[i].data.payload.viewerId__c == userId ){
                    //     console.log("existingEvents.length before pop "+existingEvents.length);
                    //     existingEvents.pop(existingEvents[i]);
                    //     console.log("existingEvents.length after pop "+existingEvents.length);
                    //     console.log("passing data of cases opened ...");
                        // alert('Alert! This record '+existingEvents[i].data.payload.caseNumber__c+' Is currently being opened by '+eventReceived.data.payload.viewerName__);

                    // }
                // }
            }
        });
        // publishEvent.setParams({
        //     "caseNr" : '123',
        //     "recId" : recordId,
        //     "userName" : 'paul',
        //     "usId" : userId
        // });

        $A.enqueueAction(getCaseNr);
        unPublishEvent.setCallback(this, function(){
            console.log("event unpublished");
        });
        // $A.enqueueAction(publishEvent);

        // $A.enqueueAction(getUserName);




        // Subscribe to an event
        // empApi.subscribe(channel, replayId, $A.getCallback(eventReceived => {
        //     console.log('Received event ', eventReceived);
        // Process event (this is called each time we receive an event)
        // let eventInfo = eventReceived;
        // let csNum = eventInfo.data.payload.caseNumber__c;
        // let usNam = eventInfo.data.payload.viewerName__c;
        // let recId = eventInfo.data.payload.recordId__c;
        // let usrId = eventInfo.data.payload.viewerId__c;
        //     // console.log(csNum);
        //     // console.log(usNam);
        //     // console.log(recId);
        //     // console.log(recordId);
        //     // console.log(usrId);
        //     // console.log(userId);
        //     let existingEvents = component.get("v.evtInfo");
        //     for(let i = 1; i < existingEvents.length; i++){
        // console.log(existingEvents[i].data.payload.caseNumber__c);
        // console.log(i+ " record Id "+ existingEvents[i].data.payload.caseNumber__c);
        // console.log(i+" user Id "+existingEvents[i].data.payload.viewerName__c);
        // console.log(existingEvents[i].data.payload.viewerName__c);
        // console.log("checking existing cases already opened ..."+checkOpenedRecords[i].data.payload.recordId__c+" ..."+recordId);
        // console.log("checking existing cases already opened ..."+checkOpenedRecords[i].data.payload.viewerId__c+"..."+userId);
        // console.log("checking existing cases already opened ..."+ (o.data.payload.recordId__c == recordId ));
        // console.log("checking existing cases already opened ..."+ (o.data.payload.viewerId__c != userId));
        // if( existingEvents[i].data.payload.recordId__c == eventReceived.data.payload.recordId__c && existingEvents[i].data.payload.viewerId__c != eventReceived.data.payload.viewerId__c ){
        //     console.log("passing data of cases opened ...");
        //     let toastEvent = $A.get("e.force:showToast");
        //     toastEvent.setParams({
        //         "title": '230 Alert! This record '+existingEvents[i].data.payload.caseNumber__c,
        //         "message": 'Is currently being opened by '+eventReceived.data.payload.viewerName__c,
        //         "mode": "sticky"
        //     });
        //     toastEvent.fire();
        // }
        // }
        //
        //     if(recordId == c && userId != usrId){
        //         // let toastEvent = $A.get("e.force:showToast");
        //         // toastEvent.setParams({
        //         //     "title": 'Alert! This '+objName+' nr '+csNum,
        //         //     "message": 'Is currently being opened by '+usNam,
        //         //     "mode": "sticky"
        //         // });
        //         // toastEvent.fire();
        //
        //     }
        // })).then(subscription => {
        // Subscription response received.
        // We haven't received an event yet.
        // console.log('Subscription request sent to: ', subscription.channel);
        // Save subscription to unsubscribe later
        // component.set('v.subscription', subscription);
        // });
        let tabInfo = [];
        let user = $A.get("$SObjectType.CurrentUser.Id");
        workspaceAPI.getAllTabInfo().then(function(result){
            // console.log("workspaceAPI"+ JSON.stringify(result));
            tabInfo = result;
            for(let i = 0; i < tabInfo.length; i++){
                // console.log(tabInfo[i]);
                // console.log(tabInfo[i].recordId);
                // console.log(tabInfo[i].tabId);
            }
        }).catch(function(error) {
            console.log(error);
        });
        // workspaceAPI.getFocusedTabInfo().then(function(result){
            // console.log("focused tab info "+ JSON.stringify(result));
            // tabInfo = result;
            // for(let i = 0; i < tabInfo.length; i++){
            //     console.log(tabInfo[i]);
            //     console.log(tabInfo[i].recordId);
            //     console.log(tabInfo[i].tabId);
            // }
        // }).catch(function(error) {
        //     console.log(error);
        // });
        // // workspaceAPI.openTab({
        //     url: '#/sObject/001R0000003HgssIAC/view',
        //     focus: true
        // });
    },
    onTabCreated : function(component, event, helper) {
        let checkOpenedRecords = component.get("v.evtInfo");
        console.log("checkOpenedRecords "+JSON.stringify(checkOpenedRecords));

        let userId = $A.get("$SObjectType.CurrentUser.Id");
        let tId = event.getParam("tabId");
        let workspaceAPI = component.find("workspace");
        let recordId;
        let getCaseNr = component.get("c.getCaseNumber");
        let getUserName = component.get("c.fetchUser");
        let publishEvent = component.get("c.publishCaseViewing");
        workspaceAPI.getTabInfo({tabId: tId}).then((result) => {
            // console.log(JSON.stringify(result));
            recordId = result.pageReference.attributes.recordId;
            // component.set("v.recordId", recordId);
            // console.log("Opened record id " + recordId);
            getCaseNr.setParams({
                "Id" : recordId
            });
        });
        let objName = component.get("v.sObjectName");
        const empApi = component.find('empApi');
        // Get the channel from the input box
        const channel = component.find('channel').get('v.value');
        // Replay option to get new events
        const replayId = -1;

        let csNr;
        let usName;
        getUserName.setCallback(this, function(response){
            let status = response.getState();
            if(status === "SUCCESS") {
                usName = response.getReturnValue();
                $A.enqueueAction(getCaseNr);
            }
        });
        getCaseNr.setCallback(this, function(response){
            let status = response.getState();
            if(status === "SUCCESS"){
                csNr = response.getReturnValue();
                console.log(userId);
                publishEvent.setParams({
                    "caseNr" : csNr,
                    "recId" : recordId,
                    "userName" : usName,
                    "usId" : userId
                });
                $A.enqueueAction(publishEvent);
                let existingEvents = component.get("v.evtInfo");
                for(let i = 0; i < existingEvents.length; i++){
                    // console.log(existingEvents[i].data.payload.caseNumber__c);
                    console.log(i+ " Case nr "+ existingEvents[i].data.payload.caseNumber__c);
                    console.log(i+ " record Id "+ component.get("v.recordId"));
                    console.log(i+" user Name "+existingEvents[i].data.payload.viewerName__c);
                    console.log(i+" user Id "+userId);
                    let rId = component.get("v.recordId");
                    // let objN = component.get("v.SObjectName");
                    // console.log(existingEvents[i].data.payload.viewerName__c);
                    // console.log("checking existing cases already opened ..."+checkOpenedRecords[i].data.payload.recordId__c+" ..."+recordId);
                    // console.log("checking existing cases already opened ..."+checkOpenedRecords[i].data.payload.viewerId__c+"..."+userId);
                    // console.log("checking existing cases already opened ..."+ (o.data.payload.recordId__c == recordId ));
                    // console.log("checking existing cases already opened ..."+ (o.data.payload.viewerId__c != userId));
                    if( existingEvents[i].data.payload.recordId__c == rId && existingEvents[i].data.payload.viewerId__c != userId ){
                    console.log("passing data of cases opened ...");
                    // alert('Alert! This record '+existingEvents[i].data.payload.caseNumber__c+' Is currently being opened by '+eventReceived.data.payload.viewerName__);
                    let toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        "title": 'This Case Nr '+existingEvents[i].data.payload.caseNumber__c,
                        "message": 'Is currently viewed by '+existingEvents[i].data.payload.viewerName__c,
                        "mode": "sticky"
                    });
                    toastEvent.fire();
                    }
                }
            }
        });
        // publishEvent.setParams({
        //     "caseNr" : '123',
        //     "recId" : recordId,
        //     "userName" : 'paul',
        //     "usId" : userId
        // });
        publishEvent.setCallback(this, function(){
            console.log("event published");
        });
        // $A.enqueueAction(publishEvent);

        $A.enqueueAction(getUserName);




        // Subscribe to an event
        // empApi.subscribe(channel, replayId, $A.getCallback(eventReceived => {
        //     console.log('Received event ', eventReceived);
            // Process event (this is called each time we receive an event)
            // let eventInfo = eventReceived;
            // let csNum = eventInfo.data.payload.caseNumber__c;
            // let usNam = eventInfo.data.payload.viewerName__c;
            // let recId = eventInfo.data.payload.recordId__c;
            // let usrId = eventInfo.data.payload.viewerId__c;
        //     // console.log(csNum);
        //     // console.log(usNam);
        //     // console.log(recId);
        //     // console.log(recordId);
        //     // console.log(usrId);
        //     // console.log(userId);
        //     let existingEvents = component.get("v.evtInfo");
        //     for(let i = 1; i < existingEvents.length; i++){
                // console.log(existingEvents[i].data.payload.caseNumber__c);
                // console.log(i+ " record Id "+ existingEvents[i].data.payload.caseNumber__c);
                // console.log(i+" user Id "+existingEvents[i].data.payload.viewerName__c);
                // console.log(existingEvents[i].data.payload.viewerName__c);
                // console.log("checking existing cases already opened ..."+checkOpenedRecords[i].data.payload.recordId__c+" ..."+recordId);
                // console.log("checking existing cases already opened ..."+checkOpenedRecords[i].data.payload.viewerId__c+"..."+userId);
                // console.log("checking existing cases already opened ..."+ (o.data.payload.recordId__c == recordId ));
                // console.log("checking existing cases already opened ..."+ (o.data.payload.viewerId__c != userId));
                // if( existingEvents[i].data.payload.recordId__c == eventReceived.data.payload.recordId__c && existingEvents[i].data.payload.viewerId__c != eventReceived.data.payload.viewerId__c ){
                //     console.log("passing data of cases opened ...");
                //     let toastEvent = $A.get("e.force:showToast");
                //     toastEvent.setParams({
                //         "title": '230 Alert! This record '+existingEvents[i].data.payload.caseNumber__c,
                //         "message": 'Is currently being opened by '+eventReceived.data.payload.viewerName__c,
                //         "mode": "sticky"
                //     });
                //     toastEvent.fire();
                // }
            // }
        //
        //     if(recordId == c && userId != usrId){
        //         // let toastEvent = $A.get("e.force:showToast");
        //         // toastEvent.setParams({
        //         //     "title": 'Alert! This '+objName+' nr '+csNum,
        //         //     "message": 'Is currently being opened by '+usNam,
        //         //     "mode": "sticky"
        //         // });
        //         // toastEvent.fire();
        //
        //     }
        // })).then(subscription => {
            // Subscription response received.
            // We haven't received an event yet.
            // console.log('Subscription request sent to: ', subscription.channel);
            // Save subscription to unsubscribe later
            // component.set('v.subscription', subscription);
        // });
        let tabInfo = [];
        let user = $A.get("$SObjectType.CurrentUser.Id");
        workspaceAPI.getAllTabInfo().then(function(result){
            // console.log("workspaceAPI"+ JSON.stringify(result));
            tabInfo = result;
            for(let i = 0; i < tabInfo.length; i++){
                // console.log(tabInfo[i]);
                // console.log(tabInfo[i].recordId);
                // console.log(tabInfo[i].tabId);
            }
        }).catch(function(error) {
            console.log(error);
        });
        // workspaceAPI.getFocusedTabInfo().then(function(result){
            // console.log("focused tab info "+ JSON.stringify(result));
            // tabInfo = result;
            // for(let i = 0; i < tabInfo.length; i++){
            //     console.log(tabInfo[i]);
            //     console.log(tabInfo[i].recordId);
            //     console.log(tabInfo[i].tabId);
            // }
        // }).catch(function(error) {
        //     console.log(error);
        // });
        // workspaceAPI.openTab({
        //     url: '#/sObject/001R0000003HgssIAC/view',
        //     focus: true
        // });
    }

});
