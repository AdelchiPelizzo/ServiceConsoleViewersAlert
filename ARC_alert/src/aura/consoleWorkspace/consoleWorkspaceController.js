/**
 * Created by Adelchi on 01/04/2022.
 */

({
    onInit : function(component, event, helper) {

        let workspaceAPI = component.find("workspace");
        workspaceAPI.getAllTabInfo().then((result) => {
            console.log(JSON.stringify(result));
            for(let i = 0; i < result.length; i++){
                let focusedTabId = result[i].tabId;
                workspaceAPI.closeTab({tabId: focusedTabId});
            }
        }).catch(function(error) {
            console.log(error);
        });

        let userId = $A.get("$SObjectType.CurrentUser.Id");
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

        empApi.subscribe(channel, replayId, $A.getCallback(eventReceived => {
            let existingEvents = component.get("v.evtInfo");
            existingEvents.push(eventReceived);
            component.set("v.evtInfo", existingEvents);
        }))
            .then(subscription => {
                component.set('v.subscription', subscription);
                $A.enqueueAction(getUserName);
            });

        empApi.subscribe(channelu, replayId, $A.getCallback(eventReceived => {
            workspaceAPI.getAllTabInfo().then((result) => {
                let isTabOpen = false;
                console.log("ALL TABS OPEN  "+JSON.stringify(result));
                for(let i = 0; i < result.length; i++){
                    let caseNr = result[i].title;
                    if(caseNr == eventReceived.data.payload.caseNumber__c){
                        isTabOpen = true;

                    }
                }
                let existingEvents = component.get("v.evtInfo");
                console.log('Received event unsubscription '+ JSON.stringify(eventReceived));
                if( existingEvents.length > 0 ){
                    for(let i = 0; i < existingEvents.length; i++){
                        let toastEventOut = $A.get("e.force:showToast");
                        toastEventOut.setParams({
                            title: 'Case #'+ existingEvents[i].data.payload.caseNumber__c,
                            message: 'Is no more viewed  by '+existingEvents[i].data.payload.viewerName__c,
                            mode: "sticky",
                            type: "success",
                        });
                        console.log("round "+i);
                        if(existingEvents[i].data.payload.caseNumber__c === eventReceived.data.payload.caseNumber__c
                            && existingEvents[i].data.payload.viewerName__c === eventReceived.data.payload.viewerName__c)
                        {
                            if ( existingEvents[i].data.payload.viewerId__c !== userId && existingEvents[i].data.payload.caseNumber__c === eventReceived.data.payload.caseNumber__c && isTabOpen){
                                let onOff = component.get("v.switch");
                                if(onOff == "on" ){
                                    let getSound = $A.get('$Resource.alarmEditingOff');
                                    let playSound = new Audio(getSound);
                                    playSound.play();
                                    toastEventOut.fire();
                                }
                            }
                            console.log("splicing ..."+i);
                            existingEvents.splice(i, 1);
                            component.set("v.evtInfo", existingEvents);
                        }
                    }
                }
            }).catch(function(error) {
                console.log(error);
            });
        })).then(subscription => {
            component.set('v.subscriptionU', subscription);
        });
    },

    onTabFocused : function(component, event, helper) {
        alert("focusing");
        let recordId = component.get("v.recordId");
        let workspaceAPI = component.find("workspace");
        let hasDraft = component.get("c.checkDraftEmails");
        let tId = event.getParam("tabId");
        workspaceAPI.getTabInfo({tabId: tId}).then((result) => {
            // console.log(JSON.stringify(result));
            recordId = result.pageReference.attributes.recordId;
            component.set("v.tabFocus", result);
            // console.log("Opened record id " + recordId);
            hasDraft.setParams({
                "Id" : recordId
            });
        });

        hasDraft.setCallback(this, function( response ) {
            let state = response.getState();
            if (state === "SUCCESS") {
                if( response.getReturnValue()  === true ){
                    if ( confirm("Do you want to close?") ){

                    }else {

                    }
                }
            }
            else if (state === "INCOMPLETE") {
                alert("incomplete");
            }
            else if (state === "ERROR") {
                alert ("errors >> look console");
                let errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        console.log("Error message: " +
                            errors[0].message);
                    }
                } else {
                    console.log("Unknown error");
                }
            }
        });
        $A.enqueueAction(hasDraft);
    },

    closeAllTabs : function(component, event, helper){

        let workspaceAPI = component.find("workspace");
        workspaceAPI.getAllTabInfo().then((result) => {
            for(let i = 0; i < result.length; i++){
                var focusedTabId = result[i].tabId;
                workspaceAPI.closeTab({tabId: focusedTabId});

            }
        }).catch(function(error) {
            console.log(error);
        });
    },

    onTabClosed : function(component, event, helper){

        let workspaceAPI = component.find("workspace");
        let UserName = component.get("v.userName");
        // let userId = $A.get("$SObjectType.CurrentUser.Id");
        let tId = event.getParam("tabId");
        let allTabInfo = component.get("v.allTabInfo");

        let getCaseNr = component.get("c.getCaseNumber");
        let unPublishEvent = component.get("c.unPublishCaseViewing");

        let recordId;
        let caseNumber;
        let closingTabInfo;

        for(let i = 0; i < allTabInfo.length; i++){
            if(allTabInfo[i].tabId == tId){
                closingTabInfo = allTabInfo[i];
                recordId = allTabInfo[i].recordId;
            }
        }
        getCaseNr.setParams({
            "Id" : recordId
        });

        console.log(getCaseNr.getParam("Id"));
        getCaseNr.setCallback(this, function(response){
            let status = response.getState();
            if(status === "SUCCESS"){
                caseNumber = response.getReturnValue();
                unPublishEvent.setParams({
                    "caseNr" : caseNumber,
                    "recId" : recordId,
                    "userName" : UserName
                });
                console.log("unpublish params "+JSON.stringify(unPublishEvent.getParams()));
                unPublishEvent.setCallback(this, function(){
                    console.log("event unpublished");
                });
                $A.enqueueAction(unPublishEvent);
            }
        });
        $A.enqueueAction(getCaseNr);
        workspaceAPI.getAllTabInfo().then((result) => {
            component.set("v.allTabInfo", result);
        }).catch(function(error) {
            console.log(error);
        });
    },

    onTabClose : function(component, event, helper) {

        let checkDraft = component.get("c.checkDraftEmails")
        let focusRecord = component.get("v.tabFocus");
        let workspaceAPI = component.find("workspace");
        workspaceAPI.getFocusedTabInfo().then( response => {
                var focusedTabId = response.tabId;
                console.log("focusedTabId "+focusedTabId);
        });

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

    onTabCreate : function(component, event, helper) {

        let workspaceAPI = component.find("workspace");
        let userId = $A.get("$SObjectType.CurrentUser.Id");
        let tId = event.getParam("tabId");

        let recId;
        let caseNumber;
        let userName;

        let getCaseNumber = component.get("c.getCaseNumber");
        let getUserName = component.get("c.fetchUser");
        let publishEvent = component.get("c.publishCaseViewing");

        workspaceAPI.getTabInfo({tabId : tId}).then((result) => {
            recId = result.pageReference.attributes.recordId;
            getCaseNumber.setParams({
                "Id" : recId,
            });
            getCaseNumber.setCallback(this, (response) => {
                    caseNumber = response.getReturnValue();
                    console.log("case number "+response.getReturnValue());
                    getUserName.setCallback(this, (response) => {
                        userName = response.getReturnValue();
                        publishEvent.setParams({
                            "caseNr" : caseNumber,
                            "recId" : recId,
                            "userName" : userName,
                            "usId" : userId
                        });
                        publishEvent.setCallback(this, () => {
                            console.log("event published");
                        });
                        $A.enqueueAction(publishEvent);
                        let existingEvents = component.get("v.evtInfo");
                        for(let i = 0; i < existingEvents.length; i++){
                            console.log("checking existing events published");
                            if( existingEvents[i].data.payload.recordId__c == recId &&
                                existingEvents[i].data.payload.viewerId__c != userId ){
                                let toastEvent = $A.get("e.force:showToast");
                                toastEvent.setParams({
                                    "title": 'Case #'+existingEvents[i].data.payload.caseNumber__c,
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
                    });
                    $A.enqueueAction(getUserName);
                }
            );
            $A.enqueueAction(getCaseNumber);
        }).catch(function(error) {
            console.log(error);
        });
        workspaceAPI.getAllTabInfo().then((result) => {
            component.set("v.allTabInfo", result);
            console.log("number of open tabs "+result.length);
        }).catch(function(error) {
            console.log(error);
        });


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
            component.set("v.tabFocus", result);
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
                        "title": 'Case #'+existingEvents[i].data.payload.caseNumber__c,
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
                console.log(tabInfo[i]);
                console.log(tabInfo[i].recordId);
                console.log(tabInfo[i].tabId);
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
