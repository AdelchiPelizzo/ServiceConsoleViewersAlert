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
            // let existEvent = component.get("v.evtInfo");
            // console.log('Received event unsubscription '+ JSON.stringify(eventReceived));
            // if(existingEvents.length > 0){
                for(let i = 0; i < existingEvents.length; i++){let toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        title: 'This Case nr '+ existingEvents[i].data.payload.caseNumber__c,
                        message: 'Is no more viewed  by '+existingEvents[i].data.payload.viewerName__c,
                        mode: "sticky",
                        type: "success",
                    });
                    console.log("round "+i);
                    // let index = existingEvents.indexOf((existingEvents[i]));
                    if(existingEvents[i].data.payload.caseNumber__c == eventReceived.data.payload.caseNumber__c
                        && existingEvents[i].data.payload.viewerName__c == eventReceived.data.payload.viewerName__c){
                        console.log("splicing ..."+i);
                        existingEvents.splice(i, 1);
                        component.set("v.evtInfo", existingEvents);
                        //
                        //
                        //     console.log("event list length "+existingEvents.length);
                        // console.log("remove existing event > case "+i+" "+existingEvents[i].data.payload.caseNumber__c);
                        // console.log("remove event received > case "+i+" "+eventReceived.data.payload.caseNumber__c);
                        // console.log("remove existing event > viewer "+i+" "+existingEvents[i].data.payload.viewerName__c);
                        // console.log("remove event received > viewer "+i+" "+eventReceived.data.payload.viewerName__c);
                        //     if (i > 0) {
                        // }

                        // console.log(" record viewed by "+existingEvents[i].data.payload.viewerName__c);
                        // console.log(" record removed ");
                        // existingEvents.pop(existingEvents[i]);
                        //existingEvents.pop(existingEvents[i-1]); edited !!
                    }
                    if ( existingEvents[i].data.payload.viewerId__c == userId ){
                        let onOff = component.get("v.switch");
                        if(onOff == "on" ){
                            let getSound = $A.get('$Resource.alarmEditingOff');
                            let playSound = new Audio(getSound);
                            playSound.play();
                            toastEvent.fire();
                        }
                    }
                    // console.log("number of existing events "+existingEvents.length);
                }
            // }
        }))
            .then(subscription => {
                component.set('v.subscriptionU', subscription);
            });
        empApi.subscribe(channel, replayId, $A.getCallback(eventReceived => {
            existingEvents.push(eventReceived);
            let eventsUpdated = existingEvents;
            let eventInfo = eventReceived;
            let csNum = eventInfo.data.payload.caseNumber__c;
            let usNam = eventInfo.data.payload.viewerName__c;
            let recId = eventInfo.data.payload.recordId__c;
            let usrId = eventInfo.data.payload.viewerId__c;
            // if(existingEvents.length === 0){
            //     existingEvents.push(eventReceived);
            // }else{
            //     for(let i = 0; i < existingEvents[i].length; i++){
                    // if( eventReceived.data.payload.recordId__c != recId || existingEvents[i].data.payload.viewerId__c != userId){
                        console.log("open record event received "+JSON.stringify(eventReceived));
                        // existingEvents.push(eventReceived);
                        component.set("v.evtInfo", existingEvents);
                        //         let toastEvent = $A.get("e.force:showToast");
                        //         toastEvent.setParams({
                        //             "title": '230 Alert! This '+objName+' nr '+csNum,
                        //             "message": 'Is currently being opened by '+usNam,
                        //             "mode": "sticky"
                        //         });
                        //         toastEvent.fire();
                        //
                    // }
                // }
            // }
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
        var focusedTabId = event.getParam('currentTabId');
        var workspaceAPI = component.find("workspace");
        workspaceAPI.getTabInfo({
            tabId : focusedTabId
        }).then(function(response) {
            component.set("v.tabFocus",  response);

        }).catch(function(error) {
            console.log(error);
        });
    },

    onTabClosed : function(component, event, helper) {
        let focusRecord = component.get("v.tabFocus");
        let workspaceAPI = component.find("workspace");
        let checkOpenedRecords = component.get("v.evtInfo");
        let userId = $A.get("$SObjectType.CurrentUser.Id");
        let tId = event.getParam("tabId");
        let recordId;
        let getCaseNr = component.get("c.getCaseNumber");
        let UserName = component.get("v.userName");
        let unPublishEvent = component.get("c.unPublishCaseViewing");
        // workspaceAPI.getTabInfo({tabId: tId}).then((result) => {
            // alert(JSON.stringify(focusRecord));
            recordId = focusRecord.pageReference.attributes.recordId;
        // alert("recordId "+recordId);
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
                        "mode": "sticky",
                        type: "warning"
                    });
                    let getSound = $A.get('$Resource.alarmEditing');
                    let playSound = new Audio(getSound);
                    playSound.play();
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
    },

    cleanUp : function(component, event, helper){
        component.set("v.showConfirmDialog", true);
    },

    handleConfirmDialogYes : function(component, event, helper) {
        component.set("v.evtInfo", []);
        component.set('v.showConfirmDialog', false);
    },

    handleConfirmDialogNo : function(component, event, helper) {
        component.set('v.showConfirmDialog', false);
    },

    notificationSwitch : function(component,event){
        let elm = component.find("onOff");
        $A.util.toggleClass(elm,"on");
        let onOff = component.get("v.switch");
        if(onOff == "off"){
            component.set("v.switch", "on");
        }
        if(onOff == "on"){
            component.set("v.switch", "off");
        }
    }

});
