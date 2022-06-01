/**
 * Created by Adelchi on 26/05/2022.
 */

import {LightningElement, track, wire, api} from 'lwc';
import checkForDrafts from '@salesforce/apex/ConsoleUtility.checkDraftEmails';


export default class CheckForEmailDraft extends LightningElement   {


    @api recordId;
    disconnectedCallback(){
        checkForDrafts({sObjId: this.recordId}).then(
            (result)=>{
                if(result != ''){
                    if(confirm(result+"\nClick Ok To Go Back and Send\nCancel to Ignore >")){
                        history.back();
                    }
                }
            }
        );
    }
}
