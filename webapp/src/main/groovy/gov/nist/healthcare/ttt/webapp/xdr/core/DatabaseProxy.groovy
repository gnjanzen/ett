package gov.nist.healthcare.ttt.webapp.xdr.core

import gov.nist.healthcare.ttt.database.xdr.XDRRecordInterface
import gov.nist.healthcare.ttt.webapp.common.db.DatabaseInstance
import gov.nist.healthcare.ttt.webapp.xdr.domain.testcase.MsgLabel
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
/**
 * Created by gerardin on 10/29/14.
 */
@Component
class DatabaseProxy {

    public final DatabaseInstance instance

    @Autowired
    DatabaseProxy(DatabaseInstance db){
        this.instance = db
    }

    def addNewXdrRecord(XDRRecordInterface record){
        try {
            String recordId = instance.getXdrFacade().addNewXdrRecord(record)
            return recordId
        }
        catch(e){
            throw new Exception(MsgLabel.CREATE_NEW_RECORD_FAILED,e)
        }
    }

    def updateXDRRecord(XDRRecordInterface record){
        try {
            instance.getXdrFacade().updateXDRRecord(record)
        }
        catch(e){
            throw new Exception(MsgLabel.UPDATE_RECORD_FAILED,e)
        }
    }

    //TODO check. Does it throw any kind of exception?
    XDRRecordInterface getXDRRecordBySimulatorId(String id) {
        instance.xdrFacade.getXDRRecordBySimulatorId(id)
    }


    XDRRecordInterface getLatestXDRRecordByUsernameTestCase(String username, String tcid){
        instance.xdrFacade.getLatestXDRRecordByUsernameTestCase(username,tcid)
    }


}